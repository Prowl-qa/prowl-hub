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
moderator of an untrusted-YAML queue, and its one real asset — the 32 verified hunt templates —
is worth more shipped *inside* the CLI (`prowl init --template`) than on a separate site. Nothing
is deleted: the repo is archived read-only and the templates move to `prowl`. Existing open
item HUB-010 is superseded by this section.

{PQH-007} **HUB-016: Migrate the hunt templates into the `prowl` repo**
   Move the 32 category-organised hunt YAMLs (plus `validate-submission.yml`'s schema check,
   ported to the CLI's own CI) into `prowl` as first-class starter templates. Counterpart item
   on the CLI side: `prowl` PROWL-072. Keep the category/name structure so `prowl init
   --template auth/login` maps 1:1 to today's catalog paths.
   **Acceptance**: every hunt in this repo exists in `prowl` and passes the CLI's schema
   validation; a short `MIGRATED.md` in this repo maps old paths → new paths.

{PQH-008} **HUB-017: Decommission the hub.prowl.tools deployment**
   Remove the Vercel (or equivalent) project, delete the `hub` DNS record (or point it at the
   new CLI-docs templates page, `prowl-docs` PQD-008, for a grace period), remove the
   `sync-to-database` workflow and any database it targets. Confirm nothing else in the
   ecosystem fetches `/api/hunts` (the `prowl` MCP server and `prowl-docs` `hub-api.md` are the
   known consumers — see PROWL-073 and PQD-008).
   **Acceptance**: hub.prowl.tools no longer serves the app; no recurring hosting/db cost.

{PQH-009} **HUB-018: Remove automation attached to this repo**
   Deregister the `lucius-mac-mini-prowl-hub` self-hosted runner (from `prowl-code-review` #64's
   rollout), close/abandon the pushed `prowl-review-codex` branch, uninstall CodeRabbit, and
   delete the `claude-code-review.yml` / `claude.yml` workflows so nothing runs on a dead repo.
   **Acceptance**: no runners registered to this repo; no GitHub Apps installed; Actions tab
   idle.

{PQH-010} **HUB-019: Archive the repository**
   After HUB-016..018: add a retirement banner at the top of `README.md` ("Retired 2026-08 —
   templates now ship with the Prowl CLI, see …"), update `CLAUDE.md`/`AGENTS.md` to say the
   repo is frozen, then archive on GitHub as the `prowltools` account (history preserved,
   read-only). Cross-repo cleanup is tracked where it lives: `prowl-web` PQW-025, `prowl`
   PROWL-073, `prowl-docs` PQD-008, and the workspace `CLAUDE.md` repo map (workspace-level,
   not a repo — do it in the same pass as PQW-025).
   **Acceptance**: repo shows "archived" on GitHub; README banner visible; no inbound links from
   live Prowl properties.

## Completed

*All completed items are tracked in [resolved.md](resolved.md) under Prowl Hub.*
