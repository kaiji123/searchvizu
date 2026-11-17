"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type { Id } from "../../../../convex/_generated/dataModel";
import { projectPath } from "@/lib/project-path";
import { PublicationEditor } from "./PublicationEditor";

export const STATUS_LABELS: Record<Doc<"requests">["status"], string> = {
  submitted: "Received", approved: "Received", reviewing: "Received", quoted: "Received", in_progress: "In progress", ready_for_review: "Ready to explore", delivered: "Complete",
};
type CurrentStatus = "submitted" | "in_progress" | "ready_for_review" | "delivered";
const STAGES: CurrentStatus[] = ["submitted", "in_progress", "ready_for_review", "delivered"];
function currentStatus(status: Doc<"requests">["status"]): CurrentStatus {
  return status === "approved" || status === "reviewing" || status === "quoted" ? "submitted" : status;
}
const TYPE_LABELS: Record<Doc<"requests">["type"], string> = {
  figure: "2D figure", "interactive-2d": "Interactive 2D", "interactive-3d": "Interactive 3D", unsure: "Not sure yet",
};

export function Studio({ onBack }: { onBack: () => void }) {
  const { results, status, loadMore } = usePaginatedQuery(api.studio.list, {}, { initialNumItems: 25 });
  const [selected, setSelected] = useState<string | null>(null);
  const current = results.find((item) => item._id === selected) ?? null;
  return <section>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-accent">Studio workspace</p><h2 className="mt-1 text-2xl font-semibold">Requests</h2><p className="mt-2 text-sm text-muted">Review briefs, contact researchers and keep progress up to date.</p></div><button type="button" onClick={onBack} className="btn-secondary">Back to my portal</button></div>
    <PublicRequests />
    <h3 className="mt-8 text-lg font-semibold">Researcher account requests</h3>
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(260px,0.85fr)_1.15fr]">
      <div><div className="overflow-hidden rounded-xl border border-line bg-surface">{status === "LoadingFirstPage" ? <p className="p-5 text-sm text-muted" role="status">Loading requests…</p> : results.length === 0 ? <p className="p-5 text-sm text-muted">No requests yet.</p> : results.map((item) => <button key={item._id} type="button" onClick={() => setSelected(item._id)} aria-pressed={current?._id === item._id} className="block w-full border-b border-line p-4 text-left last:border-0 hover:bg-canvas aria-pressed:bg-canvas"><span className="block font-semibold">{item.title}</span><span className="mt-1 block text-sm text-muted">{item.name} · {item.institution || "Independent researcher"}</span><span className="mt-3 inline-block rounded-full border border-line px-2 py-1 text-xs font-medium">{STATUS_LABELS[item.status]}</span></button>)}</div>{status === "CanLoadMore" && <button className="btn-secondary mt-4" onClick={() => loadMore(25)}>Load more</button>}{status === "LoadingMore" && <p className="mt-4 text-sm text-muted">Loading more…</p>}</div>
      {current ? <RequestDetails key={current._id} item={current} /> : <div className="grid min-h-60 place-items-center rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Select a request to read the brief and update its status.</div>}
    </div>
  </section>;
}

