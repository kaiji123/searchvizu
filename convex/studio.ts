import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";

async function isStudioAdmin(ctx: QueryCtx | MutationCtx) {
  const id = await getAuthUserId(ctx);
  const configured = process.env.STUDIO_ADMIN_USER_ID;
  return Boolean(id && configured && id === configured);
}

export const isAdmin = query({ args: {}, handler: isStudioAdmin });

export const listPublicRequests = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    return await ctx.db.query("publicRequests").order("desc").paginate(paginationOpts);
  },
});

export const submitPublicRequest = mutation({
  args: {
    secret: v.string(), id: v.string(), receivedAt: v.string(), name: v.string(), email: v.string(),
    institution: v.string(), role: v.string(),
    package: v.union(v.literal("figure"), v.literal("interactive-2d"), v.literal("interactive-3d"), v.literal("unsure")),
    topic: v.string(), description: v.string(), materialsUrl: v.string(), uses: v.array(v.string()),
    deadline: v.string(), sharing: v.union(v.literal("public-after-approval"), v.literal("private"), v.literal("embargoed")), embargoUntil: v.string(),
  },
  handler: async (ctx, { secret, ...request }) => {
    if (!process.env.INTAKE_SECRET || secret !== process.env.INTAKE_SECRET) throw new Error("Not authorized.");
    const requestId = await ctx.db.insert("publicRequests", request);
    await ctx.scheduler.runAfter(0, internal.intakeEmails.queue, { requestId });
    return requestId;
  },
});

export const retryPublicRequestEmail = mutation({
  args: { requestId: v.id("publicRequests") },
  handler: async (ctx, { requestId }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found.");
    if (!request.emailQueuedAt) await ctx.scheduler.runAfter(0, internal.intakeEmails.queue, { requestId });
  },
});

export const workSelection = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    return Boolean(await ctx.db.query("workSelections").withIndex("by_request", q => q.eq("requestId", requestId)).unique());
  },
});

export const selectForWork = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    if (!await ctx.db.get(requestId)) throw new Error("Request not found.");
    const selected = await ctx.db.query("workSelections").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    if (!selected) await ctx.db.insert("workSelections", { requestId, selectedAt: Date.now() });
  },
});

export const unselectForWork = mutation({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    const selected = await ctx.db.query("workSelections").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    if (selected) await ctx.db.delete(selected._id);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    return await ctx.db.query("requests").order("desc").paginate(paginationOpts);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("requests"),
    status: v.union(v.literal("submitted"), v.literal("in_progress"), v.literal("ready_for_review"), v.literal("delivered")),
  },
  handler: async (ctx, { id, status }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    const request = await ctx.db.get(id);
    if (!request) throw new Error("Request not found.");
    if (request.status === status) return;
    await ctx.db.patch(id, { status, updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});

export const getEntry = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    return await ctx.db.query("projectEntries").withIndex("by_request", (q) => q.eq("requestId", requestId)).unique();
  },
});

export const saveEntry = mutation({
  args: { requestId: v.id("requests"), title: v.string(), description: v.string(), previewUrl: v.string() },
  handler: async (ctx, args) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");
    const title = args.title.trim(), description = args.description.trim(), previewUrl = args.previewUrl.trim();
    if (!title || title.length > 200 || !description || description.length > 5000 || previewUrl.length > 1000) throw new Error("Check the entry details.");
    if (previewUrl) {
      try { const url = new URL(previewUrl); if (url.protocol !== "https:") throw new Error(); }
      catch { throw new Error("Preview links must begin with https://."); }
    }
    const existing = await ctx.db.query("projectEntries").withIndex("by_request", (q) => q.eq("requestId", args.requestId)).unique();
    if (existing && existing.title === title && existing.description === description && existing.previewUrl === previewUrl) return;
    const data = { title, description, previewUrl, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, data);
    else await ctx.db.insert("projectEntries", { requestId: args.requestId, ...data });
    await ctx.db.patch(args.requestId, { updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});

export const getVisual = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    return await ctx.db.query("projectVisuals").withIndex("by_request", (q) => q.eq("requestId", requestId)).unique();
  },
});

export const saveVisual = mutation({
  args: { requestId: v.id("requests"), title: v.string(), xLabel: v.string(), yLabel: v.string(), points: v.array(v.object({ x: v.number(), y: v.number(), label: v.string() })) },
  handler: async (ctx, args) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found.");
    const title = args.title.trim(), xLabel = args.xLabel.trim(), yLabel = args.yLabel.trim();
    if (!title || title.length > 120 || !xLabel || xLabel.length > 80 || !yLabel || yLabel.length > 80 || args.points.length < 1 || args.points.length > 300 || args.points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || Math.abs(p.x) > 1e12 || Math.abs(p.y) > 1e12 || p.label.length > 120)) throw new Error("Invalid chart data.");
    const existing = await ctx.db.query("projectVisuals").withIndex("by_request", q => q.eq("requestId", args.requestId)).unique();
    const data = { component: "scatter" as const, title, xLabel, yLabel, points: args.points };
    if (existing) await ctx.db.replace(existing._id, { requestId: args.requestId, ...data });
    else await ctx.db.insert("projectVisuals", { requestId: args.requestId, ...data });
    await ctx.db.patch(args.requestId, { updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});

// Registered components are application code, never client-provided scripts.
export const attachInteractiveVisual = mutation({
  args: { requestId: v.id("requests"), component: v.literal("optimiser-loss-surface") },
  handler: async (ctx, { requestId, component }) => {
    if (!await isStudioAdmin(ctx)) throw new Error("Not authorized.");
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found.");
    const existing = await ctx.db.query("projectVisuals").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    if (existing?.component === component) return;
    const data = { requestId, component, title: "Optimisers on a 3D loss surface" };
    if (existing) await ctx.db.replace(existing._id, data);
    else await ctx.db.insert("projectVisuals", data);
    await ctx.db.patch(requestId, { updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});
