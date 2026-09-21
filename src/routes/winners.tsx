import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import WinnersPanel from "@/components/winners/WinnersPanel";

export const Route = createFileRoute("/winners")({ component: WinnersPage });

function WinnersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/winners" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold text-white">Your winnings</h1>
        <WinnersPanel />
      </main>
    </div>
  );
}
