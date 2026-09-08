# Runbook: verify security headers

## Ownership

GitHub Pages cannot configure response headers from repository files. Cloudflare owns the public response-header policy.

## Privacy update, September 7, 2026

The privacy/accessibility branch hosts fonts locally and keeps only the cookieless Cloudflare Web Analytics beacon. All HTML meta policies now use:

```text
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src 'none'
```

On deployment, align the Cloudflare header with this policy and retain `frame-ancestors 'self'`. Keep automatic Web Analytics injection and Zaraz off; the beacon is loaded from the page source, so injection would only duplicate it. See the [audit record](../security/privacy-accessibility-audit.md).

## Previously verified state

Verified on 2026-08-23 at `https://aatifmulla.me/`:

- `Strict-Transport-Security: max-age=15552000`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), camera=(), microphone=(), interest-cohort=()`
- `Content-Security-Policy` is enforced through both a Cloudflare response header and an HTML meta fallback.

## Verification

```powershell
$response = Invoke-WebRequest -Uri 'https://aatifmulla.me/' -Method Head
$response.Headers
```

## Content Security Policy

Executable JavaScript and event handlers are externalized. JSON-LD remains inline as inert structured data, and the homepage has one inline `noscript` style fallback. Every HTML page enforces the policy in the privacy update above.

Checked on 2026-09-07: the Cloudflare response header still carries the older policy (Google Fonts origins, `form-action 'self'`, no `frame-src`). Browsers apply the stricter of the two, so the site is safe, but the header is stale. Replace the Cloudflare `Content-Security-Policy` header value with this exact string, which is the HTML policy plus `frame-ancestors 'self'` (browsers ignore `frame-ancestors` in a meta policy):

```text
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'self'; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src 'none'
```

At the same time raise `Strict-Transport-Security` to `max-age=31536000; includeSubDomains`, but only after confirming every subdomain, including `n8n`, serves HTTPS. Re-run the verification block and update the dates in this file.

## GitHub Pages origin certificate

Resolved on 2026-08-23. GitHub Pages issued a replacement certificate for `aatifmulla.me`, and **Enforce HTTPS** is enabled in the repository's Pages settings. Cloudflare continues to proxy the four GitHub Pages apex records and the `www` CNAME. The separate `n8n` record remains DNS-only.

If GitHub reports a future certificate error, temporarily set only the four GitHub Pages apex records and the `www` CNAME to DNS-only, wait for the Pages certificate to finish provisioning, enable **Enforce HTTPS**, and restore proxying. Do not change the `n8n` record, remove the custom domain, or unpublish the Pages site as part of certificate renewal.
