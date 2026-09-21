import { useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import { adminUpdateScore, listAllScores, type AdminScore } from "@/lib/adminService";
import { formatDate, todayISO } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  inputClass,
} from "@/components/common/States";

export default function AdminScores() {
  const { data, loading, error, refetch } = useAsync<AdminScore[]>(() => listAllScores(), []);
  const [editing, setEditing] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function save(id: string) {
    setBusy(true);
    setActionError(null);
    try {
      await adminUpdateScore(id, Number(score), date);
      setEditing(null);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <Panel>
        <Loading />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );
  const rows = data ?? [];

  return (
    <Panel>
      <PanelTitle>Scores ({rows.length} most recent)</PanelTitle>
      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}
      <div className="mt-5 space-y-2">
        {rows.length === 0 && <EmptyState message="No scores recorded." />}
        {rows.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-white">
                {s.profiles?.full_name ?? s.profiles?.email ?? s.user_id}
              </p>
              <p className="text-xs text-white/40">{formatDate(s.played_on)}</p>
            </div>
            {editing === s.id ? (
              <div className="flex flex-wrap gap-2">
                <input
                  className={`${inputClass} w-20`}
                  type="number"
                  min={1}
                  max={45}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
                <input
                  className={`${inputClass} w-40`}
                  type="date"
                  max={todayISO()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Button onClick={() => save(s.id)} disabled={busy}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-lg tabular-nums text-white">{s.score}</span>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(s.id);
                    setScore(String(s.score));
                    setDate(s.played_on);
                  }}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}
