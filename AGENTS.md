# Website instructions for AI agents

Codex and Claude Code follow this file. `CLAUDE.md` imports it and adds nothing but the Claude commit trailer.

## Work safely

- This is plain HTML, CSS, and vanilla JavaScript. Edit source directly; there is no build step.
- Read `DESIGN.md` before visible design work and preserve its visual system.
- Read the relevant file in `docs/` before changing deployment, caching, security, or architecture.
- Run `pwsh -File scripts/check.ps1` before every push. Visible changes also require browser review near 1440px and 375px, with no console errors, horizontal scroll, or undersized mobile controls.
- Before updating a PR, fetch `origin/main` and rebase the branch onto it. The tracked pre-push hook enforces this so GitHub does not receive a branch that would conflict with a newer `main`.
- Update query-string versions whenever CSS, JavaScript, `resume.pdf`, or the social image changes. Follow `docs/runbooks/cache-busting.md`.
- Preserve semantic HTML, keyboard access, reduced-motion behavior, `CNAME`, HTTPS, and the verified domain.
- Never commit credentials or private professional-brain content. Public claims must be reviewed and public-safe.
- `main` accepts pull requests only. The `protect-main` ruleset requires a pull request with the `Site integrity` and `TruffleHog secrets` checks passing on the current base, and blocks force-pushes and deletion. Never force-push or delete `main`; the owner merges.
- Pin external Actions to full commit SHAs and keep workflow permissions minimal.
- Do not install Claude plugins, marketplace extensions, or MCP servers that are not already listed in `.claude/settings.json`. The `.claude/hooks/session-start.sh` file is the only approved provisioning path, and it may only contain TruffleHog and the Chrome DevTools MCP.

## Career materials (resume, applications, interviews)

- Any request to write, tailor, review, or rewrite Aatif's resume, a cover letter, an application answer, or interview prep is governed by the `aatif-professional-brain` repository, never by a generic packaged skill a session's tool list happens to offer (for example one named `resume-diagnosis` or similar). A generic skill does not know the retired figures, the confidentiality gate, the canonical titles, or the natural-voice rules the brain enforces, and has already produced rejected drafts before.
- Before touching any career material: locate the `aatif-professional-brain` clone on disk, or clone `https://github.com/Aatif-Junaid/aatif-professional-brain` if it is not present. Read its `AGENTS.md` in full and follow the task-routing table there. For a resume or job description, that means running the matching skill under `.agents/skills/` (`tailor-resume`, `apply-to-role`, or `interview-and-offer`) end to end, not summarizing it and improvising.
- If the brain repository cannot be reached, say so explicitly and stop rather than producing career material from memory or a generic skill. A stale or ungoverned resume is worse than none.

## Copy rules

- Use no em dashes and no empty buzzwords.
- Lead experience bullets with numbers.
- Spell the company `Aiseberg` and the product `Aisepedia`.
- Describe the enterprise deal with the documented Splunk/Cisco framing, never as "closed Cisco."
- Describe POLITICO figures as reported on or analyzed, never owned.
- State dollar figures that measure Aatif's own work output. Band or omit figures that describe an employer's business size or performance. Attribution and disclosure are separate questions: a claim can be correctly attributed and still not be his to publish. Qualified pipeline he built (`$400K`, always framed as roughly or qualified, never generated and never booked), revenue he recovered (`$473K`), and figures his own analysis produced (`$2.6M` recoverable ACV, `$250K` monthly expansion) are stated. POLITICO's book size, net wallet retention, and bookings totals (`$125M`, `110.4%`, `$32.1M`) are never published; the book is described as nine-figure and the accounts as thousands. This is the brain's rule (`profile/constraints.md`, 2026-09-04 gate) and the site follows it exactly. Applies to the site, the resume, and LinkedIn alike.
- Keep positioning consistent with GTM and Product Growth unless the owner approves a repositioning.
- Cross-surface consistency: the resume, `index.html`, `playbook.html`, and LinkedIn must show the identical role title, employer, and location. Diff them before finishing; do not let the resume and the timeline disagree.

AI-authored commit messages end with a co-author trailer: `Co-Authored-By: Codex <noreply@openai.com>` for Codex, `Co-Authored-By: Claude <noreply@anthropic.com>` for Claude Code.
