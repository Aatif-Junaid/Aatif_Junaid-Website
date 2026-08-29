# Changelog

All notable user-facing and repository-maintenance changes are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The site does not publish numbered releases.

## Unreleased

### Added

- Architecture, development, security, contribution, and focused operational runbooks.
- A remote-only Claude web-session hook that installs a pinned, checksum-verified PowerShell validation dependency.
- One local check shared by pre-commit and CI.
- Shared JavaScript assets.
- A website-specific design guide for consistent future visual work.
- A recruiter-friendly case-study index and two real Aisepedia artifact previews with links to the live pages.

### Changed

- Consolidated Quantum Corporation and EnCloudEn into one compact resume entry with explicit dates, giving the current Aisepedia work more space without obscuring the earlier chronology.
- Expanded the public resume with verified Aisepedia pipeline, design-partner, field-event, activation, and AI-automation evidence.
- Reconciled every public design-partner reference to 13 participants, including 8 senior participants, and removed stale company references from the public resume.
- Corrected the public resume titles to `Senior Analyst, Revenue and Product` and `Business Strategy`.
- Fixed local TruffleHog executable discovery when the scanner is available through `PATH`.
- Matched the browser theme color to the paper canvas and aligned case-study metadata with the approved GTM and Product Growth positioning.
- Made shared anchor scrolling respect reduced-motion preferences and added the missing keyboard skip link to the 404 page.
- Aligned the Go-to-market and Approach content into consistent two-column editorial grids with shared rails and responsive single-column fallbacks.
- Standardized typography, the 12-column grid, responsive spacing, radii, and shadows while preserving the blue atmosphere, luminous hero treatment, and comet rendering.
- Replaced repeated Education, toolkit, Work, and Approach tiles with flatter editorial groupings and removed the visible comet pause control.
- Smoothed the comet's turns, restored a moderately longer visible trail, and slowed both scroll-follow and ambient drift.
- Rebalanced the comet silhouette with a larger coma, a shorter tapered tail, and a quieter distant wake.
- Unified the comet's inner filament and atmospheric wake on one curved trajectory, added a restrained internal wave, and shortened stale particles after scroll reversals.
- Gave the Experience comet a brighter core, a defined inner trail, sparse breakaway sparks, and a compact opening U-turn without increasing its pace or mobile cost. Removed the Experience card's backdrop blur so those details remain legible behind the content.
- Restored the ambient comet's visibility with full canvas opacity, a soft core, and a moderately denser silky trail while retaining its slower pace.
- Reworked the Experience comet into a slower, softer ambient form with fewer particles and lower rendering cost.
- Defined the Experience comet with a shaded nucleus, controlled bloom, separate ion and dust tails, and granular dissipation.
- Shared CSS moved to `assets/css/site.css`.
- Shared page behavior moved to `assets/js/site.js`.
- CI Actions are pinned to immutable commits.
- Repository automation is streamlined to site-integrity and TruffleHog checks, with direct validated pushes to `main`.
- Dormant AWS backup automation and solo-owner pull-request scaffolding were removed.
- Case Studies is now the homepage hero's primary action, and case-study navigation includes a Resume link.
- Case-study focus effects now use intersection observers, and continuous nonessential animation was removed.
- The experience comet keeps its existing particle treatment and now includes a desktop pause control.
- The original spiraling comet motion and balanced Experience card stack were restored after design review.
- The experience comet now has frame-rate-independent movement, a directional particle plume, a tapered light trail, a more defined nucleus and aura, and localized canvas redraws while retaining its original spiral path.
- The comet now begins beside the first Experience marker, moves more slowly, and uses a compact white nucleus with separate blue ion and warm-white dust tails plus denser particles.
- Public role titles now use `Senior Analyst, Revenue and Product` for POLITICO and `Business Strategy` for Peepal Consulting.

## 2026-08-22

### Fixed

- Structured-data date values now use full ISO 8601 datetimes with timezones.

## 2026-08-21

### Changed

- Public GTM metrics and attribution were reconciled with the professional record.
- Public positioning was standardized around GTM and Product Growth.

## 2026-08-20

### Added

- Field-program article, richer structured data, and automated static checks.
