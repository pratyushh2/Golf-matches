import { Link } from "@tanstack/react-router";
import { useScores } from "@/hooks/useScores";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import { useMyWinnings } from "@/hooks/useWinners";
import { PlusCircle, Eye, CreditCard, Heart, Trophy, ArrowRight } from "lucide-react";

interface Action {
  label: string;
  to: string;
  icon: React.ReactNode;
  primary?: boolean;
}

export function QuickActions() {
  const { eligible, hasFullTicket } = useScores();
  const { isActive } = useSubscription();
  const { profile } = useProfile();
  const { data: winnings } = useMyWinnings();

  const hasCharity = !!profile?.charityId;
  const pendingProof = (winnings ?? []).some(
    (w) => w.verification_status === "pending" && !w.proof_path,
  );

  const actions: Action[] = [];

  // Highest priority first
  if (!isActive) {
    actions.push({
      label: "Subscribe",
      to: "/subscription",
      icon: <CreditCard className="h-4 w-4" />,
      primary: true,
    });
  }
  if (!hasCharity) {
    actions.push({
      label: "Choose charity",
      to: "/charity",
      icon: <Heart className="h-4 w-4" />,
      primary: !isActive ? false : true,
    });
  }
  if (isActive && !hasFullTicket) {
    actions.push({
      label: `Add score (${eligible.length}/5)`,
      to: "/scores",
      icon: <PlusCircle className="h-4 w-4" />,
      primary: hasCharity,
    });
  }
  if (isActive) {
    actions.push({ label: "View draw", to: "/draws", icon: <Eye className="h-4 w-4" /> });
  }
  if (pendingProof) {
    actions.push({
      label: "Upload proof",
      to: "/winners",
      icon: <Trophy className="h-4 w-4" />,
      primary: true,
    });
  }
  actions.push({
    label: "Winnings",
    to: "/winners",
    icon: <Trophy className="h-4 w-4" />,
  });

  // Deduplicate by 'to'
  const unique = actions.filter((a, i, arr) => arr.findIndex((b) => b.to === a.to) === i);

  if (unique.length === 0) return null;

  return (
    <div className="animate-fade-up-delay-3">
      <p className="label-mono mb-3">Quick actions</p>
      <div className="flex flex-wrap gap-2">
        {unique.map((action) => (
          <Link
            key={action.to + action.label}
            to={action.to}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              action.primary
                ? "bg-emerald-400/90 text-black hover:bg-emerald-300"
                : "border border-white/15 text-white/70 hover:border-white/30 hover:text-white"
            }`}
          >
            {action.icon}
            {action.label}
            {action.primary && <ArrowRight className="h-3.5 w-3.5" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
