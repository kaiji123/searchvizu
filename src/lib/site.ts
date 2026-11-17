// Central place for brand and business details. Change the name here once
// you settle on one; everything else reads from this file.
export const site = {
  name: "SearchVizu",
  tagline: "Research, made explorable.",
  description:
    "Discover interactive visualisations of research, public datasets and the ideas that shape our world.",
  // Used for absolute URLs in metadata, the sitemap and embed snippets.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
};
