# SearchVizu: research visualisation studio

Portfolio site, hosted visualisation pages, embeds and an intake form for a
bespoke scientific-visualisation service.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind 4 and
React Three Fiber.

```bash
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Landing page: examples, domains, process, pricing |
| `/work` | Portfolio of **public** visualisations |
| `/viz/[slug]` | Full hosted page: visual, explanation, limitations, references, attribution, share/embed |
| `/embed/[slug]/v[n]` | Chrome-less, versioned page for `<iframe>` embedding (the only route other sites may frame) |
| `/request` | Intake form (`?package=figure\|interactive-2d\|interactive-3d` preselects a package) |
| `/sitemap.xml`, `/robots.txt` | Public pages only; embeds are disallowed |

## Adding a visualisation (e.g. a client project)

1. Build the component in `src/components/viz/` as a default-exported client component.
2. Register it in `src/components/viz/registry.tsx` (it is code-split and browser-only).
3. Add an entry to `src/content/visualisations.ts` with text, limitations, references and **visibility**:
   - `public`: in the portfolio and sitemap
   - `unlisted`: direct link only, `noindex` (client review, private work)
   - `draft`: not served

   Bump `version` when a change could break an existing embed.

## Intake submissions

`src/lib/intake.ts` stores requests:

- If `INTAKE_WEBHOOK_URL` is set, each request is POSTed there as JSON (Zapier, Make, n8n, Slack or your own API). **Use this on Vercel**, where the disk is read-only.
- Otherwise they're appended to `.data/requests.jsonl` (gitignored).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute base URL for metadata, sitemap and embed snippets (defaults to `http://localhost:3000`) |
| `INTAKE_WEBHOOK_URL` | Where intake form submissions are sent |

## Next steps (deliberately not built yet)

- Real access control for confidential client pages (auth + `"use cache: private"` or a gated route), beyond unlisted links.
- A database and admin view for requests and projects, once there's demand.
- Self-service upload/generation, only if pilots show researchers want it.
