# Prowl Hub - Product Backlog

**Repo**: `prowl-tools/prowl-hub`
**Stack**: Next.js + YAML templates + historical GitHub Actions CI
**License**: Apache 2.0

---

## High Priority

*No active items.*

## Medium Priority

*No active items.*

## Low Priority

*No active items.*

## Sunset Work Items

Decision (2026-08-26): **retire Prowl Hub.** A standalone "download a YAML file" marketplace has
no organic pull (zero users, no submissions, last product work 2026-06), it makes the owner the
moderator of an untrusted-YAML queue, and its one real asset — the hunt templates — is worth
more shipped *inside* the CLI (`prowl init --template`) than on a separate site. Historical
templates are preserved here for reference while the repo is frozen pending archive, and the
templates move to `prowl`. Existing open item HUB-010 is superseded by this section.

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

**All sunset items are resolved (2026-08-26)** — see [resolved.md](resolved.md). The two
remaining physical teardown steps live outside this repo: the Cloudflare `hub` CNAME (owner) and the
LAN `prowl-hub-postgres` container / compose dir (`prowl-infra-hub` INFRA-070).

## Completed

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
