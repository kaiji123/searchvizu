# Researcher-approved public pages

This is a development pilot. It is not yet a production publishing system or a substitute for reviewing rights, consent, security and institutional requirements.

## Workflow

1. The studio attaches a visualization to the request and verifies the visualization, paper, data, attribution and reuse rights. Do not submit confidential project content for publication.
2. In **Portal → Studio dashboard**, open the request and fill in **Public research page**: title, summary, researcher name, optional affiliation and biography, paper title and HTTPS link, optional dataset label and HTTPS link, and attribution/reuse notes. A visualization must already be attached. Saving creates a private draft and copies the current visual's data into it; it does not publish.
3. The request owner opens their private project and expands **Preview the proposed public page**. The preview shows the content and visualization proposed for publication. The owner must confirm and approve that draft version. Administrators cannot approve on someone else's behalf. The owner is responsible for reviewing the content and permissions; a checkbox is not proof that underlying rights have been secured.
4. The approved snapshot becomes available at `/research/<publication-id>/<title-slug>` and appears under **Researcher stories** on `/work` and in the sitemap. The page includes only the approved public content and visualization. Private files, contact email, request brief, external preview link and project notes are not included automatically. No email is sent.
5. If the studio changes a draft, the previously approved version stays live until the researcher approves the new revision. A stale approval is rejected. The owner can withdraw the public page from the project page; the public query and gallery then stop returning it. Republishing requires another approval.

## Important boundaries

- Only the request owner and studio admin can see the draft. Publication approval and withdrawal require the owner's authenticated account. The public page and gallery expose only the last approved snapshot.
- The snapshot freezes public text, source links, selected visualization key and its data. The component's application code is deployed separately and is **not version-pinned**: a future code deployment could change how an approved visual renders. Treat published component implementations as immutable or introduce true version pinning before relying on this workflow for production research.
- Withdrawing stops the application from returning the story, but copies, downloads and search-engine caches cannot be recalled by the application. Cached results may persist outside the site.
- The project may contain third-party data or materials. Dataset and paper URLs provide attribution; they do not automatically grant reuse rights. Verify licensing and permissions independently.
- Public pages are server-rendered and have title, description and canonical metadata. The current gallery and sitemap return at most 100 published stories. Rich previews, dedicated researcher profile pages, public embeds, multi-author attribution, approval history, email notices, admin notifications and audit logging are not yet implemented. Confirm the production site URL is configured before publishing so canonical and sitemap links are correct.
- The existing 3D optimizer visualization is a synthetic studio demo, not a client-specific analysis. Do not imply otherwise when preparing a public page.
- Publication is currently immediate when the researcher approves; there is no scheduled publication or separate studio final-approval step.

The integration test creates a synthetic public story briefly on the development deployment, checks the draft and approval boundary, and withdraws it. It does not constitute a security or legal audit.
