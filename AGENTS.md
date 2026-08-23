# Operating instructions for Codex

Codex and Claude Code follow the same maintenance and security rules in this repository.

## Security non-negotiables

- Read `docs/security/README.md` before changing workflows, repository settings, access, credentials, DNS, Pages, Cloudflare, or dependencies.
- Never place a credential in source, command history, issues, pull requests, logs, or agent prompts. Use GitHub environments, OIDC, or an approved secret manager.
- Never weaken `main` rules, bypass a failed check, force-push, transfer, change visibility, archive, or delete this repository.
- Never add a collaborator, deploy key, webhook, GitHub App, OAuth app, or workflow permission without explicit owner approval and a documented purpose.
- Pin every external GitHub Action to a full 40-character commit SHA. Keep workflow permissions explicit and minimal.
- Run `./scripts/check.ps1` before proposing a change. The configured pre-commit hook also requires TruffleHog.
- Preserve `CNAME`, HTTPS, and the verified custom-domain configuration. Stop and report a policy conflict instead of working around it.
