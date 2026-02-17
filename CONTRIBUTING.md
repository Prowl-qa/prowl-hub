# Contributing to Prowl Hub

Thank you for contributing a hunt template! This guide covers everything you need to submit a high-quality, reviewable pull request.

## Hunt Template Schema

Each `.yml` file must contain these fields:

### Required

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique identifier matching the filename (without `.yml`) |
| `description` | string | Short summary of what the hunt tests |
| `steps` | list | Ordered browser actions |
| `tags` | list of strings | Categorization tags for discoverability |

### Optional

| Field | Type | Description |
|-------|------|-------------|
| `vars` | mapping | Variables using `{{VAR_NAME}}` syntax |
| `assertions` | list | Final checks after all steps complete |

### Example

```yaml
name: my-login-flow
description: Verify standard email/password login and redirect

tags:
  - auth
  - login
  - form

vars:
  EMAIL: "{{TEST_EMAIL}}"
  PASSWORD: "{{TEST_PASSWORD}}"

steps:
  - navigate: "/login"
  - fill:
      "Email": "{{EMAIL}}"
  - fill:
      "Password": "{{PASSWORD}}"
  - click: "Sign In"
  - waitForUrl:
      value: "/dashboard"
      timeout: 5000

assertions:
  - urlIncludes: "/dashboard"
  - noConsoleErrors: true
```

## Valid Step Types

| Step | Description |
|------|-------------|
| `navigate` | Go to a URL path |
| `click` | Click an element by label, text, or selector |
| `wait` | Wait for text or element to appear |
| `fill` | Fill a form field |
| `select` | Select a dropdown option |
| `waitForUrl` | Wait for the URL to match a pattern |
| `waitForNetworkIdle` | Wait for network activity to settle |
| `assert` | Inline assertion (`visible`, `notVisible`, `urlIncludes`) |
| `runHunt` | Compose another hunt as a sub-step |
| `iframe_action` | Interact with elements inside an iframe |

## Tags

Every template must include at least one tag. Use existing tags when possible:

| Tag | Use for |
|-----|---------|
| `auth` | Authentication patterns |
| `oauth` | Third-party OAuth flows |
| `login` | Login forms and flows |
| `password` | Password reset, change password |
| `form` | Form-heavy interactions |
| `admin` | Admin panel patterns |
| `crud` | Create/read/update/delete workflows |
| `table` | Data table interactions |
| `filter` | Search and filter patterns |
| `e-commerce` | Shopping and store flows |
| `payment` | Payment processing |
| `checkout` | Checkout flows |
| `saas` | SaaS-specific patterns |
| `team` | Team management features |
| `invite` | Invitation flows |
| `accessibility` | Accessibility testing |
| `smoke` | Quick smoke-test patterns |

New tags are welcome when existing ones don't fit. Keep them lowercase, single-word or hyphenated.

## Selector Conventions

Selectors must be generic and reusable across apps:

- **Preferred**: `data-testid` attributes, `placeholder` text, visible button/link labels
- **Forbidden**: App-specific class names, auto-generated IDs, framework-internal selectors

```yaml
# Good
- click: "Sign In"
- fill:
    "Email": "user@example.com"
- click:
    selector: "[data-testid='submit-btn']"

# Bad — app-specific
- click:
    selector: ".MuiButton-root.css-1a2b3c"
- click:
    selector: "#__next > div > form > button:nth-child(3)"
```

## Pull Request Workflow

1. **Fork** the repository
2. **Add** your `.yml` file to the correct category directory (`auth/`, `admin/`, `e-commerce/`, `saas/`, `accessibility/`)
3. **Open a PR** against `main` with a clear description
4. **CI runs automatically** — fix any failures
5. **Maintainer reviews** content and security profile
6. **Merge** — your hunt appears in the live catalog

### Category Directories

| Directory | Use for |
|-----------|---------|
| `auth/` | Authentication, OAuth, 2FA, password reset |
| `admin/` | Admin panels, dashboards, data management |
| `e-commerce/` | Shopping, payments, orders |
| `saas/` | Teams, billing, onboarding, SaaS-specific |
| `accessibility/` | Keyboard navigation, focus, screen readers |

## What CI Checks

The automated pipeline validates:

- **File types** — only allowed extensions
- **File size** — `.yml` and `.md` files must be under 50KB
- **Credential patterns** — flags `{{...}}` variables referencing `PASSWORD`, `SECRET`, `TOKEN`, `KEY`, etc.
- **URL domains** — only `localhost`, `127.0.0.1`, `example.com`, and explicitly allowlisted domains
- **YAML syntax** — must parse without errors
- **Hunt schema** — `name`, `description`, `steps`, and `tags` are required; step types must be recognized

## Security Rules

Community templates are treated as untrusted input. Your submission must follow these rules:

- **No credentials** — never hardcode real passwords, API keys, or tokens
- **Allowlisted URLs only** — `localhost`, `127.0.0.1`, `0.0.0.0`, `example.com` (and subdomains), `accounts.google.com`, `checkout.stripe.com`, `js.stripe.com`
- **No embedded instructions** — do not include comments like "run this command" or "execute this to test"
- **No scripts** — YAML only; no embedded shell commands or JavaScript

Submissions that violate these rules will be rejected by CI or flagged during review.

## License

By contributing, you agree that your submission will be licensed under [Apache 2.0](LICENSE).
