# SEO and GA4 — 2026-09-13

## Local website changes (not deployed)

- Retained the descriptive Polish title, description, canonical `/cross-media/`, Open Graph and Twitter metadata; added explicit indexing/image-preview directives, site name and image alternative text.
- Expanded valid JSON-LD to linked WebPage and Service entities, matching the visible offer without inventing ratings, prices or endorsements.
- Added cross-media/ZPR terminology to the visible introduction and its English translation; refreshed the sitemap modification date.
- Kept a single Polish canonical URL. The English toggle is a convenience translation, not a separately indexed English landing page. No misleading hreflang links were added for a page without a server-rendered English counterpart.
- Reused one GA4 tag. `content_group` and `service_line` are set before the page view and on custom events. Form values and uploaded filenames are not included in custom analytics parameters. Existing consent handling and production-host gate remain unchanged.

## Live GA4 configuration

Property InnovaPM `509107239`, measurement ID `G-MVWSMYMWL1`.

- Verified `generate_lead` is already a key event and `first_visit` is not. No change was needed. Historical key-event totals are not corrected retroactively.
- Created and verified event-scoped custom dimensions `Linia biznesowa` → `service_line` and `Formularz` → `form_id`.
- Saved separate detail reports `InnovaPM — Strona główna` (report ID `15770273500`) and `InnovaPM — Cross-media` (report ID `15770207684`), based on Pages and screens, with page-path regex filters. Original report retained.
- Cross-media currently has no historical data. Deployment and real visitor activity are required before its report can populate.

## Verification and launch gate

`npm run check`, JavaScript syntax checks and `git diff --check` passed. Tests cover six URL classification cases, one tag/config per page, preview exclusion, consent and successful/failed form events. No form inquiry or synthetic production analytics event was sent.

Before claiming end-to-end completion: publish only after approval, then verify a real consented visit in GA4 Realtime/DebugView and allow processing for the standard reports. SEO indexing and rankings are not guaranteed by metadata changes.

## Official references

- Content groups: https://support.google.com/analytics/answer/11523339
- Detail reports: https://support.google.com/analytics/answer/13844077
- JavaScript SEO: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Localized versions: https://developers.google.com/search/docs/specialty/international/localized-versions
