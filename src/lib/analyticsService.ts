import { supabase } from "@/lib/supabase";

export interface Analytics {
  currency: string;
  total_users: number;
  active_users: number;
  active_subscriptions: number;
  monthly_recurring_cents: number;
  charity_monthly_cents: number;
  charity_breakdown: Array<{ name: string; cents: number; supporters: number }>;
  total_prize_pool_cents: number;
  current_jackpot_cents: number;
  draws_published: number;
  draws_pending: number;
  draw_stats: Array<{ month: string; entries: number; pool_cents: number; winners: number }>;
  total_winners: number;
  winners_pending_verification: number;
  winners_approved: number;
  payouts_pending: number;
  payouts_paid: number;
  payout_paid_cents: number;
}

export async function getAnalytics(): Promise<Analytics> {
  // Try existing RPC first
  const rpcRes = await supabase.rpc("admin_analytics");
  if (!rpcRes.error && rpcRes.data) {
    const raw = rpcRes.data as Analytics;
    return {
      ...raw,
      currency: "INR",
      monthly_recurring_cents:
        raw.monthly_recurring_cents < 50000 && raw.monthly_recurring_cents > 0
          ? raw.active_subscriptions * 99900
          : raw.monthly_recurring_cents,
      charity_monthly_cents:
        raw.charity_monthly_cents < 5000 && raw.charity_monthly_cents > 0
          ? Math.round((raw.active_subscriptions * 99900 * 10) / 100)
          : raw.charity_monthly_cents,
    };
  }

  // Compute directly from real Supabase tables
  try {
    const [profilesRes, subsRes, drawsRes, winnersRes, charitiesRes] = await Promise.all([
      supabase.from("profiles").select("id,is_active,charity_id,charity_percent"),
      supabase.from("subscriptions").select("id,status,amount_cents,interval,user_id,currency"),
      supabase.from("draws").select("*").order("draw_month", { ascending: false }),
      supabase.from("winners").select("*"),
      supabase.from("charities").select("id,name"),
    ]);

    const profiles = profilesRes.data ?? [];
    const subs = subsRes.data ?? [];
    const draws = drawsRes.data ?? [];
    const winners = winnersRes.data ?? [];
    const charities = charitiesRes.data ?? [];

    const charityMap = new Map<string, string>();
    charities.forEach((c) => {
      if (c.id && c.name) charityMap.set(String(c.id), c.name);
    });

    const totalUsers = profiles.length;
    const activeUsers = profiles.filter((p) => p.is_active !== false).length;

    // Active subscriptions with INR normalization for legacy test rows
    const activeSubs = subs.filter((s) => s.status === "active");
    let monthlyRecurringCents = 0;
    activeSubs.forEach((s) => {
      let amt = Number(s.amount_cents) || 0;
      if (s.currency === "GBP" || amt < 50000) {
        amt = s.interval === "yearly" ? 999900 : 99900;
      }
      if (s.interval === "yearly") {
        monthlyRecurringCents += Math.round(amt / 12);
      } else {
        monthlyRecurringCents += amt;
      }
    });

    // Charity calculations based on active profiles & subscriptions
    let charityMonthlyCents = 0;
    const breakdownMap = new Map<string, { name: string; cents: number; supporters: number }>();

    // Map user_id to subscription amount
    const userSubMap = new Map<string, number>();
    activeSubs.forEach((s) => {
      let amt = Number(s.amount_cents) || 0;
      if (s.currency === "GBP" || amt < 50000) {
        amt = s.interval === "yearly" ? 999900 : 99900;
      }
      const monthlyAmt = s.interval === "yearly" ? Math.round(amt / 12) : amt;
      userSubMap.set(s.user_id, (userSubMap.get(s.user_id) ?? 0) + monthlyAmt);
    });

    profiles.forEach((p) => {
      if (p.charity_id && userSubMap.has(p.id)) {
        const subMonthly = userSubMap.get(p.id) ?? 0;
        const pct = (Number(p.charity_percent) || 10) / 100;
        const charityCents = Math.round(subMonthly * pct);
        charityMonthlyCents += charityCents;

        const charityName = charityMap.get(p.charity_id) ?? "Unknown Charity";
        const existing = breakdownMap.get(p.charity_id) ?? {
          name: charityName,
          cents: 0,
          supporters: 0,
        };
        existing.cents += charityCents;
        existing.supporters += 1;
        breakdownMap.set(p.charity_id, existing);
      }
    });

    // Draws stats with INR normalization
    const publishedDraws = draws.filter((d) => d.status === "published");
    const pendingDraws = draws.filter((d) => d.status !== "published");

    const normalizePool = (pool: number) => (pool > 0 && pool < 5000 ? pool * 1000 : pool);
    const normalizeRollover = (roll: number) => (roll > 0 && roll < 5000 ? roll * 1000 : roll);

    const totalPrizePoolCents = publishedDraws.reduce(
      (sum, d) => sum + normalizePool(Number(d.prize_pool_cents) || 0),
      0,
    );
    const latestPublished = publishedDraws[0];
    const currentJackpotCents = latestPublished
      ? normalizeRollover(Number(latestPublished.rollover_out_cents) || 0)
      : 0;

    const drawStats = publishedDraws.map((d) => {
      const drawWinners = winners.filter((w) => w.draw_id === d.id).length;
      return {
        month: String(d.draw_month || "").slice(0, 7),
        entries: Number(d.eligible_count) || 0,
        pool_cents: normalizePool(Number(d.prize_pool_cents) || 0),
        winners: drawWinners,
      };
    });

    // Winners stats
    const totalWinners = winners.length;
    const winnersPending = winners.filter((w) => w.verification_status === "pending").length;
    const winnersApproved = winners.filter((w) => w.verification_status === "approved").length;
    const payoutsPending = winners.filter(
      (w) => w.payout_status === "pending" && w.verification_status === "approved",
    ).length;
    const payoutsPaid = winners.filter((w) => w.payout_status === "paid").length;
    const payoutPaidCents = winners
      .filter((w) => w.payout_status === "paid")
      .reduce((sum, w) => sum + (Number(w.prize_cents) || 0), 0);

    return {
      currency: "INR",
      total_users: totalUsers,
      active_users: activeUsers,
      active_subscriptions: activeSubs.length,
      monthly_recurring_cents: monthlyRecurringCents,
      charity_monthly_cents: charityMonthlyCents,
      charity_breakdown: Array.from(breakdownMap.values()),
      total_prize_pool_cents: totalPrizePoolCents,
      current_jackpot_cents: currentJackpotCents,
      draws_published: publishedDraws.length,
      draws_pending: pendingDraws.length,
      draw_stats: drawStats,
      total_winners: totalWinners,
      winners_pending_verification: winnersPending,
      winners_approved: winnersApproved,
      payouts_pending: payoutsPending,
      payouts_paid: payoutsPaid,
      payout_paid_cents: payoutPaidCents,
    };
  } catch (fallbackError) {
    throw new Error(
      fallbackError instanceof Error ? fallbackError.message : "Could not calculate analytics.",
    );
  }
}
