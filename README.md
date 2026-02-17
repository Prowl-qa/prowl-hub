# Prowl Hub

Community-driven hunt templates for [Prowl](https://github.com/Prowl-qa/prowl), plus a web interface for discovering, previewing, downloading, and contributing hunts.

## What Prowl Hub Is

Prowl Hub is a central library of reusable YAML hunts that teams can use in their own projects.  
The hub is designed around one core trust rule:

**Only verified hunts are published.**

A hunt appears in the live catalog only after a pull request is reviewed and approved by maintainers.

## Core Principles

- Verified-only catalog
- Pull-request-first publishing
- Security-first review for untrusted YAML
- Clear contributor UX
- Reusable hunt patterns across app domains

## Current Capabilities

- Browse hunts by category
- Search/filter hunts
- Preview raw YAML in-app
- Download hunt files directly
- Visual status badges:
  - `Verified` for published hunts
  - `New` for recently updated hunts (based on file modification time)
- Submit flow that opens a prefilled GitHub file creation flow in `Prowl-qa/prowl-hub`, then contributor completes PR workflow

## Tech Stack

- Next.js (App Router)
- TypeScript
- React
- File-backed hunt catalog (YAML from repository directories)

## Repository Structure

```text
prowl-hub/
├── AGENTS.md                         # Agent operating instructions
├── app/
│   ├── api/
│   │   └── hunts/
│   │       ├── route.ts              # JSON hunt catalog API
│   │       └── file/route.ts         # Secure hunt file download API
│   ├── globals.css                   # Global styling and design tokens
│   ├── layout.tsx                    # Root layout + fonts/metadata
│   └── page.tsx                      # Main hub page shell
├── components/
│   └── hub-shell.tsx                 # Browse/filter/preview/submit client logic
├── lib/
│   └── hunts.ts                      # Hunt loading, metadata extraction, safety guards
├── public/
│   └── assets/
│       └── brand/                    # Brand logos/mascot assets
├── auth/                             # Hunt templates
├── admin/                            # Hunt templates
├── e-commerce/                       # Hunt templates
├── saas/                             # Hunt templates
├── accessibility/                    # Hunt templates
└── .github/workflows/
    └── validate-submission.yml       # CI validation checks
```

## Local Development

### Prerequisites

- Node.js 20+ recommended
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Default local URL:

- `http://localhost:3003`

### Production Build

```bash
npm run build
npm run start
```

### Quality Checks

```bash
npm run lint
npm run typecheck
```

## API Endpoints

### `GET /api/hunts`

Returns the current published hunt catalog with metadata for UI rendering.

### `GET /api/hunts/file?path=<category/file.yml>`

Returns/downloads a hunt file if it is in an allowed published directory and has `.yml` extension.  
Path validation prevents directory traversal and non-template access.

## Verified Publishing Model

1. Contributor proposes a hunt through GitHub PR flow.
2. CI runs validation checks.
3. Maintainer reviews the content and security profile.
4. After approval + merge, the hunt is considered verified and appears in the hub.

There is intentionally **no direct publish API** that bypasses review.

## Contribution Workflow

### From the UI

Use the “Submit” form in the app:

- Fill hunt metadata
- Paste YAML
- Confirm checklist
- Click **Open Pull Request Flow**

This opens a prefilled GitHub file creation page in:

- `https://github.com/Prowl-qa/prowl-hub/new/main`

From there:

1. Commit to a branch
2. Open PR
3. Wait for review and merge

### Manual Contribution

1. Fork the repo
2. Add one `.yml` hunt file to the correct category folder
3. Open PR with clear description
4. Address CI and review feedback
5. Merge after approval

## Hunt Authoring Guidelines

- One hunt pattern per file
- Use generic selectors and labels
- Include clear comments and customization notes
- Never include secrets or credentials
- Keep files concise and maintainable
- Prefer realistic, reusable flows

## Security Model

Community hunts are treated as untrusted input.

Key safeguards:

- Review-first workflow
- Automated CI scanning
- URL/domain pattern inspection
- Credential-variable pattern inspection
- Strict file/path boundaries for downloadable templates

Security docs:

- [`SECURITY.md`](SECURITY.md)
- [`CLAUDE.md`](CLAUDE.md)
- [`AGENTS.md`](AGENTS.md)

## CI Validation Summary

`.github/workflows/validate-submission.yml` currently checks:

- Allowed file types only
- File size limits
- Suspicious credential-like variable patterns
- Suspicious URL/domain patterns
- YAML syntax parsing

## Using Templates Programmatically

Hunt templates can be discovered, pulled, and executed via the [ProwlQA CLI](https://github.com/Prowl-qa/prowl) and library API.

For the full integration guide — including `--json` structured output, JUnit reports, and the Node.js library API — see the [Agent Integration docs](https://docs.prowlqa.dev/agents).

## Brand Assets

Put brand files in:

- `public/assets/brand/`

Recommended filenames:

- `logo-mark.svg`
- `logo-wordmark.svg`
- `mascot.png`
- `social-card.png`

See:

- `public/assets/brand/README.md`

## Notes on Visibility and Trust

- All displayed hunts are intended to be verified.
- `New` is a freshness indicator, not a trust indicator.
- Unverified submissions should never be visible in public catalog results.

## License

Apache 2.0. See [LICENSE](LICENSE).
