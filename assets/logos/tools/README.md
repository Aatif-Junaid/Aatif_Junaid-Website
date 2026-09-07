# Tool marks

Brand marks used nominatively on `gtm-systems.html` to show which tools the work runs on. The files are the CC0 SVGs from Simple Icons (https://simpleicons.org), unmodified: a 24 by 24 viewbox with the brand fill on the root element.

## Rules

- Full color where a tool is named as a tool: the toolkit strip, the Proof row, the CTA repository links.
- Blue monochrome inside the engine diagram, the build timelines, the data cards, and the credential cards. That is the `--logo-blue` filter in `site.css`, which blacks the mark out and then applies the hero-proof tint.
- Tools without a Simple Icons mark (Salesforce, Tableau, Clay, Gong, Attio, Apollo.io, Excel, Power BI, PowerShell, Codex, LinkedIn) render as a two-letter monogram chip. Do not hand-draw those marks.
- Add a mark only for a tool Aatif has confirmed using. Sources: the profile README badges and the resume tools list.
- All images stay self-hosted. The CSP is `img-src 'self' data:`.