function PublicRequests() {
  const { results, status, loadMore } = usePaginatedQuery(api.studio.listPublicRequests, {}, { initialNumItems: 25 });
  const [selected, setSelected] = useState<string | null>(null);
  const current = results.find(item => item._id === selected);
  return <section className="mt-8"><h3 className="text-lg font-semibold">Public form requests</h3>
    <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(260px,0.85fr)_1.15fr]">
      <div><div className="overflow-hidden rounded-xl border border-line bg-surface">
        {status === "LoadingFirstPage" ? <p className="p-5 text-sm text-muted">Loading requests…</p> : results.length === 0 ? <p className="p-5 text-sm text-muted">No public requests yet.</p> : results.map(item => <button key={item._id} type="button" onClick={() => setSelected(item._id)} aria-pressed={current?._id === item._id} className="block w-full border-b border-line p-4 text-left last:border-0 hover:bg-canvas aria-pressed:bg-canvas"><span className="block font-semibold">{item.topic}</span><span className="mt-1 block text-sm text-muted">{item.name} · Public form</span></button>)}
      </div>{status === "CanLoadMore" && <button className="btn-secondary mt-4" onClick={() => loadMore(25)}>Load more</button>}</div>
      {current ? <article className="rounded-xl border border-line bg-surface p-6"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Public form · {TYPE_LABELS[current.package]}</p><h4 className="mt-2 text-xl font-semibold">{current.topic}</h4><p className="mt-3 text-xs text-muted">Submitted {new Date(current._creationTime).toLocaleDateString()}</p><PublicEmailStatus key={current._id} request={current} /><div className="mt-6 grid gap-4 border-t border-line pt-5 text-sm"><div><p className="font-medium">{current.name}{current.institution ? ` · ${current.institution}` : ""}{current.role ? ` · ${current.role}` : ""}</p><a className="text-accent underline" href={`mailto:${current.email}`}>{current.email}</a></div><div><p className="text-xs uppercase tracking-wide text-muted">The brief</p><p className="mt-2 whitespace-pre-wrap">{current.description}</p></div>{current.materialsUrl && <p><a className="break-all text-accent underline" href={current.materialsUrl} target="_blank" rel="noreferrer">Open materials</a></p>}<p><strong>Intended use:</strong> {current.uses.join(", ") || "Not specified"}</p><p><strong>Deadline:</strong> {current.deadline || "Not specified"}</p><p><strong>Sharing:</strong> {current.sharing === "public-after-approval" ? "Public after approval" : current.sharing === "private" ? "Not for the portfolio" : "Embargoed"}{current.embargoUntil ? ` until ${current.embargoUntil}` : ""}</p></div></article> : <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Select a public request to read it.</div>}
    </div></section>;
}

