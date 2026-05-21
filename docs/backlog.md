# Prowl Hub - Product Backlog

**Repo**: `Prowl-qa/prowl-hub`
**Stack**: Next.js + YAML templates + GitHub Actions CI
**License**: Apache 2.0

---

## High Priority

*No active items.*

## Medium Priority

*No active items.*

## Low Priority

{PQH-001} **HUB-002: Target URL Pattern Metadata**
   Add optional `targetUrl` pattern metadata to hunt templates so agents can discover relevant templates for a given application URL. Supports P5-007 (URL-based hunt discovery) in the CLI.

**Acceptance Criteria**:
- Templates include optional `meta.targetPattern` field (e.g., `"**/login"`, `"**/admin/**"`)
- Pattern matching uses glob syntax
- Metadata is separate from runtime hunt config

{PQH-002} **HUB-010: Server-Side Filtering (500+ hunts)**
   Move search/filter/pagination to server-side via `searchParams` when catalog exceeds 500 hunts. Server component reads `?q=&category=&page=`, filters and slices server-side. Search input becomes a GET form or debounced `router.push`.

{PQH-003} **HUB-011: Sort Options**
   Add sort controls to browse page (newest, alphabetical, most steps). Default to alphabetical.

{PQH-004} **HUB-012: Hunt Detail Page**
   Create `/browse/[category]/[name]` route showing full YAML, metadata, and related hunts from the same category.

{PQH-005} **HUB-014: Scope Beelink stats counter per-hub (currently shared with prowl-infra-hub)**
   Both `https://hub.prowlqa.dev/` and `https://infrahub.prowlqa.dev/` displayed the same `Total downloads` value (verified 2026-05-21: both showed `1`). Root cause: `app/page.tsx:fetchTotalDownloads()` calls `fetchStatsFromService()` without any project filter, and `lib/stats-client.ts` queries Beelink's stats endpoint with no project identifier — Beelink maintains a single global `totals.allTime` value rather than per-project counters. The metric has been temporarily hidden on both hubs (this commit removes the third `<article>` from the metrics section and switches the grid from `repeat(3, ...)` to `repeat(2, ...)`); the `fetchTotalDownloads` function is preserved with a `void` reference for quick re-enable. Three fix paths to consider: (a) **Beelink-side** — add a `project` field to events and support filtering on the stats endpoint; both hubs would then pass their project name. Cleanest long-term solution but requires changes outside this repo. (b) **Client-side via `category` filter** — `lib/stats-client.ts` already allows `category` to forward through. Each hub passes its own category list. Requires Beelink to support multi-value or comma-separated `category` filtering AND requires that hunts and playbooks never share category names. (c) **Separate Beelink endpoints per hub** — different `STATS_API_URL` per project. Mirrored in prowl-infra-hub backlog as PQIH-022 / INFRA-058.

## Completed

### HUB-013: Align hub browser icon with the shared Prowl site icon (completed: 2026-03-21)
**Description**: Replaced the metadata-only favicon setup in `prowl-hub` with Next App Router special files. Added `app/icon.png` and `app/apple-icon.png` from the shared mascot asset, removed the redundant `metadata.icons` block from the root layout, and verified the production build now emits `/icon.png` and `/apple-icon.png` routes.

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
