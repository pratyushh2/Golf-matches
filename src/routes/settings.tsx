import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useCharities } from "@/hooks/useCharities";
import { updateProfile } from "@/lib/profileService";
import { supabase } from "@/lib/supabase";
import { formatDate, formatMoney } from "@/lib/format";
import { AppNav } from "@/components/common/AppNav";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  Button,
  Field,
  inputClass,
  Badge,
} from "@/components/common/States";
import {
  User,
  Mail,
  Shield,
  Heart,
  CreditCard,
  LogOut,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { profile, user, status, errorCode, refetch } = useProfile();
  const { subscription, isActive } = useSubscription();
  const { data: charities } = useCharities();

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "error" && errorCode === "UNAUTHENTICATED") {
      void navigate({ to: "/login" });
    }
  }, [status, errorCode, navigate]);

  useEffect(() => {
    if (profile?.displayName) {
      setName(profile.displayName);
    }
  }, [profile?.displayName]);

  const charity = (charities ?? []).find((c) => c.id === profile?.charityId) ?? null;

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }
    setBusy(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateProfile({ fullName: name.trim() });
      setSaveSuccess(true);
      refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update name.");
    } finally {
      setBusy(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppNav currentPath="/settings" />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <Panel>
            <Loading label="Loading profile & settings…" />
          </Panel>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNav currentPath="/settings" />

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <div className="animate-fade-up">
          <p className="label-mono mb-2">Member area</p>
          <h1 className="text-3xl font-semibold text-white">Profile & settings</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage your player profile, view account details, and check your membership status.
          </p>
          <div className="rule-line mt-6" />
        </div>

        {/* Profile details */}
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <PanelTitle>Account details</PanelTitle>
            <Badge tone={profile?.role === "admin" ? "good" : "neutral"}>
              {profile?.role === "admin" ? "Admin" : "Member"}
            </Badge>
          </div>

          <form onSubmit={handleSaveName} className="mt-6 space-y-5">
            <Field label="Display name" hint="How you appear on the platform and leaderboards">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSaveSuccess(false);
                }}
                placeholder="Enter your name"
                disabled={busy}
              />
            </Field>

            <Field label="Email address" hint="Managed by your login authentication provider">
              <div className="relative">
                <input
                  className={`${inputClass} bg-white/[0.02] text-white/50 cursor-not-allowed`}
                  value={user?.email ?? profile?.email ?? "—"}
                  disabled
                />
                <Mail className="absolute right-3 top-2.5 h-4 w-4 text-white/25" />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2 pt-2 text-xs text-white/40">
              <div>
                <span className="uppercase tracking-[0.1em] text-white/30 block mb-1">User ID</span>
                <span className="font-mono text-white/60">{profile?.id ?? "—"}</span>
              </div>
              <div>
                <span className="uppercase tracking-[0.1em] text-white/30 block mb-1">
                  Member since
                </span>
                <span className="text-white/60">{formatDate(profile?.createdAt)}</span>
              </div>
            </div>

            {saveError && <ErrorState message={saveError} />}
            {saveSuccess && (
              <p className="flex items-center gap-2 text-sm text-emerald-300/80">
                <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={busy || name.trim() === profile?.displayName}>
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Panel>

        {/* Membership & Charity Quick Links */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Membership card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 card-lift">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-white/30" />
              <p className="label-mono">Membership plan</p>
            </div>
            {isActive && subscription ? (
              <>
                <p className="text-xl font-semibold text-white">
                  {formatMoney(subscription.amount_cents, subscription.currency)}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {subscription.interval === "yearly" ? "Annual plan" : "Monthly plan"} ·{" "}
                  {subscription.cancel_at_period_end ? "Cancelling on" : "Renews"}{" "}
                  {formatDate(subscription.current_period_end)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-amber-300/80">Inactive</p>
                <p className="text-xs text-white/35 mt-1">
                  Join a monthly or yearly plan to enter draws.
                </p>
              </>
            )}
            <Link
              to="/subscription"
              className="mt-4 inline-flex items-center gap-1 text-xs text-emerald-300/70 hover:text-emerald-200 transition"
            >
              Manage subscription <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Charity card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 card-lift">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-white/30" />
              <p className="label-mono">Charity preference</p>
            </div>
            {charity ? (
              <>
                <p className="text-sm font-semibold text-white">{charity.name}</p>
                <p className="text-xs text-white/40 mt-1">
                  Contributing {profile?.charityPercent ?? 10}% of membership
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-white/45">No cause selected</p>
                <p className="text-xs text-white/35 mt-1">Pick a verified charity to support.</p>
              </>
            )}
            <Link
              to="/charity"
              className="mt-4 inline-flex items-center gap-1 text-xs text-emerald-300/70 hover:text-emerald-200 transition"
            >
              Change charity <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Security & session */}
        <Panel>
          <PanelTitle>Session & security</PanelTitle>
          <p className="mt-2 text-sm text-white/50">
            You are currently signed in as <span className="text-white">{user?.email}</span>.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Button variant="danger" onClick={handleSignOut}>
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Sign out of account
              </span>
            </Button>
          </div>
        </Panel>
      </main>
    </div>
  );
}

export default SettingsPage;
