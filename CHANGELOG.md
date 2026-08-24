# Changelog

All notable user-facing and repository-maintenance changes are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The site does not publish numbered releases.

## Unreleased

### Added

- Architecture, development, security, contribution, and focused operational runbooks.
- One local check shared by pre-commit and CI.
- Shared JavaScript assets.
- A website-specific design guide for consistent future visual work.
- A recruiter-friendly case-study index and two real Aisepedia artifact previews with links to the live pages.

### Changed

- Shared CSS moved to `assets/css/site.css`.
- Shared page behavior moved to `assets/js/site.js`.
- CI Actions are pinned to immutable commits.
- Repository automation is streamlined to site-integrity and TruffleHog checks, with direct validated pushes to `main`.
- Dormant AWS backup automation and solo-owner pull-request scaffolding were removed.
- Case Studies is now the homepage hero's primary action, and case-study navigation includes a Resume link.
- Case-study focus effects now use intersection observers, and continuous nonessential animation was removed.
- The experience comet keeps its existing particle treatment and now includes a desktop pause control.
- Public role titles now use `Senior Analyst, Revenue and Product` for POLITICO and `Business Strategy` for Peepal Consulting.
- The homepage comet now launches from the hero, follows an Experience-only flight corridor, and activates each experience at deliberate waypoints.
- Mobile experience cards now use lighter solid surfaces and a stable edge highlight instead of the desktop comet or large neon glow.
- Reduced-motion mode preserves a static comet composition, and the particle renderer reuses sprites and objects for smoother animation.

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
