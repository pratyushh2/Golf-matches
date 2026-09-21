import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import ScoresPanel from "@/components/scores/ScoresPanel";

export const Route = createFileRoute("/scores")({ component: ScoresPage });

function ScoresPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/scores" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10 space-y-2">
        <div className="animate-fade-up mb-6">
          <p className="label-mono mb-2">Member area</p>
          <h1 className="text-3xl font-semibold text-white">Stableford scores</h1>
          <p className="mt-2 text-sm text-white/45">
            Your five most recent scores are your draw entry. Manage them here.
          </p>
          <div className="rule-line mt-6" />
        </div>
        <ScoresPanel />
      </main>
    </div>
  );
}
