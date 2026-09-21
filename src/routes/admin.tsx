import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { useAsync } from "@/hooks/useAsync";
import { getAnalytics } from "@/lib/analyticsService";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminScores from "@/components/admin/AdminScores";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AdminCharities from "@/components/admin/AdminCharities";
import AdminDraws from "@/components/admin/AdminDraws";
import AdminWinners from "@/components/admin/AdminWinners";
import { Loading } from "@/components/common/States";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  CreditCard,
  Target,
  Heart,
  Trophy,
  Medal,
  LogOut,
  Menu,
  X,
  Shield,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type TabId =
  | "overview"
  | "analytics"
  | "users"
  | "subscriptions"
  | "scores"
  | "charities"
  | "draws"
  | "winners";

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
  { id: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { id: "subscriptions", label: "Subscriptions", icon: <CreditCard className="h-4 w-4" /> },
  { id: "scores", label: "Scores", icon: <Target className="h-4 w-4" /> },
  { id: "charities", label: "Charities", icon: <Heart className="h-4 w-4" /> },
  { id: "draws", label: "Draws", icon: <Trophy className="h-4 w-4" /> },
  { id: "winners", label: "Winners", icon: <Medal className="h-4 w-4" /> },
];

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
  overview: AdminOverview,
  analytics: AdminAnalytics,
  users: AdminUsers,
  subscriptions: AdminSubscriptions,
  scores: AdminScores,
  charities: AdminCharities,
  draws: AdminDraws,
  winners: AdminWinners,
};

const TAB_DESCRIPTIONS: Record<TabId, string> = {
  overview: "Platform overview — members, draws, prizes and charitable impact.",
  analytics: "Detailed analytics charts and metrics.",
  users: "Manage user accounts, roles and activity.",
  subscriptions: "View and manage all subscription records.",
  scores: "Review and edit member score submissions.",
  charities: "Manage charity listings and featured status.",
  draws: "Create, simulate and publish monthly draws.",
  winners: "Verify winner proofs and manage payouts.",
};

function Sidebar({
  active,
  onSelect,
  pendingCount,
}: {
  active: TabId;
  onSelect: (id: TabId) => void;
  pendingCount: number;
}) {
  return (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-emerald-400/70" />
          <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-mono">
            Digital Heroes
          </span>
        </div>
        <p className="text-sm font-semibold text-white">Admin Console</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active;
          const hasBadge = item.id === "winners" && pendingCount > 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={isActive ? "text-emerald-400" : "text-white/30"}>{item.icon}</span>
                {item.label}
              </span>
              {hasBadge && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-[0.6rem] font-mono text-amber-300">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to member area */}
      <div className="px-3 py-4 border-t border-white/8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/35 hover:text-white/60 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Member area
        </Link>
      </div>
    </aside>
  );
}

function AdminPage() {
  const { loading, isAdmin } = useAdminGuard();
  const [tab, setTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch analytics just for the pending badge count
  const { data: analytics } = useAsync(() => getAnalytics(), []);
  const pendingCount = analytics?.winners_pending_verification ?? 0;

  async function handleSignOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <Shield className="mx-auto h-10 w-10 text-white/20 mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Access denied</h1>
          <p className="text-sm text-white/50 mb-6">Administrator access is required.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white transition"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const Active = TAB_COMPONENTS[tab];
  const activeItem = NAV_ITEMS.find((n) => n.id === tab)!;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-56 md:flex-col border-r border-white/8 bg-white/[0.01] sticky top-0 h-screen">
        <Sidebar active={tab} onSelect={setTab} pendingCount={pendingCount} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-background border-r border-white/8 h-full sidebar-transition">
            <Sidebar
              active={tab}
              onSelect={(id) => {
                setTab(id);
                setSidebarOpen(false);
              }}
              pendingCount={pendingCount}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-white/8 bg-background/90 backdrop-blur-md px-6 h-14">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded-lg p-1.5 text-white/50 hover:bg-white/8 hover:text-white transition"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white/30">{activeItem.icon}</span>
              <span className="text-sm font-medium text-white">{activeItem.label}</span>
            </div>
            {pendingCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[0.65rem] text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                {pendingCount} action{pendingCount !== 1 ? "s" : ""} required
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-white/20 hover:text-white transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
          {/* Section header */}
          <div className="mb-8 animate-fade-up">
            <p className="label-mono mb-1">Admin console</p>
            <h1 className="text-2xl font-semibold text-white">{activeItem.label}</h1>
            <p className="mt-1 text-sm text-white/40">{TAB_DESCRIPTIONS[tab]}</p>
            <div className="rule-line mt-5" />
          </div>

          <Active />
        </main>
      </div>
    </div>
  );
}
