import { useProfile } from "@/hooks/useProfile";
import { useScores } from "@/hooks/useScores";
import { useSubscription } from "@/hooks/useSubscription";
import { useMyWinnings } from "@/hooks/useWinners";
import { useMyEntries } from "@/hooks/useDraws";
import { CheckCircle2, Circle, Dot } from "lucide-react";

type StepState = "done" | "active" | "pending";

interface Step {
  label: string;
  state: StepState;
  sub?: string | undefined;
}

function JourneyStep({ step, isLast }: { step: Step; isLast: boolean }) {
  const iconColor =
    step.state === "done"
      ? "text-emerald-400"
      : step.state === "active"
        ? "text-white"
        : "text-white/20";
  const labelColor =
    step.state === "done"
      ? "text-white/60"
      : step.state === "active"
        ? "text-white font-medium"
        : "text-white/25";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`mt-0.5 ${iconColor}`}>
          {step.state === "done" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : step.state === "active" ? (
            <Dot className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        {!isLast && <div className="journey-line mt-1" />}
      </div>
      <div className="pb-4 min-w-0">
        <p className={`text-sm ${labelColor}`}>{step.label}</p>
        {step.sub && <p className="text-xs text-white/30 mt-0.5">{step.sub}</p>}
      </div>
    </div>
  );
}

export function JourneyTracker() {
  const { profile } = useProfile();
  const { hasFullTicket, eligible } = useScores();
  const { isActive } = useSubscription();
  const { data: winnings } = useMyWinnings();
  const { data: entries } = useMyEntries();

  const hasCharity = !!profile?.charityId;
  const hasWon = (winnings ?? []).length > 0;
  const hasEntered = (entries ?? []).length > 0;
  const hasApprovedWin = (winnings ?? []).some((w) => w.verification_status === "approved");
  const hasPaidWin = (winnings ?? []).some((w) => w.payout_status === "paid");

  function s(done: boolean, active: boolean): StepState {
    if (done) return "done";
    if (active) return "active";
    return "pending";
  }

  const steps: Step[] = [
    {
      label: "Joined Digital Heroes",
      state: "done",
      sub: "Welcome to the community",
    },
    {
      label: "Chosen charity",
      state: s(hasCharity, !hasCharity),
      sub: hasCharity ? undefined : "Choose a cause to support",
    },
    {
      label: "Subscribed",
      state: s(isActive, !isActive),
      sub: isActive ? undefined : "Subscribe to enter draws",
    },
    {
      label: `Added 5 scores — ${eligible.length}/5`,
      state: s(hasFullTicket, !hasFullTicket && isActive),
      sub: hasFullTicket ? undefined : `${5 - eligible.length} more needed`,
    },
    {
      label: "Entered draw",
      state: s(hasEntered, !hasEntered && hasFullTicket && isActive),
    },
    {
      label: "Draw result",
      state: s(hasWon, false),
      sub: hasWon ? "You've won!" : undefined,
    },
    {
      label: "Winner verification",
      state: s(hasApprovedWin, hasWon && !hasApprovedWin),
    },
    {
      label: "Charity impact",
      state: s(hasPaidWin, false),
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 animate-fade-up-delay-3">
      <p className="label-mono mb-4">Your journey</p>
      <div>
        {steps.map((step, i) => (
          <JourneyStep key={step.label} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
    </div>
  );
}

export default JourneyTracker;
