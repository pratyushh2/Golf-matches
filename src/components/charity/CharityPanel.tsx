import { useMemo, useState } from "react";
import { useCharities, useSettings } from "@/hooks/useCharities";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { filterCharities, selectCharity, type Charity } from "@/lib/charityService";
import { formatMoney } from "@/lib/format";
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
import { CheckCircle2, ExternalLink, Heart, Search, Calendar, Sparkles, Gift } from "lucide-react";

export function CharityPanel() {
  const { data: charities, loading, error, refetch } = useCharities();
  const { data: settings } = useSettings();
  const { profile, refetch: refetchProfile } = useProfile();
  const { subscription, isActive } = useSubscription();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [percent, setPercent] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Independent donation state
  const [donationCharityId, setDonationCharityId] = useState<string>("");
  const [donationAmount, setDonationAmount] = useState<number>(1000);
  const [customDonation, setCustomDonation] = useState<string>("");
  const [donating, setDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState<string | null>(null);

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

  const selectedCharity = (charities ?? []).find((c) => c.id === activeId) ?? null;

  // Monthly impact calculation in INR
  const monthlySubCents = isActive && subscription ? subscription.amount_cents : 99900;
  const monthlyImpactCents = Math.round((monthlySubCents * activePercent) / 100);

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

  async function handleDirectDonation(e: React.FormEvent) {
    e.preventDefault();
    const effectiveCharityId = donationCharityId || activeId || (charities?.[0]?.id ?? "");
    const effectiveCharity = (charities ?? []).find((c) => c.id === effectiveCharityId);
    const amountInRupees = customDonation ? Number(customDonation) : donationAmount;

    if (!effectiveCharity) {
      setFormError("Select a charity to donate to.");
      return;
    }
    if (!amountInRupees || amountInRupees <= 0) {
      setFormError("Enter a valid donation amount.");
      return;
    }

    setDonating(true);
    setDonationSuccess(null);
    // Simulate donation processing cleanly
    setTimeout(() => {
      setDonating(false);
      setDonationSuccess(
        `Thank you! Your direct donation of ${formatMoney(amountInRupees * 100, "INR")} to ${effectiveCharity.name} was recorded in test mode.`,
      );
      setCustomDonation("");
    }, 600);
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
    <div className="space-y-8">
      {/* ── Currently selected cause ── */}
      {selectedCharity ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="label-mono text-emerald-300/70 mb-1">Your chosen charity</p>
              <h2 className="text-2xl font-semibold text-white">{selectedCharity.name}</h2>
              {selectedCharity.category && (
                <span className="inline-block text-xs uppercase tracking-[0.1em] text-emerald-300/80 font-mono">
                  {selectedCharity.category}
                </span>
              )}
              {selectedCharity.description && (
                <p className="mt-3 text-sm text-white/60 max-w-2xl leading-relaxed">
                  {selectedCharity.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-emerald-300">
                ✓ Active selection
              </span>
              <div className="text-right">
                <span className="text-lg font-semibold text-white">{activePercent}%</span>
                <p className="text-xs text-emerald-300/70">
                  ≈ {formatMoney(monthlyImpactCents, "INR")} / month
                </p>
              </div>
            </div>
          </div>

          {selectedCharity.events && selectedCharity.events.length > 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-400/10">
              <p className="text-xs font-mono uppercase tracking-[0.1em] text-white/40 mb-2">
                Upcoming charity events
              </p>
              <div className="space-y-2">
                {selectedCharity.events.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                    <Calendar className="h-3.5 w-3.5 text-emerald-400/70" />
                    <span className="text-white font-medium">{ev.title}</span>
                    {ev.date && <span className="text-white/40">· {ev.date}</span>}
                    {ev.location && <span className="text-white/30">({ev.location})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCharity.website_url && (
            <div className="mt-4 pt-3 border-t border-emerald-400/10">
              <a
                href={selectedCharity.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-emerald-200 transition"
              >
                Visit charity website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-6">
          <p className="text-sm text-amber-200/90 font-medium">No charity selected yet</p>
          <p className="mt-1 text-xs text-white/50">
            Select a verified partner below to direct at least 10% of your membership to good
            causes.
          </p>
        </div>
      )}

      {/* ── Search & Charity Directory ── */}
      <Panel>
        <PanelTitle>Charity directory</PanelTitle>
        <p className="mt-1 text-sm text-white/45">
          Choose a cause to support with your monthly membership.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search by name or keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/30" />
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition ${
                !category
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(category === c ? null : c)}
                className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition ${
                  category === c
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-medium"
                    : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {visible.length === 0 && <EmptyState message="No charities match your search query." />}
          {visible.map((c) => {
            const isSelected = c.id === activeId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedId(c.id);
                  setSaved(false);
                }}
                className={`rounded-2xl border p-5 text-left transition card-lift cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-emerald-400/50 bg-emerald-400/[0.06]"
                    : "border-white/10 hover:border-white/25 bg-white/[0.01]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-semibold text-white text-base block">{c.name}</span>
                      {c.category && (
                        <span className="text-[0.7rem] uppercase tracking-[0.1em] text-white/40 font-mono">
                          {c.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.is_featured && <Badge tone="good">Spotlight</Badge>}
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-white/20" />
                      )}
                    </div>
                  </div>

                  {c.description && (
                    <p className="mt-3 text-xs text-white/50 line-clamp-3 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between gap-2">
                  {c.website_url ? (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white transition"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-white/20">Verified Partner</span>
                  )}
                  <span className="text-xs text-emerald-300/70 font-medium">
                    {isSelected ? "Selected" : "Click to select"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Set contribution percentage & Save ── */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="label-mono text-white/40 mb-3">Membership contribution share</p>
          <div className="grid gap-4 sm:grid-cols-[220px_auto] sm:items-end">
            <Field
              label="Contribution percentage"
              hint={`Platform minimum: ${min}% · Your share: ${activePercent}% (${formatMoney(monthlyImpactCents, "INR")}/mo)`}
            >
              <div className="relative">
                <input
                  className={`${inputClass} pr-8`}
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
                <span className="absolute right-3 top-2.5 text-sm text-white/40 font-mono">%</span>
              </div>
            </Field>

            <div>
              <Button onClick={save} disabled={busy || !activeId}>
                {busy ? "Saving…" : "Save charity preference"}
              </Button>
            </div>
          </div>

          {formError && (
            <div className="mt-4">
              <ErrorState message={formError} />
            </div>
          )}
          {saved && (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-300/80">
              <CheckCircle2 className="h-4 w-4" /> Your charity selection and contribution have been
              updated.
            </p>
          )}
        </div>
      </Panel>

      {/* ── Independent donation section ── */}
      <Panel>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-4 w-4 text-emerald-400" />
          <PanelTitle>Support a cause directly</PanelTitle>
        </div>
        <p className="text-sm text-white/50">
          Want to contribute beyond your membership? Make an independent donation not tied to
          gameplay.
        </p>

        <form onSubmit={handleDirectDonation} className="mt-6 space-y-5">
          <Field label="Choose charity partner">
            <select
              className={inputClass}
              value={donationCharityId || activeId || ""}
              onChange={(e) => setDonationCharityId(e.target.value)}
            >
              {(charities ?? []).map((c) => (
                <option key={c.id} value={c.id} className="bg-[#18181b] text-white">
                  {c.name} {c.category ? `(${c.category})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <label className="text-xs uppercase tracking-[0.1em] text-white/40 block mb-2">
              Select donation amount
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[500, 1000, 2500, 5000].map((amt) => {
                const isSelected = donationAmount === amt && !customDonation;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDonationAmount(amt);
                      setCustomDonation("");
                    }}
                    className={`rounded-xl border py-2.5 px-3 text-center text-sm font-semibold transition ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {formatMoney(amt * 100, "INR")}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label="Or custom amount (₹)" hint="Enter any amount in Indian Rupees">
            <input
              className={inputClass}
              type="number"
              min={100}
              step={100}
              placeholder="e.g. 7500"
              value={customDonation}
              onChange={(e) => setCustomDonation(e.target.value)}
            />
          </Field>

          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-4 text-xs text-amber-200/80">
            <span className="font-semibold text-amber-200">Test mode notice:</span> No real payment
            is taken and no card is charged. This entry point demonstrates independent donation
            capabilities.
          </div>

          {donationSuccess && (
            <p className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> {donationSuccess}
            </p>
          )}

          <div>
            <Button type="submit" disabled={donating}>
              {donating ? "Processing donation…" : "Make independent donation"}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

export default CharityPanel;
