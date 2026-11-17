import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const resend = new Resend(components.resend, { testMode: false });

export const queue = internalMutation({
  args: { requestId: v.id("publicRequests") },
  handler: async (ctx, { requestId }) => {
    const request = await ctx.db.get(requestId);
    if (!request || request.emailQueuedAt) return;
    const from = process.env.INTAKE_EMAIL_FROM;
    const to = process.env.INTAKE_NOTIFICATION_EMAIL;
    const portalUrl = process.env.INTAKE_PORTAL_URL;
    if (!process.env.RESEND_API_KEY || !from || !to || !portalUrl) {
      console.warn("Intake emails not configured; request remains available in Studio.");
      return;
    }
    await resend.sendEmail(ctx, {
      from, to,
      subject: "New SearchVizu visualisation request",
      text: `A new visualisation request has arrived.\n\nOpen Studio to review it: ${portalUrl}\n`,
      idempotencyKey: `intake-notification:${requestId}`,
    });
    await resend.sendEmail(ctx, {
      from, to: request.email,
      subject: "We received your SearchVizu request",
      text: `Hello ${request.name},\n\nThank you for your visualisation request. We have received it and will be in touch.\n\nSearchVizu`,
      idempotencyKey: `intake-confirmation:${requestId}`,
    });
    await ctx.db.patch(requestId, { emailQueuedAt: Date.now() });
  },
});
