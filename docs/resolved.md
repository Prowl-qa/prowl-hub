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
**Description**: Added "Using Templates Programmatically" section to README linking to the Agent Integration docs at docs.prowl.tools/agents with mention of CLI and library API.

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
**Description**: Created `.github/CODEOWNERS` assigning `@prowltools` as reviewer for all category directories (`auth/`, `admin/`, `e-commerce/`, `saas/`, `forms/`, `smoke/`, `accessibility/`), `.github/` CI config, and `CLAUDE.md`.

## ~~BUG-HUB-001: Hunt catalog shows 0 hunts — HUNTS_ROOT path mismatch~~
**Resolved**: 2026-02-17 (commit 4e9c66b)
**Description**: `HUNTS_ROOT` in `lib/hunts.ts` pointed to `.prowl/hunts/` which had no category subdirectories, causing the web UI to display 0 verified hunts. Changed `HUNTS_ROOT` to the project root so it reads from the root-level category directories (`auth/`, `admin/`, `e-commerce/`, etc.) where templates actually live. Also updated `filePath` references from `.prowl/hunts/${category}/${file}` to `${category}/${file}`.

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

### HUB-014: Scope Beelink stats counter per-hub (completed: 2026-05-22)
**Description**: Beelink's `prowl-feedback-api` now exposes per-hub endpoints — prowl-hub uses `/api/downloads/hub` + `/api/downloads/hub/stats` (backed by the existing `hub_downloads` table), prowl-infra-hub uses `/api/downloads/infrahub` + `/api/downloads/infrahub/stats` (backed by a new `infra_hub_downloads` table). The API was refactored to drive both routes off a single `ProjectConfig` shape, each with its own Postgres advisory-lock key for the daily insert cap. Legacy `/api/downloads` / `/api/downloads/stats` stay as aliases pointing at the hub variant for backward compatibility. Vercel env vars `TRACKING_API_URL` and `STATS_API_URL` were updated in both projects to point at the new routes; both hubs were observed writing to and reading from their own tables independently. Home-page Total downloads metric re-enabled in this branch (3-column grid + third `<article>` + `fetchTotalDownloads()` back in `Promise.all`). A separate fire-and-forget race in `trackDownload` was uncovered during verification; tracked as PQH-006 / HUB-015. Mirrors prowl-infra-hub's resolved INFRA-058.

## ~~PQH-006 / HUB-015: Fix `trackDownload` fire-and-forget race on Vercel~~
**Resolved**: 2026-05-22 (branch track-download, commit abe788e)
**Description**: `trackDownload` fired `fetch()` without awaiting, so on Vercel the serverless function context could be torn down before the POST settled — dropping download events inconsistently into `hub_downloads`. Made `trackDownload` awaitable (still never throws) and invoked it via Next.js's `after()` in `app/api/hunts/file/route.ts`, so the runtime extends the function lifetime until the tracking POST completes without blocking the response. Mirrors prowl-infra-hub's PQIH-023 / INFRA-059.

## ~~PQH-003 / HUB-011: Sort Options~~
**Resolved**: 2026-06-01 (branch two-prowl-issues)
**Description**: Added a Sort by control to the browse page in `components/browse-shell.tsx` with three options — Alphabetical (default, by title), Newest (by `updatedAt` desc), and Most steps (by `stepCount` desc). The selection is stored in the URL as `?sort=`, kept in sync with the existing `category` and `page` params via `router.replace`, and a non-default sort resets pagination to page 1. Styled the `<select>` with a `.sort-field` rule that mirrors `.search-field` for visual consistency.

## ~~PQH-004 / HUB-012: Hunt Detail Page~~
**Resolved**: 2026-06-01 (branch two-prowl-issues)
**Description**: Added `/browse/[category]/[name]` route in `app/browse/[category]/[name]/page.tsx` as a server component that loads all published hunts and looks up the requested hunt by `category` + `${category}/${name}.yml` filePath, calling `notFound()` if no match. Renders a breadcrumb, title, description, meta pills (verified, new, steps, assertions, updated), tags, Download YAML / Back actions, the full YAML body inside `.hunt-detail-yaml`, and up to 6 related hunts from the same category (excluding self). `generateMetadata` produces per-hunt `<title>` and description for SEO. Updated `components/hunt-card.tsx` to wrap the title in a `Link` to the new detail route so cards on the homepage, browse page, and related-hunts grid are now click-throughs.

## ~~PQH-001 / HUB-002: Target URL Pattern Metadata~~
**Resolved**: 2026-06-01 (branch two-prowl-issues)
**Description**: Added support for an optional `meta.targetPattern` glob string in hunt YAML so the Prowl CLI's URL-based hunt discovery (P5-007 / PROWL-022) can match templates to a target URL. Added `getMetaTargetPattern(content)` to `lib/yaml-parser.ts`, extended the `HuntRecord` type with `targetPattern?: string`, and wired the parse through both the filesystem reader (`lib/hunts-fs.ts`) and the DB query path (`lib/db/queries.ts` `toRecord`). No DB schema change — the value is derived from the existing `content` column on read, so no migration is required and no risk to imports. The field is exposed on `HuntRecord` returns (and therefore the `/api/hunts/[id]` endpoint) but intentionally left off `HuntSummary` to preserve the lightweight summary payload. Existing CI validator already accepts unknown top-level fields, so no validator change was needed. Documented the field in `CONTRIBUTING.md`.

