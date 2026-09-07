# Website instructions for Claude Code

Claude Code and Codex follow the same rules in this repository.

## Work safely

- This is plain HTML, CSS, and vanilla JavaScript. Edit source directly; there is no build step.
- Read `DESIGN.md` before visible design work and preserve its visual system.
- Read the relevant file in `docs/` before changing deployment, caching, security, or architecture.
- Run `pwsh -File scripts/check.ps1` before every push. Visible changes also require browser review near 1440px and 375px, with no console errors, horizontal scroll, or undersized mobile controls.
- Update query-string versions whenever CSS, JavaScript, `resume.pdf`, or the social image changes. Follow `docs/runbooks/cache-busting.md`.
- Preserve semantic HTML, keyboard access, reduced-motion behavior, `CNAME`, HTTPS, and the verified domain.
- Never commit credentials or private professional-brain content. Public claims must be reviewed and public-safe.
- Never force-push or delete `main`. Direct validated pushes to `main` are allowed.
- Pin external Actions to full commit SHAs and keep workflow permissions minimal.
- Do not install Claude plugins, marketplace extensions, or MCP servers that are not already listed in .claude/settings.json. The .claude/hooks/session-start.sh file is the only approved provisioning path.

## Copy rules

- Use no em dashes and no empty buzzwords.
- Lead experience bullets with numbers.
- Spell the company `Aiseberg` and the product `Aisepedia`.
- Describe the enterprise deal with the documented Splunk/Cisco framing, never as “closed Cisco.”
- Describe POLITICO figures as reported on or analyzed, never owned.
- State dollar figures that measure Aatif's own work output. Band or omit figures that describe an employer's business size or performance. Attribution and disclosure are separate questions: a claim can be correctly attributed and still not be his to publish. Pipeline he generated (`$400K`), revenue he recovered (`$473K`), and figures his own analysis produced (`$2.6M` recoverable ACV, `$250K` monthly expansion) are stated. POLITICO's book size, net wallet retention, and bookings totals (`$125M`, `110.4%`, `$32.1M`) are never published; the book is described as nine-figure and the accounts as thousands. This is the brain's rule (`profile/constraints.md`, 2026-09-04 gate) and the site follows it exactly. Applies to the site, the resume, and LinkedIn alike.
- Keep positioning consistent with GTM and Product Growth unless the owner approves a repositioning.

AI-authored commit messages end with `Co-Authored-By: Claude <noreply@anthropic.com>`.
