import { Link } from "@tanstack/react-router";
import { useSubscription } from "@/hooks/useSubscription";
import { useCharities, useSettings } from "@/hooks/useCharities";
import { useProfile } from "@/hooks/useProfile";
import { useMyWinnings } from "@/hooks/useWinners";
import { formatMoney, formatDate } from "@/lib/format";
import { Loading } from "@/components/common/States";
import { CreditCard, Heart, Trophy, ArrowRight } from "lucide-react";

function SummaryCard({
  icon,
  label,
  children,
  to,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  to: string;
  delay?: number;
}) {
  return (
    <div
      className="card-lift animate-fade-up-delay-2 relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-white/30">{icon}</div>
          <p className="label-mono">{label}</p>
        </div>
        {children}
      </div>
      <Link
        to={to}
        className="mt-4 inline-flex items-center gap-1 text-xs text-white/40 transition hover:text-emerald-300"
      >
        Manage <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export function MemberSummaryCards() {
  const { subscription, isActive, loading: subLoading } = useSubscription();
  const { profile, status: profileStatus } = useProfile();
  const { data: charities, loading: charLoading } = useCharities();
  const { data: settings } = useSettings();
  const { data: winnings, loading: winLoading } = useMyWinnings();

  const charity = (charities ?? []).find((c) => c.id === profile?.charityId) ?? null;
  const percent = profile?.charityPercent ?? settings?.min_charity_percent ?? 10;

  const wins = winnings ?? [];
  const totalWon = wins.reduce((s, w) => s + (w.prize_cents ?? 0), 0);
  const paidOut = wins
    .filter((w) => w.payout_status === "paid")
    .reduce((s, w) => s + w.prize_cents, 0);
  const currency = wins[0]?.draws?.currency ?? subscription?.currency ?? "INR";

  // Charity contribution amount
  const charityAmount =
    isActive && subscription ? Math.round((subscription.amount_cents * percent) / 100) : null;

  return (
    <div className="grid gap-4 sm:grid-cols-3 animate-fade-up-delay-2">
      {/* Membership card */}
      <SummaryCard
        icon={<CreditCard className="h-4 w-4" />}
        label="Membership"
        to="/subscription"
        delay={0}
      >
        {subLoading ? (
          <Loading />
        ) : isActive && subscription ? (
          <>
            <p className="text-lg font-semibold text-white">
              {formatMoney(subscription.amount_cents, subscription.currency)}
            </p>
            <p className="text-xs text-white/45">
              per {subscription.interval === "yearly" ? "year" : "month"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-emerald-300">
                {subscription.cancel_at_period_end ? "Ending" : "Active"}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/35">
              {subscription.cancel_at_period_end ? "Ends" : "Renews"}{" "}
              {formatDate(subscription.current_period_end)}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-amber-300/80">Not subscribed</p>
            <p className="mt-1 text-xs text-white/35">Subscribe to enter the monthly draw.</p>
          </>
        )}
      </SummaryCard>

      {/* Charity card */}
      <SummaryCard
        icon={<Heart className="h-4 w-4" />}
        label="Your charity"
        to="/charity"
        delay={70}
      >
        {charLoading || profileStatus === "loading" ? (
          <Loading />
        ) : charity ? (
          <>
            <p className="text-sm font-medium text-white leading-snug">{charity.name}</p>
            <p className="mt-1 text-xs text-white/45">{percent}% of subscription</p>
            {charityAmount !== null && (
              <p className="mt-1 text-xs text-emerald-300/70">
                ≈ {formatMoney(charityAmount, subscription?.currency ?? "INR")} / month
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-white/45">No charity selected</p>
            <p className="mt-1 text-xs text-white/35">Choose a cause to support.</p>
          </>
        )}
      </SummaryCard>

      {/* Winnings card */}
      <SummaryCard icon={<Trophy className="h-4 w-4" />} label="Winnings" to="/winners" delay={140}>
        {winLoading ? (
          <Loading />
        ) : (
          <>
            <p className="text-lg font-semibold text-white">{formatMoney(totalWon, currency)}</p>
            <p className="text-xs text-white/45">total won</p>
            <p className="mt-1 text-xs text-white/35">{formatMoney(paidOut, currency)} paid out</p>
            {wins.filter((w) => w.verification_status === "pending").length > 0 && (
              <p className="mt-1 text-xs text-amber-300/70">
                {wins.filter((w) => w.verification_status === "pending").length} pending
                verification
              </p>
            )}
          </>
        )}
      </SummaryCard>
    </div>
  );
}

export default MemberSummaryCards;
