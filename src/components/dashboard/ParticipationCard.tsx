import { useMyEntries, usePublishedDraws } from "@/hooks/useDraws";
import { useScores } from "@/hooks/useScores";
import { useSubscription } from "@/hooks/useSubscription";
import { formatMonth } from "@/lib/format";
import { Panel, PanelTitle, Loading, Badge } from "@/components/common/States";

export default function ParticipationCard() {
  const { data: entries, loading: le } = useMyEntries();
  const { data: draws, loading: ld } = usePublishedDraws();
  const { eligible, loading: ls } = useScores();
  const { isActive, loading: lb } = useSubscription();

  if (le || ld || ls || lb)
    return (
      <Panel>
        <Loading />
      </Panel>
    );

  const entered = entries?.length ?? 0;
  const latest = draws?.[0] ?? null;
  const ready = isActive && eligible.length === 5;

  return (
    <Panel>
      <PanelTitle>Participation</PanelTitle>
      <p className="mt-3 text-2xl text-white">
        {entered} draw{entered === 1 ? "" : "s"} entered
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={isActive ? "good" : "warn"}>
          {isActive ? "Subscribed" : "Not subscribed"}
        </Badge>
        <Badge tone={eligible.length === 5 ? "good" : "warn"}>{eligible.length}/5 scores</Badge>
      </div>
      <p className="mt-4 text-sm text-white/50">
        {ready
          ? "You are eligible for the next monthly draw."
          : !isActive
            ? "Subscribe to enter the monthly draw."
            : `Add ${5 - eligible.length} more score(s) to become eligible.`}
      </p>
      {latest && (
        <p className="mt-2 text-xs text-white/35">
          Last published draw: {formatMonth(latest.draw_month)}
        </p>
      )}
    </Panel>
  );
}
