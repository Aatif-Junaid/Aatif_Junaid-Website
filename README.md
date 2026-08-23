# aatifmulla.me

The public portfolio of Aatif Junaid Mulla, built with static HTML, CSS, and vanilla JavaScript and deployed from `main` through GitHub Pages.

Live site: [aatifmulla.me](https://aatifmulla.me/)

## Prerequisites

- Git
- PowerShell 7
- Python 3.10 or newer, or the bundled Codex Python runtime

No package installation, framework, bundler, runtime environment variables, or build step is required.

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
assets/logos/           Organization logos
scripts/                Deterministic repository validation
docs/                   Architecture, development, and runbooks
.github/                Pull-request checks and template
CNAME                   GitHub Pages custom-domain binding
resume.pdf              Public downloadable resume
sitemap.xml             Search-engine page inventory
```

## Canonical documentation

- [Architecture](docs/architecture.md)
- [Development and contribution workflow](docs/development.md)
- [Deployment runbook](docs/runbooks/deployment.md)
- [Cache-busting runbook](docs/runbooks/cache-busting.md)
- [Security-header runbook](docs/runbooks/security-headers.md)
- [Security reporting](SECURITY.md)
- [Change history](CHANGELOG.md)

The professional facts behind this public site are governed by the private `Aatif-professional-brain` repository. Public copy must remain consistent with its identity, evidence, constraints, and voice rules.
