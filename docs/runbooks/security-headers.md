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
- A CSP fallback is enforced through an HTML meta tag. No CSP response header is currently present.

## Verification

```powershell
$response = Invoke-WebRequest -Uri 'https://aatifmulla.me/' -Method Head
$response.Headers
```

## Content Security Policy

Executable JavaScript and event handlers are externalized. JSON-LD remains inline as inert structured data, and the homepage has one inline `noscript` style fallback. Every HTML page currently enforces this policy through a meta tag:

```
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'self'; object-src 'none'
```

Promote the same policy to a Cloudflare response header after a report-only browser pass. Add `frame-ancestors 'self'` to the response-header version because browsers ignore that directive in a meta policy. Once the header is verified, the meta fallback may stay as defense in depth or be removed to keep one source of truth.

## GitHub Pages origin warning

On 2026-08-23, the Pages API reported `https_enforced: false` and an origin certificate in `bad_authz`, while Cloudflare served valid HTTPS and HSTS publicly. Treat this as an infrastructure warning. Do not change DNS, Cloudflare proxying, or certificate settings without confirming the intended origin and rollback path.
