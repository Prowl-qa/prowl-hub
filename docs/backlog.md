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
   _Status (2026-08-26): Vercel deletion approved by the owner but **deferred until the three
   sunset PRs merge** (`prowl-hub` sunset-hub, `prowl` starter-templates, `prowl-docs`
   starter-templates-page) so live docs never point at a dead site; then `vercel project rm
   prowl-hub`. Preview builds can no longer trigger (all branches but `main`, `sunset-hub`, and
   one QA branch are gone). DNS (Cloudflare) and the LAN Postgres container remain owner
   actions._
   **Acceptance**: hub.prowl.tools no longer serves the app; no Preview deployments; no
   recurring hosting/db cost.

{PQH-010} **HUB-019: Archive the repository**
   After HUB-016..018, HUB-020..022: add a retirement banner at the top of `README.md`
   ("Retired 2026-08 — templates now ship with the Prowl CLI, see …"), update
   `CLAUDE.md`/`AGENTS.md` to say the repo is frozen (fold in the uncommitted `CLAUDE.md`
   rewrite, HUB-021), set the GitHub repo description ("Retired 2026-08 — …") and clear the
   `prowl-hub.vercel.app` homepage URL **before** archiving (settings are read-only after), then
   archive on GitHub as the `prowltools` account (history preserved, read-only). Cross-repo
   cleanup is tracked where it lives — see HUB-023 for the items that still need creating.
   _Status (2026-08-26): README banner, CLAUDE.md/AGENTS.md frozen notes, and the `MIGRATED.md`
   are on `sunset-hub`; GitHub description + homepage already set. **Remaining:** merge the
   three sunset PRs, delete the Vercel project (HUB-017), decide the leftover
   `qa/hunt-run-20260527-1635` branch, remove `prowl-hub` from the org-level `vercel` and
   `chatgpt-codex-connector` GitHub App selections (GitHub UI; carried over from HUB-018), then
   `gh repo archive prowl-tools/prowl-hub` as `prowltools`._
   **Acceptance**: repo shows "archived" on GitHub; README banner visible; no inbound links from
   live Prowl properties.

## Completed

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
