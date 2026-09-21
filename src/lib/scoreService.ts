import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/profileService";

export const SCORE_MIN = 1;
export const SCORE_MAX = 45;
export const ELIGIBLE_WINDOW = 5;

export interface ScoreRecord {
  id: string;
  user_id: string;
  score: number;
  played_on: string;
  created_at: string;
  /** true when this row is inside the latest-5 eligibility window (PRD §05). */
  eligible: boolean;
  position: number;
}

export function validateScore(value: number, playedOn: string): string | null {
  if (!Number.isInteger(value)) return "Score must be a whole number.";
  if (value < SCORE_MIN || value > SCORE_MAX)
    return `Score must be between ${SCORE_MIN} and ${SCORE_MAX}.`;
  if (!playedOn) return "A date is required.";
  const d = new Date(`${playedOn}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "Date is not valid.";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d > today) return "Date cannot be in the future.";
  return null;
}

function decorate(rows: Array<Omit<ScoreRecord, "eligible" | "position">>): ScoreRecord[] {
  return rows.map((r, i) => ({ ...r, position: i + 1, eligible: i < ELIGIBLE_WINDOW }));
}

/** All scores, newest first (PRD §05: reverse chronological). */
export async function listScores(): Promise<ScoreRecord[]> {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const normalized = (data ?? []).map((r: Record<string, unknown>) => ({
    id: String(r["id"]),
    user_id: String(r["user_id"]),
    score: Number(r["score"]),
    played_on: String(r["played_on"] ?? r["played_at"] ?? ""),
    created_at: String(r["created_at"] ?? ""),
  }));
  return decorate(normalized);
}

export async function addScore(score: number, playedOn: string): Promise<void> {
  const problem = validateScore(score, playedOn);
  if (problem) throw new Error(problem);
  const user = await getAuthenticatedUser();
  const payload: Record<string, unknown> = {
    user_id: user.id,
    score,
    played_on: playedOn,
    played_at: `${playedOn}T12:00:00Z`,
  };
  const { error } = await supabase.from("scores").insert(payload);
  if (error) {
    if (
      error.code === "23505" ||
      error.message.includes("unique") ||
      error.message.includes("duplicate")
    ) {
      throw new Error("You already have a score for that date. Edit or delete it instead.");
    }
    if (error.message.includes("column") || error.code === "42703") {
      const { error: retryErr } = await supabase
        .from("scores")
        .insert({ user_id: user.id, score, played_on: playedOn });
      if (retryErr) {
        if (retryErr.code === "23505")
          throw new Error("You already have a score for that date. Edit or delete it instead.");
        throw new Error(retryErr.message);
      }
      return;
    }
    throw new Error(error.message);
  }
}

export async function updateScore(id: string, score: number, playedOn: string): Promise<void> {
  const problem = validateScore(score, playedOn);
  if (problem) throw new Error(problem);
  const payload: Record<string, unknown> = {
    score,
    played_on: playedOn,
    played_at: `${playedOn}T12:00:00Z`,
  };
  const { error } = await supabase.from("scores").update(payload).eq("id", id);
  if (error) {
    if (
      error.code === "23505" ||
      error.message.includes("unique") ||
      error.message.includes("duplicate")
    ) {
      throw new Error("Another score already exists for that date.");
    }
    if (error.message.includes("column") || error.code === "42703") {
      const { error: retryErr } = await supabase
        .from("scores")
        .update({ score, played_on: playedOn })
        .eq("id", id);
      if (retryErr) {
        if (retryErr.code === "23505")
          throw new Error("Another score already exists for that date.");
        throw new Error(retryErr.message);
      }
      return;
    }
    throw new Error(error.message);
  }
}

export async function deleteScore(id: string): Promise<void> {
  const { error } = await supabase.from("scores").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export const eligibleNumbers = (rows: ScoreRecord[]) =>
  rows.filter((r) => r.eligible).map((r) => r.score);