function PublicEmailStatus({ request }: { request: Doc<"publicRequests"> }) {
  const retry = useMutation(api.studio.retryPublicRequestEmail);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function resendEmails() {
    setBusy(true);
    try { await retry({ requestId: request._id }); setMessage("Email queue retry scheduled. Check the status after a moment."); }
    catch { setMessage("Could not schedule the retry."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 text-xs text-muted">{request.emailQueuedAt ? "Notification and confirmation queued for delivery." : <><span>Emails have not been queued yet. </span><button type="button" className="text-accent underline" onClick={resendEmails} disabled={busy}>Retry emails</button></>}{message && <p role="status" className="mt-1">{message}</p>}</div>;
}

function RequestDetails({ item }: { item: Doc<"requests"> }) {
  const update = useMutation(api.studio.setStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [next, setNext] = useState<CurrentStatus>(currentStatus(item.status));
  async function save() {
    setSaving(true); setMessage("");
    try { await update({ id: item._id, status: next }); setMessage("Status updated."); }
    catch { setMessage("Could not update the status. Please try again."); }
    finally { setSaving(false); }
  }
  return <article className="rounded-xl border border-line bg-surface p-6"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted">{TYPE_LABELS[item.type]}</p><h3 className="mt-2 text-xl font-semibold">{item.title}</h3></div><span className="h-fit rounded-full border border-line px-3 py-1 text-xs font-medium">{STATUS_LABELS[item.status]}</span></div><p className="mt-3 text-xs text-muted">Submitted {new Date(item._creationTime).toLocaleDateString()}</p><Link href={projectPath(item._id, item.title)} className="mt-3 inline-block text-sm font-medium text-accent underline underline-offset-2">Open private project ↗</Link><div className="mt-6 grid gap-4 border-t border-line pt-5 text-sm"><div><p className="text-xs uppercase tracking-wide text-muted">Researcher</p><p className="mt-1 font-medium">{item.name}{item.institution ? ` · ${item.institution}` : ""}</p><a href={`mailto:${item.email}`} className="mt-1 inline-block text-accent underline underline-offset-2">{item.email}</a></div><div><p className="text-xs uppercase tracking-wide text-muted">The brief</p><p className="mt-2 whitespace-pre-wrap leading-relaxed">{item.description}</p></div>{item.materialsUrl && <div><p className="text-xs uppercase tracking-wide text-muted">Materials</p><a href={item.materialsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block break-all text-accent underline underline-offset-2">Open materials ↗</a></div>}</div><div className="mt-6 border-t border-line pt-5"><label htmlFor="studio-status" className="text-sm font-medium">Project status</label><div className="mt-2 flex flex-wrap gap-2"><select id="studio-status" className="field min-w-40 flex-1" value={next} onChange={(e) => setNext(e.target.value as CurrentStatus)}>{STAGES.map(value => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}</select><button type="button" className="btn-primary" onClick={save} disabled={saving || next === currentStatus(item.status)}>{saving ? "Saving…" : "Save status"}</button></div>{message && <p className="mt-2 text-sm text-muted" role="status">{message}</p>}<p className="mt-3 text-xs text-muted">Status changes appear in the researcher&apos;s portal. No email is sent yet.</p></div><WorkSelection requestId={item._id} /><EntryEditor requestId={item._id} /><VisualEditor requestId={item._id} /><PublicationEditor request={item} /></article>;
}

function WorkSelection({ requestId }: { requestId: Id<"requests"> }) {
  const selected = useQuery(api.studio.workSelection, { requestId });
  const select = useMutation(api.studio.selectForWork);
  const unselect = useMutation(api.studio.unselectForWork);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function start() {
    setBusy(true); setError("");
    try { await select({ requestId }); } catch { setError("Could not select this project. Please try again."); }
    finally { setBusy(false); }
  }
  async function stop() {
    setBusy(true); setError("");
    try { await unselect({ requestId }); } catch { setError("Could not update the selection. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 border-t border-line pt-5"><h4 className="font-semibold">Development workspace</h4><p className="mt-1 text-sm text-muted">Select this project, then run the local command to create its development copy and code folder. This does not change the client&apos;s project status.</p>{selected === undefined ? <p role="status" className="mt-3 text-sm text-muted">Loading…</p> : selected ? <div className="mt-3"><p className="text-sm font-medium text-accent">Selected for work</p><p className="mt-2 text-xs text-muted">Run this locally, replacing SOURCE with <strong>prod</strong> for a production request or <strong>dev</strong> for a development request:</p><code className="mt-2 block overflow-x-auto rounded-lg bg-canvas p-3 text-xs">npm run workspace -- --source SOURCE --project {requestId}</code><p className="mt-2 text-xs text-muted">Client files are not copied unless selected explicitly. See the workspace documentation for file selection.</p><button className="mt-3 text-sm text-muted underline underline-offset-2" type="button" onClick={stop} disabled={busy}>Remove from work selection</button></div> : <button className="btn-secondary mt-3" type="button" onClick={start} disabled={busy}>{busy ? "Selecting…" : "Start working"}</button>}{error && <p role="alert" className="mt-2 text-sm text-[var(--viz-2)]">{error}</p>}</section>;
}

function EntryEditor({ requestId }: { requestId: Id<"requests"> }) {
  const entry = useQuery(api.studio.getEntry, { requestId });
  if (entry === undefined) return <p className="mt-6 text-sm text-muted" role="status">Loading project entry…</p>;
  return <EntryForm key={entry?._id ?? "new"} requestId={requestId} entry={entry} />;
}

function EntryForm({ requestId, entry }: { requestId: Id<"requests">; entry: Doc<"projectEntries"> | null }) {
  const save = useMutation(api.studio.saveEntry);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true); setMessage("");
    try {
      await save({ requestId, title: String(data.get("title") ?? ""), description: String(data.get("description") ?? ""), previewUrl: String(data.get("previewUrl") ?? "") });
      setMessage("Entry shared with the researcher.");
    } catch { setMessage("Could not save the entry. Check the fields and try again."); }
    finally { setSaving(false); }
  }
  return <section className="mt-6 border-t border-line pt-5"><h4 className="font-semibold">Private project entry</h4><p className="mt-1 text-sm text-muted">Share an update and a preview with this request’s researcher. Saving shares it and shows a new update in their portal. No email is sent.</p><form onSubmit={submit} className="mt-4 grid gap-4"><label className="grid gap-1.5 text-sm font-medium">Title<input className="field" name="title" required maxLength={200} defaultValue={entry?.title ?? ""} /></label><label className="grid gap-1.5 text-sm font-medium">Update or review instructions<textarea className="field" name="description" required maxLength={5000} rows={4} defaultValue={entry?.description ?? ""} /></label><label className="grid gap-1.5 text-sm font-medium">Preview link (optional)<input className="field" name="previewUrl" type="url" maxLength={1000} placeholder="https://" defaultValue={entry?.previewUrl ?? ""} /></label><p className="text-xs text-muted">The portal protects this entry. A linked preview is hosted elsewhere; configure its sharing permissions separately.</p><button className="btn-primary justify-self-start" disabled={saving}>{saving ? "Saving…" : entry ? "Update shared entry" : "Share entry"}</button>{message && <p role="status" className="text-sm text-muted">{message}</p>}</form></section>;
}

function VisualEditor({ requestId }: { requestId: Id<"requests"> }) {
  const visual = useQuery(api.studio.getVisual, { requestId });
  if (visual === undefined) return <p className="mt-6 text-sm text-muted">Loading visualisation…</p>;
  return <section className="mt-6 border-t border-line pt-5"><h4 className="font-semibold">Project visualisation</h4><p className="mt-1 text-sm text-muted">Attach a visualization built and registered by the studio. It becomes available on this private project page.</p><InteractivePicker requestId={requestId} current={visual?.component ?? null} /><details className="mt-5"><summary className="cursor-pointer text-sm font-medium text-accent">Or create a simple scatter plot</summary><VisualForm key={visual?._id ?? "new"} requestId={requestId} visual={visual?.component === "scatter" ? visual : null} /></details></section>;
}

function InteractivePicker({ requestId, current }: { requestId: Id<"requests">; current: Doc<"projectVisuals">["component"] | null }) {
  const attach = useMutation(api.studio.attachInteractiveVisual);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function share() {
    setBusy(true); setMessage("");
    try { await attach({ requestId, component: "optimiser-loss-surface" }); setMessage("Interactive visualisation attached. Open the private project to review it."); }
    catch { setMessage("Could not attach the visualisation. Please try again."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 rounded-lg border border-line bg-canvas p-4"><p className="text-sm font-semibold">3D optimiser loss surface <span className="font-normal text-muted">· Studio demo</span></p><p className="mt-1 text-xs leading-relaxed text-muted">An interactive example using a synthetic surface. This is a demonstration, not a visualization of the researcher&apos;s data.</p><button type="button" className="btn-secondary mt-3" onClick={share} disabled={busy || current === "optimiser-loss-surface"}>{busy ? "Attaching…" : current === "optimiser-loss-surface" ? "Currently attached" : "Attach demo"}</button>{message && <p role="status" className="mt-2 text-sm text-muted">{message}</p>}{current && current !== "optimiser-loss-surface" && <p className="mt-2 text-xs text-muted">Attaching this replaces the current project visualisation.</p>}</div>;
}

function VisualForm({ requestId, visual }: { requestId: Id<"requests">; visual: Extract<Doc<"projectVisuals">, { component: "scatter" }> | null }) {
  const save = useMutation(api.studio.saveVisual);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setMessage("");
    try {
      const points: unknown = JSON.parse(String(data.get("points") ?? ""));
      if (!Array.isArray(points) || points.some(p => typeof p !== "object" || p === null || typeof p.x !== "number" || typeof p.y !== "number" || typeof p.label !== "string")) throw new Error("Invalid points");
      await save({ requestId, title: String(data.get("title") ?? ""), xLabel: String(data.get("xLabel") ?? ""), yLabel: String(data.get("yLabel") ?? ""), points: points.map(p => ({ x: p.x, y: p.y, label: p.label })) });
      setMessage("Visualisation shared on the project page.");
    } catch { setMessage("Could not save. Enter 1–300 points as JSON with numeric x, y and a text label."); }
    finally { setBusy(false); }
  }
  return <div><form onSubmit={submit} className="mt-4 grid gap-3"><label className="grid gap-1 text-sm font-medium">Chart title<input name="title" className="field" required maxLength={120} defaultValue={visual?.title ?? ""}/></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-sm font-medium">X axis label<input name="xLabel" className="field" required maxLength={80} defaultValue={visual?.xLabel ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Y axis label<input name="yLabel" className="field" required maxLength={80} defaultValue={visual?.yLabel ?? ""}/></label></div><label className="grid gap-1 text-sm font-medium">Observations as JSON<textarea name="points" className="field font-mono" rows={6} required defaultValue={visual ? JSON.stringify(visual.points, null, 2) : '[{"x": 1, "y": 2, "label": "Sample"}]'}/></label><p className="text-xs text-muted">Use 1–300 observations. Sharing replaces any current project visualisation.</p><button className="btn-primary justify-self-start" disabled={busy}>{busy ? "Saving…" : "Share visualisation"}</button>{message && <p role="status" className="text-sm text-muted">{message}</p>}</form></div>;
}
