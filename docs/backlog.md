# Prowl Hub - Product Backlog

**Repo**: `prowl-tools/prowl-hub`
**Stack**: Next.js + YAML templates + GitHub Actions CI
**License**: Apache 2.0

---

## High Priority

*No active items.*

## Medium Priority

*No active items.*

## Low Priority

{PQH-002} **HUB-010: Server-Side Filtering (500+ hunts)**
   Move search/filter/pagination to server-side via `searchParams` when catalog exceeds 500 hunts. Server component reads `?q=&category=&page=`, filters and slices server-side. Search input becomes a GET form or debounced `router.push`.

## Sunset Work Items

Decision (2026-08-26): **retire Prowl Hub.** A standalone "download a YAML file" marketplace has
no organic pull (zero users, no submissions, last product work 2026-06), it makes the owner the
moderator of an untrusted-YAML queue, and its one real asset — the hunt templates — is worth
more shipped *inside* the CLI (`prowl init --template`) than on a separate site. Nothing is
deleted: the repo is archived read-only and the templates move to `prowl`. Existing open item
HUB-010 is superseded by this section.

**State audit (2026-08-26)** — facts every item below relies on:
- Repo is **not yet archived** (`isArchived: false`); no open PRs/issues; `main` unprotected.
- Template inventory is **23 hunts, not 32**: 17 committed across `accessibility/ admin/ auth/
  docs/ e-commerce/ forms/ saas/ smoke/` + **6 in `smoke/` that were never committed**
  (HUB-020). `.prowl/hunts/` holds 8 self-tests of the hub site itself — not templates; they
  die with the site.
- `hub.prowl.tools` is live (HTTP 200): CNAME → Vercel, project `prowl-hub` in the owner's
  Vercel team, homepage `prowl-hub.vercel.app`. Vercel is still building **Preview deployments**
  (three on 2026-08-25, triggered by the `prowl-review-codex` push).
- The catalog DB is a LAN Postgres (`prowl-hub-postgres` container, compose file lives in
  `prowl-infra-hub/infrastructure/prowl-hub-postgres/`), reached via `DATABASE_URL`. Download
  tracking goes to Beelink's `prowl-feedback-api` (`/api/downloads/hub` → `hub_downloads`
  table) via Vercel env vars `TRACKING_API_URL` / `STATS_API_URL` / `STATS_API_KEY`.
- Four workflows: `validate-submission.yml`, `sync-to-database.yml` (self-hosted), 
  `claude-code-review.yml`, `claude.yml`. One repo secret: `CLAUDE_CODE_OAUTH_TOKEN`.
- Runner `lucius-mac-mini-prowl-hub` (id 21) is **online**, registered repo-level, hosted on the
  Mac mini (not this MacBook).
- GitHub Apps are installed at **org** level: `claude`, `coderabbitai`, `prowl-review` on *all*
  repos (no per-repo uninstall exists — archiving is what neutralises them), `vercel` and
  `chatgpt-codex-connector` on *selected* repos.
- 21 merged feature branches still exist on `origin` (HUB-022). Archived repos are read-only,
  so branch cleanup must happen **before** HUB-019.

