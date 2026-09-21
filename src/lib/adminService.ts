import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
  charity_id: string | null;
  charity_percent: number | null;
  created_at: string | null;
}

export interface AdminScore {
  id: string;
  user_id: string;
  score: number;
  played_on: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export async function listUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,role,is_active,charity_id,charity_percent,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminUser[];
}

export async function setUserActive(id: string, isActive: boolean) {
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setUserRole(id: string, role: "user" | "admin") {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAllScores(limit = 200): Promise<AdminScore[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("id,user_id,score,played_on, profiles:user_id(full_name,email)")
    .order("played_on", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminScore[];
}

export async function adminUpdateScore(id: string, score: number, playedOn: string) {
  const payload: Record<string, unknown> = {
    score,
    played_on: playedOn,
    played_at: `${playedOn}T12:00:00Z`,
  };
  const { error } = await supabase.from("scores").update(payload).eq("id", id);
  if (error) {
    if (error.message.includes("column") || error.code === "42703") {
      const { error: retryErr } = await supabase
        .from("scores")
        .update({ score, played_on: playedOn })
        .eq("id", id);
      if (retryErr) throw new Error(retryErr.message);
      return;
    }
    throw new Error(error.message);
  }
}

export async function listAllSubscriptions() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, profiles:user_id(full_name,email)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertCharity(input: {
  id?: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  image_url?: string | null;
  website_url?: string | null;
  category?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
}) {
  const payload: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    description: input.description,
    website_url: input.website_url,
    logo_url: input.image_url,
    active: input.is_active ?? true,
  };
  if (input.image_url) payload["image_url"] = input.image_url;
  if (input.is_active !== undefined) payload["is_active"] = input.is_active;
  if (input.is_featured !== undefined) payload["is_featured"] = input.is_featured;
  if (input.category !== undefined) payload["category"] = input.category;

  const { error } = input.id
    ? await supabase.from("charities").update(payload).eq("id", input.id)
    : await supabase.from("charities").insert(payload);
  if (error) throw new Error(error.message);
}

export async function deleteCharity(id: string) {
  const { error } = await supabase.from("charities").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function expireLapsedSubscriptions(): Promise<number> {
  const { data, error } = await supabase.rpc("expire_lapsed_subscriptions");
  if (error) throw new Error(error.message);
  return (data as number) ?? 0;
}
