import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import CharityPanel from "@/components/charity/CharityPanel";

export const Route = createFileRoute("/charity")({ component: CharityPage });

function CharityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/charity" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-semibold text-white">Choose your cause</h1>
        <p className="mb-8 text-sm text-white/50">
          Part of every subscription goes to a charity you pick. You set the share.
        </p>
        <CharityPanel />
      </main>
    </div>
  );
}
