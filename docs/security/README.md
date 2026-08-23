# Repository security baseline

This is the required baseline for `Aatif_Junaid-Website` and `Aatif-professional-brain`. No repository is impenetrable: the account owner, recovery channels, GitHub, trusted reviewers, and backup account remain trust anchors. These controls reduce preventable risk and make destructive changes visible and recoverable.

## Current ownership constraint

Both repositories are owned by the personal account `Aatif-Junaid`. Keep the controls proportionate to a solo static site: protect the production branch from destructive changes, scan for secrets, and avoid automation that adds routine maintenance without a clear benefit.

## Exact repository checklist

### Settings > General

- Keep this website **Public**. Keep `Aatif-professional-brain` **Private**.
- Disable Wikis and Projects unless owner-approved. Keep Issues only when actively used.
- Enable **Allow squash merging** for optional pull requests.
- Enable **Automatically delete head branches**.
- Do not transfer, archive, change visibility, or delete. A personal account has no policy layer that can block its owner from these actions.

### Settings > Collaborators

- Remove every account without a current, documented need.
- Personal-account collaborators receive write access. Move to an organization before granting routine access that needs Read, Triage, Maintain, or Admin separation.
- Use GitHub Apps, not shared human or bot accounts, for automation.

### Settings > Actions > General

- Choose **Allow OWNER, and select non-OWNER, actions and reusable workflows**.
- Allow GitHub-created actions. Allow only `trufflesecurity/trufflehog` and `aws-actions/configure-aws-credentials` as third-party action repositories.
- Enable **Require actions to be pinned to a full-length commit SHA**.
- Workflow permissions: choose **Read repository contents and packages permissions**.
- Disable **Allow GitHub Actions to create and approve pull requests**.
- Require approval for outside-collaborator workflows. Never send write tokens or secrets to fork workflows.

### Settings > Rules > Rulesets > main

Keep an active branch ruleset targeting the default branch with:

- **Restrict deletions** enabled.
- **Block force pushes** enabled through the non-fast-forward rule.
- Direct pushes allowed for fast, validated maintenance.
- Pull requests optional when review or isolated testing is useful.

### Settings > Code security / Advanced Security

- Keep **Dependency graph**, **Dependabot alerts**, and **Dependabot security updates** available where useful.
- Keep Dependabot version-update pull requests disabled; this site has no application packages and pinned Action updates can be reviewed manually when needed.
- Enable **Secret scanning** and **Push protection**. Do not bypass a detected secret without a written incident record and immediate rotation.
- Keep the lightweight `Site integrity` and `TruffleHog secrets` jobs. CodeQL and Dependency Review are intentionally not used for this dependency-free static site.

### Settings > Pages, Environments, Deploy keys, and Webhooks

- Pages: enforce HTTPS and retain custom-domain verification for `aatifmulla.me`. Deploy only from protected `main` or a protected production environment.
- Production environment: require reviewer approval, limit deployment branches to `main`, and store no long-lived cloud key.
- Deploy keys: none by default. Write-enabled deploy keys are prohibited.
- Remove unknown or unused webhooks and apps. Record owner, permissions, event scope, and review date for every retained integration.

## Tokens, OAuth, and secrets

- Prefer GitHub Apps and OIDC. Fine-grained PATs are a last resort, limited to named repositories and required permissions, with a maximum 30-day lifetime.
- At Organization > Settings > Personal access tokens, block classic PATs, require approval for fine-grained PATs, and cap lifetime at 30 days.
- Quarterly review Authorized OAuth Apps, Authorized GitHub Apps, and Installed GitHub Apps. Revoke unused, unknown, broad, or publisher-unverified access.
- Repository variables contain only non-secret identifiers. Use environment secrets or an external secret manager for secrets.
- Treat any committed credential as compromised. Revoke or rotate first, remove it second, then decide whether history rewriting is necessary.

## Commit signing

Create a dedicated passphrase-protected Ed25519 SSH signing key, add the public key to GitHub as a Signing Key, and configure Git:

```powershell
git config --global gpg.format ssh
git config --global user.signingkey "$HOME/.ssh/id_ed25519_signing.pub"
git config --global commit.gpgsign true
git config --global tag.gpgSign true
```

Enable vigilant mode. Confirm `git log --show-signature -1` and GitHub's **Verified** badge before requiring signed commits.

## Supply-chain policy

- Pin every action to a full 40-character commit SHA and review release provenance, changed files, requested permissions, and maintainer history.
- New application dependencies require a committed lockfile and immutable install mode such as `npm ci` or `pip --require-hashes`.
- Remove deprecated, abandoned, typosquatted, or compromised packages. Disable the dependent release path when no maintained replacement exists.

## Auditing cadence

- Weekly: Actions failures, security alerts, collaborators, keys, webhooks, apps, Pages, DNS, and ruleset changes.
- Monthly: personal security log, sessions, SSH and signing keys, PATs, OAuth apps, recovery methods, and email addresses.
- Quarterly: least-privilege recertification and backup restore drill.
- After organization migration, export audit logs and alert on repository, organization, team, webhook, integration, OAuth, ruleset, token, and Actions-permission events.

See [backup and recovery](backup-and-recovery.md) for immutable storage and restoration, and [audit monitoring](audit-monitoring.md) for alert and response operations.
