# Audit monitoring protocol

Personal-account repositories do not provide the organization audit log needed for enterprise monitoring. Until the repositories move to an organization, review the account security log, repository activity, Actions history, collaborators, keys, webhooks, apps, rulesets, Pages, DNS, and security alerts on the cadence below.

## Alert conditions

Treat these as high severity and investigate immediately:

- Repository deletion, transfer, archive, visibility, default-branch, Pages, custom-domain, DNS, or ruleset changes.
- New owners, admins, collaborators, deploy keys, webhooks, OAuth apps, GitHub Apps, PATs, SSH keys, or signing keys.
- Force-push attempts, branch deletion attempts, bypasses, disabled checks, workflow-permission escalation, or workflow edits that add write permissions.
- Secret-scanning or TruffleHog findings, push-protection bypasses, or critical dependency alerts.
- Authentication from a new country, unfamiliar session or device, repeated recovery attempts, anomalous clone volume, unexpected forks, or archive downloads.
- Failed or skipped immutable backups, changed retention, disabled Object Lock, KMS-policy changes, or checksum failures.

## Review procedure

1. Preserve the event, actor, timestamp, source IP when available, repository, target, and request identifier in immutable storage. Do not paste secret values into the incident record.
2. Confirm the change against an approved PR or owner-authorized maintenance record.
3. Revoke sessions, tokens, keys, or app access before editing repository history.
4. Freeze deployment, DNS, and access changes when account compromise is possible.
5. Compare `main`, tags, workflows, rulesets, Pages, DNS, Cloudflare, and backup settings with the last known-good snapshot.
6. Restore or revert through a reviewed PR. Do not force-push unless history contains sensitive data and the owner approves a tested recovery plan.
7. Record cause, scope, affected credentials, containment, recovery, and a dated follow-up action.

## Organization target state

After migration, enable the organization audit log and source IP disclosure where legally appropriate. Export logs at least daily to a SIEM and immutable archive. Alert on these categories: `repo`, `org`, `team`, `member`, `hook`, `integration`, `oauth_application`, `personal_access_token`, `ruleset`, `protected_branch`, `workflows`, `secret_scanning`, `code_scanning`, and `repository_vulnerability_alert`.

Retain searchable logs for at least one year and immutable raw exports for the same period as the incident-response requirement. Test one alert and one export restoration quarterly.