{PQH-007} **HUB-016: Migrate the hunt templates into the `prowl` repo**
   Move the 23 category-organised hunt YAMLs (plus `validate-submission.yml`'s schema check,
   ported to the CLI's own CI) into `prowl` as first-class starter templates. Counterpart item
   on the CLI side: `prowl` PROWL-072 (its "32" count needs the same correction). Keep the
   category/name structure so `prowl init --template auth/login-flow` maps 1:1 to today's
   catalog paths. The three `docs/*.yml` hunts are a real `docs` category (docs-site smoke
   tests) that happens to sit next to the backlog files — migrate them as `docs/`.
   Depends on HUB-020 (the 6 uncommitted smoke hunts must be in git first).
   **Acceptance**: every hunt in this repo exists in `prowl` and passes the CLI's schema
   validation; a short `MIGRATED.md` in this repo maps old paths → new paths.

{PQH-008} **HUB-017: Decommission the hub.prowl.tools deployment**
   (1) Vercel: delete project `prowl-hub` (or at minimum disconnect the Git integration so
   Preview builds stop) and remove `prowl-hub` from the `vercel` GitHub App's selected repos.
   (2) DNS: delete the `hub` CNAME, or point it at the `prowl-docs` starter-templates page
   (PQD-008) for a grace period. (3) DB: stop/remove the `prowl-hub-postgres` container on its
   LAN host and drop the compose dir from `prowl-infra-hub` (no `prowl-infra-hub` item exists
   for this yet — add one). (4) Beelink: retire the `/api/downloads/hub` routes + `hub_downloads`
   table in `prowl-feedback-api`, or leave dormant (no cost either way). (5) Delete
   `sync-to-database.yml`. Known `/api/hunts` consumers to confirm are cut over: `prowl`
   `src/cli/commands/init.ts:87` + MCP server (PROWL-073), `prowl-docs` `hub-api.md` /
   `agents.mdx` (PQD-008).
   **Acceptance**: hub.prowl.tools no longer serves the app; no Preview deployments; no
   recurring hosting/db cost.

{PQH-009} **HUB-018: Remove automation attached to this repo**
   (1) Runner: `DELETE /repos/prowl-tools/prowl-hub/actions/runners/21` on GitHub, **and** on
   the Mac mini stop/uninstall the service and `./config.sh remove` for the
   `lucius-mac-mini-prowl-hub` runner dir (from `prowl-code-review` #64's rollout). (2) Branch:
   close/abandon the pushed `prowl-review-codex` branch (4 commits ahead of main). (3) Apps:
   `coderabbitai`/`claude`/`prowl-review` are org-wide installs — either accept that archiving
   neutralises them or flip each to "selected repositories" without `prowl-hub`; remove
   `prowl-hub` from the `chatgpt-codex-connector` selection. (4) Delete all four workflows
   (`claude-code-review.yml`, `claude.yml`, `validate-submission.yml`, `sync-to-database.yml`)
   and the `CLAUDE_CODE_OAUTH_TOKEN` repo secret.
   **Acceptance**: no runners registered to this repo; no app has this repo selected; Actions
   tab idle; no repo secrets.

{PQH-010} **HUB-019: Archive the repository**
   After HUB-016..018, HUB-020..022: add a retirement banner at the top of `README.md`
   ("Retired 2026-08 — templates now ship with the Prowl CLI, see …"), update
   `CLAUDE.md`/`AGENTS.md` to say the repo is frozen (fold in the uncommitted `CLAUDE.md`
   rewrite, HUB-021), set the GitHub repo description ("Retired 2026-08 — …") and clear the
   `prowl-hub.vercel.app` homepage URL **before** archiving (settings are read-only after), then
   archive on GitHub as the `prowltools` account (history preserved, read-only). Cross-repo
   cleanup is tracked where it lives — see HUB-023 for the items that still need creating.
   **Acceptance**: repo shows "archived" on GitHub; README banner visible; no inbound links from
   live Prowl properties.

{PQH-011} **HUB-020: Commit the six never-committed `smoke/` hunts**
   `smoke/api-health.yml`, `empty-state.yml`, `navigation.yml`, `pagination.yml`,
   `preview-modal.yml`, `search-and-filter.yml` (dated 2026-06-05) exist only in the local
   working tree — they are not on GitHub and would be lost by the archive. Commit them on a
   branch and merge before HUB-016 migrates the catalog. (Discovered 2026-08-26 during the
   sunset audit.)
   **Acceptance**: `git ls-files smoke/` lists 7 hunts on `origin/main`.

{PQH-012} **HUB-021: Commit the uncommitted `CLAUDE.md` rewrite**
   The 2026-08-09 rebrand pass rewrote `CLAUDE.md` to defer to the workspace `CLAUDE.md` (drops
   the stale "Prowl QA" repo table, `@prowlqa` handle, and duplicated git/backlog rules) but the
   change was never committed. Land it as part of the HUB-019 freeze edit rather than a separate
   PR.
   **Acceptance**: `git status` clean for `CLAUDE.md`; committed content matches the workspace
   pattern.

{PQH-013} **HUB-022: Prune stale branches before archiving**
   21 merged/abandoned branches remain on `origin` (`initial-build`, `browse-page`,
   `db-migration`, `rebrand-to-prowl-tools`, `standardize-copyright`, two `qa/hunt-run-*`, …)
   plus the same set locally. An archived repo cannot delete branches, so prune them (keep
   `main`) as the last step before HUB-019. `prowl-review-codex` is handled in HUB-018.
   **Acceptance**: `origin` has only `main`; local repo has only `main`.

{PQH-014} **HUB-023: Create the missing cross-repo sunset items**
   HUB-019 cites counterparts that do not all exist. Found on 2026-08-26: `prowl` PROWL-072/073
   ✅ and `prowl-docs` PQD-008 ✅ exist; **`prowl-web` PQW-025 does not** — create it covering
   `src/components/Community.tsx` (hub + repo CTAs), `src/lib/products.ts` (hub product card),
   `next.config.ts` (`/hub` → hub.prowl.tools permanent redirect), the
   `introducing-prowl-qa-blog` post link, and the three `.prowl/hunts` (`nav-desktop`,
   `nav-mobile`, `docs-page`) that *assert* a hub link exists. Also missing: a
   `prowl-code-review-docs` item (2 nav/footer links in `docusaurus.config.ts`), a
   `prowl-infra-hub` item (README intro, `site-footer.tsx` link, `.prowl/hunts/hello.yml`
   comment, and the `infrastructure/prowl-hub-postgres/` compose dir — `prowl-code-review`'s
   backlog references an INFRA-073 that does not exist), and the `prowl-code-review` #64
   rollout list needs `prowl-hub` dropped (its item 82 already says so — verify). Workspace
   `CLAUDE.md` repo-map row → "archived 2026-08".
   **Acceptance**: each repo above has a numbered backlog item; PQW-025 exists under that id.

## Completed

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
