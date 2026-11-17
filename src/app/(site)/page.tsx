import Link from "next/link";
import { Container } from "@/components/site/SiteChrome";
import { VizCard } from "@/components/site/VizCard";
import { publicVisualisations } from "@/content/visualisations";
import { site } from "@/lib/site";

// Yearly plan shown on the home page. Billing is not automated yet.
const plan = {
  price: "£99",
  perMonth: "£8.25",
  features: [
    "Submit visualisation requests through the researcher portal",
    "Private project page for each request",
    "Share files and receive deliverables",
    "In-portal progress updates",
  ],
};

const steps = [
  {
    title: "Send the research",
    body: "Share a paper, dataset, equations or a short explanation, plus where the visual will be used.",
  },
  {
    title: "We create together",
    body: "We turn your research into an interactive visualisation, with a private space to follow its progress and review it.",
  },
  {
    title: "Publish, share, embed",
    body: "Explore your work privately and choose whether to share a public research page after reviewing it.",
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
          <p className="mb-4 text-sm font-medium text-accent">A collection for curious minds</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            A curious place to explore the world through data.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{site.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/work" className="btn-primary">
              Explore the collection
            </Link>
            <Link href="/request" className="btn-secondary !py-2.5">
              Request a visualisation
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Live examples</h2>
            <p className="mt-1 text-muted">Real data, big ideas and interactive experiments. Pick a story and explore.</p>
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
          <h2 className="text-2xl font-semibold tracking-tight">Subscription</h2>
          <p className="mt-2 max-w-2xl text-muted">One simple yearly plan for researchers who want to bring their work to life.</p>
          <div className="mt-8 max-w-md rounded-xl border border-line bg-surface p-6">
            <h3 className="font-semibold">Researcher</h3>
            <p className="mt-3"><span className="text-4xl font-semibold tracking-tight">{plan.price}</span> <span className="text-muted">/ year</span></p>
            <p className="mt-1 text-sm text-muted">Billed annually. That&apos;s about {plan.perMonth} a month.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2"><span aria-hidden="true" className="text-accent">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/portal" className="btn-primary mt-6">Get started</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
