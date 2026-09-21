import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole = "user" | "admin";

export interface ProfileRow {
  id: string;
  role?: string | null;
  full_name?: string | null;
  name?: string | null;
  display_name?: string | null;
  email?: string | null;
  charity_id?: string | null;
  charity_percent?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  email: string | null;
  displayName: string;
  fullName: string;
  role: UserRole;
  charityId: string | null;
  charityPercent: number | null;
  isActive: boolean;
  createdAt: string | null;
  row: ProfileRow;
}

export type ProfileErrorCode = "UNAUTHENTICATED" | "PROFILE_NOT_FOUND" | "QUERY_FAILED";

export class ProfileError extends Error {
  code: ProfileErrorCode;
  override cause?: unknown;
  override name = "ProfileError";
  constructor(code: ProfileErrorCode, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}

export const isProfileError = (e: unknown): e is ProfileError => e instanceof ProfileError;

const normaliseRole = (r?: string | null): UserRole =>
  r?.trim().toLowerCase() === "admin" ? "admin" : "user";

function resolveDisplayName(row: ProfileRow, user: User | null): string {
  const fromRow = row.full_name ?? row.name ?? row.display_name;
  if (typeof fromRow === "string" && fromRow.trim()) return fromRow.trim();
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  for (const k of ["full_name", "name", "display_name"]) {
    const v = meta[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const email = (typeof row.email === "string" ? row.email : null) ?? user?.email ?? null;
  return email ? email.split("@")[0] || "Member" : "Member";
}

function toProfile(row: ProfileRow, user: User | null): Profile {
  const rawPercent = row.charity_percent ?? (row["charity_contribution_percent"] as number | null);
  const resolvedName = resolveDisplayName(row, user);
  return {
    id: row.id,
    email: (typeof row.email === "string" ? row.email : null) ?? user?.email ?? null,
    displayName: resolvedName,
    fullName: (typeof row.full_name === "string" ? row.full_name : null) ?? resolvedName,
    role: normaliseRole(typeof row.role === "string" ? row.role : null),
    charityId: (row.charity_id as string | null) ?? null,
    charityPercent: rawPercent == null ? null : Number(rawPercent),
    isActive: row.is_active !== false,
    createdAt: (row.created_at as string | null) ?? null,
    row,
  };
}

export async function getAuthenticatedUser(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new ProfileError("UNAUTHENTICATED", "Could not verify your session.", error);
  if (!data.user) throw new ProfileError("UNAUTHENTICATED", "You are not signed in.");
  return data.user;
}

export async function getProfileRow(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new ProfileError("QUERY_FAILED", "Could not load your profile.", error);
  return (data as ProfileRow | null) ?? null;
}

export async function getCurrentProfile(): Promise<{ user: User; profile: Profile }> {
  const user = await getAuthenticatedUser();
  const row = await getProfileRow(user.id);
  if (!row) {
    throw new ProfileError("PROFILE_NOT_FOUND", "Your profile record could not be found.");
  }
  return { user, profile: toProfile(row, user) };
}

export async function updateProfile({ fullName }: { fullName: string }): Promise<void> {
  const user = await getAuthenticatedUser();
  const trimmed = fullName.trim();
  if (!trimmed) throw new Error("Name cannot be empty.");

  // Update Supabase Auth user metadata
  const { error: authErr } = await supabase.auth.updateUser({
    data: { full_name: trimmed, name: trimmed, display_name: trimmed },
  });
  if (authErr) {
    console.warn("Auth metadata update warning:", authErr.message);
  }

  // Update profiles row
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ full_name: trimmed })
    .eq("id", user.id);

  if (profileErr) {
    // Try other name fields if full_name is not present
    if (profileErr.message.includes("column") || profileErr.code === "42703") {
      const { error: retryErr } = await supabase
        .from("profiles")
        .update({ display_name: trimmed })
        .eq("id", user.id);
      if (retryErr) throw new Error(retryErr.message);
    } else {
      throw new Error(profileErr.message);
    }
  }
}

export const isAdmin = (p: Profile | null) => p?.role === "admin";
