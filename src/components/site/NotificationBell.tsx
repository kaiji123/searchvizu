"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function NotificationBell() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  return <ConnectedBell />;
}

function ConnectedBell() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const requests = useQuery(api.requests.listMine, isAuthenticated ? {} : "skip");
  const count = requests?.filter((request) => (request.updateVersion ?? 0) > (request.readVersion ?? 0)).length ?? 0;
  const label = isLoading ? "Notifications" : !isAuthenticated ? "Sign in to see notifications" : count ? `Notifications: ${count} ${count === 1 ? "request has" : "requests have"} new updates` : "Notifications: no new updates";
  return <Link href="/portal#your-requests" onClick={() => window.dispatchEvent(new Event("portal:show-requests"))} aria-label={label} title={label} className="relative grid size-10 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="size-5"><path d="M18 8a6 6 0 0 0-12 0c0 7-2.5 7.5-2.5 9h17C20.5 15.5 18 15 18 8Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
    {count > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-[var(--on-accent)]">{count > 99 ? "99+" : count}</span>}
  </Link>;
}
