"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { publicationPath } from "@/lib/publication-path";
import { ResearchStory } from "./ResearchStory";

export function PublicationReview({ requestId }: { requestId: Id<"requests"> }) {
  const review = useQuery(api.publications.review, { requestId });
  if (!review) return null;
  return <ReviewDraft key={`${review.id}-${review.revision}`} requestId={requestId} review={review} />;
}

function ReviewDraft({ requestId, review }: { requestId: Id<"requests">; review: NonNullable<ReturnType<typeof useQuery<typeof api.publications.review>>> }) {
  const approve = useMutation(api.publications.approve), withdraw = useMutation(api.publications.withdraw);
  const [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const current = review.published && review.approvedRevision === review.revision;
  async function publish() {
    setBusy(true); setMessage("");
    try { await approve({ requestId, revision: review.revision, confirm: confirmed }); setMessage("The public page is now live."); }
    catch { setMessage("Could not publish. The draft may have changed; review the latest version and try again."); }
    finally { setBusy(false); }
  }
  async function unpublish() {
    setBusy(true); setMessage("");
    try { await withdraw({ requestId }); setMessage("The page has been withdrawn from the public gallery."); }
    catch { setMessage("Could not withdraw the page. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-8"><h2 className="text-xl font-semibold">Public page {current ? "approved" : "for review"}</h2><p className="mt-2 text-sm leading-relaxed text-muted">{review.published ? current ? "This version is public." : "An earlier approved version is public. This revised draft will not replace it until you approve." : "This draft is private until you approve it."} The preview includes the visualization and every field proposed for publication.</p>{review.published && <Link href={publicationPath(review.id, review.draft.title)} className="mt-3 inline-block text-sm text-accent underline underline-offset-2">Open public page ↗</Link>}<details className="mt-5"><summary className="cursor-pointer font-medium text-accent">Preview the proposed public page</summary><div className="mt-5 border-t border-line pt-6"><ResearchStory story={review.draft} /></div></details>{review.canApprove && <div className="mt-6 border-t border-line pt-5">{!current && <><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 accent-[var(--accent)]"/><span>I have reviewed the proposed page and authorize publication of this version, including the visualisation, data shown, biography and source links. I have checked that I can share these materials.</span></label><button type="button" className="btn-primary mt-4" disabled={!confirmed || busy} onClick={publish}>{busy ? "Saving…" : review.published ? "Approve and replace public page" : "Approve and publish"}</button></>}{review.published && <button type="button" className="btn-secondary mt-4 ml-0 sm:ml-3" disabled={busy} onClick={unpublish}>Withdraw public page</button>}</div>}{!review.canApprove && <p className="mt-4 text-sm text-muted">Only the request owner can approve or withdraw this page.</p>}{message && <p role="status" className="mt-4 text-sm text-accent">{message}</p>}</section>;
}
