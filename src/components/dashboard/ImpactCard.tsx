import { Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { useCharities, useSettings } from "@/hooks/useCharities";
import { useSubscription } from "@/hooks/useSubscription";
import { formatMoney } from "@/lib/format";
import { Heart, ArrowRight } from "lucide-react";
import { Loading } from "@/components/common/States";

export function ImpactCard() {
  const { profile } = useProfile();
  const { data: charities, loading } = useCharities();
  const { data: settings } = useSettings();
  const { subscription, isActive } = useSubscription();

  const charity = (charities ?? []).find((c) => c.id === profile?.charityId) ?? null;
  const percent = profile?.charityPercent ?? settings?.min_charity_percent ?? 10;

  const charityAmount =
    isActive && subscription ? Math.round((subscription.amount_cents * percent) / 100) : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 card-lift animate-fade-up-delay-3">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-4 w-4 text-white/30" />
        <p className="label-mono">Your impact</p>
      </div>

      {loading ? (
        <Loading />
      ) : charity ? (
        <>
          {charityAmount !== null && (
            <p className="text-2xl font-semibold text-white">
              {formatMoney(charityAmount, subscription?.currency ?? "INR")}
            </p>
          )}
          <p className="mt-1 text-xs text-white/40">contributed this month ({percent}%)</p>

          <p className="mt-3 text-sm font-medium text-white/80">{charity.name}</p>
          {charity.description && (
            <p className="mt-1 text-xs text-white/40 line-clamp-2">{charity.description}</p>
          )}
          <p className="mt-2 text-xs text-white/30">
            Your membership helps support the charity you've chosen.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-white/45">No charity selected yet.</p>
          <p className="mt-1 text-xs text-white/30">
            Choose a charity to make your membership count.
          </p>
        </>
      )}

      <Link
        to="/charity"
        className="mt-4 inline-flex items-center gap-1 text-xs text-emerald-300/70 transition hover:text-emerald-200"
      >
        {charity ? "Change charity" : "Choose charity"} <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export default ImpactCard;
