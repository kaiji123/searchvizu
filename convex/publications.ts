import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function httpsUrl(value: string, required: boolean) {
  if (!value && !required) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export const saveDraft = mutation({
  args: { requestId: v.id("requests"), title: v.string(), summary: v.string(), authorName: v.string(), affiliation: v.string(), bio: v.string(), paperTitle: v.string(), paperUrl: v.string(), datasetLabel: v.string(), datasetUrl: v.string(), attribution: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || userId !== process.env.STUDIO_ADMIN_USER_ID) throw new Error("Not authorized.");
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");
    const visual = await ctx.db.query("projectVisuals").withIndex("by_request", q => q.eq("requestId", args.requestId)).unique();
    if (!visual) throw new Error("Attach a visualization first.");
    const title = args.title.trim(), summary = args.summary.trim(), authorName = args.authorName.trim(), affiliation = args.affiliation.trim(), bio = args.bio.trim(), paperTitle = args.paperTitle.trim(), paperUrl = args.paperUrl.trim(), datasetLabel = args.datasetLabel.trim(), datasetUrl = args.datasetUrl.trim(), attribution = args.attribution.trim();
    if (!title || title.length > 160 || !summary || summary.length > 2000 || !authorName || authorName.length > 160 || affiliation.length > 200 || bio.length > 3000 || !paperTitle || paperTitle.length > 300 || paperUrl.length > 1000 || datasetLabel.length > 300 || datasetUrl.length > 1000 || attribution.length > 2000 || !httpsUrl(paperUrl, true) || !httpsUrl(datasetUrl, false) || Boolean(datasetLabel) !== Boolean(datasetUrl)) throw new Error("Check the public-page details and HTTPS links.");
    const publicVisual = visual.component === "scatter" ? { component: visual.component, title: visual.title, xLabel: visual.xLabel, yLabel: visual.yLabel, points: visual.points } : { component: visual.component, title: visual.title };
    const draft = { title, summary, authorName, affiliation, bio, paperTitle, paperUrl, datasetLabel, datasetUrl, attribution, visual: publicVisual };
    const existing = await ctx.db.query("publications").withIndex("by_request", q => q.eq("requestId", args.requestId)).unique();
    if (existing && JSON.stringify(existing.draft) === JSON.stringify(draft)) return;
    if (existing) await ctx.db.patch(existing._id, { draft, revision: existing.revision + 1 });
    else await ctx.db.insert("publications", { requestId: args.requestId, draft, revision: 1, published: false });
    await ctx.db.patch(args.requestId, { updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});

export const review = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    const userId = await getAuthUserId(ctx);
    const request = await ctx.db.get(requestId);
    if (!userId || !request || (request.owner !== userId && userId !== process.env.STUDIO_ADMIN_USER_ID)) return null;
    const publication = await ctx.db.query("publications").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    if (!publication) return null;
    return { id: publication._id, draft: publication.draft, revision: publication.revision, published: publication.published, approvedRevision: publication.approvedRevision, canApprove: request.owner === userId };
  },
});

export const approve = mutation({
  args: { requestId: v.id("requests"), revision: v.number(), confirm: v.boolean() },
  handler: async (ctx, { requestId, revision, confirm }) => {
    const userId = await getAuthUserId(ctx);
    const request = await ctx.db.get(requestId);
    if (!userId || !request || request.owner !== userId) throw new Error("Not authorized.");
    const publication = await ctx.db.query("publications").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    if (!publication || publication.revision !== revision || !confirm) throw new Error("Review the latest version and confirm before publishing.");
    if (publication.published && publication.approvedRevision === revision) return;
    await ctx.db.patch(publication._id, { snapshot: publication.draft, approvedRevision: revision, approvedAt: Date.now(), published: true });
  },
});

export const withdraw = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    const userId = await getAuthUserId(ctx);
    const request = await ctx.db.get(requestId);
    if (!userId || !request || request.owner !== userId) throw new Error("Not authorized.");
    const publication = await ctx.db.query("publications").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    if (publication?.published) await ctx.db.patch(publication._id, { published: false });
  },
});

export const getPublic = query({
  args: { publicationId: v.string() },
  handler: async (ctx, { publicationId }) => {
    const id = ctx.db.normalizeId("publications", publicationId);
    const publication = id && await ctx.db.get(id);
    if (!publication?.published || !publication.snapshot) return null;
    return { id: publication._id, ...publication.snapshot };
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("publications").withIndex("by_published", q => q.eq("published", true)).order("desc").take(100);
    return entries.filter(p => p.snapshot).map(p => ({ id: p._id, title: p.snapshot!.title, summary: p.snapshot!.summary, authorName: p.snapshot!.authorName, affiliation: p.snapshot!.affiliation }));
  },
});
