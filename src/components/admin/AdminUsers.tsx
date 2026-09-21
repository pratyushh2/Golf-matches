import { useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import { listUsers, setUserActive, setUserRole, type AdminUser } from "@/lib/adminService";
import { formatDate } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Badge,
} from "@/components/common/States";

export default function AdminUsers() {
  const { data, loading, error, refetch } = useAsync<AdminUser[]>(() => listUsers(), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function run(id: string, fn: () => Promise<void>) {
    setBusy(id);
    setActionError(null);
    try {
      await fn();
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(null);
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
  const users = data ?? [];

  return (
    <Panel>
      <PanelTitle>Users ({users.length})</PanelTitle>
      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}
      <div className="mt-5 space-y-2">
        {users.length === 0 && <EmptyState message="No users yet." />}
        {users.map((u) => (
          <div
            key={u.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{u.full_name ?? "—"}</p>
              <p className="truncate text-xs text-white/40">{u.email ?? u.id}</p>
              <p className="text-xs text-white/30">Joined {formatDate(u.created_at)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={u.role === "admin" ? "good" : "neutral"}>{u.role}</Badge>
              <Badge tone={u.is_active ? "good" : "bad"}>
                {u.is_active ? "active" : "deactivated"}
              </Badge>
              <Button
                variant="ghost"
                disabled={busy === u.id}
                onClick={() => run(u.id, () => setUserActive(u.id, !u.is_active))}
              >
                {u.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="ghost"
                disabled={busy === u.id}
                onClick={() =>
                  run(u.id, () => setUserRole(u.id, u.role === "admin" ? "user" : "admin"))
                }
              >
                {u.role === "admin" ? "Demote" : "Promote"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
