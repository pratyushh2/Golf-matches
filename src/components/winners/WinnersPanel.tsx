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
import { Upload, Eye, Trophy } from "lucide-react";

function VerificationBadge({ status }: { status: string }) {
  const tone = status === "approved" ? "good" : status === "rejected" ? "bad" : "warn";
  return <Badge tone={tone}>{status}</Badge>;
}

function WinnerRow({ w, onChange }: { w: WinnerRecord; onChange: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const currency = w.draws?.currency ?? "INR";

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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden card-lift">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
        <div>
          <p className="label-mono text-white/40">{formatMonth(w.draws?.draw_month ?? null)}</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {formatMoney(w.prize_cents, currency)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="good">{w.match_count} match</Badge>
          <VerificationBadge status={w.verification_status} />
          <Badge tone={w.payout_status === "paid" ? "good" : "neutral"}>{w.payout_status}</Badge>
        </div>
      </div>

      {/* Matched numbers */}
      {w.matched_numbers && w.matched_numbers.length > 0 && (
        <div className="px-5 py-4">
          <p className="label-mono text-white/35 mb-3">Your matching numbers</p>
          <div className="flex flex-wrap gap-2">
            {w.matched_numbers.map((n, i) => (
              <NumberBall key={`${n}-${i}`} n={n} hit />
            ))}
          </div>
        </div>
      )}

      {/* Rejection reason */}
      {w.verification_status === "rejected" && w.rejection_reason && (
        <div className="mx-5 mb-4 rounded-lg border border-red-400/20 bg-red-400/[0.04] px-4 py-3">
          <p className="text-sm text-red-300/85">Rejected: {w.rejection_reason}</p>
        </div>
      )}

      {/* Proof actions */}
      <div className="border-t border-white/8 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            onChange={pick}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={busy}>
            <span className="inline-flex items-center gap-2">
              <Upload className="h-3.5 w-3.5" />
              {busy ? "Uploading…" : w.proof_path ? "Replace proof" : "Upload proof"}
            </span>
          </Button>
          {w.proof_path && (
            <Button variant="ghost" onClick={view}>
              <span className="inline-flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                View proof
              </span>
            </Button>
          )}
        </div>
        {!w.proof_path && (
          <p className="mt-2 text-xs text-white/35">
            Upload a screenshot of your scores from the golf platform to be verified.
          </p>
        )}
        {err && (
          <div className="mt-3">
            <ErrorState message={err} />
          </div>
        )}
      </div>
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
  const pending = wins.filter((w) => w.verification_status === "pending").length;
  const currency = wins[0]?.draws?.currency ?? "INR";

  if (compact) {
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
        {wins.length === 0 && <p className="mt-4 text-sm text-white/40">No winnings yet.</p>}
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-white/30" />
            <p className="label-mono">Total won</p>
          </div>
          <p className="text-3xl font-semibold text-white">{formatMoney(total, currency)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 animate-fade-up-delay-1">
          <p className="label-mono mb-2">Paid out</p>
          <p className="text-3xl font-semibold text-white">{formatMoney(paid, currency)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 animate-fade-up-delay-2">
          <p className="label-mono mb-2">Pending verification</p>
          <p className="text-3xl font-semibold text-white">{pending}</p>
          {pending > 0 && <p className="mt-1 text-xs text-amber-300/70">Upload proof to proceed</p>}
        </div>
      </div>

      {/* History */}
      <div>
        <p className="label-mono mb-4">Winning history</p>
        {wins.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-white/15 mb-3" />
            <p className="text-sm text-white/45">
              Your winning history will appear here after your first winning draw.
            </p>
            <p className="mt-1 text-xs text-white/30">
              Keep your five scores up to date to stay in the monthly draw.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(compact ? wins.slice(0, 2) : wins).map((w) => (
              <WinnerRow key={w.id} w={w} onChange={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WinnersPanel;
