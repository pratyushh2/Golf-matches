import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import ScoresPanel from "@/components/scores/ScoresPanel";
import { ProfileSummary } from "@/components/dashboard/ProfileSummary";

export const Route = createFileRoute("/scores")({ component: ScoresPage });

function ScoresPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/scores" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10 space-y-6">
        <h1 className="text-3xl font-semibold text-white">Your scores</h1>
        <ProfileSummary />
        <ScoresPanel />
      </main>
    </div>
  );
}
