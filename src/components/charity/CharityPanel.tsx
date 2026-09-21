import { useMemo, useState } from "react";
import { useCharities, useSettings } from "@/hooks/useCharities";
import { useProfile } from "@/hooks/useProfile";
import { filterCharities, selectCharity } from "@/lib/charityService";
import {
  Panel,
  PanelTitle,
  Loading,
  ErrorState,
  EmptyState,
  Button,
  Field,
  inputClass,
  Badge,
} from "@/components/common/States";

export function CharityPanel() {
  const { data: charities, loading, error, refetch } = useCharities();
  const { data: settings } = useSettings();
  const { profile, refetch: refetchProfile } = useProfile();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [percent, setPercent] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const min = settings?.min_charity_percent ?? 10;
  const activeId = selectedId ?? profile?.charityId ?? null;
  const activePercent = percent !== "" ? Number(percent) : (profile?.charityPercent ?? min);

  const categories = useMemo(
    () => Array.from(new Set((charities ?? []).map((c) => c.category).filter(Boolean))) as string[],
    [charities],
  );
  const visible = useMemo(
    () => filterCharities(charities ?? [], query, category),
    [charities, query, category],
  );

  async function save() {
    if (!activeId) {
      setFormError("Choose a charity first.");
      return;
    }
    if (!Number.isFinite(activePercent) || activePercent < min || activePercent > 100) {
      setFormError(`Contribution must be between ${min}% and 100%.`);
      return;
    }
    setBusy(true);
    setFormError(null);
    setSaved(false);
    try {
      await selectCharity(activeId, activePercent);
      setSaved(true);
      refetchProfile();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <Panel>
        <Loading label="Loading charities…" />
      </Panel>
    );
  if (error)
    return (
      <Panel>
        <ErrorState message={error} onRetry={refetch} />
      </Panel>
    );

  return (
    <Panel>
      <PanelTitle>Your charity</PanelTitle>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          className={`${inputClass} sm:w-64`}
          placeholder="Search charities"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className={`${inputClass} sm:w-48`}
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || null)}
        >
          <option value="">All causes</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {visible.length === 0 && <EmptyState message="No charities match your search." />}
        {visible.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedId(c.id);
                setSaved(false);
              }}
              className={`rounded-xl border p-4 text-left transition ${isActive ? "border-emerald-400/50 bg-emerald-400/[0.06]" : "border-white/10 hover:border-white/25"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-white">{c.name ?? "Unnamed charity"}</span>
                {c.is_featured && <Badge tone="good">Spotlight</Badge>}
              </div>
              {c.description && (
                <p className="mt-2 line-clamp-3 text-sm text-white/55">{c.description}</p>
              )}
              {c.events.length > 0 && (
                <p className="mt-3 text-xs text-white/40">{c.events.length} upcoming event(s)</p>
              )}
              {c.website_url && (
                <span className="mt-2 block truncate text-xs text-emerald-300/70">
                  {c.website_url}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[200px_auto] sm:items-end">
        <Field label="Contribution" hint={`Minimum ${min}% of your subscription`}>
          <input
            className={inputClass}
            type="number"
            min={min}
            max={100}
            step={1}
            value={percent !== "" ? percent : String(profile?.charityPercent ?? min)}
            onChange={(e) => {
              setPercent(e.target.value);
              setSaved(false);
            }}
          />
        </Field>
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save selection"}
        </Button>
      </div>

      {formError && (
        <div className="mt-4">
          <ErrorState message={formError} />
        </div>
      )}
      {saved && <p className="mt-4 text-sm text-emerald-300/80">Saved.</p>}
    </Panel>
  );
}

export default CharityPanel;
