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
import { useCharities, useSettings } from "@/hooks/useCharities";
import { useProfile } from "@/hooks/useProfile";
import { CreditCard, Calendar, Heart, RefreshCw, Sparkles, Check } from "lucide-react";

export function SubscriptionPanel({ compact = false }: { compact?: boolean }) {
  const { subscription, isActive, loading, error, refetch } = useSubscription();
  const { data: plans, loading: plansLoading } = usePlans();
  const { profile } = useProfile();
  const { data: charities } = useCharities();
  const { data: settings } = useSettings();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const provider = getPaymentProvider();

  const charity = (charities ?? []).find((c) => c.id === profile?.charityId) ?? null;
  const percent = profile?.charityPercent ?? settings?.min_charity_percent ?? 10;
  const charityAmount =
    isActive && subscription ? Math.round((subscription.amount_cents * percent) / 100) : null;

  const monthlyPlan = plans?.find((p) => p.interval === "monthly" || p.code === "monthly");
  const yearlyPlan = plans?.find((p) => p.interval === "yearly" || p.code === "yearly");
  const monthlyAnnualized = monthlyPlan ? monthlyPlan.price_cents * 12 : 99900 * 12;
  const yearlyPrice = yearlyPlan ? yearlyPlan.price_cents : 999900;
  const annualSavingsCents = Math.max(0, monthlyAnnualized - yearlyPrice);
  const annualSavingsPercent = ((annualSavingsCents / monthlyAnnualized) * 100).toFixed(1);

  async function choose(plan: Plan) {
    setBusy(plan.code);
    setActionError(null);
    try {
      await subscribe(plan);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not activate subscription.");
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
      setActionError(e instanceof Error ? e.message : "Could not cancel subscription.");
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

  if (compact) {
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
          <div className="mt-3 space-y-1">
            <p className="text-lg text-white font-medium">
              {subscription.interval === "yearly" ? "Annual" : "Monthly"} ·{" "}
              {formatMoney(subscription.amount_cents, subscription.currency)}
            </p>
            <p className="text-sm text-white/50">
              {subscription.cancel_at_period_end ? "Ends" : "Renews"}{" "}
              {formatDate(subscription.current_period_end)}
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState message="You are not subscribed. Non-subscribers cannot enter the monthly draw." />
          </div>
        )}
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Current membership status ── */}
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-mono mb-1">Membership</p>
            {isActive && subscription ? (
              <>
                <h2 className="text-3xl font-semibold text-white">
                  {formatMoney(subscription.amount_cents, subscription.currency)}
                </h2>
                <p className="text-sm text-white/45">
                  per {subscription.interval === "yearly" ? "year" : "month"}
                </p>
              </>
            ) : (
              <h2 className="text-xl text-white/60">Not subscribed</h2>
            )}
          </div>
          <Badge tone={isActive ? "good" : "warn"}>
            {isActive
              ? subscription?.cancel_at_period_end
                ? "Active · ending"
                : "● Active"
              : (subscription?.status ?? "Inactive")}
          </Badge>
        </div>

        {isActive && subscription && (
          <>
            <div className="rule-line my-5" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 text-white/30 shrink-0" />
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-[0.1em]">Plan</p>
                  <p className="mt-0.5 text-sm text-white">
                    {subscription.interval === "yearly" ? "Annual plan" : "Monthly plan"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-white/30 shrink-0" />
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-[0.1em]">
                    {subscription.cancel_at_period_end ? "Ends" : "Renews"}
                  </p>
                  <p className="mt-0.5 text-sm text-white">
                    {formatDate(subscription.current_period_end)}
                  </p>
                </div>
              </div>

              {charity && (
                <div className="flex items-start gap-2">
                  <Heart className="mt-0.5 h-4 w-4 text-white/30 shrink-0" />
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-[0.1em]">
                      Charity impact
                    </p>
                    <p className="mt-0.5 text-sm text-white">{percent}%</p>
                    {charityAmount !== null && (
                      <p className="text-xs text-emerald-300/80 font-medium">
                        ≈ {formatMoney(charityAmount, subscription.currency)} /{" "}
                        {subscription.interval === "yearly" ? "yr" : "mo"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <RefreshCw className="mt-0.5 h-4 w-4 text-white/30 shrink-0" />
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-[0.1em]">Status</p>
                  <p className="mt-0.5 text-sm text-white">
                    {subscription.cancel_at_period_end
                      ? "Cancelling at period end"
                      : "Auto-renewing"}
                  </p>
                </div>
              </div>
            </div>

            {!subscription.cancel_at_period_end && (
              <div className="mt-6">
                <Button variant="danger" onClick={cancel} disabled={busy === "cancel"}>
                  {busy === "cancel" ? "Cancelling…" : "Cancel subscription at period end"}
                </Button>
              </div>
            )}
          </>
        )}
      </Panel>

      {/* ── Choose a plan if not subscribed ── */}
      {!isActive && (
        <Panel>
          <PanelTitle>Choose your membership plan</PanelTitle>
          <p className="mt-2 text-sm text-white/50">
            Subscribe to enter the monthly prize draws and support verified charities across India.
          </p>

          <div className="mt-6">
            {plansLoading && <Loading />}
            {!plansLoading && (plans ?? []).length === 0 && (
              <p className="text-sm text-amber-200/80">
                No plans are configured yet. An administrator must add pricing before subscriptions
                can start.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {(plans ?? []).map((p) => {
                const isYearly = p.interval === "yearly" || p.code.includes("year");
                return (
                  <div
                    key={p.code}
                    className={`rounded-2xl border p-6 flex flex-col justify-between card-lift relative ${
                      isYearly
                        ? "border-emerald-400/40 bg-emerald-400/[0.04]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    {isYearly && (
                      <span className="absolute -top-3 right-6 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-emerald-300">
                        SAVE {formatMoney(annualSavingsCents, "INR")} / YEAR ({annualSavingsPercent}
                        %)
                      </span>
                    )}

                    <div>
                      <p className="font-semibold text-white text-lg">{p.name}</p>
                      <p className="mt-3 text-3xl font-bold text-white tracking-tight">
                        {formatMoney(p.price_cents, p.currency)}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        per {isYearly ? "year" : "month"}
                      </p>

                      <ul className="mt-6 space-y-2 text-xs text-white/60">
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Eligible for monthly prize draws</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Direct min 10% to your chosen charity</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>5-number rolling score tracking</span>
                        </li>
                        {isYearly && (
                          <li className="flex items-center gap-2 text-emerald-300 font-medium">
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>Save {formatMoney(annualSavingsCents, "INR")} / year</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/10">
                      <Button onClick={() => choose(p)} disabled={busy === p.code}>
                        {busy === p.code ? "Activating…" : `Choose ${p.name}`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      )}

      {actionError && (
        <div>
          <ErrorState message={actionError} />
        </div>
      )}

      {!provider.isLive && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-200/80">
          <span className="font-semibold text-amber-200">Test mode:</span> No payment is taken and
          no card is stored. Subscriptions are activated immediately for testing.
        </div>
      )}
    </div>
  );
}

export default SubscriptionPanel;
