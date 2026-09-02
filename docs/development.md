# Development

## Local setup

1. Install Git, PowerShell 7, and Python 3.10 or newer.
2. Clone the repository.
3. Enable the versioned pre-commit hook once:

   ```powershell
   git config core.hooksPath .githooks
   ```

4. Run the aggregate check:

   ```powershell
   pwsh -File scripts/check.ps1
   ```

5. Start a local server:

   ```powershell
   python -m http.server 8000
   ```

Opening HTML directly does not reproduce root-relative URLs on `404.html`; use the local server.

## Command reference

`pwsh -File scripts/check.ps1` is the canonical `check` command. It validates:

- required HTML structure and metadata;
- internal files, anchors, shared scripts, and Markdown links;
- cache-buster consistency;
- external-link safety and copy rules;
- JSON-LD dates and syntax;
- high-confidence credential patterns;
- tracked local or generated state;
- deploy-critical files and the exact `CNAME` value.

`python -m http.server 8000` is the canonical `dev` command. There is no `build`, `format`, or `clean` command because the repository has no generated build or formatter dependency.

## Agent tooling

`AGENTS.md` and `CLAUDE.md` route repository-maintenance work without loading private career context. Claude remote sessions additionally use `.claude/hooks/session-start.sh` only when `CLAUDE_CODE_REMOTE=true`. The hook builds pinned TruffleHog source and registers a pinned Chrome DevTools MCP release when the required browser is present. It does not provision marketplaces or third-party plugins.

Local Codex, Claude, and human development continue to use the prerequisites above. Changes to agent bootstrap behavior require the same review and validation as other executable repository code.

## Branches

`main` is the only long-lived branch. It is deployable and protected: GitHub blocks force-pushes and deletions. Site Integrity and TruffleHog run in CI on pushes and pull requests; direct validated pushes remain allowed.

For any non-trivial change, use a short-lived topic branch with this two-tier naming scheme:

```
<type>/<topic>/<short-description>
```

**Types** — what kind of change:

| Type | Use for |
|---|---|
| `feat` | New capability or page section |
| `fix` | Bug or regression correction |
| `content` | Copy, metrics, or public claim updates |
| `refactor` | Code reorganisation, no visible change |
| `docs` | Documentation only |
| `chore` | CI, hooks, scripts, config |

**Topics** — what domain it touches:

| Topic | Use for |
|---|---|
| `ui` | CSS, layout, typography, visual design |
| `motion` | Comet, canvas, animation |
| `content` | Copy, case studies, structured data, JSON-LD |
| `seo` | Meta tags, OG, sitemap, robots.txt, canonical |
| `infra` | CI, hooks, scripts, security controls |
| `perf` | Image compression, lazy loading, cache-busting |

**Examples:**

```
feat/ui/redesign-contact-section
fix/motion/comet-mobile-flicker
content/case-studies/update-design-partner-count
fix/seo/404-og-tags
chore/infra/activate-branch-protection
fix/perf/compress-og-image
```

Direct pushes to `main` are allowed for small, validated, single-file corrections. Use a branch when the change touches multiple files, requires review, or has a non-trivial rollback risk.

Delete branches after merging. Do not reuse merged branches.

## Public history hygiene

Commit messages and pull-request discussions are public. Describe the code or content correction at the level needed to review it, but do not include nonpublic contact information, unnecessary third-party relationship details, or private career context. Do not rewrite published history for routine corrections because copies may already exist outside the repository.

## Optional pull requests

Use a pull request when review or isolated testing is useful. Include a concise description, validation, and any deployment follow-up.

Visible changes require desktop and mobile review. CSS, JavaScript, resume, metadata, sitemap, or deployment changes must follow the relevant runbook.

## CI and formatting

The pre-commit hook and the read-only `Site integrity` CI job run the same PowerShell check. The separate `TruffleHog secrets` job scans commits for credentials. Do not skip hooks with `--no-verify`.

Use two-space indentation in HTML, CSS, YAML, and JavaScript. Preserve UTF-8, semantic HTML, accessible labels, reduced-motion behavior, and the writing rules enforced by `check_site.py`.
