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

## Branches

`main` is protected, deployable, and changed only through pull requests. Use short-lived branches with these prefixes:

- `feature/`
- `fix/`
- `docs/`
- `chore/`
- `refactor/`

Delete branches after merging and do not reuse merged branches.

## Pull requests

Use the repository template. Every pull request must include a concise description, why the change is needed, validation or a reason tests do not apply, links to relevant documents, and any deployment follow-up.

Visible changes require desktop and mobile review. CSS, JavaScript, resume, metadata, sitemap, or deployment changes must follow the relevant runbook.

## CI and formatting

The pre-commit hook and the read-only `static-checks` CI job run the same PowerShell check. CI also verifies `CNAME` and warns on assets over 500 KB. Do not skip hooks with `--no-verify`.

Use two-space indentation in HTML, CSS, YAML, and JavaScript. Preserve UTF-8, semantic HTML, accessible labels, reduced-motion behavior, and the writing rules enforced by `check_site.py`.
