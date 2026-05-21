# Prowl Hub - Resolved Items

## ~~Add `.gitignore` file~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Added `.gitignore` with standard entries for `.DS_Store`, `node_modules`, `.next`, editor configs, and OS-generated files.

## ~~CI URL allowlist wildcard is broken~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Replaced shell `case` glob with function-based domain matching using bash `[[ =~ ]]` regex for proper subdomain support.

## ~~Add formal Prowl hunt schema validation to CI~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Added Python-based schema validation step that checks for required `name`, `description`, `steps` fields and validates step action keys.

## ~~Credential pattern scan should fail the build, not just warn~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Changed `::warning` to `::error` and added `exit 1` to block PRs with suspicious credential variable patterns.

## ~~Add CONTRIBUTING.md with detailed submission guidelines~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Created `CONTRIBUTING.md` with hunt template schema, valid step types, tags taxonomy, selector conventions, PR workflow, CI checks summary, and security rules.

## ~~URL scan should also flag non-allowlisted domains as errors~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Changed URL scan from `::warning` to `::error` with `exit 1` to block PRs containing non-allowlisted domain URLs without maintainer override.

## ~~Add a PR template for community submissions~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Created `.github/PULL_REQUEST_TEMPLATE.md` with category/pattern fields and contributor checklist (valid YAML, filename match, correct directory, generic selectors, no credentials, allowlisted URLs, comments, tags).

## ~~HUB-001: Tags in Hunt Templates~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Added `tags` field to all 5 existing hunt templates. CI schema validator now requires non-empty `tags` list. `lib/hunts.ts` extracts tags into `HuntRecord`. Hub UI displays tag pills on cards and includes tags in search. Tags documented in `CONTRIBUTING.md` with taxonomy guide.

## ~~HUB-005: Add "Using Templates Programmatically" link to README~~
**Resolved**: 2026-02-16 (branch: high-priority)
**Description**: Added "Using Templates Programmatically" section to README linking to the Agent Integration docs at docs.prowlqa.dev/agents with mention of CLI and library API.

## ~~HUB-006: Scalable Catalog UI — Two-Page Architecture~~
**Resolved**: 2026-02-17 (commit 175def1, branch: browse-page)
**Description**: Split the single-page hub into a curated homepage with 6 featured hunts and a dedicated `/browse` library page. Shared header/footer extracted to root layout. Browse page includes search, category chips, URL-based pagination (12 cards/page, `?page=N`), and accessible pagination controls. Homepage shows hero, metrics, featured cards with "Browse all N hunts" CTA, submit form, and quality section.

## ~~HUB-007: Extract Reusable Hunt Card Component~~
**Resolved**: 2026-02-17 (commit 175def1, branch: browse-page)
**Description**: Extracted card rendering into `components/hunt-card.tsx` shared by homepage featured section and browse page grid. Props: `hunt: HuntSummary`, `showTags?: boolean`, `onPreview?: () => void`.

## ~~HUB-008: Featured Hunts Curation~~
**Resolved**: 2026-02-17 (commit 175def1, branch: browse-page)
**Description**: Created `lib/featured.ts` with `FEATURED_HUNT_IDS` array — 6 manually curated hunts, one per major category (auth, e-commerce, admin, saas, forms, smoke). Homepage renders these as server-rendered cards.

## ~~HUB-009: On-Demand YAML Preview Loading~~
**Resolved**: 2026-02-17 (commit 175def1, branch: browse-page)
**Description**: Browse page preview modal fetches YAML content on demand via `/api/hunts/file?path=` instead of shipping all content to the client. Added `HuntSummary` type (omits `content` field) used for all client payloads. Loading state shown while fetching.

## ~~Create the `accessibility/` category directory~~
**Resolved**: 2026-02-17 (commit 00636df, branch: regression-testing)
**Description**: Created `accessibility/keyboard-navigation.yml` — starter template testing keyboard-only navigation through primary UI elements (skip link, tab flow, focus management). The `accessibility` category was already in `PUBLISHED_DIRS`, so it now appears in the hub catalog (14 total hunts).

## ~~Add issue templates for requesting new hunt patterns~~
**Resolved**: 2026-02-17 (commit 00636df, branch: regression-testing)
**Description**: Created `.github/ISSUE_TEMPLATE/hunt-request.yml` using GitHub's issue form YAML format. Fields: category dropdown (7 options + Other), pattern name, description of flow to test, optional example YAML steps, and commonality priority.

## ~~Add CI step to validate hunt file naming conventions~~
**Resolved**: 2026-02-17 (commit 00636df, branch: regression-testing)
**Description**: Added "Validate filename matches name field" step to `validate-submission.yml`. Python script extracts the `name:` field from each hunt YAML and compares it to the filename (minus `.yml`). Mismatches fail the build with a clear error showing both values.

## ~~Add CODEOWNERS file~~
**Resolved**: 2026-02-17 (commit 00636df, branch: regression-testing)
**Description**: Created `.github/CODEOWNERS` assigning `@mtookes` as reviewer for all category directories (`auth/`, `admin/`, `e-commerce/`, `saas/`, `forms/`, `smoke/`, `accessibility/`), `.github/` CI config, and `CLAUDE.md`.

## ~~BUG-HUB-001: Hunt catalog shows 0 hunts — HUNTS_ROOT path mismatch~~
**Resolved**: 2026-02-17 (commit 4e9c66b)
**Description**: `HUNTS_ROOT` in `lib/hunts.ts` pointed to `.prowlqa/hunts/` which had no category subdirectories, causing the web UI to display 0 verified hunts. Changed `HUNTS_ROOT` to the project root so it reads from the root-level category directories (`auth/`, `admin/`, `e-commerce/`, etc.) where templates actually live. Also updated `filePath` references from `.prowlqa/hunts/${category}/${file}` to `${category}/${file}`.

## ~~BUG-HUB-002: Published playbook path hardening and nested CI coverage~~
**Resolved**: 2026-03-18
**Description**: Hardened `lib/playbooks.ts` so published file downloads resolve the real filesystem target before reading and reject symlink escapes outside the requested category root. Updated `.github/workflows/validate-submission.yml` to recurse through nested category directories for both schema validation and filename/name matching, closing the gap where nested playbooks could bypass CI checks while remaining downloadable.

## ~~HUB-003: Add `smoke/` and `forms/` categories with community hunt templates~~
**Resolved**: 2026-02-17
**Description**: Added `smoke/` and `forms/` directories to `PUBLISHED_DIRS` in `lib/hunts.ts`. Created 8 verified hunt templates migrated from the CLI's bundled examples (made self-contained — removed `runHunt` dependencies):
- `smoke/homepage.yml` — Basic page load smoke test
- `auth/login-flow.yml` — Email/password login flow
- `auth/signup-flow.yml` — Registration flow
- `forms/form-submit.yml` — Contact form submission
- `forms/form-validation.yml` — Validation error handling
- `e-commerce/checkout-flow.yml` — E-commerce purchase flow
- `admin/crud-cycle.yml` — CRUD lifecycle (self-contained with auth state)
- `saas/onboarding-wizard.yml` — Onboarding wizard (inlined signup steps)
