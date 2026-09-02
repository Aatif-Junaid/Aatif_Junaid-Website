# File map — aatifmulla.me

Annotated map of every tracked file. Grouped by domain. Use this to orient quickly.

## Root — deployed pages (GitHub Pages serves these at `/`)

| File | Size | What it is | Touch with care |
|---|---|---|---|
| `index.html` | 43 KB | Homepage: hero, experience timeline, education, GTM samples, contact | Copy rules, cache-busters, canonical claim checks |
| `case-studies.html` | 25 KB | Five GTM case studies with evidence artifacts | Canonical design-partner claims, attribution boundaries |
| `field-program.html` | 14 KB | Long-form field event narrative (PMM 2.0) | Attribution boundary — no pipeline figures |
| `404.html` | 4 KB | 404 page with nav and CTAs | Canonical link, OG tags |

## Root — deployed static assets (must stay at these exact paths)

| File | What it is |
|---|---|
| `CNAME` | Custom domain record (`aatifmulla.me`) — never edit |
| `sitemap.xml` | Three-URL sitemap for search crawlers |
| `robots.txt` | Allow all + sitemap pointer |
| `resume.pdf` | Published one-page public resume |
| `og-image.jpg` | 2400×1260 social preview image (119 KB after compression) |
| `apple-touch-icon.png` | 180×180 iOS home screen icon |
| `favicon.ico` | Multi-size favicon |
| `favicon.svg` | SVG favicon |
| `favicon-32x32.png` | 32×32 favicon |
| `favicon-16x16.png` | 16×16 favicon |

## `assets/` — shared site resources

| File | What it is |
|---|---|
| `assets/css/site.css` | **Single CSS file for the entire site** (63 KB). Design tokens, layout, components, responsive, a11y, reduced-motion, print. Cache-buster: `?v=28` |
| `assets/js/site.js` | Shared JS: footer year, smooth scroll, logo-error hiding. Cache-buster: `?v=3` |
| `assets/js/homepage.js` | Homepage-only: experience comet (canvas), carousel, reveal observer. Cache-buster: `?v=17` |
| `assets/js/case-studies.js` | Case-study focus observer. Cache-buster: `?v=2` |
| `assets/headshot.jpg` | 24 KB contact section photo |
| `assets/logos/am-mark.svg` | AM wordmark SVG (header logo) |
| `assets/logos/hero-geometry.svg` | Decorative hero background geometry |
| `assets/logos/proof-*.svg/png` | Hero proof section icons (position, demand, activate, convert, launch, scale, strategy, system) |
| `assets/logos/acharya.png` | Acharya Institute logo (education section) |
| `assets/logos/american.png` | American University logo (education section) |
| `assets/logos/aisepedia.png` | Aisepedia logo (experience section) |
| `assets/logos/enclouden.png` | EnCloudEn logo (experience section) |
| `assets/logos/peepal.png` | Peepal Consulting logo (experience section) |
| `assets/logos/pmi.png` | PMI PMP logo (credentials section) |
| `assets/logos/politico.png` | POLITICO logo (experience section) |
| `assets/logos/quantum.svg` | Quantum Corporation logo (experience section) |
| `assets/evidence/design-partners-page.jpg` | Screenshot of design partner program page (104 KB) |
| `assets/evidence/pmm-2-event-page.jpg` | Screenshot of PMM 2.0 event page (83 KB) |

## `scripts/` — validation and security tooling

| File | What it is | When it runs |
|---|---|---|
| `scripts/check.ps1` | Entry point — finds Python, runs both check scripts | Pre-commit, CI, manual |
| `scripts/check_site.py` | 15-group site integrity checker | Via check.ps1 |
| `scripts/check_security_policy.py` | Security policy drift checker | Via check.ps1 |
| `scripts/security_scan.ps1` | TruffleHog staged-file scan | Pre-commit (via `.githooks/pre-commit`) |

## `docs/` — documentation

| File | What it is |
|---|---|
| `docs/architecture.md` | System design, component boundaries, data flow |
| `docs/development.md` | Local setup, commands, branching, CI, formatting |
| `docs/ai/CONTEXT.md` | **This file's companion** — full AI agent context |
| `docs/ai/file-map.md` | **This file** |
| `docs/runbooks/cache-busting.md` | How to increment cache-buster versions |
| `docs/runbooks/deployment.md` | GitHub Pages deployment steps |
| `docs/runbooks/security-headers.md` | CSP and Cloudflare header management |
| `docs/security/README.md` | Security baseline controls |
| `docs/security/audit-monitoring.md` | Review routine and alert response |

## Root documentation

| File | What it is |
|---|---|
| `AI.md` | Quick-start for AI agents (read first) |
| `AGENTS.md` | Full agent workflow rules |
| `CLAUDE.md` | Claude-specific rules |
| `DESIGN.md` | Complete visual design system |
| `README.md` | Human-facing project overview |
| `CHANGELOG.md` | Notable changes (Keep a Changelog format) |
| `CONTRIBUTING.md` | Contribution pointer |
| `SECURITY.md` | Vulnerability reporting policy |
| `LICENSE` | Repository license |

## `.github/` — CI

| File | What it is |
|---|---|
| `.github/workflows/security-scan.yml` | Two jobs: site-integrity (check.ps1) + TruffleHog. Actions pinned to full SHAs. |

## `.githooks/` — local git hooks (activated by `git config core.hooksPath .githooks`)

| File | When it runs |
|---|---|
| `.githooks/pre-commit` | Before every commit: runs check.ps1 + TruffleHog staged scan |
| `.githooks/pre-push` | Before push to non-main branch: verifies branch includes latest origin/main |

## `.claude/` — Claude remote session bootstrap

| File | What it is |
|---|---|
| `.claude/settings.json` | Registers the session-start hook |
| `.claude/hooks/session-start.sh` | Installs TruffleHog + Chrome DevTools MCP in ephemeral remote containers |

## `.gitattributes` / `.gitignore`

| File | What it is |
|---|---|
| `.gitattributes` | Line-ending and diff rules |
| `.gitignore` | Excludes OS files, editor state, Python cache, local dev output |
