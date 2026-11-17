import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { Container } from "@/components/site/SiteChrome";
import { ResearchStory } from "@/components/publications/ResearchStory";
import { publicationPath } from "@/lib/publication-path";

type Params = Promise<{ id: string; slug: string }>;
async function getStory(params: Params) {
  await connection();
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  return await fetchQuery(api.publications.getPublic, { publicationId: (await params).id });
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const story = await getStory(params);
  if (!story) return { title: "Research story unavailable", robots: { index: false, follow: false } };
  return { title: story.title, description: story.summary.slice(0, 160), alternates: { canonical: publicationPath(story.id, story.title) }, openGraph: { title: story.title, description: story.summary.slice(0, 160), type: "article" } };
}

export default function ResearchPage({ params }: { params: Params }) {
  return <Container className="py-12 sm:py-16"><Suspense fallback={<p role="status" className="text-muted">Loading research story…</p>}><StoryContent params={params} /></Suspense></Container>;
}

async function StoryContent({ params }: { params: Params }) {
  const story = await getStory(params);
  if (!story) notFound();
  return <ResearchStory story={story} />;
}
