import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

const kindValidator = v.union(v.literal("input"), v.literal("deliverable"));

export const list = query({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    const userId = await getAuthUserId(ctx);
    const request = await ctx.db.get(requestId);
    if (!userId || !request || (request.owner !== userId && userId !== process.env.STUDIO_ADMIN_USER_ID)) throw new Error("Not authorized.");
    const files = await ctx.db.query("projectFiles").withIndex("by_request", (q) => q.eq("requestId", requestId)).order("desc").take(100);
    return files.map(({ _id, name, size, kind, uploadedAt }) => ({ _id, name, size, kind, uploadedAt }));
  },
});

// Only HTTP actions can call these internal functions; userId comes from a verified session.
export const canUpload = internalQuery({
  args: { requestId: v.string(), userId: v.string(), kind: kindValidator },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("requests", args.requestId);
    const request = id && await ctx.db.get(id);
    if (!request) return false;
    const admin = args.userId === process.env.STUDIO_ADMIN_USER_ID;
    return args.kind === "deliverable" ? admin : admin || request.owner === args.userId;
  },
});

export const register = internalMutation({
  args: { requestId: v.id("requests"), userId: v.string(), storageId: v.id("_storage"), name: v.string(), size: v.number(), kind: kindValidator },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    const admin = args.userId === process.env.STUDIO_ADMIN_USER_ID;
    if (!request || (args.kind === "deliverable" ? !admin : !admin && request.owner !== args.userId)) throw new Error("Not authorized.");
    await ctx.db.insert("projectFiles", { requestId: args.requestId, storageId: args.storageId, name: args.name, size: args.size, kind: args.kind, uploadedAt: Date.now() });
    if (args.kind === "deliverable") await ctx.db.patch(args.requestId, { updateVersion: (request.updateVersion ?? 0) + 1 });
  },
});

export const resolve = internalQuery({
  args: { fileId: v.string(), userId: v.string() },
  handler: async (ctx, { fileId, userId }) => {
    const id = ctx.db.normalizeId("projectFiles", fileId);
    const file = id && await ctx.db.get(id);
    if (!file) return null;
    const request = await ctx.db.get(file.requestId);
    if (!request || (request.owner !== userId && userId !== process.env.STUDIO_ADMIN_USER_ID)) return null;
    return { storageId: file.storageId, name: file.name };
  },
});
