import Link from "next/link";
import { connection } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { publicationPath } from "@/lib/publication-path";

export async function PublicGallery() {
  await connection();
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  let stories;
  try {
    stories = await fetchQuery(api.publications.listPublic, {});
  } catch (error) {
    console.error("Unable to load public researcher stories from Convex:", error);
    return <section className="mt-12" aria-live="polite"><h2 className="text-2xl font-semibold tracking-tight">Researcher stories</h2><p className="mt-2 text-muted">Researcher stories are temporarily unavailable. Please try again later.</p></section>;
  }
  if (!stories.length) return null;
  return <section className="mt-12"><h2 className="text-2xl font-semibold tracking-tight">Researcher stories</h2><p className="mt-2 text-muted">Interactive work shared with the researcher’s approval.</p><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{stories.map(story => <Link key={story.id} href={publicationPath(story.id, story.title)} className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-lg"><span className="text-xs font-medium uppercase tracking-wide text-accent">Research story</span><h3 className="text-lg font-semibold group-hover:underline">{story.title}</h3><p className="text-sm text-muted">{story.summary}</p><p className="mt-auto pt-2 text-xs text-muted">{story.authorName}{story.affiliation && ` · ${story.affiliation}`}</p><span className="text-sm font-medium text-accent">Explore →</span></Link>)}</div></section>;
}
