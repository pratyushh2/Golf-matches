import { useState } from "react";
import { useScores } from "@/hooks/useScores";
import { addScore, deleteScore, updateScore, SCORE_MAX, SCORE_MIN } from "@/lib/scoreService";
import { formatDate, todayISO } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Field,
  inputClass,
  Badge,
} from "@/components/common/States";

/** Large score ball used in the 5-score strip */
function EligibleBall({ score, date, index }: { score: number; date: string; index: number }) {
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
      <span className="text-[0.65rem] font-mono tracking-wider text-white/40 uppercase">
        {label}
      </span>
    </div>
  );
}

export function ScoresPanel({ compact = false }: { compact?: boolean }) {
  const { scores, eligible, loading, error, refetch } = useScores();
  const [score, setScore] = useState("");
  const [playedOn, setPlayedOn] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editScore, setEditScore] = useState("");
  const [editDate, setEditDate] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await addScore(Number(score), playedOn);
      setScore("");
      setPlayedOn(todayISO());
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the score.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setFormError(null);
    try {
      await updateScore(id, Number(editScore), editDate);
      setEditing(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setFormError(null);
    try {
      await deleteScore(id);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <Panel>
        <Loading label="Loading scores…" />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );

  /** Compact mode: just show the score strip + count */
  if (compact) {
    return (
      <Panel>
        <div className="flex items-center justify-between gap-3">
          <PanelTitle>Stableford scores</PanelTitle>
          <span className="text-xs text-white/40">{eligible.length}/5 in draw</span>
        </div>
        {eligible.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">
            No scores yet — add five to enter the monthly draw.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3">
            {eligible.map((s, i) => (
              <EligibleBall key={s.id} score={s.score} date={s.played_on} index={i} />
            ))}
          </div>
        )}
      </Panel>
    );
  }

  const archived = scores.filter((s) => !s.eligible);

  return (
    <div className="space-y-6">
      {/* ── Five scores strip ── */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PanelTitle>Your five scores</PanelTitle>
          <span
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${
              eligible.length === 5
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/15 text-white/50"
            }`}
          >
            {eligible.length} / 5 in draw
          </span>
        </div>

        {eligible.length === 0 ? (
          <div className="mt-6">
            <EmptyState message="No scores recorded yet. Add five to enter the monthly draw." />
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3 sm:gap-4">
            {eligible.map((s, i) => (
              <EligibleBall key={s.id} score={s.score} date={s.played_on} index={i} />
            ))}
          </div>
        )}

        {eligible.length === 5 && (
          <p className="mt-4 text-xs text-white/35">
            Your five most recent scores are locked in for the current monthly draw.
          </p>
        )}
      </Panel>

      {/* ── Add score form ── */}
      <Panel>
        <PanelTitle>Add a score</PanelTitle>
        <form
          onSubmit={submit}
          className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <Field label="Score" hint={`${SCORE_MIN}–${SCORE_MAX}`}>
            <input
              className={inputClass}
              type="number"
              min={SCORE_MIN}
              max={SCORE_MAX}
              required
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="36"
            />
          </Field>
          <Field label="Date played" hint="One entry per date">
            <input
              className={inputClass}
              type="date"
              max={todayISO()}
              required
              value={playedOn}
              onChange={(e) => setPlayedOn(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add score"}
          </Button>
        </form>

        {formError && (
          <div className="mt-4">
            <ErrorState message={formError} />
          </div>
        )}
      </Panel>

      {/* ── Full score history ── */}
      <Panel>
        <PanelTitle>Score history</PanelTitle>

        <div className="mt-5 space-y-2">
          {scores.length === 0 && <EmptyState message="No scores recorded yet." />}

          {scores.map((s) => (
            <div
              key={s.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 transition ${
                s.eligible
                  ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                  : "border-white/5 bg-transparent opacity-50"
              }`}
            >
              {editing === s.id ? (
                <>
                  <input
                    className={`${inputClass} w-24`}
                    type="number"
                    min={SCORE_MIN}
                    max={SCORE_MAX}
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                  />
                  <input
                    className={`${inputClass} w-44`}
                    type="date"
                    max={todayISO()}
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => saveEdit(s.id)} disabled={busy}>
                      Save
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(null)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-semibold tabular-nums text-white">{s.score}</span>
                    <span className="text-sm text-white/50">{formatDate(s.played_on)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={s.eligible ? "good" : "neutral"}>
                      {s.eligible ? "In draw" : "Archived"}
                    </Badge>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditing(s.id);
                        setEditScore(String(s.score));
                        setEditDate(s.played_on);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => remove(s.id)} disabled={busy}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {scores.length > 5 && (
          <p className="mt-4 text-xs text-white/35">
            Only the five most recent scores form your draw entry. Older rows are kept for your
            history and are not used in matching.
          </p>
        )}
      </Panel>
    </div>
  );
}

export default ScoresPanel;
