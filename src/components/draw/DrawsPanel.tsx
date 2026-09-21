import { usePublishedDraws } from "@/hooks/useDraws";
import { formatMoney, formatMonth } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Badge,
} from "@/components/common/States";

export const NumberBall = ({ n, hit = false }: { n: number; hit?: boolean }) => (
  <span
    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold tabular-nums ${hit ? "bg-emerald-400 text-black" : "border border-white/15 text-white/70"}`}
  >
    {n}
  </span>
);

export function DrawsPanel() {
  const { data, loading, error, refetch } = usePublishedDraws();
  if (loading)
    return (
      <Panel>
        <Loading label="Loading draws…" />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );

  const draws = data ?? [];
  return (
    <Panel>
      <PanelTitle>Draw results</PanelTitle>
      <div className="mt-5 space-y-3">
        {draws.length === 0 && <EmptyState message="No draws have been published yet." />}
        {draws.map((d) => (
          <div key={d.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-medium text-white">{formatMonth(d.draw_month)}</span>
              <Badge tone="neutral">{d.mode === "algorithmic" ? "Algorithmic" : "Random"}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(d.winning_numbers ?? []).map((n, i) => (
                <NumberBall key={`${n}-${i}`} n={n} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/45">
              <span>Pool {formatMoney(d.prize_pool_cents, d.currency)}</span>
              <span>{d.eligible_count} entries</span>
              {d.rollover_in_cents > 0 && (
                <span>Jackpot carried in {formatMoney(d.rollover_in_cents, d.currency)}</span>
              )}
              {d.rollover_out_cents > 0 && (
                <span>Jackpot rolled over {formatMoney(d.rollover_out_cents, d.currency)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default DrawsPanel;
