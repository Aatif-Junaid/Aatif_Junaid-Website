# Runbook: deploy the website

## Current architecture

GitHub Pages deploys the repository root from protected `main`. Cloudflare serves `https://aatifmulla.me` in front of Pages.

```text
short-lived branch -> pull request -> static-checks -> merge -> Pages -> Cloudflare
```

## Before merging

1. Run `pwsh -File scripts/check.ps1`.
2. Follow the [cache-busting runbook](cache-busting.md) when CSS, JavaScript, the resume, or the social image changed.
3. Review visible changes on desktop and mobile through a local HTTP server.
4. Confirm no console error, missing request, horizontal overflow, or reduced-motion regression.
5. Confirm the pull request's `static-checks` job passes.

## Deployment

Merge the approved pull request. Do not push directly to `main`. GitHub Pages starts automatically and normally completes within several minutes.

## Verification

Check the Pages workflow and then request:

- `https://aatifmulla.me/`
- `https://aatifmulla.me/case-studies.html`
- `https://aatifmulla.me/field-program.html`
- `https://aatifmulla.me/robots.txt`
- `https://aatifmulla.me/sitemap.xml`

All should return HTTP 200. Confirm the changed asset has the expected cache version.

## Rollback

Revert the merged pull request in GitHub, validate the revert, and merge it through the same protected workflow. Do not force-push `main`.

## Escalation

- A failed `static-checks` job belongs to the pull request author.
- A failed Pages build belongs in GitHub Actions and Pages settings.
- A Pages success with a stale or unavailable public site requires Cloudflare cache, DNS, and certificate checks.
- Never delete or empty this repository; it is the production source.
