# Audit monitoring

The site uses a small monitoring routine suited to one owner.

## Automated signals

- GitHub Actions reports site-integrity or credential-scan failures after a push.
- GitHub Pages reports deployment failures.
- UptimeRobot checks `https://aatifmulla.me/`; notification preferences are controlled in UptimeRobot.
- Cloudflare provides DNS, TLS, and security-event visibility.

## Review when alerted

1. Confirm the alert is genuine and note the time and affected service.
2. Check the latest GitHub commit, Actions run, Pages deployment, Cloudflare status, and live site.
3. If credentials may be exposed, revoke or rotate them before changing repository history.
4. Revert the smallest responsible change or restore the last known-good commit.
5. Record anything worth remembering in the private professional-brain repository without copying secrets.

## Occasional account review

Every few months, review GitHub sessions, recovery methods, SSH keys, OAuth apps, GitHub Apps, collaborators, deploy keys, webhooks, repository secrets, and branch rules. Remove anything unused or unfamiliar.
