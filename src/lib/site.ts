// Central place for brand and business details. Change the name here once
// you settle on one; everything else reads from this file.
export const site = {
  name: "SearchVizu",
  tagline: "Research, made explorable.",
  description:
    "A research visualisation studio that turns papers, models and datasets into accurate, interactive 2D and 3D web experiences researchers can publish, share and embed.",
  // Used for absolute URLs in metadata, the sitemap and embed snippets.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
};

export type Package = {
  id: "figure" | "interactive-2d" | "interactive-3d";
  name: string;
  price: string;
  priceNote: string;
  summary: string;
  includes: string[];
};

export const packages: Package[] = [
  {
    id: "figure",
    name: "2D Figure",
    price: "£39",
    priceNote: "starting price",
    summary: "One polished static chart or diagram for a paper, poster or slide.",
    includes: ["Publication-ready SVG and PNG", "One revision", "Style matched to the journal"],
  },
  {
    id: "interactive-2d",
    name: "Interactive 2D",
    price: "£99",
    priceNote: "starting price",
    summary: "A browser-based visual with sliders, hover detail or step-through states.",
    includes: ["Hosted page and embed code", "Simple interactions", "Two revisions"],
  },
  {
    id: "interactive-3d",
    name: "Interactive 3D",
    price: "£199+",
    priceNote: "custom quote",
    summary: "A 3D model, surface or simulation viewer, scoped to its complexity.",
    includes: ["Hosted page and embed code", "Orbit, zoom and parameter controls", "Scoped revisions"],
  },
];
