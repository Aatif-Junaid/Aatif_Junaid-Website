# Repository security baseline

This is the required baseline for `Aatif_Junaid-Website` and `Aatif-professional-brain`. No repository is impenetrable: the account owner, recovery channels, GitHub, trusted reviewers, and backup account remain trust anchors. These controls reduce preventable risk and make destructive changes visible and recoverable.

## Current ownership constraint

Both repositories are owned by the personal account `Aatif-Junaid`. A personal repository has only owner and collaborator access. It cannot enforce organization-wide 2FA, granular Admin/Maintain/Write/Read roles, organization PAT policy, an organization audit log, custom repository roles, or a two-person owner model.

For the requested enterprise posture, create a GitHub organization, add at least two hardware-key-protected owners, transfer both repositories to it, and apply this baseline at organization level. Until then, add no collaborator without a current need and remove access when the work ends.

## Exact repository checklist

### Settings > General

- Keep this website **Public**. Keep `Aatif-professional-brain` **Private**.
- Disable Wikis and Projects unless owner-approved. Keep Issues only when actively used.
- Enable **Allow squash merging**. Disable merge commits and rebase merging so `main` receives one reviewable, GitHub-signed commit per PR.
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

Create an active branch ruleset named `main-protection` targeting the default branch, with no bypass actors.

- Enable **Restrict deletions**, **Require a pull request before merging**, **Require linear history**, and **Require conversation resolution before merging**.
- Set required approvals to **1** after adding a second trusted reviewer. Use **2** for workflows, access, `CODEOWNERS`, backup, security policy, DNS, Pages, or Cloudflare changes.
- Enable **Dismiss stale pull request approvals when new commits are pushed**, **Require approval of the most recent reviewable push**, and Code Owner review only after `.github/CODEOWNERS` includes a second trusted reviewer.
- Require status checks, require the branch to be up to date, and require `static-checks`, `Security policy`, and `TruffleHog secrets` after those security checks have completed successfully once.
- Enable **Require signed commits** after the open hardening PR is squash-merged by its author or rewritten with verified signatures.
- Disable force pushes and use no owner bypass.

A PR author cannot approve their own PR. Required reviews must remain at zero until a second trusted reviewer exists or the repository will be locked against legitimate changes.

### Settings > Code security / Advanced Security

- Enable **Dependency graph**, **Dependabot alerts**, **Dependabot security updates**, and **Grouped security updates**.
- Enable **Secret scanning** and **Push protection**. Do not bypass a detected secret without a written incident record and immediate rotation.
- Use the committed advanced CodeQL workflow for JavaScript and Python. Do not enable CodeQL default setup at the same time.
- The private professional brain needs an organization with GitHub Secret Protection and GitHub Code Security licensing before equivalent GitHub-native controls can run there. TruffleHog remains required in both repositories.

### Settings > Pages, Environments, Deploy keys, and Webhooks

- Pages: enforce HTTPS and retain custom-domain verification for `aatifmulla.me`. Deploy only from protected `main` or a protected production environment.
- Production environment: require reviewer approval, limit deployment branches to `main`, and store no long-lived cloud key.
- Deploy keys: none by default. Write-enabled deploy keys are prohibited.
- Remove unknown or unused webhooks and apps. Record owner, permissions, event scope, and review date for every retained integration.

## Identity and access after organization migration

| Role | Boundary |
| --- | --- |
| Owner/Admin | Two named break-glass custodians only; hardware keys; security and recovery administration. |
| Maintain | Repository operations; no access, security, visibility, transfer, or deletion authority. |
| Write | Feature branches and PR reviews only; no direct `main` changes or settings administration. |
| Triage/Read | Issue or review work and read-only access; no code or workflow writes. |

- Organization > Settings > Authentication security: require 2FA for everyone and enable **Only allow secure two-factor methods**. Use passkeys, hardware keys, authenticator apps, or GitHub Mobile, not SMS alone.
- Set organization base permission to None and grant access through teams.
- Disable repository creation, deletion, transfer, and visibility changes for members. Reserve them to organization owners.
- Keep two owners with two hardware keys each and offline recovery codes stored separately.

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

- Dependabot opens weekly GitHub Action updates. Never auto-merge a major update.
- Pin every action to a full 40-character commit SHA and review release provenance, changed files, requested permissions, and maintainer history.
- New application dependencies require a committed lockfile and immutable install mode such as `npm ci` or `pip --require-hashes`.
- Remove deprecated, abandoned, typosquatted, or compromised packages. Disable the dependent release path when no maintained replacement exists.

## Auditing cadence

- Weekly: Actions failures, security alerts, Dependabot, collaborators, keys, webhooks, apps, Pages, DNS, and ruleset changes.
- Monthly: personal security log, sessions, SSH and signing keys, PATs, OAuth apps, recovery methods, and email addresses.
- Quarterly: least-privilege recertification and backup restore drill.
- After organization migration, export audit logs and alert on repository, organization, team, webhook, integration, OAuth, ruleset, token, and Actions-permission events.

See [backup and recovery](backup-and-recovery.md) for immutable storage and restoration, and [audit monitoring](audit-monitoring.md) for alert and response operations.
