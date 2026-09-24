# Runbook: verify security headers

## Ownership

GitHub Pages cannot configure response headers from repository files. Cloudflare owns the public response-header policy.

## Privacy update, September 7, 2026

The privacy/accessibility branch hosts fonts locally and keeps only the cookieless Cloudflare Web Analytics beacon. All HTML meta policies now use:

```text
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src 'none'
```

On deployment, align the Cloudflare header with this policy and retain `frame-ancestors 'self'`. Keep automatic Web Analytics injection and Zaraz off; the beacon is loaded from the page source, so injection would only duplicate it. See the [audit record](../security/privacy-accessibility-audit.md).

## Preferred Sources button, September 24, 2026

`index.html` loads Google's Preferred Sources button, so that one page carries a wider policy than the other eight:

```text
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com https://news.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.gstatic.com; connect-src 'self' https://cloudflareinsights.com https://news.google.com; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src https://news.google.com
```

**The Cloudflare transform rule is the enforcing copy and still carries the old value.** A browser applies the meta policy and the response header together and honours whichever is stricter, so until the rule is updated the header keeps blocking `news.google.com` and the button does not render in production. Edit the existing "Modify response header" rule's `Content-Security-Policy` value to the policy above plus `frame-ancestors 'self'`, which a meta policy cannot express.

Edit the one existing rule rather than adding a second one scoped to `/`. Response header transform rules do carry their own filter expression and later rules overwrite earlier ones, so a per-path rule is possible, but it buys nothing here and introduces an ordering dependency: two rules setting the same header means behaviour depends on which runs last.

It buys nothing because the wider header is inert everywhere except the home page. Every other page carries its own September 8 meta policy, and the browser honours the stricter of header and meta, so `news.google.com` stays refused on `playbook.html` whatever the header says. The single exception is `case-studies.html`, a 12-line redirect stub with no meta policy and no content. That is also why adding the button to a second page later would need that page's meta widened too; changing Cloudflare alone would not be enough.

Three entries in the policy are belt-and-braces rather than load-bearing, confirmed by reading the live `publisher.js`: `www.gstatic.com` in `script-src` (the bundle uses gstatic only as an `<img>` source, which `img-src` already covers), `fonts.gstatic.com` in `font-src`, and `news.google.com` in `connect-src` (it talks to its iframe over `postMessage`, which CSP does not govern). They are kept so the header stays byte-identical to `index.html`'s meta plus `frame-ancestors`. Remove them from the meta and the header together or not at all; a header tighter than the meta creates two disagreeing sources of truth.

## Earlier verified state

Verified on 2026-08-23 at `https://aatifmulla.me/`. Superseded by the September 8, 2026 alignment above; kept for history.

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

Aligned and verified live on 2026-09-08. The Cloudflare `Content-Security-Policy` response header is set by the "Modify response header" transform rule and now matches the HTML policy exactly, plus `frame-ancestors 'self'` (browsers ignore `frame-ancestors` in a meta policy):

```text
default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'self'; base-uri 'self'; form-action 'none'; object-src 'none'; frame-src 'none'
```

`Strict-Transport-Security` is now `max-age=31536000; includeSubDomains`, set under SSL/TLS, Edge Certificates, HSTS. Preload stays off because it is impractical to reverse. `n8n.aatifmulla.me` was confirmed to serve HTTPS before subdomains were included.

Post-change verification on 2026-09-08: all four routes return the new header, the three local font files, all page images, and both scripts load, the console is clean, and the Experience comet paints. The site has no forms and no iframes, so `form-action 'none'` and `frame-src 'none'` block nothing it uses.

To change the policy later, edit that one transform rule's `Content-Security-Policy` value. Leave the other four static headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) alone.

## GitHub Pages domain verification

Verified on 2026-09-08. `aatifmulla.me` is a verified custom domain on the `Aatif-Junaid` account, so no other GitHub account can bind it. The API reports `protected_domain_state: verified` at `repos/Aatif-Junaid/Aatif_Junaid-Website/pages`.

Verification depends on a DNS TXT record that must stay in place permanently:

```text
_github-pages-challenge-Aatif-Junaid.aatifmulla.me
```

Do not delete that record when tidying DNS. Removing it lets the verification lapse. It is the only purpose that hostname serves, so it looks disposable and is not.

## GitHub Pages origin certificate

Resolved on 2026-08-23. GitHub Pages issued a replacement certificate for `aatifmulla.me`, and **Enforce HTTPS** is enabled in the repository's Pages settings. Cloudflare continues to proxy the four GitHub Pages apex records and the `www` CNAME. The separate `n8n` record remains DNS-only.

If GitHub reports a future certificate error, temporarily set only the four GitHub Pages apex records and the `www` CNAME to DNS-only, wait for the Pages certificate to finish provisioning, enable **Enforce HTTPS**, and restore proxying. Do not change the `n8n` record, remove the custom domain, or unpublish the Pages site as part of certificate renewal.
