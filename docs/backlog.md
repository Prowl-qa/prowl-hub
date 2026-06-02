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

## Completed

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
