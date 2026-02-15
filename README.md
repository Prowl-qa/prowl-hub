# Prowl Hub

Community-contributed hunt templates for [Prowl](https://github.com/michaeltookes/prowl) — the CLI-first QA testing tool for web applications.

<!-- ILLUSTRATION: Prowl raccoon mascot with "Community" badge -->

## What is this?

Prowl Hub is a collection of reusable hunt YAML files that you can copy into your `.prowl/hunts/` directory. Each template covers a common web testing pattern with detailed comments explaining the approach.

## Browse Templates

| Category | Template | Description |
|----------|----------|-------------|
| **Auth** | [oauth-google.yml](auth/oauth-google.yml) | Google OAuth login flow |
| **Auth** | [password-reset.yml](auth/password-reset.yml) | Forgot password and reset flow |
| **E-commerce** | [stripe-checkout.yml](e-commerce/stripe-checkout.yml) | Stripe payment integration |
| **Admin** | [data-table-filter.yml](admin/data-table-filter.yml) | Filter, sort, and paginate data tables |
| **SaaS** | [team-invite.yml](saas/team-invite.yml) | Invite team members via email |

## Using a Template

1. Browse the templates above or explore the directories
2. Copy the `.yml` file into your `.prowl/hunts/` directory
3. Update the selectors, URLs, and variables to match your app
4. Run it: `prowl run <hunt-name>`

```bash
# Example: copy and customize
curl -o .prowl/hunts/oauth-google.yml \
  https://raw.githubusercontent.com/michaeltookes/prowl-hub/main/auth/oauth-google.yml

# Edit the file to match your app's selectors and URLs
# Then run it
prowl run oauth-google
```

## Contributing

We welcome contributions! Submit your hunt templates as pull requests.

### Submission Guidelines

1. **One hunt per file** — each `.yml` file should cover a single test pattern
2. **Heavy comments** — explain what the hunt does, what to customize, and any gotchas
3. **Generic selectors** — use `data-testid`, placeholder text, or button labels that users can adapt
4. **Include a header comment** with: pattern name, description, and customization notes
5. **No secrets** — never include real credentials, API keys, or sensitive data. Use `{{VAR}}` syntax
6. **Valid YAML** — your hunt must pass Prowl's schema validation

### File Structure

Place your template in the appropriate category directory:

```
prowl-hub/
├── auth/           # Authentication patterns (OAuth, 2FA, password reset)
├── e-commerce/     # Shopping, payments, orders
├── admin/          # Admin panels, dashboards, data management
├── saas/           # SaaS-specific patterns (teams, billing, onboarding)
└── accessibility/  # Keyboard navigation, focus management, screen readers
```

### Pull Request Process

1. Fork this repository
2. Create your template in the appropriate directory
3. Ensure your YAML is valid: it should parse against Prowl's hunt schema
4. Open a pull request with a clear description of the pattern
5. Automated checks will validate your submission
6. A maintainer will review and merge

### What Gets Checked

Every submission is automatically validated:
- YAML syntax and Prowl schema compliance
- No suspicious URL patterns (only localhost, example.com, and known demo sites allowed)
- No hardcoded credentials or sensitive variable patterns
- File size under 50KB
- Only `.yml` and `.md` files accepted

## Security

Community submissions are untrusted input. All submissions go through:
1. **Automated CI validation** — schema checks, URL scanning, credential pattern detection
2. **Human maintainer review** — every PR requires manual approval before merge
3. **No auto-merge** — branch protection requires at least one approval

See [SECURITY.md](SECURITY.md) for our full security policy.

## License

Apache 2.0 — see [LICENSE](LICENSE)
