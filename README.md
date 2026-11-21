# aatifmulla.me

Aatif Junaid Mulla's public portfolio for GTM & Enterprise Growth. It covers enterprise technology sales, customer discovery, revenue operations, and AI workflows with human review.

The repository is maintained as a public proof of both the site and the working practice behind it: small, reviewed changes, source-backed claims, and deployable static assets. That is the foundation.

## Start here

- [Portfolio](https://aatifmulla.me/)
- [Enterprise GTM: Selected Work](https://aatifmulla.me/playbook.html)
- [GTM Workflows: Research, Drafting and Human Review](https://aatifmulla.me/gtm-systems.html)
- [Building an Enterprise Field Program in San Francisco](https://aatifmulla.me/field-program.html)
- [Resume](https://aatifmulla.me/resume.pdf)
- [LinkedIn](https://www.linkedin.com/in/aatif-junaid)

## How to read the site

- Homepage: an introduction and three selected cases, followed by the career timeline, approach, toolkit, and credentials.
- Selected work: five enterprise GTM cases with context, responsibility, decisions, outcomes, and evidence.
- GTM workflows: a public n8n demonstration and a separate account of lifecycle work at Aiseberg.
- Field program: one first-person write-up of the PMM 2.0 event.
- Resume: one page, the same facts as the site.

## Selected proof

- Co-built a design partner program with 13 publicly named practitioners, eight at Director level or above, and helped land Aisepedia's first signed enterprise agreement with Splunk, a Cisco company, alongside the founder.
- Specified lifecycle tracking, including 11 Mixpanel events and 22 KPIs, and analyzed funnel drop-off. The guided onboarding changes cut early abandonment 24%.
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
assets/js/              site.js (shared), homepage.js (comet), playbook.js
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
