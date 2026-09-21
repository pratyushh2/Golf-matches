import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { AppNav } from "@/components/common/AppNav";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";
import ParticipationCard from "@/components/dashboard/ParticipationCard";
import CharitySummaryCard from "@/components/dashboard/CharitySummaryCard";
import { SubscriptionPanel } from "@/components/subscription/SubscriptionPanel";
import { ScoresPanel } from "@/components/scores/ScoresPanel";
import { WinnersPanel } from "@/components/winners/WinnersPanel";
import { Panel, Loading } from "@/components/common/States";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { status, errorCode } = useProfile();

  useEffect(() => {
    if (status === "error" && errorCode === "UNAUTHENTICATED") {
      void navigate({ to: "/login" });
    }
  }, [status, errorCode, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <AppNav currentPath="/dashboard" />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <Panel>
            <Loading label="Loading your dashboard…" />
          </Panel>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/dashboard" />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Header Profile Summary */}
        <ProfileSummary />

        {/* Status Row: Participation & Charity */}
        <div className="grid gap-6 md:grid-cols-2">
          <ParticipationCard />
          <CharitySummaryCard />
        </div>

        {/* Membership & Subscription Overview */}
        <SubscriptionPanel compact />

        {/* Score Log Overview (Latest 5 active in draw) */}
        <ScoresPanel compact />

        {/* Recent Winnings */}
        <WinnersPanel compact />
      </main>
    </div>
  );
}
