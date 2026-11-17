import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();
const maxBytes = 10 * 1024 * 1024;
const cors = { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const response = (message: string, status: number) => new Response(message, { status, headers: cors });

http.route({ path: "/project-file", method: "OPTIONS", handler: httpAction(async () => new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Max-Age": "600" } })) });

http.route({ path: "/project-file", method: "POST", handler: httpAction(async (ctx, request) => {
  let userId;
  try { const identity = await ctx.auth.getUserIdentity(); userId = identity && (await ctx.runQuery(components.auth.public.getSession, { sessionId: identity.subject }))?.userId; } catch { return response("Unauthorized", 401); }
  if (!userId) return response("Unauthorized", 401);
  const url = new URL(request.url);
  const requestId = url.searchParams.get("requestId") ?? "";
  const kind = url.searchParams.get("kind");
  const name = (url.searchParams.get("name") ?? "").replace(/[\x00-\x1f\x7f/\\]/g, "_").trim();
  if ((kind !== "input" && kind !== "deliverable") || !name || name.length > 180) return response("Invalid file details", 400);
  if (!await ctx.runQuery(internal.projectFiles.canUpload, { requestId, kind, userId })) return response("Not found", 404);
  const length = Number(request.headers.get("content-length"));
  if (length > maxBytes) return response("File exceeds 10 MiB", 413);
  if (!request.body) return response("Empty file", 400);
  const reader = request.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); return response("File exceeds 10 MiB", 413); }
    chunks.push(new Uint8Array(value).buffer);
  }
  if (!size) return response("Empty file", 400);
  const blob = new Blob(chunks, { type: "application/octet-stream" });
  const storageId = await ctx.storage.store(blob);
  try {
    await ctx.runMutation(internal.projectFiles.register, { requestId: requestId as Id<"requests">, userId, storageId, name, size, kind });
  } catch {
    await ctx.storage.delete(storageId);
    return response("Could not save file", 400);
  }
  return response("Uploaded", 201);
}) });

http.route({ path: "/project-file", method: "GET", handler: httpAction(async (ctx, request) => {
  let userId;
  try { const identity = await ctx.auth.getUserIdentity(); userId = identity && (await ctx.runQuery(components.auth.public.getSession, { sessionId: identity.subject }))?.userId; } catch { return response("Unauthorized", 401); }
  if (!userId) return response("Unauthorized", 401);
  const fileId = new URL(request.url).searchParams.get("fileId") ?? "";
  const file = await ctx.runQuery(internal.projectFiles.resolve, { fileId, userId });
  if (!file) return response("Not found", 404);
  const blob = await ctx.storage.get(file.storageId);
  if (!blob) return response("Not found", 404);
  return new Response(blob, { headers: { ...cors, "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}` } });
}) });

export default http;
