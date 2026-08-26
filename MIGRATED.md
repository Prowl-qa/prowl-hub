# Migrated to the Prowl CLI

Prowl Hub was retired in 2026-08. Every hunt template that lived here now ships **inside the
`prowl-tools` npm package** and is reachable from the CLI — no download step, no separate site:

```bash
prowl templates list                     # browse the catalog
prowl templates show auth/login-flow     # print a template
prowl init --template auth/login-flow    # copy it into .prowl/hunts/login-flow.yml
```

Source of truth: [`prowl-tools/prowl`](https://github.com/prowl-tools/prowl) → `templates/<category>/<name>.yml`
(tracked as `prowl` PROWL-072 / `prowl-hub` HUB-016). Contribute new templates by PR to that repo;
`test/templates.test.ts` schema-validates every template in its CI.

## Path map

| Old path (this repo) | New path (`prowl`) | CLI id | Notes |
|---|---|---|---|
| `accessibility/keyboard-navigation.yml` | `templates/accessibility/keyboard-navigation.yml` | `accessibility/keyboard-navigation` |  |
| `admin/crud-cycle.yml` | `templates/admin/crud-cycle.yml` | `admin/crud-cycle` |  |
| `admin/data-table-filter.yml` | `templates/admin/data-table-filter.yml` | `admin/data-table-filter` |  |
| `auth/login-flow.yml` | `templates/auth/login-flow.yml` | `auth/login-flow` |  |
| `auth/oauth-google.yml` | `templates/auth/oauth-google.yml` | `auth/oauth-google` |  |
| `auth/password-reset.yml` | `templates/auth/password-reset.yml` | `auth/password-reset` |  |
| `auth/signup-flow.yml` | `templates/auth/signup-flow.yml` | `auth/signup-flow` |  |
| `docs/content-smoke.yml` | `templates/docs/content-smoke.yml` | `docs/content-smoke` |  |
| `docs/sidebar-navigation.yml` | `templates/docs/sidebar-navigation.yml` | `docs/sidebar-navigation` |  |
| `docs/theme-toggle.yml` | `templates/docs/theme-toggle.yml` | `docs/theme-toggle` |  |
| `e-commerce/checkout-flow.yml` | `templates/e-commerce/checkout-flow.yml` | `e-commerce/checkout-flow` |  |
| `e-commerce/stripe-checkout.yml` | `templates/e-commerce/stripe-checkout.yml` | `e-commerce/stripe-checkout` | rewritten against Stripe-hosted Checkout (the hub version used an `iframe_action` step the CLI never had) |
| `forms/form-submit.yml` | `templates/forms/form-submit.yml` | `forms/form-submit` |  |
| `forms/form-validation.yml` | `templates/forms/form-validation.yml` | `forms/form-validation` |  |
| `saas/onboarding-wizard.yml` | `templates/saas/onboarding-wizard.yml` | `saas/onboarding-wizard` |  |
| `saas/team-invite.yml` | `templates/saas/team-invite.yml` | `saas/team-invite` |  |
| `smoke/api-health.yml` | `templates/smoke/api-health.yml` | `smoke/api-health` |  |
| `smoke/empty-state.yml` | `templates/smoke/empty-state.yml` | `smoke/empty-state` |  |
| `smoke/homepage.yml` | `templates/smoke/homepage.yml` | `smoke/homepage` |  |
| `smoke/navigation.yml` | `templates/smoke/navigation.yml` | `smoke/navigation` |  |
| `smoke/pagination.yml` | `templates/smoke/pagination.yml` | `smoke/pagination` |  |
| `smoke/preview-modal.yml` | `templates/smoke/preview-modal.yml` | `smoke/preview-modal` |  |
| `smoke/search-and-filter.yml` | `templates/smoke/search-and-filter.yml` | `smoke/search-and-filter` |  |

23 templates migrated 1:1 (same category and file name, so `hub.prowl.tools` catalog paths map
directly onto CLI ids). `prowl` additionally adds a `macos/` category (`app-launch-smoke`,
`menu-bar-extra`, `settings-form`) for the native desktop target.

Not migrated: `.prowl/hunts/*` (the hub website's own smoke tests — they die with the site) and
`docs/*.yml` are migrated as the `docs` category (they are docs-site checks, not backlog files).
