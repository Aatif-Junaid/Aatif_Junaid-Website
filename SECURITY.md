# Security policy

## Reporting

Report a credential, privacy issue, unsafe professional claim, domain problem, or website vulnerability privately to `aatif.recruitment@gmail.com`. Do not include sensitive details in a public issue.

## Scope

The repository is a static public website with no authentication, forms backend, database, package dependencies, or runtime secrets. Security concerns still include accidental credentials, malicious links, unsafe browser behavior, Cloudflare configuration, DNS, and public disclosure of private professional information.

## Response

1. Stop deployment when a pull request is still open.
2. Revoke exposed credentials immediately when applicable.
3. Revert a deployed regression through a pull request; do not force-push `main`.
4. Verify GitHub Pages and the public Cloudflare response separately.

See the [deployment](docs/runbooks/deployment.md) and [security-header](docs/runbooks/security-headers.md) runbooks.
