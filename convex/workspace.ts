import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// Deployment administrators invoke these internal functions via the local CLI.
export const exportSelected = internalQuery({
  args: { requestId: v.id("requests") },
  handler: async (ctx, { requestId }) => {
    const selected = await ctx.db.query("workSelections").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    const request = await ctx.db.get(requestId);
    if (!selected || !request) throw new Error("Select this project for work in the source studio first.");
    const files = await ctx.db.query("projectFiles").withIndex("by_request", q => q.eq("requestId", requestId)).order("desc").take(100);
    return { title: request.title, description: request.description, type: request.type, files: files.map(f => ({ id: f._id, name: f.name, size: f.size, kind: f.kind })) };
  },
});

export const fileForSelected = internalQuery({
  args: { requestId: v.id("requests"), fileId: v.id("projectFiles") },
  handler: async (ctx, { requestId, fileId }) => {
    const selected = await ctx.db.query("workSelections").withIndex("by_request", q => q.eq("requestId", requestId)).unique();
    const file = await ctx.db.get(fileId);
    if (!selected || !file || file.requestId !== requestId) throw new Error("File does not belong to the selected project.");
    return { storageId: file.storageId, name: file.name, size: file.size };
  },
});

export const importCopy = internalMutation({
  args: { source: v.union(v.literal("prod"), v.literal("dev")), sourceRequestId: v.string(), title: v.string(), description: v.string(), type: v.union(v.literal("figure"), v.literal("interactive-2d"), v.literal("interactive-3d"), v.literal("unsure")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("workspaceImports").withIndex("by_source", q => q.eq("source", args.source).eq("sourceRequestId", args.sourceRequestId)).unique();
    if (existing) return { requestId: existing.devRequestId, created: false };
    const owner = process.env.STUDIO_ADMIN_USER_ID;
    if (!owner) throw new Error("Configure the development STUDIO_ADMIN_USER_ID first.");
    const id = await ctx.db.insert("requests", { owner, title: args.title, description: args.description, type: args.type, name: "Development copy", email: "", institution: "", materialsUrl: "", status: "submitted" });
    await ctx.db.insert("workspaceImports", { source: args.source, sourceRequestId: args.sourceRequestId, devRequestId: id, createdAt: Date.now() });
    return { requestId: id, created: true };
  },
});
