# Prowl Hub

Community-contributed hunt templates for [Prowl](https://github.com/Prowl-qa/prowl) plus a web interface for discovering and submitting hunts.

## What is this?

Prowl Hub is a verified hunt library. End users can browse reusable YAML templates, preview raw content, and download hunts into `.prowl/hunts/`.

All visible hunts are verified: a hunt appears in the hub only after pull-request review and maintainer approval.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Brand Assets

Drop official assets into `public/assets/brand/`.

See `public/assets/brand/README.md` for recommended filenames.

## Browse Templates

| Category | Template | Description |
|----------|----------|-------------|
| **Auth** | [oauth-google.yml](auth/oauth-google.yml) | Google OAuth login flow |
| **Auth** | [password-reset.yml](auth/password-reset.yml) | Forgot password and reset flow |
| **E-commerce** | [stripe-checkout.yml](e-commerce/stripe-checkout.yml) | Stripe payment integration |
| **Admin** | [data-table-filter.yml](admin/data-table-filter.yml) | Filter, sort, and paginate data tables |
| **SaaS** | [team-invite.yml](saas/team-invite.yml) | Invite team members via email |

## Contributing

We welcome contributions through pull requests.

### Submission Guidelines

1. **One hunt per file** — each `.yml` file should cover a single test pattern.
2. **Heavy comments** — explain the pattern, customization points, and gotchas.
3. **Generic selectors** — prefer `data-testid`, placeholder text, or visible labels.
4. **No secrets** — never include credentials or sensitive data. Use `{{VAR}}` syntax.
5. **Valid YAML** — templates must parse and pass CI checks.

### Pull Request Process

1. Fork this repository.
2. Add your hunt file in the matching category directory.
3. Open a pull request with a clear summary.
4. CI checks run automatically.
5. A maintainer reviews and approves.
6. After merge, the hunt is published in the hub as verified.

### What Gets Checked

Every submission is automatically validated:
- YAML syntax
- Suspicious URL/domain usage
- Suspicious credential variable patterns
- File size under 50KB
- Allowed repository file types

## Project Structure

```text
prowl-hub/
├── app/             # Next.js app routes and pages
├── components/      # UI components
├── lib/             # Hunt catalog utilities
├── public/          # Brand assets and static files
├── auth/            # Authentication hunt templates
├── e-commerce/      # Commerce hunt templates
├── admin/           # Admin hunt templates
├── saas/            # SaaS hunt templates
└── accessibility/   # Accessibility hunt templates
```

## Security

Community submissions are untrusted input. Review and CI guardrails are required before publication.

See [SECURITY.md](SECURITY.md) for the full policy.

## License

Apache 2.0 — see [LICENSE](LICENSE).
