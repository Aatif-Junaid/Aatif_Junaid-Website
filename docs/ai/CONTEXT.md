# AI context — aatifmulla.me

Full context for AI agents. Read `AI.md` at the repo root first for the quick-start summary.

## Owner

**Aatif Junaid Mulla** — GTM & Product Growth operator in San Francisco.
Current employer: Aiseberg (product: Aisepedia). Contact: aatif.recruitment@gmail.com.

## Purpose of this repository

A recruiter-facing portfolio. The site demonstrates GTM credibility through real, verified
work — a field program, design partner cohort, pipeline generation, enterprise deals, and
revenue operations. Every claim must be verifiable and already approved for public disclosure.

## Architecture in one paragraph

Static HTML + CSS + JS, no build step. GitHub Pages serves from `main` at `aatifmulla.me`.
Cloudflare handles DNS, TLS, HSTS, and production response headers (CSP is in the HTML for
local dev; Cloudflare overrides it in production). No backend, no forms, no package manager,
no environment variables.

## What the check suite validates (all 15 must pass)

1. HTML structure on 4 pages (lang, charset, viewport, title, description, h1, skip-link, CSP)
2. Internal file and anchor references resolve
3. Shared + page-specific scripts referenced correctly
4. No inline executable JavaScript (CSP compliance)
5. All `target="_blank"` links have `rel="noopener"`
6. `site.css` cache-buster consistent across pages
7. JavaScript cache-busters consistent
8. `resume.pdf` cache-buster consistent
9. Copy rules: no em dashes, no banned buzzwords
10. Canonical design-partner claims match across all public pages
11. JSON-LD parses and structured dates use ISO 8601 with timezone
12. No high-confidence secrets in tracked files
13. Markdown links in docs resolve to real files
14. No generated/local-state files tracked (no .pyc, .log, .DS_Store, etc.)
15. Deploy-critical files present and CNAME = `aatifmulla.me`

## Security controls in place

| Control | Location | Status |
|---|---|---|
| SSH commit signing | `~/.gitconfig` | ✅ Active |
| Pre-commit: site checks + TruffleHog staged scan | `.githooks/pre-commit` | ✅ Active (core.hooksPath set) |
| Pre-push: branch currency check | `.githooks/pre-push` | ✅ Active |
| CI: site integrity + TruffleHog full-history scan | `.github/workflows/security-scan.yml` | ✅ All Actions pinned to full SHA |
| Branch protection: no force-push, no deletion | GitHub API | ✅ Enforced on main |
| CI status checks | GitHub Actions | ✅ Site integrity and TruffleHog run on pushes and pull requests; direct validated pushes remain allowed |
| No collaborators except owner | GitHub | ✅ |
| No deploy keys, secrets, webhooks | GitHub | ✅ |
| Session-start hook: TruffleHog + Chrome DevTools MCP only | `.claude/hooks/session-start.sh` | ✅ Third-party plugins removed |

## What AI agents are and are not allowed to do

**Allowed:**
- Edit HTML, CSS, JS files following DESIGN.md and copy rules
- Add or update docs files
- Run `pwsh -File scripts/check.ps1` to validate changes
- Create and push topic branches following the branching convention
- Update cache-buster versions following `docs/runbooks/cache-busting.md`

**Not allowed without explicit owner approval:**
- Committing credentials, tokens, or private career data
- Force-pushing or deleting `main`
- Installing Claude plugins, MCP servers, or marketplace extensions not in `.claude/settings.json`
- Changing `CNAME`
- Disabling or skipping the check suite (`--no-verify`)
- Publishing confidential professional-brain content
- Rewriting published Git history
- Adding new external origins to the CSP without a matching functional need

## Branching convention

```
<type>/<topic>/<short-description>

Types:
  feat      New capability or page section
  fix       Bug or regression correction
  content   Copy, metrics, or public claim updates
  refactor  Code reorganisation, no visible change
  docs      Documentation only
  chore     CI, hooks, scripts, config

Topics:
  ui        CSS, layout, typography, visual design
  motion    Comet, canvas, animation
  content   Copy, case studies, structured data, JSON-LD
  seo       Meta tags, OG, sitemap, robots.txt, canonical
  infra     CI, hooks, scripts, security controls
  perf      Image compression, lazy loading, cache-busting

Examples:
  feat/ui/redesign-contact-section
  fix/motion/comet-mobile-flicker
  content/case-studies/update-design-partner-count
  fix/seo/404-og-tags
  chore/infra/activate-branch-protection
  fix/perf/compress-og-image
```

`main` is the only long-lived branch. Delete topic branches after merging.
