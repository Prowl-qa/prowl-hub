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

## Completed

### HUB-013: Align hub browser icon with the shared Prowl site icon (completed: 2026-03-21)
**Description**: Replaced the metadata-only favicon setup in `prowl-hub` with Next App Router special files. Added `app/icon.png` and `app/apple-icon.png` from the shared mascot asset, removed the redundant `metadata.icons` block from the root layout, and verified the production build now emits `/icon.png` and `/apple-icon.png` routes.

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
