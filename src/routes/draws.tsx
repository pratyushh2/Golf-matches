import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import DrawsPanel from "@/components/draw/DrawsPanel";

export const Route = createFileRoute("/draws")({ component: DrawsPage });

function DrawsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/draws" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="animate-fade-up mb-8">
          <p className="label-mono mb-2">Member area</p>
          <h1 className="text-3xl font-semibold text-white">Monthly draws</h1>
          <p className="mt-2 text-sm text-white/45">
            Your five most recent scores are your numbers. Match three, four or five to win a share
            of the pool.
          </p>
          <div className="rule-line mt-6" />
        </div>
        <DrawsPanel />
      </main>
    </div>
  );
}
