"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

export function PublicationEditor({ request }: { request: Doc<"requests"> }) {
  const review = useQuery(api.publications.review, { requestId: request._id });
  if (review === undefined) return <p className="mt-6 text-sm text-muted">Loading public-page draft…</p>;
  return <PublicationForm key={request._id} request={request} draft={review?.draft ?? null} published={review?.published ?? false} />;
}

function PublicationForm({ request, draft, published }: { request: Doc<"requests">; draft: Doc<"publications">["draft"] | null; published: boolean }) {
  const save = useMutation(api.publications.saveDraft);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const d = new FormData(event.currentTarget); setBusy(true); setMessage("");
    const value = (name: string) => String(d.get(name) ?? "");
    try { await save({ requestId: request._id as Id<"requests">, title: value("title"), summary: value("summary"), authorName: value("authorName"), affiliation: value("affiliation"), bio: value("bio"), paperTitle: value("paperTitle"), paperUrl: value("paperUrl"), datasetLabel: value("datasetLabel"), datasetUrl: value("datasetUrl"), attribution: value("attribution") }); setMessage("Draft saved for researcher review."); }
    catch { setMessage("Could not save. Attach a visualisation first and check the required fields and HTTPS links."); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 border-t border-line pt-5"><h4 className="font-semibold">Public research page</h4><p className="mt-1 text-sm text-muted">Prepare a draft for the researcher to review. Saving copies the current visualisation and does not publish it. {published && "The existing approved page stays public until the researcher approves a new version or withdraws it."}</p><form onSubmit={submit} className="mt-4 grid gap-3"><label className="grid gap-1 text-sm font-medium">Public title<input name="title" className="field" required maxLength={160} defaultValue={draft?.title ?? request.title}/></label><label className="grid gap-1 text-sm font-medium">Research summary<textarea name="summary" className="field" required rows={4} maxLength={2000} defaultValue={draft?.summary ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Researcher name<input name="authorName" className="field" required maxLength={160} defaultValue={draft?.authorName ?? request.name}/></label><label className="grid gap-1 text-sm font-medium">Affiliation (optional)<input name="affiliation" className="field" maxLength={200} defaultValue={draft?.affiliation ?? request.institution}/></label><label className="grid gap-1 text-sm font-medium">Researcher biography (optional)<textarea name="bio" className="field" rows={3} maxLength={3000} defaultValue={draft?.bio ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Paper title<input name="paperTitle" className="field" required maxLength={300} defaultValue={draft?.paperTitle ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Paper link<input name="paperUrl" type="url" className="field" required maxLength={1000} placeholder="https://" defaultValue={draft?.paperUrl ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Dataset label (optional)<input name="datasetLabel" className="field" maxLength={300} defaultValue={draft?.datasetLabel ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Dataset link (optional)<input name="datasetUrl" type="url" className="field" maxLength={1000} placeholder="https://" defaultValue={draft?.datasetUrl ?? ""}/></label><label className="grid gap-1 text-sm font-medium">Attribution and reuse notes (optional)<textarea name="attribution" className="field" rows={3} maxLength={2000} defaultValue={draft?.attribution ?? ""}/></label><button className="btn-secondary justify-self-start" disabled={busy}>{busy ? "Saving…" : "Save draft for review"}</button>{message && <p role="status" className="text-sm text-muted">{message}</p>}</form></section>;
}
