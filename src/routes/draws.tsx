import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import DrawsPanel from "@/components/draw/DrawsPanel";

export const Route = createFileRoute("/draws")({ component: DrawsPage });

function DrawsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/draws" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="mb-2 text-3xl font-semibold text-white">Monthly draws</h1>
        <p className="mb-8 text-sm text-white/50">
          Your five most recent scores are your numbers. Match three, four or five to win a share of
          the pool.
        </p>
        <DrawsPanel />
      </main>
    </div>
  );
}
