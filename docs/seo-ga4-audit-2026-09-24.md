# SEO and GA4 audit — 2026-09-24 (rollout status as of 2026-09-25)

Read-only audit of `innova.pm` and `/cross-media/`, followed by the code changes it produced.
Sources of evidence: GA4 Data API, Search Console APIs, the served HTML, and a real browser
(headless Chrome over CDP, fresh profile — never the user profile).

No synthetic analytics events were sent, no form was submitted, and no GA4 setting was changed
through an API (the connected OAuth grant is read-only).

## What was measured

- GA4 property `509107239`, stream `G-MVWSMYMWL1`: channels, landing pages, events, custom
  parameters, hostnames, key events, data streams, custom dimensions.
- Search Console `https://innova.pm/` and `https://innovapm.pl/`: performance, countries,
  sitemaps, URL inspection for three addresses.
- Served HTML of all four pages, `robots.txt`, `sitemap.xml`, and the redirect behaviour of the
  `www` and `github.io` hostnames.

## Findings

1. Page context (`content_group`, `service_line`) reached only **0.7%** of page views — the
   parameters were passed to `config`, where they do not attach to later events.
2. The Google tag was present **only in `assets/analytics.js`**. Crawlers and the Search Console
   verification fetcher do not execute external JavaScript, so page-content verification methods
   failed twice with "no Google Analytics tracking code found on the site index page".
3. `/cross-media/` sat at **"Discovered – currently not indexed"** with no crawl at all.
4. `innovapm.pl` and `www.innovapm.pl` serve a **live copy of the site from Hostinger** that still
   loads the same measurement ID without consent mode — 6.9% of historic sessions came from those
   hosts. GA4 has no standard hostname dimension, so this traffic cannot be filtered in the UI
   without an exploration segment.
5. `www.innova.pm` generated sessions despite a 301 to the apex; the tail ends in August 2026 and
   is zero since.
6. Five planned event-scoped custom dimensions do not exist yet — only `Linia biznesowa`
   (`service_line`) and `Formularz` (`form_id`).
7. `purchase` remains marked as a key event. The `keyEvents`/`conversions` metrics in the Data API
   also return values for `first_visit`, so conversions must be counted on
   `eventName = generate_lead`.
8. Development traffic is still collected (`127.0.0.1`, `localhost`).
9. Search Console totals: 11 clicks / 264 impressions. Historically 61% of impressions came from
   Egypt; in the last 90 days it is 19 impressions, 0 clicks, average position 3.8 — the queries
   are anonymised, so no action is available.

## Changes shipped (deployed and verified)

| Commit | Change | Verification |
|---|---|---|
| `8092867` | Page context on every event via `gtag('set')` + an explicit `page_view`; `form_id` on both forms; one consent module; `404.html` with `noindex,follow`, `og:site_name`, robots directives; static no-JS fallback with an H1 and a link to `/cross-media/` | `npm run check` 3/3; rendered DOM has exactly one H1 and exactly one `page_view` per load carrying `content_group` and `service_line`; GA4 Realtime shows page_view : session_start = 1:1 |
| `d44e969` | Google tag moved **inline into the HTML** of all four pages (the loader in `analytics.js` stays as a fallback for cached pages), cache-buster bumped | literal tag found exactly once per page in the served HTML within ~60 s of the push |
| `b267c3f` | Google HTML verification file for the `www` property | HTTP 200 on the apex, reachable through the 301 under `www` |

Search Console work done by hand: `https://www.innova.pm/` **verified** 2026-09-25 with the HTML
file method (Google does follow the `www` → apex 301); sitemap resubmitted — 0 errors,
0 warnings; "Request indexing" for `/cross-media/` — Google crawled it within minutes
(`lastCrawlTime 2026-09-24T23:48Z`) and the state moved to **"Crawled – currently not indexed"**.
The page is not thin (25.9 kB HTML, 1×H1, 8×H2, 7.6 kB of text without JS, `robots: index,follow`),
so discovery and technical setup are settled; the remaining decision belongs to Google.

## Still open (owner: property owner — GA4 UI / Hostinger)

| Item | State measured 2026-09-25 | Where |
|---|---|---|
| Stream website URL | still `https://www.innova.pm` | Admin → Data collection → Data streams → InnovaPM → Website URL → `https://innova.pm` |
| Event-scoped custom dimensions | only `service_line`, `form_id` | Admin → Data display → Custom definitions → `brand_id`, `lead_type`, `cta_target`, `cta_location`, `link_context` |
| Key events | `purchase` still marked | Admin → Data display → Events |
| Event data retention | not exposed by the API | Admin → Data collection → Data retention → 14 months |
| Data filters | developer traffic still in the data | Admin → Data collection → Data filters (internal-IP + developer traffic) |
| Exploration segment | none | exclude the working hosts so reports are not polluted |
| `innovapm.pl` copy | still serving the tag without consent mode | Hostinger: at minimum remove the tag from the copy, ideally 301 to `innova.pm` |
| Google Signals / ad personalisation / data sharing | not decided | Admin |
| Domain property `sc-domain:innova.pm` | created, awaiting a DNS TXT record | measurement is already covered by the three verified prefix properties |

## Limits of this audit

- GA4 processing lag: standard reports trail Realtime by up to 24–48 h.
- The audit tooling could read but not write GA4 (read-only OAuth grant); any API write requires a
  service account or an OAuth client holding `analytics.edit`.
- Long-tail queries are anonymised by Search Console and cannot be recovered.
- Traffic figures are point-in-time API readings and change as data accumulates.
