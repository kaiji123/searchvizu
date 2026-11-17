import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { publicationContent } from "./publicationTypes";

export default defineSchema({
  users: defineTable({}),
  publicRequests: defineTable({
    id: v.string(), receivedAt: v.string(), name: v.string(), email: v.string(),
    institution: v.string(), role: v.string(),
    package: v.union(v.literal("figure"), v.literal("interactive-2d"), v.literal("interactive-3d"), v.literal("unsure")),
    topic: v.string(), description: v.string(), materialsUrl: v.string(), uses: v.array(v.string()),
    deadline: v.string(),
    sharing: v.union(v.literal("public-after-approval"), v.literal("private"), v.literal("embargoed")),
    embargoUntil: v.string(),
    emailQueuedAt: v.optional(v.number()),
  }),
  requests: defineTable({
    owner: v.string(),
    name: v.string(),
    email: v.string(),
    institution: v.string(),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("figure"), v.literal("interactive-2d"), v.literal("interactive-3d"), v.literal("unsure")),
    materialsUrl: v.string(),
    status: v.union(v.literal("submitted"), v.literal("approved"), v.literal("reviewing"), v.literal("quoted"), v.literal("in_progress"), v.literal("ready_for_review"), v.literal("delivered")),
    updateVersion: v.optional(v.number()),
    readVersion: v.optional(v.number()),
  }).index("by_owner", ["owner"]),
  projectEntries: defineTable({
    requestId: v.id("requests"),
    title: v.string(),
    description: v.string(),
    previewUrl: v.string(),
    updatedAt: v.number(),
  }).index("by_request", ["requestId"]),
  projectFiles: defineTable({
    requestId: v.id("requests"),
    storageId: v.id("_storage"),
    name: v.string(),
    size: v.number(),
    kind: v.union(v.literal("input"), v.literal("deliverable")),
    uploadedAt: v.number(),
  }).index("by_request", ["requestId"]),
  projectVisuals: defineTable(v.union(v.object({
    requestId: v.id("requests"),
    component: v.literal("scatter"),
    title: v.string(),
    xLabel: v.string(),
    yLabel: v.string(),
    points: v.array(v.object({ x: v.number(), y: v.number(), label: v.string() })),
  }), v.object({
    requestId: v.id("requests"),
    component: v.literal("optimiser-loss-surface"),
    title: v.string(),
  }))).index("by_request", ["requestId"]),
  publications: defineTable({
    requestId: v.id("requests"),
    draft: publicationContent,
    revision: v.number(),
    published: v.boolean(),
    snapshot: v.optional(publicationContent),
    approvedRevision: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
  }).index("by_request", ["requestId"]).index("by_published", ["published"]),
  workSelections: defineTable({ requestId: v.id("requests"), selectedAt: v.number() }).index("by_request", ["requestId"]),
  workspaceImports: defineTable({ source: v.union(v.literal("prod"), v.literal("dev")), sourceRequestId: v.string(), devRequestId: v.id("requests"), createdAt: v.number() }).index("by_source", ["source", "sourceRequestId"]),
});
