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

## QA Findings — Archy / Woz

{PQH-QA-001} **Preview modal hunt text assertion fails on YAML punctuation**
   **Severity**: Medium
   **Hunt**: `.prowlqa/hunts/preview-modal.yml` (`preview-modal`)
   **Observed**: Step 8 failed on `assert: { visible: "name:" }` with `locator.count: Unexpected token "" while parsing css selector "name:". Did you mean to CSS.escape it?` after the modal opened and `[role='dialog'] pre code` was present.
   **Expected**: The hunt should treat `visible: "name:"` as a text assertion and pass when the preview YAML contains a `name:` field.
   **Woz read-only diagnosis**: The app appears to render the expected modal content in `components/browse-shell.tsx` (`role="dialog"`, `<pre><code>{previewContent ?? 'Loading...'}</code></pre>`). The failure is caused by the ProwlQA CLI visibility selector heuristic: `looksLikeSelector()` treats `:` as selector syntax, so `toVisibilitySelector("name:")` sends raw `name:` to `page.locator()` instead of wrapping it as a text selector.
   **Suggested fix direction**: Update ProwlQA visibility assertion resolution to prefer text semantics for `assert.visible` / `assert.notVisible` values, or support an explicit text selector form for punctuation-bearing strings. As a hunt-side workaround, assert against a stable selector/content mechanism that does not pass bare `name:` as a CSS selector.
   **Run context**: 2026-05-27 19:09 CDT, branch `qa/hunt-run-20260527-1909`, command `prowlqa run preview-modal --json`, target dev server `http://localhost:3003`.

{PQH-QA-002} **Submit form validation hunt text assertion fails on sentence punctuation**
   **Severity**: Medium
   **Hunt**: `.prowlqa/hunts/submit-form.yml` (`submit-form`)
   **Observed**: Step 16 failed on `assert: { visible: "Complete all required fields before opening a pull request." }` with `locator.count: Unexpected token "" while parsing css selector "Complete all required fields before opening a pull request.". Did you mean to CSS.escape it?` after form fields rendered, partial values were filled, and `Open Pull Request Flow` was clicked.
   **Expected**: The hunt should treat the validation sentence as a text assertion and pass when the submit form shows the incomplete-required-fields error.
   **Woz read-only diagnosis**: The app explicitly sets the expected validation message in `components/submit-form.tsx` when `form.checkValidity()` fails, and the form has `noValidate`, so the custom message path is reachable. The failure matches the same ProwlQA CLI selector heuristic: punctuation in the visible text causes the assertion value to be interpreted as a CSS selector instead of text.
   **Suggested fix direction**: Fix ProwlQA CLI assertion selector detection so prose strings with punctuation are escaped or routed through text locators. If changing only the hunt, use an assertion form that cannot be mistaken for CSS, once the CLI supports it.
   **Run context**: 2026-05-27 19:09 CDT, branch `qa/hunt-run-20260527-1909`, command `prowlqa run submit-form --json`, target dev server `http://localhost:3003`.

## Completed

### HUB-013: Align hub browser icon with the shared Prowl site icon (completed: 2026-03-21)
**Description**: Replaced the metadata-only favicon setup in `prowl-hub` with Next App Router special files. Added `app/icon.png` and `app/apple-icon.png` from the shared mascot asset, removed the redundant `metadata.icons` block from the root layout, and verified the production build now emits `/icon.png` and `/apple-icon.png` routes.

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
