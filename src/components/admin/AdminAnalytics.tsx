import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAsync } from "@/hooks/useAsync";
import { getAnalytics, type Analytics } from "@/lib/analyticsService";
import { formatMoney } from "@/lib/format";
import { Loading, ErrorState, EmptyState } from "@/components/common/States";

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 card-lift">
    <p className="label-mono text-white/35 mb-2">{label}</p>
    <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
  </div>
);

const tooltipStyle = {
  contentStyle: {
    background: "rgba(20,20,20,0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
  },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

export default function AdminAnalytics() {
  const { data, loading, error, refetch } = useAsync<Analytics>(() => getAnalytics(), []);

  if (loading)
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <Loading label="Loading analytics…" />
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

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Platform */}
      <section>
        <p className="label-mono mb-4">Platform</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total users" value={data.total_users} />
          <Stat label="Active subscriptions" value={data.active_subscriptions} />
          <Stat label="Monthly recurring" value={formatMoney(data.monthly_recurring_cents, c)} />
          <Stat label="Charity / month" value={formatMoney(data.charity_monthly_cents, c)} />
        </div>
      </section>

      {/* Draws & prizes */}
      <section>
        <p className="label-mono mb-4">Draws & prizes</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Published draws" value={data.draws_published} />
          <Stat label="Total prize pool" value={formatMoney(data.total_prize_pool_cents, c)} />
          <Stat label="Current jackpot" value={formatMoney(data.current_jackpot_cents, c)} />
          <Stat label="Total winners" value={data.total_winners} />
        </div>

        {/* Draw chart */}
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <p className="label-mono mb-5 text-white/50">Prize pool & entries by draw</p>
          {data.draw_stats.length === 0 ? (
            <EmptyState message="No published draws yet." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.draw_stats.map((d) => ({
                    ...d,
                    pool: +(d.pool_cents / 100).toFixed(2),
                  }))}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="entries"
                    orientation="left"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    label={{
                      value: "Entries",
                      angle: -90,
                      position: "insideLeft",
                      fill: "rgba(255,255,255,0.3)",
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    yAxisId="pool"
                    orientation="right"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={11}
                    tickLine={false}
                    label={{
                      value: `Pool (${c})`,
                      angle: 90,
                      position: "insideRight",
                      fill: "rgba(255,255,255,0.3)",
                      fontSize: 10,
                    }}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <Bar
                    yAxisId="entries"
                    dataKey="entries"
                    fill="rgba(52,211,153,0.75)"
                    name="Entries"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    yAxisId="pool"
                    dataKey="pool"
                    fill="rgba(255,255,255,0.22)"
                    name={`Prize Pool (${c})`}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Verification & payouts */}
      <section>
        <p className="label-mono mb-4">Verification & payouts</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Awaiting verification" value={data.winners_pending_verification} />
          <Stat label="Approved" value={data.winners_approved} />
          <Stat label="Payouts pending" value={data.payouts_pending} />
          <Stat label="Paid out" value={formatMoney(data.payout_paid_cents, c)} />
        </div>
      </section>

      {/* Charity breakdown */}
      <section>
        <p className="label-mono mb-4">Charity contributions</p>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
          {data.charity_breakdown.length === 0 && (
            <EmptyState message="No active subscribers have selected a charity yet." />
          )}
          {data.charity_breakdown.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-white/8 px-3 py-2 hover:bg-white/[0.02] transition"
            >
              <span className="text-sm text-white">{row.name}</span>
              <span className="text-sm text-white/50">
                {formatMoney(row.cents, c)} / month · {row.supporters} supporter
                {row.supporters !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
          <p className="px-3 pt-1 text-xs text-white/25">
            Calculated from current active subscriptions and each member's chosen percentage. Not a
            record of funds transferred.
          </p>
        </div>
      </section>
    </div>
  );
}
