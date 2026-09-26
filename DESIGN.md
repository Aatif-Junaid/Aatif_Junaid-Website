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
- blue accent (`#2f7fb3`) with accessible dark variants (`#226aa0`, `#1f5575`) and the label ink (`#063c82`, `--blue-ink`) for eyebrows and kickers
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

The type scale, on every page:

- Seven sizes: 14, 16, 18, 24, 32, 48 for case-page titles, and the name at `clamp(3rem, 6.2vw, 5.5rem)`. Every text element uses one of the `--text-*` tokens; nothing renders below 14px.
- Section titles are 32 at weight 500. Item titles (play titles, card titles, h3) are 24 at weight 600. Page titles are weight 500 everywhere.
- Body text never runs past about 70 characters: `max-width: 56ch` in Inter, whose `ch` is wide.
- One header on every page: the flat 68px bar. On phones it keeps only the page links, 14px on 44px targets; the in-page anchors are one scroll away, and there is no hamburger menu. One hero: left-aligned, kicker over title over lede over actions. The homepage geometry is the site's one signature.
- Two radii: 16px for cards, 8px for controls. Circles only for real markers and the headshot.
- One shadow, `--tile-shadow`, on cards only. Icons, buttons, chips, and node circles carry none. Metric tiles carry no icons.
- Two buttons: filled and outline, both 48px tall, 14px at weight 500. Carousel arrows and the comet toggle are quiet text controls.
- Motion budget: the comet is the one continuous movement on the site. Reveal-on-scroll runs once; hovers lift by a pixel or two. No sweeping gradients, travelling dots, spinning rings, or icon entrances.
- Experience cards are two columns on desktop: description and bullets on the left at about 75 characters, number tiles two-across on the right. A card without tiles runs its text the full card width, so the tile column does not read as an empty gap. Phones stack.

Labels and headings, on every page:

- Section headings are the plain word: Experience, Education, What I built, The build, The bet. A call to action keeps its sentence. No small label sits above a heading.
- No small-capitals labels anywhere except dates (`SEPT 2025 - PRESENT`). Metric labels, badges, node types, verb labels, and kickers are ordinary text at 0.78 to 0.95rem.
- No pills. A badge is plain text. The four verb pills under the How I work diagram and the Aiseberg loop are gone.
- No arrows on links, chips, or Show more controls. A caret stays only where it marks an expandable block (the Decision systems disclosure).
- The header nav reads the same on every page: sentence case, 0.875rem, weight 500.

## Layout and hierarchy

The general content container caps at 1280px with responsive 20-64px gutters and a 12-column desktop grid. The homepage hero box stays 1400px wide so the geometry does not move, but its text column sits on the same 1280px edge as every section. The signature Experience composition remains at its established 1380px width so the comet geometry does not shift. Desktop navigation is 68px tall and remains on one line. Mobile layouts collapse to one column below 768px and never depend on horizontal page scrolling.

Use a 4px base spacing system. Major sections use 48px vertical padding on desktop and 40px on phones, so two adjacent sections sit 96px apart on desktop and 80px apart on phones. Section headings sit 48px above their content on desktop and 32px above it on mobile. Education and capability groups use flat editorial groupings with hairlines. Work and Approach use a consistent two-column editorial matrix with shared rails and row rhythm, collapsing to one column on mobile.

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
- Photographs are rare and informational, never decorative: at most one per page, the full width of the content column, 16:9, with a one-line caption that names the date and the source. The event page carries the room; the homepage carries none.
- Metrics use large Playfair numerals, concise Inter labels, and tabular figures when comparison alignment matters.
- Navigation links use semantic anchors. The wordmark always returns to the homepage.
- Focus states are visible, high contrast, and unobscured by the sticky header.

## Motion

