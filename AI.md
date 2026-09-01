# AI.md — Quick-start for any AI agent working on this repo

Read this file first. It replaces reading AGENTS.md + CLAUDE.md + DESIGN.md separately.
See `docs/ai/CONTEXT.md` for the full context, and `docs/ai/file-map.md` for the annotated file map.

## What this repo is

A dependency-free static portfolio website for **Aatif Junaid Mulla** (GTM & Product Growth),
served by GitHub Pages at `https://aatifmulla.me`. No build step, no package manager,
no server-side code. Four HTML pages, one shared CSS file, three JS files.

## Cardinal rules (never violate these)

1. **No secrets, tokens, or private career data** in any tracked file — ever.
2. **Direct pushes to `main` are allowed**. This is a zero-friction solo-developer workflow. Force-pushes are permitted for fast-tracking hotfixes.
3. **No installing Claude plugins, marketplace extensions, or MCP servers** that are
   not already listed in `.claude/settings.json`. The session-start hook is the only
   approved provisioning path.
4. **Run `pwsh -File scripts/check.ps1` before every commit.** The pre-commit hook
   does this automatically if `core.hooksPath .githooks` is set.
5. **All 15 check groups must pass** before pushing to `main`.
6. **No em dashes. No buzzwords** (delve, unlock, unleash, elevate, transform, tapestry,
   beacon, game-chang, superpower, skyrocket, synergy).
7. **Lead every experience bullet with a number.**

## Files you must read before touching design, copy, or layout

| File | Purpose |
|---|---|
| `DESIGN.md` | Visual system, typography, layout, motion, accessibility rules |
| `AGENTS.md` | Full agent workflow, branching, commit, copy, and deploy rules |
| `CLAUDE.md` | Claude-specific rules (same substance, tighter format) |

## Files you must never edit without explicit owner approval

- `CNAME` (breaks the custom domain)
- `assets/css/site.css` cache-buster version (`?v=24`) — follow `docs/runbooks/cache-busting.md`
- `assets/js/*.js` cache-buster versions — same runbook
- `resume.pdf?v=...` cache-buster — same runbook
- `.github/workflows/security-scan.yml` — any change here must keep Actions pinned to full SHAs
- `.claude/hooks/session-start.sh` — only TruffleHog + Chrome DevTools MCP are approved

## Canonical facts (these must be consistent across all pages)

- Design partner cohort: **13 members, 8 at Director level or above**
- First enterprise deal: **Splunk (a Cisco company)**
- POLITICO figures: **reported and analyzed, never owned**
- Current employer: **Aiseberg** / product **Aisepedia**
- Role titles: `GTM & Product Growth` (Aisepedia) | `Senior Analyst, Revenue and Product` (POLITICO) | `Business Strategy` (Peepal)

## Git branching convention

```
<type>/<topic>/<short-description>

Types:   feat  fix  content  refactor  docs  chore
Topics:  ui    motion  content  seo  infra  perf
```

Examples: `feat/ui/redesign-contact-section`, `fix/seo/404-canonical`, `content/case-studies/update-metrics`

## Local dev commands

```powershell
git config core.hooksPath .githooks   # activate hooks (once per clone)
pwsh -File scripts/check.ps1         # run all 15 site checks
python -m http.server 8000           # local preview at http://localhost:8000
```

## Helpful entry points

- Architecture: `docs/architecture.md`
- Development: `docs/development.md`
- Branching: `docs/development.md#branches`
- Security: `docs/security/README.md`
- Deployment: `docs/runbooks/deployment.md`
- Cache busting: `docs/runbooks/cache-busting.md`
- Full AI context: `docs/ai/CONTEXT.md`
- File map: `docs/ai/file-map.md`
