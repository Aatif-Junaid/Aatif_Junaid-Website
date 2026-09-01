# Website instructions for Codex

Codex and Claude Code follow the same rules in this repository.

## Work safely

- This is plain HTML, CSS, and vanilla JavaScript. Edit source directly; there is no build step.
- Read `DESIGN.md` before visible design work and preserve its visual system.
- Read the relevant file in `docs/` before changing deployment, caching, security, or architecture.
- Run `pwsh -File scripts/check.ps1` before every push. Visible changes also require browser review near 1440px and 375px, with no console errors, horizontal scroll, or undersized mobile controls.
- Before updating a PR, fetch `origin/main` and rebase the branch onto it. The tracked pre-push hook enforces this so GitHub does not receive a branch that would conflict with a newer `main`.
- Update query-string versions whenever CSS, JavaScript, `resume.pdf`, or the social image changes. Follow `docs/runbooks/cache-busting.md`.
- Preserve semantic HTML, keyboard access, reduced-motion behavior, `CNAME`, HTTPS, and the verified domain.
- Never commit credentials or private professional-brain content. Public claims must be reviewed and public-safe.
- Direct validated pushes and force-pushes to `main` are allowed for zero-friction solo-development. Never delete `main`.
- Pin external Actions to full commit SHAs and keep workflow permissions minimal.
- Do not install Claude plugins, marketplace extensions, or MCP servers that are not already listed in .claude/settings.json. The .claude/hooks/session-start.sh file is the only approved provisioning path, and it may only contain TruffleHog and the Chrome DevTools MCP.

## Copy rules

- Use no em dashes and no empty buzzwords.
- Lead experience bullets with numbers.
- Spell the company `Aiseberg` and the product `Aisepedia`.
- Describe the enterprise deal with the documented Splunk/Cisco framing, never as “closed Cisco.”
- Describe POLITICO figures as reported on or analyzed, never owned.
- Keep positioning consistent with GTM and Product Growth unless the owner approves a repositioning.
- Cross-surface consistency: the resume, `index.html`, `case-studies.html`, and LinkedIn must show the identical role title, employer, and location. Diff them before finishing; do not let the resume and the timeline disagree.

AI-authored commit messages end with `Co-Authored-By: Codex <noreply@openai.com>`.
