import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { AppNav } from "@/components/common/AppNav";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DrawHeroCard } from "@/components/dashboard/DrawHeroCard";
import { MemberSummaryCards } from "@/components/dashboard/MemberSummaryCards";
import { JourneyTracker } from "@/components/dashboard/JourneyTracker";
import { ImpactCard } from "@/components/dashboard/ImpactCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
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
        {/* A. Member Header */}
        <DashboardHero />

        {/* B. Quick Actions */}
        <QuickActions />

        {/* C. Current Draw — Hero Card (full width) */}
        <DrawHeroCard />

        {/* D. Summary Cards */}
        <MemberSummaryCards />

        {/* E. Journey + Impact (side by side on md+) */}
        <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <JourneyTracker />
          <ImpactCard />
        </div>
      </main>
    </div>
  );
}
