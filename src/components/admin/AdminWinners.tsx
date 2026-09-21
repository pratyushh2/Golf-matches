import { useState } from "react";
import { useAllWinners } from "@/hooks/useWinners";
import { getProofUrl, reviewWinner, setPayoutStatus } from "@/lib/winnerService";
import { formatMoney, formatMonth } from "@/lib/format";
import {
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Badge,
  inputClass,
} from "@/components/common/States";
import { Eye, CheckCircle, XCircle, Banknote } from "lucide-react";

type WinnerWithProfile = {
  id: string;
  user_id: string;
  draw_id: string;
  match_count: number;
  matched_numbers: number[] | null;
  prize_cents: number;
  proof_path: string | null;
  verification_status: string;
  payout_status: string;
  rejection_reason: string | null;
  draws?: { draw_month: string | null; currency: string } | null;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export default function AdminWinners() {
  const { data, loading, error, refetch } = useAllWinners();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reason, setReason] = useState<Record<string, string>>({});

  async function run(id: string, fn: () => Promise<void>) {
    setBusy(id);
    setActionError(null);
    try {
      await fn();
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function view(path: string) {
    try {
      window.open(await getProofUrl(path), "_blank", "noopener");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not open proof.");
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

  const winners = (data ?? []) as WinnerWithProfile[];
  const pendingVer = winners.filter((w) => w.verification_status === "pending").length;
  const pendingPay = winners.filter(
    (w) => w.payout_status === "pending" && w.verification_status === "approved",
  ).length;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="label-mono text-white/35 mb-1">Total winners</p>
          <p className="text-2xl font-semibold text-white">{winners.length}</p>
        </div>
        <div
          className={`rounded-xl border p-4 ${pendingVer > 0 ? "border-amber-400/20 bg-amber-400/[0.04]" : "border-white/10 bg-white/[0.02]"}`}
        >
          <p className="label-mono text-white/35 mb-1">Awaiting verification</p>
          <p
            className={`text-2xl font-semibold ${pendingVer > 0 ? "text-amber-300" : "text-white"}`}
          >
            {pendingVer}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${pendingPay > 0 ? "border-amber-400/20 bg-amber-400/[0.04]" : "border-white/10 bg-white/[0.02]"}`}
        >
          <p className="label-mono text-white/35 mb-1">Payouts pending</p>
          <p
            className={`text-2xl font-semibold ${pendingPay > 0 ? "text-amber-300" : "text-white"}`}
          >
            {pendingPay}
          </p>
        </div>
      </div>

      {actionError && <ErrorState message={actionError} />}

      {/* Winner cards */}
      <section>
        <p className="label-mono mb-4">All winners ({winners.length})</p>
        {winners.length === 0 && (
          <EmptyState message="No winners recorded. Simulate and publish a draw first." />
        )}
        <div className="space-y-4">
          {winners.map((w) => {
            const currency = w.draws?.currency ?? "INR";
            const vTone =
              w.verification_status === "approved"
                ? "good"
                : w.verification_status === "rejected"
                  ? "bad"
                  : "warn";
            const name = w.profiles?.full_name ?? w.profiles?.email ?? w.user_id;

            return (
              <div
                key={w.id}
                className={`rounded-xl border overflow-hidden bg-white/[0.02] ${
                  w.verification_status === "pending"
                    ? "border-amber-400/15"
                    : w.verification_status === "rejected"
                      ? "border-red-400/15"
                      : "border-white/10"
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-[260px]">
                      {name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {formatMonth(w.draws?.draw_month ?? null)} · {w.match_count} match
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {formatMoney(w.prize_cents, currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={vTone}>{w.verification_status}</Badge>
                    <Badge tone={w.payout_status === "paid" ? "good" : "neutral"}>
                      {w.payout_status}
                    </Badge>
                  </div>
                </div>

                {/* Rejection reason */}
                {w.verification_status === "rejected" && w.rejection_reason && (
                  <div className="mx-5 mt-3 rounded-lg border border-red-400/20 bg-red-400/[0.04] px-3 py-2">
                    <p className="text-xs text-red-300/80">Rejected: {w.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-white/8 mt-4 px-5 py-4">
                  <div className="flex flex-wrap items-start gap-3">
                    {/* Proof */}
                    <div className="flex items-center gap-2">
                      {w.proof_path ? (
                        <Button variant="ghost" onClick={() => view(w.proof_path!)}>
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            View proof
                          </span>
                        </Button>
                      ) : (
                        <span className="text-xs text-white/30 italic">No proof uploaded</span>
                      )}
                    </div>

                    {/* Approve */}
                    <Button
                      disabled={busy === w.id || !w.proof_path}
                      onClick={() => run(w.id, () => reviewWinner(w.id, "approved"))}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </span>
                    </Button>

                    {/* Reject with reason */}
                    <div className="flex items-center gap-2">
                      <input
                        className={`${inputClass} w-44`}
                        placeholder="Rejection reason"
                        value={reason[w.id] ?? ""}
                        onChange={(e) => setReason({ ...reason, [w.id]: e.target.value })}
                      />
                      <Button
                        variant="danger"
                        disabled={busy === w.id}
                        onClick={() =>
                          run(w.id, () =>
                            reviewWinner(w.id, "rejected", reason[w.id] || "Proof not acceptable"),
                          )
                        }
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </span>
                      </Button>
                    </div>

                    {/* Payout toggle */}
                    <Button
                      variant="ghost"
                      disabled={busy === w.id || w.verification_status !== "approved"}
                      onClick={() =>
                        run(w.id, () =>
                          setPayoutStatus(w.id, w.payout_status === "paid" ? "pending" : "paid"),
                        )
                      }
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Banknote className="h-3.5 w-3.5" />
                        {w.payout_status === "paid" ? "Mark unpaid" : "Mark as paid"}
                      </span>
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-white/25">
                    Marking as paid records administrator settlement. No payment is processed here.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
