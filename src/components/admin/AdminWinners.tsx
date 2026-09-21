import { useState } from "react";
import { useAllWinners } from "@/hooks/useWinners";
import { getProofUrl, reviewWinner, setPayoutStatus } from "@/lib/winnerService";
import { formatMoney, formatMonth } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Badge,
  inputClass,
} from "@/components/common/States";

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
  const winners = (data ?? []) as Array<
    NonNullable<typeof data>[number] & {
      profiles?: { full_name: string | null; email: string | null };
    }
  >;

  return (
    <Panel>
      <PanelTitle>Winners ({winners.length})</PanelTitle>
      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}
      <div className="mt-5 space-y-3">
        {winners.length === 0 && (
          <EmptyState message="No winners recorded. Simulate and publish a draw first." />
        )}
        {winners.map((w) => (
          <div key={w.id} className="rounded-lg border border-white/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">
                  {w.profiles?.full_name ?? w.profiles?.email ?? w.user_id}
                </p>
                <p className="text-xs text-white/40">
                  {formatMonth(w.draws?.draw_month ?? null)} · {w.match_count} match ·{" "}
                  {formatMoney(w.prize_cents, w.draws?.currency ?? "GBP")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  tone={
                    w.verification_status === "approved"
                      ? "good"
                      : w.verification_status === "rejected"
                        ? "bad"
                        : "warn"
                  }
                >
                  {w.verification_status}
                </Badge>
                <Badge tone={w.payout_status === "paid" ? "good" : "neutral"}>
                  {w.payout_status}
                </Badge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {w.proof_path ? (
                <Button variant="ghost" onClick={() => view(w.proof_path!)}>
                  View proof
                </Button>
              ) : (
                <span className="text-xs text-white/35">No proof uploaded</span>
              )}
              <Button
                disabled={busy === w.id || !w.proof_path}
                onClick={() => run(w.id, () => reviewWinner(w.id, "approved"))}
              >
                Approve
              </Button>
              <input
                className={`${inputClass} w-48`}
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
                Reject
              </Button>
              <Button
                variant="ghost"
                disabled={busy === w.id || w.verification_status !== "approved"}
                onClick={() =>
                  run(w.id, () =>
                    setPayoutStatus(w.id, w.payout_status === "paid" ? "pending" : "paid"),
                  )
                }
              >
                {w.payout_status === "paid" ? "Mark unpaid" : "Mark as paid"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-white/30">
              Marking as paid records that an administrator settled the payout outside the platform.
              No payment is processed here.
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
