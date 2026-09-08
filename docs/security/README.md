# Repository security baseline

This public repository serves a dependency-free static website. Its security controls should stay small, understandable, and useful to a solo owner.

## Required controls

- Keep the GitHub account protected with two-factor authentication and current recovery methods.
- Keep the `protect-main` ruleset active: pull requests only, `Site integrity` and `TruffleHog secrets` required, no force pushes, no deletion, no bypass actors.
- Keep GitHub secret scanning on with push protection and non-provider patterns enabled.
- Run `pwsh -File scripts/check.ps1` before every push.
- Keep the read-only `Site integrity` and `TruffleHog secrets` GitHub Actions jobs.
- Pin every third-party GitHub Action to a full 40-character commit SHA.
- Allow only GitHub-owned actions and `trufflesecurity/trufflehog` in repository Actions settings.
- Keep GitHub Pages HTTPS enforcement and the verified `aatifmulla.me` custom domain.
- Keep deploy keys, repository secrets, variables, and webhooks empty unless a specific feature needs one.
- Review collaborators and connected GitHub apps occasionally; remove anything unused or unfamiliar.

## Secrets and dependencies

Never commit credentials, tokens, private career records, or environment files. Treat any committed credential as compromised and rotate it immediately.

The site has no package manager or application dependencies. Dependabot watches only the pinned GitHub Actions in `.github/workflows` and opens a pull request when a pinned SHA has a newer release. Do not add CodeQL, Dependency Review, or cloud-backup workflows unless the architecture changes enough to justify them.

## Cloudflare and external monitoring

Cloudflare owns the production response headers, including CSP and HSTS. Keep the CSP narrow and add an external origin only when the site actually uses it. UptimeRobot provides the external availability check; notification preferences are managed there.

See [audit monitoring](audit-monitoring.md) for the short review routine.

See the [privacy, accessibility, and rights review](privacy-accessibility-audit.md) before adding tracking, forms, embeds, payments, or new third-party assets. It records unresolved permissions and the deployment checks for the policy pages.
