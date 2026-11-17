"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { STATUS_LABELS } from "../../../portal/Studio";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { ProjectFiles } from "@/components/projects/ProjectFiles";
import { PrivateVisual } from "@/components/viz/private/registry";
import { PublicationReview } from "@/components/publications/PublicationReview";

export function PrivateProject({ requestId }: { requestId: string }) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return <p>This project portal is not configured.</p>;
  return <AuthenticatedProject requestId={requestId} />;
}

function AuthenticatedProject({ requestId }: { requestId: string }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const project = useQuery(api.projects.get, isAuthenticated ? { requestId } : "skip");
  if (isLoading || (isAuthenticated && project === undefined)) return <p role="status" className="text-muted">Loading project…</p>;
  if (!isAuthenticated) return <div className="max-w-xl"><p className="text-sm font-medium text-accent">Private project</p><h1 className="mt-3 text-3xl font-semibold">Sign in to view this project</h1><p className="mt-3 text-muted">Use the researcher account associated with this request, then return to this link or open it from your portal.</p><Link href="/portal" className="btn-primary mt-6">Sign in to the portal</Link></div>;
  if (!project) return <div className="max-w-xl"><h1 className="text-3xl font-semibold">Project unavailable</h1><p className="mt-3 text-muted">This project may not exist, or your account may not have access.</p><Link href="/portal" className="btn-secondary mt-6">Back to portal</Link></div>;
  return <div className="mx-auto max-w-3xl"><Link href="/portal" className="text-sm text-muted hover:text-ink">← Back to portal</Link><header className="mt-8 border-b border-line pb-8"><p className="text-sm font-medium text-accent">Private project</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1><p className="mt-3 text-sm text-muted">Status: {STATUS_LABELS[project.status]}</p></header>{project.entry ? <article className="mt-8 rounded-xl border border-line bg-surface p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-wide text-accent">Shared by the studio</p><h2 className="mt-3 text-2xl font-semibold">{project.entry.title}</h2><p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted">{project.entry.description}</p>{project.entry.previewUrl && <div className="mt-6"><a href={project.entry.previewUrl} target="_blank" rel="noreferrer" className="btn-primary">Open external preview ↗</a><p className="mt-2 text-xs text-muted">Access to this external preview is controlled by its host.</p></div>}</article> : <div className="mt-8 rounded-xl border border-line bg-surface p-6"><h2 className="font-semibold">Your project is being prepared</h2><p className="mt-2 text-sm text-muted">The studio will share an update here when it is ready.</p></div>}<section aria-labelledby="project-visualisation" className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-accent">Your research, visualised</p><h2 id="project-visualisation" className="mt-2 text-2xl font-semibold tracking-tight">Visualisation</h2></div>{project.visual && <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Private to this project</span>}</div>{project.visual ? <PrivateVisual visual={project.visual} /> : <div className="mt-4 rounded-xl border border-dashed border-line bg-surface p-8"><p className="font-semibold">Your visualisation will appear here</p><p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">Once the studio shares a visualisation, you can explore it directly on this page.</p></div>}</section><PublicationReview requestId={requestId as Id<"requests">} /><ProjectFiles requestId={requestId as Id<"requests">} /></div>;
}
