import type { MetadataRoute } from "next";
import { publicVisualisations } from "@/content/visualisations";
import { site } from "@/lib/site";

// Only public visualisations are listed; unlisted client pages never appear.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/` },
    { url: `${site.url}/work` },
    { url: `${site.url}/request` },
    ...publicVisualisations().map((v) => ({ url: `${site.url}/viz/${v.slug}`, lastModified: v.updated })),
  ];
}