## ~~Rebrand: Prowl QA → Prowl (Hub)~~
**Resolved**: 2026-06-03 (branch: rebrand-to-prowl-tools)
**Description**: Rebranded the community hub for the Prowl / prowl-tools rename. Site brand "Prowl QA Hub"→"Prowl Hub", ProwlQA/Prowl QA→Prowl, `prowlqa` command→`prowl`, `prowlqa.dev`→`prowl.tools` (docs/hub/email + npm link→`prowl-tools`), `github.com/Prowl-qa`→`prowl-tools`, `.prowlqa/`→`.prowl/` across hunt templates and the hub's own test-hunt dir. `lib/hunt-identifiers.ts` now accepts **both** `.prowl/` and legacy `.prowlqa/` submission paths (back-compat). The `@prowlqa` X handle left unchanged pending the handle decision; the "Brought to you by Genkei Labs" footer deferred until genkeilabs.com is live. lint + typecheck + build pass.

## ~~PQH-007 / HUB-016: Migrate the hunt templates into the `prowl` repo~~
**Resolved**: 2026-08-26 (branch sunset-hub; `prowl` branch starter-templates)
**Description**: All 23 hunt templates (accessibility, admin, auth, docs, e-commerce, forms, saas, smoke — same category/file names) now live in `prowl` at `templates/<category>/<name>.yml` and are surfaced by `prowl templates list|show` and `prowl init --template <category/name>`; `prowl`'s `test/templates.test.ts` schema-validates every one in CI (the port of this repo's `validate-submission.yml` check). `e-commerce/stripe-checkout` was rewritten there against Stripe-hosted Checkout because the hub version used an `iframe_action` step the CLI never had. `MIGRATED.md` in this repo maps every old path to its new path and CLI id. Counterparts: `prowl` PROWL-072/073 (resolved), `prowl-docs` PQD-008 (resolved — `/hub-api` now redirects to `/starter-templates`).

## ~~PQH-009 / HUB-018: Remove automation attached to this repo~~
**Resolved**: 2026-08-26 (branch sunset-hub)
**Description**: Runner `lucius-mac-mini-prowl-hub` (id 21) deregistered on GitHub and its LaunchAgent + directory removed on the Mac mini (`luciusfox@192.168.86.28`; the other seven runners untouched). `prowl-review-codex` branch deleted from origin. All four workflows (`claude-code-review.yml`, `claude.yml`, `sync-to-database.yml`, `validate-submission.yml`) removed and the `CLAUDE_CODE_OAUTH_TOKEN` secret deleted — Actions tab is idle. GitHub Apps: `claude`/`coderabbitai`/`prowl-review` are org-wide "all repositories" installs with no per-repo uninstall, so archiving is what neutralises them; removing `prowl-hub` from the `vercel` and `chatgpt-codex-connector` "selected repositories" lists needs the GitHub UI and is carried under HUB-019.

## ~~PQH-011 / HUB-020: Commit the six never-committed `smoke/` hunts~~
**Resolved**: 2026-08-26 (branch sunset-hub, commit 7b88ac9)
**Description**: `smoke/api-health.yml`, `empty-state.yml`, `navigation.yml`, `pagination.yml`, `preview-modal.yml`, `search-and-filter.yml` (written 2026-06-05, never added to git) are now committed, so the catalog on GitHub is the full 23 and the `prowl` migration includes them.

## ~~PQH-012 / HUB-021: Commit the uncommitted `CLAUDE.md` rewrite~~
**Resolved**: 2026-08-26 (branch sunset-hub, commit bffa7ea)
**Description**: Landed the 2026-08-09 rewrite that defers to the workspace `CLAUDE.md` (drops the stale "Prowl QA" repo table, `@prowlqa` handle, and duplicated git/backlog rules), then added the frozen-repo note on top as part of HUB-019.

## ~~PQH-013 / HUB-022: Prune stale branches before archiving~~
**Resolved**: 2026-08-26
**Description**: Deleted 18 fully-merged branches from origin plus `prowl-review-codex`, and the matching local branches. `origin` now holds `main`, `sunset-hub`, and `qa/hunt-run-20260527-1635` — the last one has a single unmerged QA-agent commit and was deliberately left for the owner to keep or drop before the archive.

## ~~PQH-014 / HUB-023: Create the missing cross-repo sunset items~~
**Resolved**: 2026-08-26
**Description**: Created `prowl-web` PQW-025 (Community.tsx, products.ts, `/hub` redirect, blog link, the three `.prowl/hunts` that assert a hub link) and `prowl-infra-hub` INFRA-070 (README/footer/hello.yml links + the `infrastructure/prowl-hub-postgres/` compose dir; notes that the INFRA-073 id referenced by `prowl-code-review` does not exist). Corrected the "32" template count in `prowl` PROWL-072 to 23. `prowl-code-review-docs` needs no item — that site is itself being retired (`prowl-code-review` item 68), and item 71 there already drops `prowl-hub` from the runner rollout. Workspace `CLAUDE.md` repo-map row is left for the archive pass (HUB-019).
