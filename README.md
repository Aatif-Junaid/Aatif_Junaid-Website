# aatifmulla.me

Aatif Junaid Mulla's public GTM and Product Growth portfolio. It presents verified work across zero-to-one enterprise GTM, product-growth instrumentation, lifecycle systems, and recurring-revenue analysis.

## Start here

- [Portfolio](https://aatifmulla.me/)
- [GTM and Product Growth case studies](https://aatifmulla.me/case-studies.html)
- [GTM systems](https://aatifmulla.me/gtm-systems.html)
- [First field-program write-up](https://aatifmulla.me/field-program.html)
- [Resume](https://aatifmulla.me/resume.pdf)
- [LinkedIn](https://www.linkedin.com/in/aatif-junaid)

## Selected proof

- Recruited 13 named design partners, including 8 at Director level or above, and helped land Aisepedia's first signed enterprise agreement with Splunk, a Cisco company, alongside the founder.
- Instrumented 11 Mixpanel events and 22 lifecycle KPIs, then used the resulting drop-off analysis to help cut early-stage abandonment 24%.
- Built recurring-revenue reporting across five POLITICO product lines and thousands of accounts, used weekly by the CEO, COO, and VP Finance, and surfaced $2.6M in recoverable ACV.

The website is built with static HTML, CSS, and vanilla JavaScript and deployed from `main` through GitHub Pages.

## Prerequisites

- Git
- PowerShell 7
- Python 3.10 or newer, or the bundled Codex Python runtime

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
case-studies.html       GTM case studies
field-program.html      First-person field-program article
404.html                Custom not-found page
assets/css/             Shared site styling
assets/js/              Shared and page-specific browser behavior
assets/evidence/        Public screenshots that substantiate case-study work
assets/logos/           Organization logos
DESIGN.md               Visual direction and interface rules
scripts/                Deterministic repository validation
docs/                   Architecture, development, and runbooks
.github/                Lightweight integrity and secret checks
.githooks/               Versioned local Git validation hooks
.claude/                 Remote Claude web-session validation bootstrap
CNAME                   GitHub Pages custom-domain binding
resume.pdf              Public downloadable resume
sitemap.xml             Search-engine page inventory
```

## Canonical documentation

- [Architecture](docs/architecture.md)
- [Design direction](DESIGN.md)
- [Development and contribution workflow](docs/development.md)
- [Deployment runbook](docs/runbooks/deployment.md)
- [Cache-busting runbook](docs/runbooks/cache-busting.md)
- [Security-header runbook](docs/runbooks/security-headers.md)
- [Security reporting](SECURITY.md)
- [Change history](CHANGELOG.md)

The professional facts behind this public site are governed by the private `Aatif-professional-brain` repository. Public copy must remain consistent with its identity, evidence, constraints, and voice rules.
