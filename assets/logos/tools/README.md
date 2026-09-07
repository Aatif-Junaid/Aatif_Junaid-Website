# Tool marks

Brand marks used nominatively on `gtm-systems.html` to show which tools the work runs on. Every tool gets a real mark; none are hand-drawn.

## Sources

| Files | Source | Notes |
| --- | --- | --- |
| `n8n`, `anthropic`, `gmail`, `hubspot`, `googlesheets`, `mixpanel`, `posthog`, `calendly`, `zapier`, `figma`, `githubactions`, `googlegemini`, `googleanalytics`, `jira`, `github`, `rss` (SVG) | Simple Icons, CC0 (https://simpleicons.org) | 24 by 24 viewbox, brand fill on the root element |
| `codex` (OpenAI mark), `salesforce`, `linkedin`, `tableau`, `powerbi` (SVG) | gilbarbara/logos, MIT collection (https://github.com/gilbarbara/logos) | Unmodified vendor artwork |
| `powershell` (SVG) | devicon, MIT (https://github.com/devicons/devicon) | |
| `excel` (SVG) | vscode-icons, CC BY 4.0 (https://github.com/vscode-icons/vscode-icons) | `file_type_excel.svg` |
| `apollo`, `clay`, `gong`, `attio` (PNG) | The vendors' own site favicons, 128 px (Attio 32 px) | Used at 18 px or smaller |

## Rules

- Full color where a tool is named as a tool: the toolkit table, the Proof row, the CTA repository links.
- Blue monochrome inside the engine diagram, the build timelines, the data cards, and the credential cards. That is the `--logo-blue` filter in `site.css`, which blacks the mark out and then applies the hero-proof tint. Activation nodes invert the mark to white on blue.
- Add a mark only for a tool Aatif has confirmed using. Sources: the profile README badges and the resume tools list.
- All images stay self-hosted. The CSP is `img-src 'self' data:`.
