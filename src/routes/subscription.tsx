import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import SubscriptionPanel from "@/components/subscription/SubscriptionPanel";

export const Route = createFileRoute("/subscription")({ component: SubscriptionPage });

function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/subscription" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <h1 className="mb-8 text-3xl font-semibold text-white">Membership</h1>
        <SubscriptionPanel />
      </main>
    </div>
  );
}
