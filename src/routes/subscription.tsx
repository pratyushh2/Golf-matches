import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import SubscriptionPanel from "@/components/subscription/SubscriptionPanel";

export const Route = createFileRoute("/subscription")({ component: SubscriptionPage });

function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/subscription" />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="animate-fade-up mb-8">
          <p className="label-mono mb-2">Member area</p>
          <h1 className="text-3xl font-semibold text-white">Membership</h1>
          <p className="mt-2 text-sm text-white/45">
            Your subscription powers the monthly draw and funds your chosen charity.
          </p>
          <div className="rule-line mt-6" />
        </div>
        <SubscriptionPanel />
      </main>
    </div>
  );
}
