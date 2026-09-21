import { useState } from "react";
import { useCharities } from "@/hooks/useCharities";
import { deleteCharity, upsertCharity } from "@/lib/adminService";
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

const blank = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  website_url: "",
  category: "",
  is_active: true,
  is_featured: false,
};

export default function AdminCharities() {
  const { data, loading, error, refetch } = useCharities(true);
  const [form, setForm] = useState<typeof blank & { id?: string }>(blank);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function save() {
    if (!form.name.trim()) {
      setActionError("Name is required.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await upsertCharity({
        ...form,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: form.description || null,
        image_url: form.image_url || null,
        website_url: form.website_url || null,
        category: form.category || null,
      });
      setForm(blank);
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setActionError(null);
    try {
      await deleteCharity(id);
      refetch();
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Delete failed. It may be in use by a profile.",
      );
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

  return (
    <Panel>
      <PanelTitle>Charities</PanelTitle>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Category">
          <input
            className={inputClass}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </Field>
        <Field label="Website">
          <input
            className={inputClass}
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          />
        </Field>
        <Field label="Image URL">
          <input
            className={inputClass}
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              className={`${inputClass} h-24`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
        <div className="flex items-center gap-5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />{" "}
            Active
          </label>
          <label className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
            />{" "}
            Homepage spotlight
          </label>
          <Button onClick={save} disabled={busy}>
            {form.id ? "Update" : "Add charity"}
          </Button>
          {form.id && (
            <Button variant="ghost" onClick={() => setForm(blank)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}

      <div className="mt-6 space-y-2">
        {(data ?? []).length === 0 && <EmptyState message="No charities configured." />}
        {(data ?? []).map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-white">{c.name}</p>
              <p className="truncate text-xs text-white/40">{c.category ?? "—"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {c.is_featured && <Badge tone="good">Spotlight</Badge>}
              <Badge tone={c.is_active ? "good" : "neutral"}>
                {c.is_active ? "active" : "hidden"}
              </Badge>
              <Button
                variant="ghost"
                onClick={() =>
                  setForm({
                    id: c.id,
                    name: c.name ?? "",
                    slug: c.slug ?? "",
                    description: c.description ?? "",
                    image_url: c.image_url ?? "",
                    website_url: c.website_url ?? "",
                    category: c.category ?? "",
                    is_active: c.is_active,
                    is_featured: c.is_featured,
                  })
                }
              >
                Edit
              </Button>
              <Button variant="danger" onClick={() => remove(c.id)} disabled={busy}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
