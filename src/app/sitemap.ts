import type { MetadataRoute } from "next";
import { publicVisualisations } from "@/content/visualisations";
import { site } from "@/lib/site";
import { connection } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { publicationPath } from "@/lib/publication-path";

// Only public visualisations are listed; unlisted client pages never appear.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const stories = process.env.NEXT_PUBLIC_CONVEX_URL ? await fetchQuery(api.publications.listPublic, {}).catch(() => []) : [];
  return [
    { url: `${site.url}/` },
    { url: `${site.url}/work` },
    { url: `${site.url}/request` },
    ...publicVisualisations().map((v) => ({ url: `${site.url}/viz/${v.slug}`, lastModified: v.updated })),
    ...stories.map((story) => ({ url: `${site.url}${publicationPath(story.id, story.title)}` })),
  ];
}
