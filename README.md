# aatifmulla.me

Aatif Junaid Mulla's public GTM and Product Growth portfolio. It presents verified work across zero-to-one enterprise GTM, product-growth instrumentation, lifecycle systems, and recurring-revenue analysis.

The repository is maintained as a public proof of both the site and the working practice behind it: small, reviewed changes, source-backed claims, and deployable static assets. That is the foundation.

## Start here

- [Portfolio](https://aatifmulla.me/)
- [Playbook, five GTM plays](https://aatifmulla.me/playbook.html)
- [GTM systems](https://aatifmulla.me/gtm-systems.html)
- [First field-program write-up](https://aatifmulla.me/field-program.html)
- [Resume](https://aatifmulla.me/resume.pdf)
- [LinkedIn](https://www.linkedin.com/in/aatif-junaid)

## How to read the site

- Homepage: the career timeline with the comet, one card per role, numbers first, then education, the core stack, and how I work. Two minutes.
- Playbook: five go-to-market plays, each with the problem, what I owned, and the number it moved, with evidence screenshots inline.
- GTM systems: the n8n lifecycle engine node by node, the toolkit behind it, and the sanitized export on GitHub.
- Field program: one first-person write-up of the PMM 2.0 event.
- Resume: one page, the same facts as the site.

## Selected proof

- Recruited 13 named design partners, including 8 at Director level or above, and helped land Aisepedia's first signed enterprise agreement with Splunk, a Cisco company, alongside the founder.
- Instrumented 11 Mixpanel events and 22 lifecycle KPIs, then used the resulting drop-off analysis to help cut early-stage abandonment 24%.
- Built recurring-revenue reporting across five POLITICO product lines and thousands of accounts, used weekly by the CEO, COO, and VP Finance, and surfaced $2.6M in recoverable ACV.

The website is built with static HTML, CSS, and vanilla JavaScript and deployed from `main` through GitHub Pages.

## Prerequisites

- Git
- PowerShell 7
- Python 3.10 or newer

The website itself requires no package installation, framework, bundler, runtime environment variables, or build step. Claude web sessions use a repository hook to install the PowerShell validation dependency in their temporary container.

## Quick start

```powershell
git clone https://github.com/Aatif-Junaid/Aatif_Junaid-Website.git
cd Aatif_Junaid-Website
pwsh -File scripts/check.ps1
python -m http.server 8000
```

Open `http://localhost:8000`.

## Core commands

| Task | Command |
|---|---|
| Validate the complete repository | `pwsh -File scripts/check.ps1` |
| Preview the site locally | `python -m http.server 8000` |

Detailed setup, branching, testing, and contribution rules live in [`docs/development.md`](docs/development.md).

## Repository map

```text
index.html              Homepage and professional timeline
playbook.html           Playbook, five GTM plays (case-studies.html redirects here)
gtm-systems.html        GTM systems write-up: the n8n lifecycle engine and toolkit
field-program.html      First-person field-program article
privacy.html, terms.html, accessibility.html
                        Policy pages, linked from every footer
404.html                Custom not-found page
assets/css/site.css     The one stylesheet: tokens, layout, components, phone blocks
assets/js/              site.js (shared), homepage.js (comet, carousel), playbook.js
assets/fonts/           Self-hosted Inter and Playfair Display subsets (OFL)
assets/evidence/        Public screenshots that substantiate the plays
assets/logos/           Organization and tool logos, the AM mark
assets/media/           GTM engine clip and poster
AGENTS.md               Rules for AI agents (CLAUDE.md imports it)
DESIGN.md               Visual direction and interface rules
SECURITY.md             How to report a problem
CHANGELOG.md            Notable changes
scripts/                Deterministic repository validation (check.ps1)
docs/                   Architecture, development, security, and runbooks
.github/                CI: site integrity, secret scan, Dependabot for Actions
.githooks/              Versioned local Git validation hooks
.claude/                Remote Claude web-session validation bootstrap
CNAME                   GitHub Pages custom-domain binding
resume.pdf              Public downloadable resume
og-image.jpg, favicon.* Share card and tab icons
sitemap.xml, robots.txt Search-engine page inventory
```

## Canonical documentation

- [Architecture](docs/architecture.md)
- [Rules for AI agents](AGENTS.md)
- [Design direction](DESIGN.md)
- [Development and contribution workflow](docs/development.md)
- [Deployment runbook](docs/runbooks/deployment.md)
- [Cache-busting runbook](docs/runbooks/cache-busting.md)
- [Security-header runbook](docs/runbooks/security-headers.md)
- [Security reporting](SECURITY.md)
- [Change history](CHANGELOG.md)

The professional facts behind this public site are governed by the private `Aatif-professional-brain` repository. Public copy must remain consistent with its identity, evidence, constraints, and voice rules.
