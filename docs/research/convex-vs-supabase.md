# Convex vs Supabase for SearchVizu

Research snapshot: 15 November 2026. Prices are in US dollars and can change. This is a desk study of published product information, not an independent performance benchmark or legal assessment.

See also [the validation of the Reddit discussion](./reddit-backend-claims.md), including Neon, schema drift and the security of the suggested server client.

## Decision in brief

**Provisional recommendation: Supabase** for the initial researcher portal, because its PostgreSQL model suits projects, memberships, requests and approvals; it combines authentication and storage; and its standard database offers a clearer migration path. Convex remains a credible choice, particularly if fast TypeScript development and live collaboration become central. The evidence does not establish a general performance or security winner.

The existing application is Next.js. Requests currently go to a webhook or a local JSONL file; researchers cannot sign in or upload files. The form's unlisted-link description is not access control. Neither vendor choice fixes that until authorization is implemented and tested.

## Published numerical comparison

Plan quotas describe different resources and scopes; they are not direct capacity or throughput benchmarks. Convex limits are generally per team; Supabase details vary by resource and organization/project. Verify current plan terms, region and account configuration before purchase.

| Measure | Convex | Supabase |
| --- | --- | --- |
| Entry-level paid pricing | Starter: $0/month plus usage; Professional: $25 per developer/month | Pro: from $25/month, first project included |
| Free database storage | 0.5 GB | 500 MB |
| Free file storage | 1 GB | 1 GB |
| Free data transfer | 1 GB/month file egress | 5 GB/month egress plus 5 GB/month cached egress |
| Paid database allowance | Professional: 50 GB | Pro: 8 GB disk per project |
| Paid file storage | Professional: 100 GB | Pro: 100 GB |
| Paid transfer allowance | Professional: 50 GB/month file egress | Pro: 250 GB/month egress and 250 GB/month cached egress |
| Paid overage: file storage | Professional: $0.03/GB/month | Pro: $0.0213/GB/month |
| Paid overage: file transfer | Professional: $0.12/GB | Pro: $0.09/GB uncached, $0.03/GB cached |
| Function/API usage | Free: 1 million Convex function calls/month; Professional: 25 million included | Pricing page lists unlimited API requests, but underlying compute, egress and other resource limits still apply |
| Automatic daily database backups | Professional; available for 7 days | Pro; available for 7 days |

Sources: [Convex plans](https://www.convex.dev/pricing), [Convex limits](https://docs.convex.dev/production/state/limits), [Convex backups](https://docs.convex.dev/database/backup-restore), [Supabase pricing](https://supabase.com/pricing), [Supabase egress](https://supabase.com/docs/guides/platform/manage-your-usage/egress). Convex's published limits state that prices are for US regions unless otherwise noted and that other regions are 1.3×; these figures should not be used as UK-region quotes. The services measure transfer differently: Convex file egress also includes file access in functions and backup operations; Supabase's unified egress covers multiple services. Convex's file allowance includes backups.

Supabase states that Free projects pause after one week of inactivity. Convex Free has hard caps: writes can fail after relevant limits are reached; Starter allows usage-based overages. Both need monitoring before use for paid clients.

## Illustrative monthly cost scenarios

These are arithmetic examples, **not quotes or measured usage**. Assume one developer, one project, US-region published prices, one month, and all other usage within included allowances. For simplicity, assume Supabase egress is uncached and all Convex egress is file egress. These examples omit tax, frontend hosting, email, backups, database overages, extra compute and provider-specific charges. Backup usage can change the file totals. No private-data suitability is implied.

| Scenario | Convex Professional | Supabase Pro |
| --- | ---: | ---: |
| Small: 10 GB stored, 10 GB transferred | $25 | $25 |
| Larger: 200 GB stored, 300 GB transferred | $58 | $31.63 |

Larger example: Convex $25 + (100 × $0.03) + (250 × $0.12) = $58. Supabase $25 + (100 × $0.0213) + (50 × $0.09) = $31.63. This comparison illustrates sensitivity to allowances; it does not imply those totals apply to a real deployment. Convex Starter may be cheaper at modest usage, but has different performance and backup provisions. The Professional per-developer charge makes team size relevant; Supabase's pricing model differs.

## Evidence on adoption, reliability and speed

- **Developer interest:** GitHub displayed approximately [115.1k stars for Supabase](https://github.com/supabase/supabase) and [12.8k for the Convex backend](https://github.com/convex/convex-backend) at the time of research, about 9:1. Stars are a rough interest signal, not active customers, reliability, security or quality; the repositories differ in age and scope.
- **Reliability:** A status page snapshot or an SLA is not an independent uptime measurement. Both vendors publish status information ([Convex](https://status.convex.dev/), [Supabase](https://status.supabase.com/)). No comparable normalized incident analysis was conducted, so no uptime ranking is justified.
- **Performance:** No controlled, independent, representative head-to-head benchmark for this application was established in this review. Published concurrency limits, API quotas and repository popularity cannot determine p95 latency or throughput. A vendor's benchmark of its own product against competitors should not be treated as independent evidence.
- **Development speed:** No measurements for this team exist. Convex's TypeScript functions and reactive queries may reduce work for live dashboards; SQL, joins and policies may be a better fit for relational workflows. This is an architectural judgment, not a measured result.

## Security and data handling

Both require carefully designed access control. Test that a researcher cannot read, update or download another researcher's project, including through APIs and embed routes. Store explicit membership and publication approval; default work and files to private. An unlisted URL alone is not privacy.

Supabase Storage supports access policies using [Postgres row-level security](https://supabase.com/docs/guides/storage/security/access-control) and time-limited signed URLs. Signed URLs are bearer links until expiry and can be shared. Convex's ordinary generated file URLs are also bearer URLs; its docs describe [authenticated delivery and external storage options](https://docs.convex.dev/file-storage/serve-files) when that is insufficient. Authorization, file lifecycle and backups are the application's responsibility on both platforms.

For unpublished, sensitive or personal research data, evaluate the customer's contract, location, access, retention and institutional requirements before accepting it. Vendor compliance statements do not by themselves establish that this application or a project is compliant.

## How to turn this into a real statistical comparison

Implement functionally equivalent prototypes with the same region, data, authorization rules, file sizes and representative paid tiers. Record the exact infrastructure configuration and costs. For each provider, run repeated interleaved trials at multiple load levels and times of day; capture raw results and errors. Use synthetic data only.

1. **User operations:** sign in, create a request, list a user's projects, load a private project, upload and download a representative file. Include an unauthorized cross-user request and confirm it fails.
2. **Metrics:** median and p95/p99 end-to-end latency, error rate, upload/download completion and throughput, and full billable usage. Keep sample sizes and concurrency explicit.
3. **Analysis:** report distributions and uncertainty intervals from repeated runs, not a single best run. Compare matched workloads, not different endpoints or plan capacities. Separate cold starts from warm requests.
4. **Operational tests:** restore a backup, revoke a user's access, verify expiry of shared links and export project data and files. Measure engineering time as well as hosting cost.

The current recommendation should be revisited if prototypes, customer security requirements, live-collaboration needs or measured costs favor the other choice.
