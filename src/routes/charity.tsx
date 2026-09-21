import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import CharityPanel from "@/components/charity/CharityPanel";

export const Route = createFileRoute("/charity")({ component: CharityPage });

function CharityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/charity" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="animate-fade-up mb-8">
          <p className="label-mono mb-2">Member area</p>
          <h1 className="text-3xl font-semibold text-white">Your cause</h1>
          <p className="mt-2 text-sm text-white/45">
            Part of every subscription goes to a charity you pick. You set the share.
          </p>
          <div className="rule-line mt-6" />
        </div>
        <CharityPanel />
      </main>
    </div>
  );
}
