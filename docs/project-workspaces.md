# Project workspaces and private visualization components

This is a development pilot, not an approved environment for confidential or regulated research. Review the full system and the customer's requirements before accepting sensitive data.

For selecting a request and creating a local development copy, see [Selected projects: production to local development](development-workspaces.md).

## How projects are organized

Each signed-in request is the project record. Its stable Convex `requests` document ID links its `projectEntries`, `projectFiles` and `projectVisuals` records. A researcher and the studio administrator can open its same-domain route `/projects/<request-id>/<title-slug>`. The slug is descriptive; authorization is based on the signed-in account, not the URL. Project titles appear in URLs and should not contain sensitive information.

Project files are logically grouped through `projectFiles.requestId`; there is no operating-system folder per project. Their bytes live in Convex file storage. Git contains the code for visualizations, not private client datasets or deliverables. The current development project has one administrator configured by `STUDIO_ADMIN_USER_ID`.

## Using project files

Open the private project page and use **Project files**. The researcher can upload research material; the studio admin can upload either research material or a deliverable. Either party can download the project's files. Deliverable uploads create an in-portal unread update; research-material uploads do not currently notify the administrator. Files must be nonempty and at most 10 MiB each; the UI currently lists the most recent 100. There is no delete, replace, version history, malware scanning or retention automation yet. Files are downloaded as attachments rather than executed or previewed inline. Do not treat the system as ready for sensitive data or untrusted production uploads until those operational and security requirements are addressed.

The browser calls the Convex `/project-file` HTTP action using its short-lived authenticated access token. The action checks a live session and project membership before each upload or download. The `projectFiles.list` query returns metadata without the storage ID. Downloads do not use Convex's reusable bearer file URLs and send `Cache-Control: no-store`. Uploads enforce the limit while reading the stream and clean up a stored blob if registration fails. Uploaded content is visible to both the project's researcher and the studio, including files labeled research material. Deleting accounts, revoking access, retention and orphan recovery still need a full lifecycle design.

`NEXT_PUBLIC_CONVEX_SITE_URL` must point to the matching deployment's `.convex.site` endpoint in the frontend environment; `npx convex dev` normally writes this locally. The HTTP action accepts cross-origin browser requests with an explicit bearer token and does not rely on cookies; deployment and allowed-origin policies should be reviewed before production. Public links in project entries are independent of this file system and have their own access rules.

## Attaching a visualization

In **Portal → Studio dashboard**, select the request and use **Project visualisation**. The registered interactive option currently is the 3D optimiser loss-surface studio demonstration. Select **Attach demo** and then **Open private project** to review it. It uses a hand-built example surface, not the researcher's data; it is not a bespoke client visualization. Attaching makes it visible immediately to the researcher and replaces the current visualization. Change the request status to **Ready to explore** when appropriate; the researcher receives an in-portal update, not an email. The admin can also create one scatter plot per project by supplying a title, axis labels and 1–300 JSON points, for example:

```json
[{"x": 1.2, "y": 4.5, "label": "Observation A"}]
```

Saving shares the plot with the project owner and raises an in-portal update. The private project page has a dedicated **Visualisation** section, which shows a placeholder until the studio shares a chart. Data is validated and stored in the private `projectVisuals` record, and the authorized `projects.get` query sends it to the browser only after checking ownership or admin access. It is not a CSV importer; prepare the JSON deliberately and verify units, attribution and scientific interpretation. The default example is illustrative and should be replaced before sharing. The plot does not yet support unsharing, version history or deleting a chart through the UI.

## Building a bespoke component

The private visualization registry is `src/components/viz/private/registry.tsx`; it includes the scatter plot and lazily loads the existing `LossSurface3D.tsx` example. To deliver bespoke work built in Claude Code or another editor: add a project-specific component under `src/components/viz/private/`; add its key and validated data shape to `projectVisuals` in `convex/schema.ts`; implement a strictly admin-authorized attachment mutation in `convex/studio.ts`; return only the required data from the authorization-checked `projects.get` query; add a rendering branch in the private registry and an admin attachment control. Test, sync the Convex development functions, build and deploy the corresponding frontend, then attach the registered component to the intended request. Add references and limitations appropriate to the research. Mark it ready for review only after testing. Deploy source changes through the normal code review and release process. Project-specific *data* must be returned by an authorization-checked query, not embedded in source files, `public/`, static assets, route metadata or client bundles.

This registry is an allowlist of code written and deployed by the studio. It does not accept arbitrary uploaded JavaScript, HTML, executables or code from clients. Project code itself is bundled with the application and should not be treated as secret; only project data and file content have per-user access controls. For a new visualization type, add isolation tests with two unrelated users, logged-out access and admin access, as well as scientific and accessibility checks appropriate to that visualization. Decide how to handle embeds before exposing one: the existing public embed routes are not private.

## Verification performed

The integration smoke test `scripts/check-convex-portal.mjs` creates synthetic accounts, a request and a file in the development deployment. It exercises owner access, anonymous and unrelated-account denial, upload/download behavior, and—with an authorized administrator session—private chart rendering data and notification state. It leaves the synthetic records and file in development. This is not a browser test or security audit.
