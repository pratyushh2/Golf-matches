import { useAsync } from "@/hooks/useAsync";
import { listScores, type ScoreRecord } from "@/lib/scoreService";

export function useScores() {
  const { data, loading, error, refetch } = useAsync<ScoreRecord[]>(() => listScores(), []);
  const scores = data ?? [];
  return {
    scores,
    eligible: scores.filter((s) => s.eligible),
    archived: scores.filter((s) => !s.eligible),
    hasFullTicket: scores.filter((s) => s.eligible).length === 5,
    loading,
    error,
    refetch,
  };
}
