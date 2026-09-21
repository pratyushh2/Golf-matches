import { useState } from "react";
import { usePlans, useSubscription } from "@/hooks/useSubscription";
import {
  cancelSubscription,
  getPaymentProvider,
  subscribe,
  type Plan,
} from "@/lib/subscriptionService";
import { formatDate, formatMoney } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Badge,
} from "@/components/common/States";

export function SubscriptionPanel({ compact = false }: { compact?: boolean }) {
  const { subscription, isActive, loading, error, refetch } = useSubscription();
  const { data: plans, loading: plansLoading } = usePlans();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const provider = getPaymentProvider();

  async function choose(plan: Plan) {
    setBusy(plan.code);
    setActionError(null);
    try {
      await subscribe(plan);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not activate.");
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    setBusy("cancel");
    setActionError(null);
    try {
      await cancelSubscription();
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not cancel.");
    } finally {
      setBusy(null);
    }
  }

  if (loading)
    return (
      <Panel>
        <Loading label="Loading subscription…" />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <PanelTitle>Membership</PanelTitle>
        <Badge tone={isActive ? "good" : "warn"}>
          {isActive
            ? subscription?.cancel_at_period_end
              ? "Active · ending"
              : "Active"
            : (subscription?.status ?? "Inactive")}
        </Badge>
      </div>

      {isActive && subscription ? (
        <div className="mt-4 space-y-1">
          <p className="text-lg text-white">
            {subscription.interval === "yearly" ? "Yearly" : "Monthly"} ·{" "}
            {formatMoney(subscription.amount_cents, subscription.currency)}
          </p>
          <p className="text-sm text-white/50">
            {subscription.cancel_at_period_end ? "Ends" : "Renews"}{" "}
            {formatDate(subscription.current_period_end)}
          </p>
          {!compact && !subscription.cancel_at_period_end && (
            <div className="pt-3">
              <Button variant="danger" onClick={cancel} disabled={busy === "cancel"}>
                {busy === "cancel" ? "Cancelling…" : "Cancel at period end"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState message="You are not subscribed. Non-subscribers cannot enter the monthly draw." />
          {!compact && (
            <>
              {plansLoading && (
                <div className="mt-4">
                  <Loading />
                </div>
              )}
              {!plansLoading && (plans ?? []).length === 0 && (
                <p className="mt-4 text-sm text-amber-200/80">
                  No plans are configured yet. An administrator must add pricing before
                  subscriptions can start.
                </p>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(plans ?? []).map((p) => (
                  <div key={p.code} className="rounded-xl border border-white/10 p-4">
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="mt-1 text-2xl text-white">
                      {formatMoney(p.price_cents, p.currency)}
                    </p>
                    <p className="text-xs text-white/40">
                      per {p.interval === "yearly" ? "year" : "month"}
                    </p>
                    <div className="mt-4">
                      <Button onClick={() => choose(p)} disabled={busy === p.code}>
                        {busy === p.code ? "Activating…" : "Choose plan"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}

      {!provider.isLive && !compact && (
        <p className="mt-5 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] px-3 py-2 text-xs text-amber-200/80">
          Test mode — no payment is taken and no card is stored. Subscription records are marked as
          test data.
        </p>
      )}
    </Panel>
  );
}

export default SubscriptionPanel;
