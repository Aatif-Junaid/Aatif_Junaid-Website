# Privacy, accessibility, and rights review

Reviewed September 7, 2026. This record describes implementation and open questions, not a legal opinion or accessibility certification.

## Scope and decisions

The owner confirmed this is a personal portfolio with no payments or automated contact collection. Pages link to email, telephone, LinkedIn, GitHub, and other external destinations. There are no HTML forms, embedded frames, accounts, checkout, or visitor-to-CRM integration. Mentions of analytics and automation tools describe professional experience; those tools are not connected to visitors.

- Privacy, terms, and accessibility pages are linked in every footer, on the same chrome as the case pages. Cookie and refund pages were considered and dropped on 2026-09-07: the privacy page carries the cookie facts, and the terms page states that nothing is sold, so a refund page would only confuse a recruiter.
- No form-consent checkbox is needed because no form submits data. The contact area explains email use. Any future form needs accessible labels, validation and an adjacent collection notice. Marketing enrollment must be separate and optional; a privacy notice is not blanket consent.
- Cloudflare Web Analytics stays on the homepage by the owner's decision (2026-09-07): it is cookieless, uses no local storage or fingerprinting, and reports aggregates, so no consent control is needed. The privacy page names it. Fonts are now local, with their OFL notices. No advertising pixels, session replay, or browser storage remain in the source.
- Meta CSP restricts script, font, and connection sources to self plus the Cloudflare analytics host; frames, objects, and form submission are blocked. Cloudflare's response policy combines with this policy. Do not loosen it to activate tracking without reviewing notices and consent.
- Hosting/security still processes request information. No claim of zero data collection is made.
- All meaningful images already had alt text. Repeated decorative tool marks intentionally keep empty alt text.
- The workflow recording keeps its muted in-view autoplay and gains native controls, which satisfy the pause requirement; a viewer's own pause is respected when the clip scrolls back into view. The homepage footer has a small "Pause the comet" control, present only where the comet is; reduced-motion users never see it because the comet does not run for them. The comet rendering and velocity are unchanged.
- In-page navigation now moves keyboard focus to its target. Footer note opacity was removed to restore contrast. The "Full toolkit" link keeps its deliberately quiet style at the owner's request.

## Deployment follow-up

Cloudflare dashboard settings are independent of this repository. Web Analytics is loaded from the page source, so automatic injection should stay off to avoid a duplicate beacon; Zaraz stays off. Update the response CSP to match the meta policy plus `frame-ancestors 'self'`. Verify the deployed response and browser requests after merge. Do not disable security challenges or HTTPS to remove necessary security processing.

## Applicable-law assessment

California is the starting jurisdiction because the operator is based in San Francisco. CalOPPA can require a conspicuous privacy policy for commercial sites collecting California residents' personal information. The added policy describes collection categories, purposes, providers, contact requests, tracking signals, and changes. It does not fabricate an exact retention schedule.

CCPA applicability depends on business facts beyond this repository, including revenue and processing thresholds. The CPPA currently lists $26.625 million annual revenue, buying/selling/sharing information of 100,000 consumers or households, or deriving at least half of annual revenue from selling/sharing personal information. No evidence in this portfolio establishes that a threshold is met. Do not claim CCPA certification or add a nonfunctional sale opt-out button.

EU/UK rules require a separate scope assessment if services target those markets or visitor behavior is monitored. Worldwide availability alone is not the same as deliberate targeting. Optional storage/tracking should remain absent; if introduced, assess consent and block it until any required choice. Necessary security technology is distinct from optional analytics.

ADA Title III applicability depends on the business and service context. WCAG 2.2 AA is the engineering review target, not a guarantee that legal duties are fully satisfied. PDF tagging, screen-reader usability, video equivalence, and real assistive-technology testing need continuing review.

## Asset rights register

| Assets | Available evidence | Remaining action |
| --- | --- | --- |
| `assets/fonts/` | Google Fonts Inter and Playfair Display; local OFL license notices | Preserve notices with redistributed fonts |
| `assets/logos/tools/` | Existing README identifies Simple Icons, gilbarbara/logos, devicon, vscode-icons, and vendor favicons | Preserve collection licenses and attribution; collection licenses do not grant trademark endorsement rights |
| `assets/logos/tools/excel.svg` | README identifies vscode-icons, CC BY 4.0 | Credit vscode-icons with source and license; disclose styling transformations |
| Employer, university, PMI and vendor marks | Used to identify named organizations | Confirm each brand's usage conditions; nominative purpose alone is not a universal permission |
| `assets/evidence/*.jpg` | Screenshots of Aisepedia pages | Confirm permission to reproduce the pages, portraits and quotations, or replace with outbound links |
| `assets/headshot.jpg`, `og-image.jpg` | Existing portfolio assets | Confirm photographer/designer license; being the pictured person does not establish copyright ownership |
| AM mark, hero geometry, proof icons | Existing design assets; some supplied by the owner or generated during design work | Retain source/provenance and confirm any third-party inputs; do not assert exclusive rights without evidence |
| `assets/media/gtm-lifecycle-engine.mp4` and poster | Existing workflow demonstration | Confirm recording rights and review every frame for private records, credentials or third-party confidential material |
| Resume, experience, quotes and case studies | Existing public copy | Employer confidentiality agreements and testimonial permissions cannot be verified by code scanning |

The repository LICENSE now distinguishes original material from third-party rights. This does not retroactively clear any asset. Unverified permissions must be confirmed by the owner; no rights are inferred merely because a file is public. Keep private permission correspondence outside this public repository.

## Sources

- [California privacy-policy guidance](https://oag.ca.gov/privacy/business-privacy)
- [CPPA applicability FAQ](https://cppa.ca.gov/faq)
- [ICO storage/access exceptions](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [European Commission data protection guidance](https://commission.europa.eu/digital-life/protecting-your-data-and-privacy_en)
- [DOJ web accessibility guidance](https://www.ada.gov/resources/web-guidance/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [GitHub Pages data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Cloudflare security cookies](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/)
- [Copyright Office: obtaining permission](https://www.copyright.gov/circs/m10.pdf)

## Verification on September 7, 2026

- All 10 HTML pages reviewed at 1440px and 375px with axe-core 4.10.3, WCAG 2 A/AA, 2.1 A/AA and 2.2 AA rules: zero automated violations after fixes. Automated testing does not establish full conformance.
- No missing alt attributes, broken loaded images, horizontal document overflow, client-side cookies, browser storage, or external requests in the local page-load audit.
- Keyboard skip links focus main content. Pause/resume responds to keyboard activation. Video starts paused with controls. Reduced-motion testing hides the comet.
- Separate browser checks with CSP enforced: no console errors or external requests. Axe injection was allowed only in its test browser context; the shipped CSP was not weakened.
- All 16 repository check groups and security policy checks pass.

## Future changes

Revisit this record before adding forms, payments, analytics, embedded players, chat widgets, advertising, CRM connections, or mailing lists. Keep service-provider access limited to the data needed for the stated task. No automated connection from a private professional brain to this public site is authorized by this review.
