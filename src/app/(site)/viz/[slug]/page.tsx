import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/SiteChrome";
import { ShareEmbed } from "@/components/site/ShareEmbed";
import { VizRenderer } from "@/components/viz/registry";
import { getVisualisation, servedVisualisations } from "@/content/visualisations";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return servedVisualisations().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/viz/[slug]">): Promise<Metadata> {
  const viz = getVisualisation((await params).slug);
  if (!viz) return {};
  return {
    title: viz.title,
    description: viz.summary,
    alternates: { canonical: `/viz/${viz.slug}` },
    robots: viz.visibility === "public" ? undefined : { index: false, follow: false },
    openGraph: { title: viz.title, description: viz.summary, type: "article" },
  };
}

export default async function VizPage({ params }: PageProps<"/viz/[slug]">) {
  const viz = getVisualisation((await params).slug);
  if (!viz) notFound();

  const pageUrl = `${site.url}/viz/${viz.slug}`;
  const embedUrl = `${site.url}/embed/${viz.slug}/v${viz.version}`;

  return (
    <Container className="py-10 sm:py-14">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/work" className="hover:text-ink">
          ← All work
        </Link>
      </nav>

      {viz.visibility === "unlisted" && (
        <div className="mb-6 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
          This page is unlisted. Only people with the link can see it, and search engines are asked not to index it.
        </div>
      )}

      <header className="mb-8 max-w-3xl">
        <div className="mb-3 flex items-center gap-2 text-sm text-muted">
          <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium uppercase tracking-wide">{viz.kind}</span>
          {viz.discipline}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{viz.title}</h1>
        <p className="mt-3 text-lg text-muted">{viz.summary}</p>
      </header>

      <VizRenderer component={viz.component} />

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="flex min-w-0 max-w-3xl flex-col gap-10">
          <Section title="About this visualisation">
            {viz.about.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Section>
          <Section title="How to read it">
            <ul className="list-disc space-y-2 pl-5">
              {viz.howToRead.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Section>
          <Section title="Limitations">
            <ul className="list-disc space-y-2 pl-5">
              {viz.limitations.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Section>
          <Section title="References">
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {viz.references.map((r) => (
                <li key={r.label}>
                  {r.label}{" "}
                  {r.url && (
                    <a href={r.url} className="text-accent underline underline-offset-2" target="_blank" rel="noreferrer">
                      Link
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        </article>

        <aside className="flex min-w-0 flex-col gap-8 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-5 text-sm">
            <div className="text-xs uppercase tracking-wide text-muted">Research by</div>
            <div className="mt-1 font-semibold">
              {viz.attribution.url ? (
                <a href={viz.attribution.url} className="underline underline-offset-2">
                  {viz.attribution.owner}
                </a>
              ) : (
                viz.attribution.owner
              )}
            </div>
            {viz.attribution.affiliation && <div className="text-muted">{viz.attribution.affiliation}</div>}
            <div className="mt-4 text-xs text-muted">
              Version {viz.version} · updated {viz.updated}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Share or embed</h2>
            <ShareEmbed pageUrl={pageUrl} embedUrl={embedUrl} title={viz.title} />
          </div>
          <div className="rounded-xl border border-line bg-surface p-5 text-sm">
            <div className="font-semibold">Want one for your research?</div>
            <p className="mt-1 text-muted">Tell us about your research and what you&apos;d like to explore.</p>
            <Link href="/request" className="btn-primary mt-4 w-full">
              Request a visualisation
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 leading-relaxed text-[color-mix(in_oklab,var(--ink)_85%,var(--muted))]">{children}</div>
    </section>
  );
}
