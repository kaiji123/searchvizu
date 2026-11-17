import { v } from "convex/values";

export const publishedVisual = v.union(
  v.object({ component: v.literal("scatter"), title: v.string(), xLabel: v.string(), yLabel: v.string(), points: v.array(v.object({ x: v.number(), y: v.number(), label: v.string() })) }),
  v.object({ component: v.literal("optimiser-loss-surface"), title: v.string() }),
);

export const publicationContent = v.object({
  title: v.string(), summary: v.string(), authorName: v.string(), affiliation: v.string(), bio: v.string(),
  paperTitle: v.string(), paperUrl: v.string(), datasetLabel: v.string(), datasetUrl: v.string(), attribution: v.string(),
  visual: publishedVisual,
});
