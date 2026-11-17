# Public request emails

Public requests are saved in Convex first. A scheduled task then queues a brief
notification to the studio and a confirmation to the researcher through the
Convex Resend component. Request details remain in Studio. Queueing is tracked
on each request; a queued status does not confirm delivery.

Configure these environment variables on each Convex deployment (not in the
browser or the Next.js environment):

- `RESEND_API_KEY`: a Resend API key.
- `INTAKE_EMAIL_FROM`: a sender on a domain verified with Resend, for example
  `SearchVizu <hello@example.com>`.
- `INTAKE_NOTIFICATION_EMAIL`: the inbox that receives request notifications.
- `INTAKE_PORTAL_URL`: the absolute URL of the Studio portal, for example
  `https://example.com/portal`.

If configuration is missing, requests are still saved and shown in Studio,
but emails are not queued. Once configured, select a request in Studio and use
**Retry emails** to queue the notification and confirmation for that request.
Requests created before email integration can be retried in the same way.

The Resend component retries temporary delivery failures. For delivery and
bounce feedback, configure the Resend webhook described in the
[component documentation](https://github.com/get-convex/resend#setting-up-a-resend-webhook).
Email sending requires a verified domain and a configured Resend account.
