import { Link } from "@tanstack/react-router";
import { useScores } from "@/hooks/useScores";
import { useSubscription } from "@/hooks/useSubscription";
import { usePublishedDraws } from "@/hooks/useDraws";
import { formatMonth, formatMoney } from "@/lib/format";
import { Loading } from "@/components/common/States";
import { ArrowRight, Trophy } from "lucide-react";

function ScoreBall({ score, date, index }: { score: number; date: string; index: number }) {
  const d = new Date(date);
  const label = Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });

  return (
    <div
      className="flex flex-col items-center gap-2 animate-score-pop"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-400 text-xl sm:text-2xl font-bold text-black shadow-lg shadow-emerald-400/20">
        {score}
      </div>
      <span className="label-mono text-[0.6rem] sm:text-[0.65rem]">{label}</span>
    </div>
  );
}

function EmptyBall({ index }: { index: number }) {
  return (
    <div
      className="flex flex-col items-center gap-2 animate-score-pop"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-dashed border-white/15 text-white/20">
        <span className="text-xl">—</span>
      </div>
      <span className="label-mono text-[0.6rem] sm:text-[0.65rem]">pending</span>
    </div>
  );
}

export function DrawHeroCard() {
  const { eligible, loading: scoresLoading } = useScores();
  const { isActive, loading: subLoading } = useSubscription();
  const { data: draws, loading: drawsLoading } = usePublishedDraws();

  if (scoresLoading || subLoading || drawsLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-fade-up-delay-1">
        <Loading label="Loading draw status…" />
      </div>
    );
  }

  const latestDraw = draws?.[0] ?? null;
  const count = eligible.length;
  const hasAll = count === 5;

  // Pad to 5 slots
  const slots = Array.from({ length: 5 }, (_, i) => eligible[i] ?? null);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 card-lift animate-fade-up-delay-1">
      {/* Background glow when fully eligible */}
      {hasAll && isActive && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-400/[0.03]" />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-mono">
            {latestDraw ? formatMonth(latestDraw.draw_month) : "Monthly draw"}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/40">Monthly draw</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-400/60" />
          {latestDraw && (
            <span className="text-xs text-white/50">
              Prize pool {formatMoney(latestDraw.prize_pool_cents, latestDraw.currency)}
            </span>
          )}
        </div>
      </div>

      {/* Not subscribed state */}
      {!isActive ? (
        <div className="mt-6">
          <p className="text-white/40 text-sm">Subscribe to enter the monthly prize draw.</p>
          <Link
            to="/subscription"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30 hover:text-white transition"
          >
            View membership <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Score strip */}
          <div className="mt-6">
            <p className="label-mono mb-4">Your five scores</p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {slots.map((s, i) =>
                s ? (
                  <ScoreBall key={s.id} score={s.score} date={s.played_on} index={i} />
                ) : (
                  <EmptyBall key={`empty-${i}`} index={i} />
                ),
              )}
            </div>
          </div>

          {/* Eligibility counter */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-semibold tabular-nums ${hasAll ? "text-emerald-300" : "text-white"}`}
              >
                {count} / 5
              </span>
              <span className="text-xs text-white/40 uppercase tracking-[0.12em]">
                {hasAll ? "eligible" : "scores submitted"}
              </span>
            </div>
            {hasAll ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-emerald-300 animate-pulse-ring">
                ✓ Draw eligible
              </span>
            ) : (
              <span className="text-xs text-white/40">Add {5 - count} more to qualify</span>
            )}
          </div>

          {/* Supporting copy */}
          <p className="mt-3 text-xs text-white/35">
            {hasAll
              ? "Your five latest scores are locked in for this month's draw."
              : `You need ${5 - count} more score${5 - count === 1 ? "" : "s"} to enter the monthly draw.`}
          </p>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/draws"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-400/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-300"
            >
              View draw <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/scores"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Manage scores
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default DrawHeroCard;
