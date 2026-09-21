import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/profileService";

export interface Charity {
  id: string;
  name: string | null;
  slug: string | null;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  category: string | null;
  events: Array<{ title?: string; date?: string; location?: string }>;
  is_active: boolean;
  is_featured: boolean;
}

export interface AppSettings {
  min_charity_percent: number;
  prize_pool_rate: number;
  number_min: number;
  number_max: number;
  numbers_per_draw: number;
  currency: string;
}

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("min_charity_percent,prize_pool_rate,number_min,number_max,numbers_per_draw,currency")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return {
    min_charity_percent: Number(data.min_charity_percent),
    prize_pool_rate: Number(data.prize_pool_rate),
    number_min: data.number_min,
    number_max: data.number_max,
    numbers_per_draw: data.numbers_per_draw,
    currency: data.currency,
  };
}

function mapCharity(c: Record<string, unknown>): Charity {
  const rawEvents = c["events"];
  const isActive =
    c["is_active"] !== undefined
      ? Boolean(c["is_active"])
      : c["active"] !== undefined
        ? Boolean(c["active"])
        : true;
  const isFeatured = Boolean(c["is_featured"]);
  const imageUrl = (c["image_url"] as string | null) ?? (c["logo_url"] as string | null) ?? null;

  return {
    id: String(c["id"]),
    name: (c["name"] as string | null) ?? null,
    slug: (c["slug"] as string | null) ?? null,
    description: (c["description"] as string | null) ?? null,
    image_url: imageUrl,
    website_url: (c["website_url"] as string | null) ?? null,
    category: (c["category"] as string | null) ?? null,
    events: Array.isArray(rawEvents) ? (rawEvents as Charity["events"]) : [],
    is_active: isActive,
    is_featured: isFeatured,
  };
}

export async function listCharities(includeInactive = false): Promise<Charity[]> {
  const { data, error } = await supabase.from("charities").select("*").order("name");
  if (error) throw new Error(error.message);
  const list = (data ?? []).map((c: Record<string, unknown>) => mapCharity(c));
  if (!includeInactive) {
    return list.filter((c) => c.is_active);
  }
  return list;
}

export async function getFeaturedCharity(): Promise<Charity | null> {
  const list = await listCharities(false);
  return list.find((c) => c.is_featured) ?? list[0] ?? null;
}

/** Saves selection + percentage. The DB trigger enforces the 10% minimum. */
export async function selectCharity(charityId: string, percent: number): Promise<void> {
  const user = await getAuthenticatedUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      charity_id: charityId,
      charity_percent: percent,
      charity_contribution_percent: percent,
    })
    .eq("id", user.id);
  if (error) {
    if (error.message.includes("column") || error.code === "42703") {
      const { error: retryErr } = await supabase
        .from("profiles")
        .update({ charity_id: charityId, charity_percent: percent })
        .eq("id", user.id);
      if (retryErr) {
        if (retryErr.message.includes("below_minimum"))
          throw new Error("Contribution is below the platform minimum.");
        if (retryErr.message.includes("charity_not_available"))
          throw new Error("That charity is not currently available.");
        throw new Error(retryErr.message);
      }
      return;
    }
    if (error.message.includes("below_minimum"))
      throw new Error("Contribution is below the platform minimum.");
    if (error.message.includes("charity_not_available"))
      throw new Error("That charity is not currently available.");
    throw new Error(error.message);
  }
}

export function filterCharities(
  list: Charity[],
  query: string,
  category: string | null,
): Charity[] {
  const q = query.trim().toLowerCase();
  return list.filter((c) => {
    if (category && c.category !== category) return false;
    if (!q) return true;
    return (
      (c.name ?? "").toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q)
    );
  });
}
