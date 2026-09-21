import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useScores } from "@/hooks/useScores";
import { Shield } from "lucide-react";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero() {
  const { profile } = useProfile();
  const { isActive, subscription } = useSubscription();
  const { hasFullTicket, eligible } = useScores();

  const displayName = profile?.displayName ?? "Member";
  const firstName = displayName.split(" ")[0];
  const isAdmin = profile?.role === "admin";

  return (
    <div className="animate-fade-up">
      {/* Eyebrow */}
      <p className="label-mono mb-3">{getGreeting()}</p>

      {/* Main heading */}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          {firstName}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-emerald-300">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          )}
          <span
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${
              isActive
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/30 bg-amber-400/10 text-amber-300"
            }`}
          >
            {isActive ? "Active member" : "Not subscribed"}
          </span>
          {isActive && (
            <span
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.12em] ${
                hasFullTicket
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-white/15 text-white/50"
              }`}
            >
              {eligible.length}/5 scores
            </span>
          )}
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-2 text-sm text-white/40">
        {isActive && hasFullTicket
          ? "Your game. Your impact. Your chance."
          : isActive
            ? `Add ${5 - eligible.length} more score${5 - eligible.length === 1 ? "" : "s"} to enter the monthly draw.`
            : "Subscribe to enter the monthly prize draw."}
      </p>

      {/* Rule */}
      <div className="rule-line mt-6" />
    </div>
  );
}

export default DashboardHero;
