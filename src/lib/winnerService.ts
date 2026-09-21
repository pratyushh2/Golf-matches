import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/profileService";

export const PROOF_BUCKET = "winner-proofs";
const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

export interface WinnerRecord {
  id: string;
  draw_id: string;
  user_id: string;
  match_count: number;
  matched_numbers: number[] | null;
  prize_cents: number;
  proof_path: string | null;
  proof_uploaded_at: string | null;
  verification_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  payout_status: "pending" | "paid";
  paid_at: string | null;
  draws?: {
    draw_month: string;
    currency: string;
    status: string;
    winning_numbers: number[] | null;
  } | null;
}

export async function listMyWinnings(): Promise<WinnerRecord[]> {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("winners")
    .select("*, draws!inner(draw_month,currency,status,winning_numbers)")
    .eq("user_id", user.id)
    .eq("draws.status", "published")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WinnerRecord[];
}

export function validateProofFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "Upload a PNG, JPEG, WebP or PDF.";
  if (file.size > MAX_PROOF_BYTES) return "File must be 5 MB or smaller.";
  return null;
}

/** Uploads to the private bucket and links it. The DB trigger resets review to pending. */
export async function uploadProof(winner: WinnerRecord, file: File): Promise<string> {
  const problem = validateProofFile(file);
  if (problem) throw new Error(problem);
  const user = await getAuthenticatedUser();
  if (user.id !== winner.user_id) throw new Error("You can only upload proof for your own win.");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${user.id}/${winner.id}/${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(PROOF_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw new Error(upErr.message);

  const { error } = await supabase.from("winners").update({ proof_path: path }).eq("id", winner.id);
  if (error) {
    await supabase.storage.from(PROOF_BUCKET).remove([path]); // don't orphan the file
    throw new Error(error.message);
  }
  return path;
}

/** Short-lived signed URL — the bucket is never public. */
export async function getProofUrl(path: string, seconds = 300): Promise<string> {
  const { data, error } = await supabase.storage.from(PROOF_BUCKET).createSignedUrl(path, seconds);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function reviewWinner(id: string, status: "approved" | "rejected", reason?: string) {
  let res = await supabase.rpc("admin_review_winner", {
    p_winner_id: id,
    p_status: status,
    p_reason: reason ?? null,
  });
  if (res.error && (res.error.message.includes("parameter") || res.error.code === "42883")) {
    res = await supabase.rpc("admin_review_winner", {
      winner_id: id,
      status,
      reason: reason ?? null,
    });
  }
  if (res.error) {
    throw new Error(
      res.error.message.includes("not_authorized")
        ? "Administrator access required."
        : res.error.message,
    );
  }
}

export async function setPayoutStatus(id: string, status: "pending" | "paid") {
  let res = await supabase.rpc("admin_set_payout", { p_winner_id: id, p_status: status });
  if (res.error && (res.error.message.includes("parameter") || res.error.code === "42883")) {
    res = await supabase.rpc("admin_set_payout", { winner_id: id, status });
  }
  if (res.error) {
    if (res.error.message.includes("proof_not_approved"))
      throw new Error("Approve the proof before marking as paid.");
    throw new Error(res.error.message);
  }
}

export async function listAllWinners(): Promise<WinnerRecord[]> {
  const { data, error } = await supabase
    .from("winners")
    .select("*, draws(draw_month,currency,status), profiles:user_id(full_name,email)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WinnerRecord[];
}
