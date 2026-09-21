import { useState } from "react";
import { useAllDraws } from "@/hooks/useDraws";
import { createDraw, publishDraw, simulateDraw, type SimulationResult } from "@/lib/drawService";
import { formatMoney, formatMonth } from "@/lib/format";
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
import { NumberBall } from "@/components/draw/DrawsPanel";

export default function AdminDraws() {
  const { data, loading, error, refetch } = useAllDraws();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [mode, setMode] = useState<"random" | "algorithmic">("random");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);

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
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Publish failed.");
    } finally {
      setBusy(null);
    }
  }

  if (loading)
    return (
      <Panel>
        <Loading />
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
      <PanelTitle>Draw management</PanelTitle>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Draw month">
          <input
            className={inputClass}
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </Field>
        <Field label="Draw logic" hint="Algorithmic weights numbers by score frequency">
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
          Create draw
        </Button>
      </div>

      <div className="mt-4">
        <Field
          label="Manual winning numbers (optional)"
          hint="Five numbers 1–45, comma separated. Leave blank to generate."
        >
          <input
            className={inputClass}
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="7, 14, 22, 31, 40"
          />
        </Field>
      </div>

      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-4 text-sm text-white/75">
          <p className="mb-2 font-medium text-white">Simulation preview</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {result.winning_numbers.map((n, i) => (
              <NumberBall key={`${n}-${i}`} n={n} hit />
            ))}
          </div>
          <ul className="space-y-1 text-xs">
            <li>Eligible entries: {result.eligible_entries}</li>
            <li>Prize pool: {formatMoney(result.prize_pool_cents)}</li>
            <li>
              5-match: {result.winners_5} winner(s) · tier {formatMoney(result.tier_5_cents)}
            </li>
            <li>
              4-match: {result.winners_4} winner(s) · tier {formatMoney(result.tier_4_cents)}
            </li>
            <li>
              3-match: {result.winners_3} winner(s) · tier {formatMoney(result.tier_3_cents)}
            </li>
            <li>Jackpot rollover: {formatMoney(result.rollover_out_cents)}</li>
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {draws.length === 0 && <EmptyState message="No draws created yet." />}
        {draws.map((d) => (
          <div key={d.id} className="rounded-lg border border-white/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white">{formatMonth(d.draw_month)}</p>
                <p className="text-xs text-white/40">
                  {d.mode} · {d.eligible_count} entries · pool{" "}
                  {formatMoney(d.prize_pool_cents, d.currency)}
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
                  <Button variant="ghost" onClick={() => simulate(d.id)} disabled={busy === d.id}>
                    Simulate
                  </Button>
                )}
                {d.status === "simulated" && (
                  <Button onClick={() => publish(d.id)} disabled={busy === d.id}>
                    Publish
                  </Button>
                )}
              </div>
            </div>
            {d.winning_numbers && (
              <div className="mt-3 flex flex-wrap gap-2">
                {d.winning_numbers.map((n, i) => (
                  <NumberBall key={`${n}-${i}`} n={n} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
