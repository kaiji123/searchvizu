import type { Metadata } from "next";
import { Container } from "@/components/site/SiteChrome";
import { VizCard } from "@/components/site/VizCard";
import { publicVisualisations } from "@/content/visualisations";

export const metadata: Metadata = {
  title: "Work",
  description: "Interactive research visualisations: mathematical models, causal diagrams and 3D scenes.",
};

export default function WorkPage() {
  const items = publicVisualisations();
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Work</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Studio demonstrations and published client visualisations. Client pages appear here only with the researcher&apos;s permission.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <VizCard key={v.slug} viz={v} />
        ))}
      </div>
    </Container>
  );
}
