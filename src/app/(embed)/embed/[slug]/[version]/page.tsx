import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VizRenderer } from "@/components/viz/registry";
import { getVisualisation, servedVisualisations } from "@/content/visualisations";
import { site } from "@/lib/site";

// Embeds are versioned (/embed/<slug>/v1) so a researcher's embedded copy
// never changes under them. When a visualisation gets a breaking update, bump
// `version` in the registry and keep the old component reachable under its
// old version before removing anything.

export function generateStaticParams() {
  return servedVisualisations().map((v) => ({ slug: v.slug, version: `v${v.version}` }));
}

export async function generateMetadata({ params }: PageProps<"/embed/[slug]/[version]">): Promise<Metadata> {
  const viz = getVisualisation((await params).slug);
  return {
    title: viz?.title,
    robots: { index: false, follow: true },
    alternates: viz ? { canonical: `/viz/${viz.slug}` } : undefined,
  };
}

export default async function EmbedPage({ params }: PageProps<"/embed/[slug]/[version]">) {
  const { slug, version } = await params;
  const viz = getVisualisation(slug);
  if (!viz || version !== `v${viz.version}`) notFound();

  return (
    <div className="flex min-h-screen flex-col gap-2 p-2 sm:p-3">
      <VizRenderer component={viz.component} />
      <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted">
        <span className="truncate">
          {viz.title} · {viz.attribution.owner}
        </span>
        <a href={`${site.url}/viz/${viz.slug}`} target="_blank" rel="noopener" className="shrink-0 hover:text-ink">
          Open full page ↗
        </a>
      </div>
    </div>
  );
}
