# Website design system

This file defines how aatifmulla.me should look and behave. Read it before visible design work. It complements `AGENTS.md` and `CLAUDE.md`; it does not replace the copy, security, cache, or deployment rules in those files.

## Design read

This is a recruiter-facing GTM and Product Growth portfolio. It should feel warm, editorial, evidence-led, and technically credible. The site is a targeted evolution of its existing identity, not a template or a brand imitation.

- Design variance: 6/10. Editorial composition with controlled asymmetry.
- Motion intensity: 6/10 for the comet, 3/10 elsewhere. Expressive signature motion inside a calm interface.
- Visual density: 5/10. Scannable proof with enough detail for a hiring manager.

The warm editorial hierarchy is informed by the Claude design analysis in Awesome DESIGN.md. Only general principles are adapted. Keep Aatif's blue palette, copy, assets, and original visual identity. Do not copy Anthropic colors, marks, illustrations, layouts, or proprietary typefaces.

## Visual character

The site combines a warm paper canvas with one cool blue accent. It should read like a well-edited professional profile: confident headlines, compact evidence, and generous space around important claims.

Preserve:

- warm paper surfaces (`#EEEDE8`, `#E7E3DA`)
- warm ink (`#26241f`) and muted text (`#6b655b`)
- blue accent (`#2f7fb3`) with accessible dark variants (`#226aa0`, `#1f5575`)
- Playfair Display for editorial headings and Inter for clear body text
- the comet timeline as the signature visual
- glass-like tiles as a web approximation, used only where elevation communicates grouping

Avoid adding new accent colors, dark theme bands, generic gradient text, excessive glow, decorative dots, fake product mockups, or repeated card grids.

## Typography and copy

Playfair Display carries names, section titles, case-study titles, quotes, and major numbers. Use only weights 500 and 600, with a 0.98-1.15 line-height and restrained negative tracking. Inter carries navigation, body copy, labels, and controls at weights 400, 500, and 600. Running text uses a 1.65 line-height and stays near 65 characters per line where practical. Labels use no more than 0.08em tracking unless a specific compact control requires less.

Copy is part of the design:

- use no em dashes
- prefer concrete language and active verbs
- make evidence easy to scan
- lead experience bullets with documented numbers
- preserve the approved Aiseberg, Aisepedia, Splunk/Cisco, and POLITICO framing
- keep positioning consistent with GTM and Product Growth

## Layout and hierarchy

The general content container caps at 1280px with responsive 20-64px gutters and a 12-column desktop grid. The signature Experience composition remains at its established 1380px width so the comet geometry does not shift. Desktop navigation is 68px tall and remains on one line. Mobile layouts collapse to one column below 768px and never depend on horizontal page scrolling.

Use a 4px base spacing system. Major sections use 112px vertical padding on desktop, 80px on tablet, and 64px on mobile. Section headings sit 48px above their content on desktop and 32px above it on mobile. Education, capability groups, work categories, and Approach use flat editorial groupings with hairlines and asymmetric column spans instead of repeated equal-card grids.

The hero is an editorial manifesto: one positioning statement, one proof-oriented primary action, and one secondary action. Contact and social links belong in the header or contact section, not as competing hero actions.

Case studies follow one repeatable evidence structure:

1. Problem
2. Decision
3. Messaging or artifact
4. Measured result
5. Attribution boundary

Use flat editorial bands, hairlines, and spacing before adding another tile. Real screenshots, documents, or public links are preferred over decorative illustrations. Never publish confidential or private-brain material.

## Components

- Buttons are pill-shaped. One filled blue button indicates the primary action; secondary actions use a light surface and visible border.
- Content tiles use a 16px radius, a restrained blue-tinted shadow, a translucent warm-white surface, and a solid fallback when transparency is reduced.
- Smaller proof modules and media use an 8px radius. Buttons and compact navigation destinations use a pill radius. Circular shapes are reserved for real markers and the headshot.
- Most content remains flat. Elevation is reserved for Experience cards, evidence artifacts, and the primary case-study invitation.
- Metrics use large Playfair numerals, concise Inter labels, and tabular figures when comparison alignment matters.
- Navigation links use semantic anchors. The wordmark always returns to the homepage.
- Focus states are visible, high contrast, and unobscured by the sticky header.

## Motion

The comet communicates career progression and remains the site's signature motion. It begins beside the first Experience marker, makes one compact left-hand hook, then returns into the first card and follows its spiraling movement behind the balanced, full-width Experience stack. Render it as one atmospheric form with a large luminous, borderless coma, a readable inner filament, a moderately long tapered blue stream, silky mist, and sparse warm fragments. The head must remain visually dominant over the tail, and the distant wake should dissolve gradually without becoming a permanent route line. Every tail layer must follow one smoothed recorded trajectory with continuous curved joins, including during fast scrolling. A subtle low-frequency wave may soften the inner filament, but it must reconnect at both ends. Keep the canvas at full opacity and control softness inside the gradients and particles. Do not use a hard nucleus, outline, blown-out flare, dense particle cone, angular turn, or dotted trajectory. Keep its glide slow and its drawing work lightweight. Do not carry it onto other pages. Pause it automatically when off-screen, stop it for reduced-motion users, and do not add a visible pause control unless the owner requests one.

Other motion supports hierarchy or feedback only:

- reveal content once as it enters the viewport
- animate only `transform` and `opacity`
- keep hover lift subtle
- avoid `transition: all`
- avoid continuous decorative motion competing with the comet
- disable or simplify all nonessential movement under `prefers-reduced-motion: reduce`

## Responsive, accessibility, and performance

- interactive targets are at least 44px on mobile
- section anchors account for the sticky header
- every meaningful image has alt text and explicit dimensions
- decorative visuals are hidden from assistive technology
- keyboard users can reach every action and always see focus
- browser zoom remains enabled
- no horizontal page scroll at 375px
- preserve semantic headings, skip links, and reduced-motion support
- keep the dependency-free HTML, CSS, and JavaScript architecture
- reserve layout space for media and lazy-load below-fold images

Every visible change must be checked near 1440px and 375px before deployment.
