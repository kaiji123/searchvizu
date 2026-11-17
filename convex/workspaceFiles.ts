"use node";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Called only by the deployment-admin CLI after the operator selects a file.
export const readSelected = internalAction({
  args: { requestId: v.id("requests"), fileId: v.id("projectFiles") },
  handler: async (ctx, args): Promise<{ data: string }> => {
    const file = await ctx.runQuery(internal.workspace.fileForSelected, args);
    if (file.size > 10 * 1024 * 1024) throw new Error("File exceeds local transfer limit.");
    const blob = await ctx.storage.get(file.storageId);
    if (!blob) throw new Error("File not found.");
    return { data: Buffer.from(await blob.arrayBuffer()).toString("base64") };
  },
});
