import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import WinnersPanel from "@/components/winners/WinnersPanel";

export const Route = createFileRoute("/winners")({ component: WinnersPage });

function WinnersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/winners" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="animate-fade-up mb-8">
          <p className="label-mono mb-2">Member area</p>
          <h1 className="text-3xl font-semibold text-white">Your winnings</h1>
          <p className="mt-2 text-sm text-white/45">
            Track your prize history, upload proof, and monitor verification status.
          </p>
          <div className="rule-line mt-6" />
        </div>
        <WinnersPanel />
      </main>
    </div>
  );
}
