import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/profileService";

export interface Draw {
  id: string;
  draw_month: string;
  mode: "random" | "algorithmic";
  status: "draft" | "simulated" | "published";
  winning_numbers: number[] | null;
  prize_pool_cents: number;
  rollover_in_cents: number;
  rollover_out_cents: number;
  eligible_count: number;
  currency: string;
  simulated_at: string | null;
  published_at: string | null;
}

export interface SimulationResult {
  draw_id: string;
  winning_numbers: number[];
  eligible_entries: number;
  prize_pool_cents: number;
  tier_5_cents: number;
  tier_4_cents: number;
  tier_3_cents: number;
  winners_5: number;
  winners_4: number;
  winners_3: number;
  rollover_out_cents: number;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  numbers: number[];
  contribution_cents: number;
}

/** Published draws only — RLS enforces this for non-admins. */
export async function listPublishedDraws(limit = 12): Promise<Draw[]> {
  const { data, error } = await supabase
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("draw_month", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Draw[];
}

export async function listAllDraws(): Promise<Draw[]> {
  const { data, error } = await supabase
    .from("draws")
    .select("*")
    .order("draw_month", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Draw[];
}

export async function listMyEntries(): Promise<DrawEntry[]> {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("draw_entries")
    .select("id,draw_id,numbers,contribution_cents")
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  return (data ?? []) as DrawEntry[];
}

export async function createDraw(month: string, mode: "random" | "algorithmic"): Promise<Draw> {
  let res = await supabase.rpc("admin_create_draw", { p_month: month, p_mode: mode });
  if (res.error && (res.error.message.includes("parameter") || res.error.code === "42883")) {
    res = await supabase.rpc("admin_create_draw", { month, mode });
  }
  if (res.error) throw new Error(mapDrawError(res.error.message));
  return res.data as Draw;
}

export async function simulateDraw(drawId: string, numbers?: number[]): Promise<SimulationResult> {
  let res = await supabase.rpc("admin_simulate_draw", {
    p_draw_id: drawId,
    p_numbers: numbers ?? null,
  });
  if (res.error && (res.error.message.includes("parameter") || res.error.code === "42883")) {
    res = await supabase.rpc("admin_simulate_draw", {
      draw_id: drawId,
      numbers: numbers ?? null,
    });
  }
  if (res.error) throw new Error(mapDrawError(res.error.message));
  return res.data as SimulationResult;
}

export async function publishDraw(drawId: string): Promise<Draw> {
  let res = await supabase.rpc("admin_publish_draw", { p_draw_id: drawId });
  if (res.error && (res.error.message.includes("parameter") || res.error.code === "42883")) {
    res = await supabase.rpc("admin_publish_draw", { draw_id: drawId });
  }
  if (res.error) throw new Error(mapDrawError(res.error.message));
  return res.data as Draw;
}

function mapDrawError(message: string): string {
  if (message.includes("not_authorized")) return "Administrator access is required.";
  if (message.includes("draw_already_published"))
    return "This draw is published and can no longer be changed.";
  if (message.includes("draw_not_simulated")) return "Run a simulation before publishing.";
  if (message.includes("wrong_number_count")) return "Provide exactly five numbers.";
  if (message.includes("number_out_of_range")) return "Numbers must be between 1 and 45.";
  if (message.includes("duplicate key")) return "A draw already exists for that month.";
  return message;
}
