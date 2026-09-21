import { useRef, useState } from "react";
import { useMyWinnings } from "@/hooks/useWinners";
import { getProofUrl, uploadProof, type WinnerRecord } from "@/lib/winnerService";
import { formatMoney, formatMonth } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Badge,
  Button,
} from "@/components/common/States";
import { NumberBall } from "@/components/draw/DrawsPanel";

function WinnerRow({ w, onChange }: { w: WinnerRecord; onChange: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const currency = w.draws?.currency ?? "GBP";

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      await uploadProof(w, file);
      onChange();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function view() {
    if (!w.proof_path) return;
    try {
      window.open(await getProofUrl(w.proof_path), "_blank", "noopener");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not open the file.");
    }
  }

  const vTone =
    w.verification_status === "approved"
      ? "good"
      : w.verification_status === "rejected"
        ? "bad"
        : "warn";

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-medium text-white">{formatMonth(w.draws?.draw_month ?? null)}</span>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">{w.match_count} match</Badge>
          <Badge tone={vTone}>{w.verification_status}</Badge>
          <Badge tone={w.payout_status === "paid" ? "good" : "neutral"}>{w.payout_status}</Badge>
        </div>
      </div>

      <p className="mt-3 text-2xl text-white">{formatMoney(w.prize_cents, currency)}</p>

      {w.matched_numbers && w.matched_numbers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {w.matched_numbers.map((n, i) => (
            <NumberBall key={`${n}-${i}`} n={n} hit />
          ))}
        </div>
      )}

      {w.verification_status === "rejected" && w.rejection_reason && (
        <p className="mt-3 text-sm text-red-300/85">Rejected: {w.rejection_reason}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={pick}
        />
        <Button onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Uploading…" : w.proof_path ? "Replace proof" : "Upload proof"}
        </Button>
        {w.proof_path && (
          <Button variant="ghost" onClick={view}>
            View proof
          </Button>
        )}
      </div>

      {!w.proof_path && (
        <p className="mt-2 text-xs text-white/40">
          Upload a screenshot of your scores from the golf platform to be verified.
        </p>
      )}
      {err && (
        <div className="mt-3">
          <ErrorState message={err} />
        </div>
      )}
    </div>
  );
}

export function WinnersPanel({ compact = false }: { compact?: boolean }) {
  const { data, loading, error, refetch } = useMyWinnings();
  if (loading)
    return (
      <Panel>
        <Loading label="Loading winnings…" />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );

  const wins = data ?? [];
  const total = wins.reduce((sum, w) => sum + (w.prize_cents ?? 0), 0);
  const paid = wins
    .filter((w) => w.payout_status === "paid")
    .reduce((s, w) => s + w.prize_cents, 0);
  const currency = wins[0]?.draws?.currency ?? "GBP";

  return (
    <Panel>
      <PanelTitle>Winnings</PanelTitle>
      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
        <div>
          <p className="text-2xl text-white">{formatMoney(total, currency)}</p>
          <p className="text-xs text-white/40">Total won</p>
        </div>
        <div>
          <p className="text-2xl text-white">{formatMoney(paid, currency)}</p>
          <p className="text-xs text-white/40">Paid out</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {wins.length === 0 && (
          <EmptyState message="No winnings yet. Keep your five scores up to date to stay in the draw." />
        )}
        {(compact ? wins.slice(0, 2) : wins).map((w) => (
          <WinnerRow key={w.id} w={w} onChange={refetch} />
        ))}
      </div>
    </Panel>
  );
}

export default WinnersPanel;
