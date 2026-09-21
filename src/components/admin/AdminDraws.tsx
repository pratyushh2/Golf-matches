import { useState } from "react";
import { useAllDraws } from "@/hooks/useDraws";
import { createDraw, publishDraw, simulateDraw, type SimulationResult } from "@/lib/drawService";
import { formatMoney, formatMonth } from "@/lib/format";
import {
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Field,
  inputClass,
  Badge,
} from "@/components/common/States";
import { NumberBall } from "@/components/draw/DrawsPanel";
import { PlusCircle, Play, Send, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminDraws() {
  const { data, loading, error, refetch } = useAllDraws();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [mode, setMode] = useState<"random" | "algorithmic">("random");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function create() {
    setBusy("create");
    setActionError(null);
    try {
      await createDraw(`${month}-01`, mode);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(null);
    }
  }

  async function simulate(id: string) {
    setBusy(id);
    setActionError(null);
    setResult(null);
    const nums = manual.trim()
      ? manual
          .split(/[,\s]+/)
          .map(Number)
          .filter((n) => Number.isFinite(n))
      : undefined;
    try {
      setResult(await simulateDraw(id, nums));
      setExpanded(id);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Simulation failed.");
    } finally {
      setBusy(null);
    }
  }

  async function publish(id: string) {
    setBusy(id);
    setActionError(null);
    try {
      await publishDraw(id);
      setResult(null);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setBusy(null);
    }
  }

  if (loading)
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  const draws = data ?? [];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Create draw */}
      <section>
        <p className="label-mono mb-4">Create draw</p>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Draw month">
              <input
                className={inputClass}
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </Field>
            <Field label="Draw logic" hint="Algorithmic weights by score frequency">
              <select
                className={inputClass}
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
              >
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </Field>
            <Button onClick={create} disabled={busy === "create"}>
              <span className="inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                {busy === "create" ? "Creating…" : "Create draw"}
              </span>
            </Button>
          </div>

          <div className="mt-4">
            <Field
              label="Manual winning numbers (optional)"
              hint="Five numbers 1–45, comma separated. Leave blank to generate automatically."
            >
              <input
                className={inputClass}
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="7, 14, 22, 31, 40"
              />
            </Field>
          </div>
        </div>
      </section>

      {actionError && <ErrorState message={actionError} />}

      {/* Simulation preview */}
      {result && (
        <section>
          <p className="label-mono mb-4">Simulation preview</p>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {result.winning_numbers.map((n, i) => (
                <NumberBall key={`${n}-${i}`} n={n} hit />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
              <div className="rounded-lg border border-white/10 p-3">
                <p className="label-mono text-white/35 mb-1">Eligible entries</p>
                <p className="text-white font-semibold">{result.eligible_entries}</p>
              </div>
              <div className="rounded-lg border border-white/10 p-3">
                <p className="label-mono text-white/35 mb-1">Prize pool</p>
                <p className="text-white font-semibold">{formatMoney(result.prize_pool_cents)}</p>
              </div>
              <div className="rounded-lg border border-white/10 p-3">
                <p className="label-mono text-white/35 mb-1">Jackpot rollover</p>
                <p className="text-white font-semibold">{formatMoney(result.rollover_out_cents)}</p>
              </div>
              <div className="rounded-lg border border-white/10 p-3">
                <p className="label-mono text-white/35 mb-1">5-match</p>
                <p className="text-white">
                  {result.winners_5} winner{result.winners_5 !== 1 ? "s" : ""} ·{" "}
                  {formatMoney(result.tier_5_cents)} each
                </p>
              </div>
              <div className="rounded-lg border border-white/10 p-3">
                <p className="label-mono text-white/35 mb-1">4-match</p>
                <p className="text-white">
                  {result.winners_4} winner{result.winners_4 !== 1 ? "s" : ""} ·{" "}
                  {formatMoney(result.tier_4_cents)} each
                </p>
              </div>
              <div className="rounded-lg border border-white/10 p-3">
                <p className="label-mono text-white/35 mb-1">3-match</p>
                <p className="text-white">
                  {result.winners_3} winner{result.winners_3 !== 1 ? "s" : ""} ·{" "}
                  {formatMoney(result.tier_3_cents)} each
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Draw list */}
      <section>
        <p className="label-mono mb-4">All draws ({draws.length})</p>
        {draws.length === 0 && <EmptyState message="No draws created yet." />}
        <div className="space-y-3">
          {draws.map((d) => {
            const isOpen = expanded === d.id;
            return (
              <div
                key={d.id}
                className={`rounded-xl border bg-white/[0.02] overflow-hidden transition ${
                  d.status === "published"
                    ? "border-emerald-400/15"
                    : d.status === "simulated"
                      ? "border-amber-400/15"
                      : "border-white/10"
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatMonth(d.draw_month)}</p>
                    <p className="text-xs text-white/40">
                      {d.mode} · {d.eligible_count} entries ·{" "}
                      {formatMoney(
                        d.prize_pool_cents < 5000 && d.prize_pool_cents > 0
                          ? d.prize_pool_cents * 1000
                          : d.prize_pool_cents,
                        "INR",
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        d.status === "published"
                          ? "good"
                          : d.status === "simulated"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {d.status}
                    </Badge>
                    {d.status !== "published" && (
                      <Button
                        variant="ghost"
                        onClick={() => simulate(d.id)}
                        disabled={busy === d.id}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Play className="h-3.5 w-3.5" />
                          {busy === d.id ? "Running…" : "Simulate"}
                        </span>
                      </Button>
                    )}
                    {d.status === "simulated" && (
                      <Button onClick={() => publish(d.id)} disabled={busy === d.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5" />
                          Publish
                        </span>
                      </Button>
                    )}
                    {d.winning_numbers && (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : d.id)}
                        className="rounded-lg border border-white/10 p-1.5 text-white/40 hover:text-white/70 transition"
                      >
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded numbers */}
                {isOpen && d.winning_numbers && (
                  <div className="border-t border-white/8 px-5 py-4">
                    <p className="label-mono text-white/35 mb-3">Winning numbers</p>
                    <div className="flex flex-wrap gap-2">
                      {d.winning_numbers.map((n, i) => (
                        <NumberBall key={`${n}-${i}`} n={n} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
