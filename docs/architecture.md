# Architecture

## System design

The site is a dependency-free static website served by GitHub Pages from the repository root. Cloudflare fronts the custom domain.

```text
root HTML pages
  -> assets/css/site.css
  -> assets/js/site.js
  -> optional page-specific JavaScript
  -> local images, icons, and resume.pdf
        |
        v
GitHub Pages from main
        |
        v
Cloudflare and aatifmulla.me
```

## Component boundaries

| Component | Responsibility |
|---|---|
| Root HTML files | Deployable pages, metadata, JSON-LD, and page-specific copy |
| `assets/css/site.css` | Shared visual system and responsive behavior |
| `assets/js/site.js` | Footer year and shared in-page navigation behavior |
| `assets/js/case-studies.js` | Case-study focus behavior |
| `assets/js/homepage.js` | Homepage-only canvas, timeline, carousel, and reveal behavior |
| `assets/` media | Headshot and organization logos |
| Root media | Social image, icons, and public resume required at stable URLs |
| `scripts/check_site.py` | Canonical structural, safety, link, cache, and deploy validation |
| `.github/workflows/security-scan.yml` | Lightweight site-integrity and secret checks |

## Decisions

- Root HTML stays in place because GitHub Pages deploys `/` from `main`. Moving pages behind a build step would add risk without user value.
- CSS and reusable scripts live under `assets/` so static source has clear boundaries.
- Page-specific behavior remains separate from shared behavior so each page loads only the JavaScript it uses.
- Static query-string versions provide deterministic cache invalidation without a build system.
- No `.env.example` exists because the website consumes no environment variables or secrets.
- Response headers are controlled by Cloudflare, not by GitHub Pages source files.

## Data and publishing flow

Public professional claims originate in the private professional brain. A website change copies only reviewed, public-safe information. A push to `main` runs the integrity and secret checks and triggers GitHub Pages automatically.

## Related documentation

- [Development](development.md)
- [Deployment](runbooks/deployment.md)
- [Cache busting](runbooks/cache-busting.md)
- [Security headers](runbooks/security-headers.md)
