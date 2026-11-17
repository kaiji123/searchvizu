import type { Metadata } from "next";
import { Container } from "@/components/site/SiteChrome";
import { ExploreGallery } from "@/components/site/ExploreGallery";
import { publicVisualisations } from "@/content/visualisations";
import { Suspense } from "react";
import { PublicGallery } from "@/components/publications/PublicGallery";

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
        Explore real research data, surprising patterns and ideas brought to life. Every example invites you to take a closer look.
      </p>
      <ExploreGallery items={items} />
      <Suspense fallback={null}><PublicGallery /></Suspense>
    </Container>
  );
}
