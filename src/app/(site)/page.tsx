import Link from "next/link";
import { Container } from "@/components/site/SiteChrome";
import { VizCard } from "@/components/site/VizCard";
import { publicVisualisations } from "@/content/visualisations";
import { packages, site } from "@/lib/site";

const steps = [
  {
    title: "Send the research",
    body: "Share a paper, dataset, equations or a short explanation, plus where the visual will be used.",
  },
  {
    title: "We scope and build",
    body: "You get a fixed quote, then a working draft you can review in the browser. Accuracy comes before decoration.",
  },
  {
    title: "Publish, share, embed",
    body: "You receive a hosted page, an embed snippet for your lab site and downloadable assets. Pages stay private until you approve them.",
  },
];

const domains = [
  {
    title: "Mathematical models",
    body: "SIR/SEIR dynamics, uncertainty distributions, sensitivity analysis, causal diagrams and optimisation surfaces.",
  },
  {
    title: "3D scientific scenes",
    body: "Molecular structures, biological mechanisms, spatial simulations and 3D scan viewers.",
  },
  {
    title: "AI and algorithms",
    body: "Network architectures, attention, computer-vision pipelines and side-by-side model comparisons.",
  },
];

export default function Home() {
  const featured = publicVisualisations();
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="mb-4 text-sm font-medium text-accent">Research visualisation studio</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Turn complex research into interactive visuals people can explore.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/request" className="btn-primary">
              Request a visualisation
            </Link>
            <Link href="/work" className="btn-secondary !py-2.5">
              See live examples
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Live examples</h2>
            <p className="mt-1 text-muted">Every one runs in the browser. Open one and start adjusting it.</p>
          </div>
          <Link href="/work" className="hidden text-sm font-medium text-accent sm:block">
            All work →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((v) => (
            <VizCard key={v.slug} viz={v} />
          ))}
        </div>
      </Container>

      <Container className="py-16">
        <h2 className="text-2xl font-semibold tracking-tight">What we visualise</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {domains.map((d) => (
            <div key={d.title}>
              <h3 className="font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm text-muted">{d.body}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-line bg-surface p-5">
              <div className="mb-3 grid size-8 place-items-center rounded-full bg-ink text-sm font-semibold text-canvas">{i + 1}</div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </Container>

      <section id="pricing" className="scroll-mt-16">
        <Container className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mt-1 text-muted">Fixed scope, agreed before work starts. Introductory rates for students and early-career researchers.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {packages.map((p) => (
              <div key={p.id} className="flex flex-col rounded-xl border border-line bg-surface p-6">
                <h3 className="font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{p.price}</span>
                  <span className="text-sm text-muted">{p.priceNote}</span>
                </div>
                <p className="mt-3 text-sm text-muted">{p.summary}</p>
                <ul className="mt-4 flex flex-col gap-1.5 text-sm">
                  {p.includes.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-accent" aria-hidden>
                        ✓
                      </span>
                      {i}
                    </li>
                  ))}
                </ul>
                <Link href={`/request?package=${p.id}`} className="btn-secondary mt-6">
                  Start with {p.name}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            Custom modelling, data cleaning and extra revisions are quoted separately.
          </p>
        </Container>
      </section>
    </>
  );
}
