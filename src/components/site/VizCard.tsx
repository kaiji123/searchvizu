import Link from "next/link";
import type { Visualisation } from "@/content/visualisations";

const ACCENT: Record<string, string> = {
  "sir-model": "var(--viz-2)",
  "causal-dag": "var(--viz-1)",
  "loss-surface": "var(--viz-3)",
};

export function VizCard({ viz }: { viz: Visualisation }) {
  return (
    <Link
      href={`/viz/${viz.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="h-1.5" style={{ background: ACCENT[viz.component] ?? "var(--accent)" }} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded-full border border-line px-2 py-0.5 font-medium uppercase tracking-wide">{viz.kind}</span>
          {viz.discipline}
        </div>
        <h3 className="text-lg font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">{viz.title}</h3>
        <p className="text-sm text-muted">{viz.summary}</p>
        <span className="mt-auto pt-2 text-sm font-medium text-accent">Explore →</span>
      </div>
    </Link>
  );
}
