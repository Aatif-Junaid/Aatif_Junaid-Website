# Runbook: verify security headers

## Ownership

GitHub Pages cannot configure response headers from repository files. Cloudflare owns the public response-header policy.

## Current verified state

Verified on 2026-08-23 at `https://aatifmulla.me/`:

- `Strict-Transport-Security: max-age=15552000`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), camera=(), microphone=(), interest-cohort=()`
- No Content Security Policy is currently present.

## Verification

```powershell
$response = Invoke-WebRequest -Uri 'https://aatifmulla.me/' -Method Head
$response.Headers
```

## Content Security Policy follow-up

Executable homepage JavaScript is still inline, so a strict policy cannot remove `'unsafe-inline'` yet. Test any proposed policy in `Content-Security-Policy-Report-Only` first, load every page, inspect browser console violations, and only then enforce it.

## GitHub Pages origin warning

On 2026-08-23, the Pages API reported `https_enforced: false` and an origin certificate in `bad_authz`, while Cloudflare served valid HTTPS and HSTS publicly. Treat this as an infrastructure warning. Do not change DNS, Cloudflare proxying, or certificate settings without confirming the intended origin and rollback path.
