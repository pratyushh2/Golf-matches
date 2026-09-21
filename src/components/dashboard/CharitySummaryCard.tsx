import { Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { useCharities, useSettings } from "@/hooks/useCharities";
import { Panel, PanelTitle, Loading, EmptyState } from "@/components/common/States";

export default function CharitySummaryCard() {
  const { profile, status } = useProfile();
  const { data: charities, loading } = useCharities();
  const { data: settings } = useSettings();

  if (status === "loading" || loading)
    return (
      <Panel>
        <Loading />
      </Panel>
    );

  const charity = (charities ?? []).find((c) => c.id === profile?.charityId) ?? null;
  const percent = profile?.charityPercent ?? settings?.min_charity_percent ?? 10;

  return (
    <Panel>
      <PanelTitle>Your charity</PanelTitle>
      {charity ? (
        <>
          <p className="mt-3 text-lg text-white">{charity.name}</p>
          <p className="mt-1 text-sm text-white/50">{percent}% of your subscription</p>
        </>
      ) : (
        <div className="mt-3">
          <EmptyState message="No charity selected yet." />
        </div>
      )}
      <Link
        to="/charity"
        className="mt-4 inline-block text-sm text-emerald-300/80 hover:text-emerald-200"
      >
        {charity ? "Change selection" : "Choose a charity"} →
      </Link>
    </Panel>
  );
}
