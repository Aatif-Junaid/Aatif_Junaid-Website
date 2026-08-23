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
- `Content-Security-Policy` is enforced through both a Cloudflare response header and an HTML meta fallback.

## Verification

```powershell
$response = Invoke-WebRequest -Uri 'https://aatifmulla.me/' -Method Head
$response.Headers
```

## Content Security Policy

Executable JavaScript and event handlers are externalized. JSON-LD remains inline as inert structured data, and the homepage has one inline `noscript` style fallback. Cloudflare and every HTML page currently enforce this policy:

```
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'self'; object-src 'none'
```

The Cloudflare response-header version also includes `frame-ancestors 'self'`, which browsers ignore in a meta policy. The header and meta fallback were verified live with no browser console violations on 2026-08-23.

## GitHub Pages origin warning

On 2026-08-23, the Pages API reported `https_enforced: false` and an origin certificate in `bad_authz`, while Cloudflare served valid HTTPS and HSTS publicly. Treat this as an infrastructure warning. Do not change DNS, Cloudflare proxying, or certificate settings without confirming the intended origin and rollback path.
