import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAsync } from "@/hooks/useAsync";
import { getAnalytics, type Analytics } from "@/lib/analyticsService";
import { formatMoney } from "@/lib/format";
import { Panel, PanelTitle, Loading, ErrorState, EmptyState } from "@/components/common/States";

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
    <p className="text-xs uppercase tracking-[0.14em] text-white/35">{label}</p>
    <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</p>
  </div>
);

export default function AdminAnalytics() {
  const { data, loading, error, refetch } = useAsync<Analytics>(() => getAnalytics(), []);
  if (loading)
    return (
      <Panel>
        <Loading label="Loading analytics…" />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );
  if (!data) return null;
  const c = data.currency;

  return (
    <div className="space-y-6">
      <Panel>
        <PanelTitle>Platform</PanelTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total users" value={data.total_users} />
          <Stat label="Active subscriptions" value={data.active_subscriptions} />
          <Stat label="Monthly recurring" value={formatMoney(data.monthly_recurring_cents, c)} />
          <Stat label="Charity per month" value={formatMoney(data.charity_monthly_cents, c)} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Draws & prizes</PanelTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Published draws" value={data.draws_published} />
          <Stat label="Total prize pool" value={formatMoney(data.total_prize_pool_cents, c)} />
          <Stat label="Current jackpot" value={formatMoney(data.current_jackpot_cents, c)} />
          <Stat label="Total winners" value={data.total_winners} />
        </div>
        <div className="mt-6 h-64">
          {data.draw_stats.length === 0 ? (
            <EmptyState message="No published draws yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.draw_stats.map((d) => ({ ...d, pool: d.pool_cents / 100 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#0b0f14",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <Bar dataKey="entries" fill="rgba(52,211,153,0.75)" name="Entries" />
                <Bar dataKey="pool" fill="rgba(255,255,255,0.28)" name={`Pool (${c})`} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Verification & payouts</PanelTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Awaiting verification" value={data.winners_pending_verification} />
          <Stat label="Approved" value={data.winners_approved} />
          <Stat label="Payouts pending" value={data.payouts_pending} />
          <Stat label="Paid out" value={formatMoney(data.payout_paid_cents, c)} />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Charity contributions</PanelTitle>
        <div className="mt-4 space-y-2">
          {data.charity_breakdown.length === 0 && (
            <EmptyState message="No active subscribers have selected a charity yet." />
          )}
          {data.charity_breakdown.map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-white/10 p-3"
            >
              <span className="text-sm text-white">{row.name}</span>
              <span className="text-sm text-white/60">
                {formatMoney(row.cents, c)} / month · {row.supporters} supporter(s)
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/30">
          Calculated from current active subscriptions and each member's chosen percentage. Not a
          record of funds transferred.
        </p>
      </Panel>
    </div>
  );
}
