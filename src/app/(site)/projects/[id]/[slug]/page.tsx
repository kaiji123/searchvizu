import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/site/SiteChrome";
import { PrivateProject } from "./project";

export const metadata: Metadata = { title: "Private project", robots: { index: false, follow: false } };

export default function ProjectPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  return <Container className="py-12 sm:py-16"><Suspense fallback={<p role="status" className="text-muted">Loading project…</p>}><ProjectContent params={params} /></Suspense></Container>;
}

async function ProjectContent({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  return <PrivateProject requestId={id} />;
}
