# Operating instructions for Claude Code

Claude Code and Codex follow the same maintenance and security rules in this repository.

## Security non-negotiables

- Read `docs/security/README.md` before changing workflows, repository settings, access, credentials, DNS, Pages, Cloudflare, or dependencies.
- Never place credentials in source, prompts, issues, pull requests, command output, or logs. Use GitHub environments, OIDC, or an approved secret manager.
- Never allow force-pushing or deletion of `main`, bypass a failed check, transfer, change visibility, archive, or delete this repository. Other rules require explicit owner approval to change.
- Never add collaborators, deploy keys, webhooks, apps, or write permissions without explicit owner approval and a documented purpose.
- Pin external GitHub Actions to full commit SHAs and run `./scripts/check.ps1` before proposing a change.
- Preserve `CNAME`, HTTPS, and the verified custom-domain configuration. Stop and report a policy conflict instead of working around it.
