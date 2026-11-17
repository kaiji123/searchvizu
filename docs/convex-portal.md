# Researcher portal: Convex development setup

For the end-to-end client and studio process, see [Researcher request workflow](researcher-workflow.md).
For private files, component registration and project workspace limitations, see [Project workspaces](project-workspaces.md).
For public-page drafts, researcher approval and withdrawal, see [Publication workflow](publication-workflow.md).

The initial portal is an unfinished pilot. It has username/password sign-in, owner-scoped requests, project file transfers and a studio dashboard for reviewing requests, updating their status and sharing visualisations. It does not provide account recovery, email verification, staff notifications or subscription billing. Do not use it for confidential or regulated research or represent it as production-ready until the application and deployment have been tested and reviewed.

A Convex development project has been provisioned in Europe (Ireland). The backend is synchronized, and `scripts/check-convex-portal.mjs` has verified sign-up, owner isolation, anonymous rejection and input validation against it. This check creates two synthetic accounts and one synthetic request that remain in the development database. It does not test the browser UI or constitute a security audit.

The public site and existing request form work without Convex. The portal shows a setup message until `NEXT_PUBLIC_CONVEX_URL` is configured. The existing form retains its independent webhook/local storage path and does not add entries to the Convex portal.

## Connect a development deployment

1. Sign in to Convex and create or select an appropriate development project using the Convex CLI: `npx convex dev`. Review the CLI prompts before creating a project or uploading source. This synchronizes the `convex/` backend and writes local environment settings.
2. Confirm `.env.local` contains `NEXT_PUBLIC_CONVEX_URL`, then restart `npm run dev`. Do not commit deployment keys or `.env.local`.
3. Open `/portal`, register two separate test accounts and submit synthetic requests. Confirm each account sees only its own request, and an unauthenticated request to the backend fails. Check validation by invoking the mutation directly with invalid inputs.
4. Run `npx convex dev` while developing to synchronize backend changes and regenerate types. Run TypeScript and a production build before release.

The studio administrator is selected server-side by the Convex deployment's `STUDIO_ADMIN_USER_ID` environment variable, which must contain the Convex Auth **user ID**, not a session ID or an unverified contact email. Only that signed-in account can list all requests or change statuses. Sign in at `/portal` and select **Studio dashboard** to review requests. This is a single-admin pilot; configure and test each deployment separately. Status changes do not send emails.

Select a request to create or update its project entry. Saving immediately shares its text and optional HTTPS link with that request's owner in the portal and on a same-domain `/projects/<request-id>/<title-slug>` page. The server-side Convex query checks the stable account ID and returns data only to the owner or studio administrator. The path is not secret; titles appear in URLs. External preview links have independent access controls and must be secured at their host. There is one editable entry per request; this pilot does not yet support unsharing or multiple entries.

Changing a request's status or saving changed project-entry content increments an update version. The researcher sees a new-update badge in their portal and can mark the version they saw as read; an update made in the meantime stays unread. Unchanged saves do not create another notification. Pre-existing updates from before this feature are not backfilled. No email is sent. Email notifications require verified recipient addresses, a configured sender and delivery/retry handling before implementation.

Requests are owned by the stable Convex Auth user ID, resolved with `getAuthUserId`; don't use a token's session identifier as the owner. The original pilot's three requests were migrated from their session identifiers on the development deployment. An internal migration remains available for investigation of old data, but only resolves currently active sessions and only scans the first 1,000 records; it is not a general-purpose migration.

The initial sign-in uses Convex Auth v2's username/password component and its client-side provider. Users cannot recover a forgotten password via this method in the current implementation. Before real customer use, implement a verified-email sign-in and recovery flow (or another appropriate identity provider), session handling suitable for the deployment, abuse controls, a privacy policy and a reviewed data-retention process. The provided contact email is not verified as account ownership.

## Before accepting client data

Strengthen file handling with type validation, malware scanning, deletion and lifecycle cleanup; implement explicit consent for publication and a complete review workflow. Do not return Convex storage bearer URLs as though they were private. Add email notifications and a suitable multi-staff access model. Test account isolation with two accounts and direct API calls, and run an independent security review appropriate to the data and institutional requirements.
