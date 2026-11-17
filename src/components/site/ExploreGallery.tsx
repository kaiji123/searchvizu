"use client";

import { useMemo, useState } from "react";
import type { Visualisation } from "@/content/visualisations";
import { VizCard } from "./VizCard";

export function ExploreGallery({ items }: { items: Visualisation[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return items.filter((item) => (kind === "all" || item.kind === kind) && (!search || `${item.title} ${item.summary} ${item.discipline} ${item.attribution.owner}`.toLocaleLowerCase().includes(search)));
  }, [items, query, kind]);
  return <div className="mt-8">
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-line bg-surface p-4">
      <label className="min-w-[200px] flex-1 text-xs font-medium text-muted" htmlFor="gallery-search">Search sample visualisations<input id="gallery-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try astronomy, climate or biology" className="mt-2 block w-full rounded-md border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-offset-2" /></label>
      <label className="text-xs font-medium text-muted" htmlFor="gallery-kind">Format<select id="gallery-kind" value={kind} onChange={(event) => setKind(event.target.value)} className="mt-2 block rounded-md border border-line bg-canvas px-3 py-2.5 text-sm text-ink"><option value="all">All formats</option><option value="2d">2D</option><option value="3d">3D</option></select></label>
      <p className="pb-2 text-sm text-muted" role="status">{filtered.length} {filtered.length === 1 ? "visualisation" : "visualisations"}</p>
    </div>
    {filtered.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((viz) => <VizCard key={viz.slug} viz={viz} />)}</div> : <p className="mt-8 text-sm text-muted">No visualisations match those filters. Try a different search or format.</p>}
  </div>;
}