The comet communicates career progression and remains the site's signature motion. It rests level with the first Experience marker and 32px to its left, clear of the dot, so it is visible before anyone scrolls. From there it makes one compact left-hand hook, then returns into the first card and follows its spiraling movement behind the balanced, full-width Experience stack. Render it as one atmospheric form with a large luminous, borderless coma, a readable inner filament, a moderately long tapered blue stream, silky mist, and fine dust. The matter around it is dust and gas, never glitter: no bright points, no warm or gold flecks, nothing that twinkles. Each grain or wisp eases in, floats slowly in no preferred direction, and swells as it thins out, the way real matter disperses. While the comet moves, matter is dropped at the head and left behind on the recorded path; at rest it lies along the tail. It never streams, falls, or rains away from a head that is standing still. The head must remain visually dominant over the tail, and the distant wake should dissolve gradually without becoming a permanent route line. Every tail layer must follow one smoothed recorded trajectory with continuous curved joins, including during fast scrolling. A subtle low-frequency wave may soften the inner filament, but it must reconnect at both ends. Keep the canvas at full opacity and control softness inside the gradients and particles. Do not use a hard nucleus, outline, blown-out flare, dense particle cone, angular turn, or dotted trajectory. Keep its glide slow and its drawing work lightweight. Do not carry it onto other pages. Pause it automatically when off-screen, stop it for reduced-motion users, and do not add a visible pause control unless the owner requests one.

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

## The premium pass, 2026-09-16

The rules below came out of a full review against premium, minimal design. They override anything earlier in this file that disagrees.

- Gradient-filled text exists in exactly one place: the homepage name, with its glow. Every other title is solid, case-page titles in the deep blue.
- No boxes inside boxes. Inside a card, a metric is a Playfair number over a hairline, not a tile; the event strip is a row under a hairline; panelists are a comma list; the MBA gap entry sits between two hairlines. The playbook result blocks put the number on paper with a hairline above, never white on a gradient. The contact intro is plain text beside the photo.
- Motion: sections fade in, they do not rise, and nothing staggers. Every transition runs 0.2s ease. The comet is the one continuous movement.
- One spacing system on every page: 48px section padding on desktop, 40px on phones, including case pages. Play cards use 48px inside.
- Case pages read in a 1040px frame, footer included. An experience card without number tiles keeps one 56ch column; a two-column split was tried on 2026-09-16 and withdrawn. Education rows carry no shadow, and their points are 14px in the wider right column. A metric whose value is a word (Splunk, Peepal Centennial) keeps value over label at 24px. The case-page call to action is left-aligned: heading, buttons, and repository chips share one edge.
- Three blues do the work: deep blue for display and numbers, the accent blue for buttons, rails, and markers, link blue for links. Sky and sky-bright are tints. Navy and the mid blue are retired.
- Serif headings sit at weight 500; numbers and lead words keep 600. Italic Inter is not used for descriptions or footnotes; italics stay on the tagline, the testimonials, and the footer line.
- Letter-spacing has three values: -0.02em on display type, none on body, 0.06em on the small-capital dates. The hero name keeps its own. Line-height has three: 1.15 on headings, 1.4 on compact labels, 1.6 on body, with display type tighter.
- Every heading is left-aligned, the Toolkit included. Closing invitations may centre.
- The social image mirrors the hero: plain kicker, the gradient name, the italic tagline, the four verbs as plain words, and no letterspaced capitals. Regenerate it whenever the hero copy changes and bump its version.
- How I work is four numbered columns with no icons, followed by the one-line method note. There is no separate Approach section, and the homepage index of the two case pages is titled What I built, which echoes the hero line and pairs with How I work.
- Each fact appears once on a play: bullets carry the actions, the result block carries the number. Disclosure controls say Show, never See.

## The phone pass, 2026-09-16

Phones are not a scaled-down desktop. Below 768px:

- Body text is 16px with a 1.55 line-height, never 14px. Captions, footnotes, descriptions, and labels may be 14px. Section titles are 24px, role titles 18px, metric numbers 24px, the tagline 18px.
- Cards keep their frames and glass on phones, the same tiles as on desktop. A frameless version was tried on 2026-09-16 and withdrawn the same day: it read as plain. Only the backdrop blur is off below 768px, where the flat background gives it nothing to blur; the sticky header keeps its blur.
- Neighbouring targets sit at least 12px apart; every target is 44px, the header mark included.
- Fold rows use short labels from `data-short` and keep their thumbnails; the full title stays in the accessibility tree. The first play and both GTM tracks start open on phones (`data-phone-open`).
- The playbook index is five single-line rows. The toolkit keeps its four logo groups, two across. The contact action fills the width. Note labels read inline with their sentence.
- Metric labels are two or three words.

