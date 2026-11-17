import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

// Return no project data until the session and request ownership are verified.
export const get = query({
  args: { requestId: v.string() },
  handler: async (ctx, { requestId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const id = ctx.db.normalizeId("requests", requestId);
    if (!id) return null;
    const request = await ctx.db.get(id);
    if (!request) return null;
    if (request.owner !== userId && userId !== process.env.STUDIO_ADMIN_USER_ID) return null;
    const entry = await ctx.db.query("projectEntries").withIndex("by_request", (q) => q.eq("requestId", id)).unique();
    const visual = await ctx.db.query("projectVisuals").withIndex("by_request", (q) => q.eq("requestId", id)).unique();
    return { title: request.title, status: request.status, entry: entry ? { title: entry.title, description: entry.description, previewUrl: entry.previewUrl, updatedAt: entry.updatedAt } : null, visual: visual ? visual.component === "scatter" ? { component: visual.component, title: visual.title, xLabel: visual.xLabel, yLabel: visual.yLabel, points: visual.points } : { component: visual.component, title: visual.title } : null };
  },
});
