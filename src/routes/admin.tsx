import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppNav } from "@/components/common/AppNav";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminScores from "@/components/admin/AdminScores";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminCharities from "@/components/admin/AdminCharities";
import AdminDraws from "@/components/admin/AdminDraws";
import AdminWinners from "@/components/admin/AdminWinners";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { Panel, Loading } from "@/components/common/States";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const TABS = [
  { id: "analytics", label: "Analytics", Component: AdminAnalytics },
  { id: "users", label: "Users", Component: AdminUsers },
  { id: "subscriptions", label: "Subscriptions", Component: AdminSubscriptions },
  { id: "scores", label: "Scores", Component: AdminScores },
  { id: "charities", label: "Charities", Component: AdminCharities },
  { id: "draws", label: "Draws", Component: AdminDraws },
  { id: "winners", label: "Winners", Component: AdminWinners },
] as const;

function AdminPage() {
  const { loading, isAdmin } = useAdminGuard();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("analytics");

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav currentPath="/admin" />
        <main className="mx-auto max-w-5xl px-6 py-16">
          <Panel>
            <Loading />
          </Panel>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav currentPath="/admin" />
        <main className="mx-auto max-w-5xl px-6 py-16">
          <Panel>
            <p className="text-sm text-white/60">Administrator access required.</p>
          </Panel>
        </main>
      </div>
    );
  }

  const Active = TABS.find((t) => t.id === tab)!.Component;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/admin" />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-semibold text-white">Admin Management</h1>
        <nav className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === t.id ? "bg-white/10 text-white font-medium" : "text-white/50 hover:text-white/80"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <Active />
      </main>
    </div>
  );
}
