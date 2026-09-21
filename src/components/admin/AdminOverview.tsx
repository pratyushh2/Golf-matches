import { Link } from "@tanstack/react-router";
import { useAsync } from "@/hooks/useAsync";
import { getAnalytics, type Analytics } from "@/lib/analyticsService";
import { useAllDraws } from "@/hooks/useDraws";
import { formatMoney, formatMonth } from "@/lib/format";
import { Loading, ErrorState } from "@/components/common/States";
import { NumberBall } from "@/components/draw/DrawsPanel";
import { AlertTriangle, CheckCircle2, Users, CreditCard, Trophy, Heart } from "lucide-react";

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string | undefined;
  accent?: "good" | "warn" | "bad" | undefined;
}) {
  const textColor =
    accent === "good"
      ? "text-emerald-300"
      : accent === "warn"
        ? "text-amber-300"
        : accent === "bad"
          ? "text-red-300"
          : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 card-lift">
      <p className="label-mono text-white/35 mb-2">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${textColor}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/35">{sub}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const { data, loading, error, refetch } = useAsync<Analytics>(() => getAnalytics(), []);
  const { data: draws } = useAllDraws();

  if (loading)
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <Loading label="Loading analytics…" />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  if (!data) return null;

  const c = data.currency === "GBP" ? "INR" : data.currency || "INR";
  const recentDraws = (draws ?? []).slice(0, 3);

  // Action required
  const actions: { label: string; sub: string; section: string }[] = [];
  if (data.winners_pending_verification > 0)
    actions.push({
      label: `${data.winners_pending_verification} winner${data.winners_pending_verification === 1 ? "" : "s"} awaiting verification`,
      sub: "Review proof uploads",
      section: "winners",
    });
  if (data.payouts_pending > 0)
    actions.push({
      label: `${data.payouts_pending} payout${data.payouts_pending === 1 ? "" : "s"} pending`,
      sub: "Mark as paid once settled",
      section: "winners",
    });
  if (data.draws_pending > 0)
    actions.push({
      label: `${data.draws_pending} draw${data.draws_pending === 1 ? "" : "s"} awaiting publication`,
      sub: "Simulate or publish when ready",
      section: "draws",
    });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Platform metrics */}
      <section>
        <p className="label-mono mb-4">Platform</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total users"
            value={data.total_users}
            sub={`${data.active_subscriptions} subscribed`}
          />
          <MetricCard
            label="Active subscriptions"
            value={data.active_subscriptions}
            accent={data.active_subscriptions > 0 ? "good" : undefined}
          />
          <MetricCard
            label="Monthly recurring"
            value={formatMoney(data.monthly_recurring_cents, c)}
          />
          <MetricCard
            label="Charity / month"
            value={formatMoney(data.charity_monthly_cents, c)}
            accent="good"
          />
        </div>
      </section>

      {/* Draw + prize metrics */}
      <section>
        <p className="label-mono mb-4">Draws & prizes</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Published draws" value={data.draws_published} />
          <MetricCard
            label="Total prize pool"
            value={formatMoney(data.total_prize_pool_cents, c)}
          />
          <MetricCard
            label="Current jackpot"
            value={formatMoney(data.current_jackpot_cents, c)}
            accent={data.current_jackpot_cents > 0 ? "warn" : undefined}
          />
          <MetricCard label="Total winners" value={data.total_winners} />
        </div>
      </section>

      {/* Verification & payouts */}
      <section>
        <p className="label-mono mb-4">Verification & payouts</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Awaiting verification"
            value={data.winners_pending_verification}
            accent={data.winners_pending_verification > 0 ? "warn" : undefined}
          />
          <MetricCard
            label="Approved"
            value={data.winners_approved}
            accent={data.winners_approved > 0 ? "good" : undefined}
          />
          <MetricCard
            label="Payouts pending"
            value={data.payouts_pending}
            accent={data.payouts_pending > 0 ? "warn" : undefined}
          />
          <MetricCard
            label="Paid out"
            value={formatMoney(data.payout_paid_cents, c)}
            accent={data.payouts_paid > 0 ? "good" : undefined}
          />
        </div>
      </section>

      {/* Action required */}
      <section>
        <p className="label-mono mb-4">Action required</p>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          {actions.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-300/80">
              <CheckCircle2 className="h-4 w-4" />
              No action required — platform is up to date.
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((a) => (
                <div
                  key={a.label}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400/70 shrink-0" />
                    <div>
                      <p className="text-sm text-white">{a.label}</p>
                      <p className="text-xs text-white/40">{a.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent draws */}
      {recentDraws.length > 0 && (
        <section>
          <p className="label-mono mb-4">Recent draws</p>
          <div className="space-y-3">
            {recentDraws.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-white">{formatMonth(d.draw_month)}</p>
                    <p className="text-xs text-white/40">
                      {d.eligible_count} entries · {formatMoney(d.prize_pool_cents, d.currency)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.1em] ${
                      d.status === "published"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : d.status === "simulated"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : "border-white/10 text-white/40"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                {d.winning_numbers && (
                  <div className="flex flex-wrap gap-2">
                    {d.winning_numbers.map((n, i) => (
                      <span
                        key={`${n}-${i}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-xs font-medium tabular-nums text-white/70"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Charity breakdown */}
      {data.charity_breakdown.length > 0 && (
        <section>
          <p className="label-mono mb-4">Charity contributions</p>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            {data.charity_breakdown.map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-white/25" />
                  <span className="text-sm text-white">{row.name}</span>
                </div>
                <span className="text-xs text-white/50">
                  {formatMoney(row.cents, c)} / month · {row.supporters} supporter
                  {row.supporters !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
            <p className="mt-2 px-3 text-xs text-white/25">
              Calculated from active subscriptions and chosen percentages. Not a record of funds
              transferred.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
