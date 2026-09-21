import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/common/States";
import { Menu, X, LogOut, Shield, Settings } from "lucide-react";

interface NavLinkItem {
  label: string;
  to:
    | "/dashboard"
    | "/scores"
    | "/charity"
    | "/subscription"
    | "/draws"
    | "/winners"
    | "/settings"
    | "/admin";
  adminOnly?: boolean;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Scores", to: "/scores" },
  { label: "Charity", to: "/charity" },
  { label: "Membership", to: "/subscription" },
  { label: "Draws", to: "/draws" },
  { label: "Winnings", to: "/winners" },
  { label: "Settings", to: "/settings" },
  { label: "Admin", to: "/admin", adminOnly: true },
];

export function AppNav({ currentPath }: { currentPath?: string }) {
  const navigate = useNavigate();
  const { profile, user } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.role === "admin";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  };

  const visibleLinks = NAV_LINKS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight text-white hover:text-emerald-400 transition"
          >
            Digital Heroes
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((item) => {
              const active = currentPath === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {profile && (
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition"
              title="Manage profile & settings"
            >
              <span>{profile.displayName}</span>
              {isAdmin && (
                <Badge tone="good">
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                </Badge>
              )}
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/25 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Mobile hamburger button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-background/95 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {visibleLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  currentPath === item.to
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between">
            <Link
              to="/settings"
              onClick={() => setMobileOpen(false)}
              className="text-xs text-white/60 hover:text-white"
            >
              {profile?.displayName ?? user?.email}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/70 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppNav;
