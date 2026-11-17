import { internalMutation, mutation, query } from "./_generated/server";
import { components } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in.");
    return await ctx.db.query("requests").withIndex("by_owner", (q) => q.eq("owner", userId)).order("desc").take(100);
  },
});

export const myEntry = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in.");
    const request = await ctx.db.get(requestId);
    if (!request || request.owner !== userId) throw new Error("Not authorized.");
    return await ctx.db.query("projectEntries").withIndex("by_request", (q) => q.eq("requestId", requestId)).unique();
  },
});

export const markRead = mutation({
  args: { requestId: v.id("requests"), observedVersion: v.number() },
  handler: async (ctx, { requestId, observedVersion }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in.");
    const request = await ctx.db.get(requestId);
    if (!request || request.owner !== userId) throw new Error("Not authorized.");
    const latest = request.updateVersion ?? 0;
    if (!Number.isSafeInteger(observedVersion) || observedVersion < 0 || observedVersion > latest) throw new Error("Invalid update version.");
    const readVersion = Math.max(request.readVersion ?? 0, observedVersion);
    if (readVersion !== (request.readVersion ?? 0)) await ctx.db.patch(requestId, { readVersion });
  },
});

export const create = mutation({
  args: {
    name: v.string(), email: v.string(), institution: v.string(), title: v.string(), description: v.string(),
    type: v.union(v.literal("figure"), v.literal("interactive-2d"), v.literal("interactive-3d"), v.literal("unsure")),
    materialsUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Please sign in.");
    const name = args.name.trim(), email = args.email.trim(), institution = args.institution.trim();
    const title = args.title.trim(), description = args.description.trim(), materialsUrl = args.materialsUrl.trim();
    if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || institution.length > 200 || !title || title.length > 200 || description.length < 30 || description.length > 5000 || materialsUrl.length > 1000) throw new Error("Please check the request details.");
    if (materialsUrl) {
      try { const url = new URL(materialsUrl); if (url.protocol !== "https:") throw new Error(); }
      catch { throw new Error("Materials links must begin with https://."); }
    }
    return await ctx.db.insert("requests", { owner: userId, name, email, institution, title, description, type: args.type, materialsUrl, status: "submitted" });
  },
});

// One-time migration for the original pilot's session-based ownership.
// Unresolvable sessions are left untouched for manual recovery.
export const migrateSessionOwners = internalMutation({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db.query("requests").take(1000);
    let migrated = 0, unresolved = 0;
    for (const request of requests) {
      if (!request.owner.includes("|")) continue;
      const sessionId = request.owner.slice(request.owner.lastIndexOf("|") + 1);
      const session = await ctx.runQuery(components.auth.public.getSession, { sessionId });
      if (!session) { unresolved++; continue; }
      await ctx.db.patch(request._id, { owner: session.userId });
      migrated++;
    }
    return { migrated, unresolved, scanned: requests.length };
  },
});

// Internal functions can only be invoked by trusted backend code or an
// authenticated deployment administrator, never by a portal visitor.
export const approve = internalMutation({
  args: { id: v.id("requests") },
  handler: async (ctx, { id }) => {
    const request = await ctx.db.get(id);
    if (!request) throw new Error("Request not found.");
    if (request.status === "approved") return;
    await ctx.db.patch(id, { status: "approved", updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});
