import { usePublishedDraws, useMyEntries } from "@/hooks/useDraws";
import { useScores } from "@/hooks/useScores";
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
    className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-base font-bold tabular-nums transition ${
      hit
        ? "bg-emerald-400 text-black shadow-lg shadow-emerald-400/30"
        : "border-2 border-white/15 text-white/70"
    }`}
  >
    {n}
  </span>
);

export function DrawsPanel() {
  const { data, loading, error, refetch } = usePublishedDraws();
  const { data: entries } = useMyEntries();
  const { eligible } = useScores();

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
  const myNumbers = eligible.map((s) => s.score);

  return (
    <div className="space-y-6">
      {draws.length === 0 && (
        <Panel>
          <EmptyState message="No draws have been published yet. Check back after the monthly draw." />
        </Panel>
      )}

      {draws.map((d, drawIndex) => {
        // Compute matches for this draw
        const winningSet = new Set(d.winning_numbers ?? []);
        const matches = myNumbers.filter((n) => winningSet.has(n));
        const matchCount = matches.length;
        const isLatest = drawIndex === 0;

        return (
          <div
            key={d.id}
            className={`rounded-2xl border bg-white/[0.02] overflow-hidden animate-fade-up ${
              isLatest ? "border-white/15" : "border-white/8 opacity-80"
            }`}
            style={{ animationDelay: `${drawIndex * 80}ms` }}
          >
            {/* Draw header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
              <div>
                <p className="label-mono">{formatMonth(d.draw_month)}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-white/35">
                  Monthly draw
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{d.mode === "algorithmic" ? "Algorithmic" : "Random"}</Badge>
                {isLatest && <Badge tone="good">Latest</Badge>}
              </div>
            </div>

            {/* Winning numbers */}
            <div className="px-6 py-6">
              {(d.winning_numbers ?? []).length > 0 ? (
                <>
                  <p className="label-mono mb-4 text-white/50">Winning numbers</p>
                  <div className="flex flex-wrap gap-3">
                    {(d.winning_numbers ?? []).map((n, i) => (
                      <NumberBall key={`${n}-${i}`} n={n} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40">Numbers not available.</p>
              )}
            </div>

            {/* Stats row */}
            <div className="border-t border-white/8 px-6 py-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="label-mono text-white/35">Prize pool</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatMoney(
                      d.prize_pool_cents < 5000 && d.prize_pool_cents > 0
                        ? d.prize_pool_cents * 1000
                        : d.prize_pool_cents,
                      "INR",
                    )}
                  </p>
                </div>
                <div>
                  <p className="label-mono text-white/35">Entries</p>
                  <p className="mt-1 text-sm font-medium text-white">{d.eligible_count}</p>
                </div>
                {(d.rollover_in_cents > 0 || (d.rollover_in_cents ?? 0) > 0) && (
                  <div>
                    <p className="label-mono text-white/35">Jackpot carried in</p>
                    <p className="mt-1 text-sm font-medium text-amber-300">
                      {formatMoney(
                        d.rollover_in_cents < 5000 && d.rollover_in_cents > 0
                          ? d.rollover_in_cents * 1000
                          : d.rollover_in_cents,
                        "INR",
                      )}
                    </p>
                  </div>
                )}
                {(d.rollover_out_cents > 0 || (d.rollover_out_cents ?? 0) > 0) && (
                  <div>
                    <p className="label-mono text-white/35">Jackpot rolled over</p>
                    <p className="mt-1 text-sm font-medium text-amber-300">
                      {formatMoney(
                        d.rollover_out_cents < 5000 && d.rollover_out_cents > 0
                          ? d.rollover_out_cents * 1000
                          : d.rollover_out_cents,
                        "INR",
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Your entry for this draw */}
            {myNumbers.length > 0 && (
              <div className="border-t border-white/8 bg-white/[0.01] px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="label-mono text-white/50">Your entry</p>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${
                      matchCount > 0
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 text-white/35"
                    }`}
                  >
                    {matchCount} / 5 matches
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {myNumbers.map((n, i) => (
                    <NumberBall key={`my-${n}-${i}`} n={n} hit={winningSet.has(n)} />
                  ))}
                </div>
                {matchCount > 0 && (
                  <p className="mt-3 text-sm text-emerald-300/80 font-medium">
                    🎉 You matched {matchCount} number{matchCount === 1 ? "" : "s"}! Check your
                    winnings.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DrawsPanel;
