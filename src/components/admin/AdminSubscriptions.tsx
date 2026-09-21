import { useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import { expireLapsedSubscriptions, listAllSubscriptions } from "@/lib/adminService";
import { formatDate, formatMoney } from "@/lib/format";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Badge,
} from "@/components/common/States";

interface Row {
  id: string;
  status: string;
  interval: string | null;
  amount_cents: number;
  currency: string;
  current_period_end: string | null;
  is_test: boolean;
  provider: string;
  profiles?: { full_name: string | null; email: string | null } | null;
}

export default function AdminSubscriptions() {
  const { data, loading, error, refetch } = useAsync<Row[]>(
    () => listAllSubscriptions() as Promise<Row[]>,
    [],
  );
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function expire() {
    setBusy(true);
    try {
      const n = await expireLapsedSubscriptions();
      setNote(`${n} subscription(s) updated.`);
      refetch();
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Failed.");
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
      <div className="flex items-center justify-between gap-3">
        <PanelTitle>Subscriptions ({rows.length})</PanelTitle>
        <Button variant="ghost" onClick={expire} disabled={busy}>
          Expire lapsed
        </Button>
      </div>
      {note && <p className="mt-3 text-xs text-white/50">{note}</p>}
      <div className="mt-5 space-y-2">
        {rows.length === 0 && <EmptyState message="No subscription records." />}
        {rows.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-white">
                {s.profiles?.full_name ?? s.profiles?.email ?? "—"}
              </p>
              <p className="text-xs text-white/40">
                {s.interval ?? "—"} · {formatMoney(s.amount_cents, s.currency)} · ends{" "}
                {formatDate(s.current_period_end)}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge tone={s.status === "active" ? "good" : "neutral"}>{s.status}</Badge>
              {s.is_test && <Badge tone="warn">test</Badge>}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
