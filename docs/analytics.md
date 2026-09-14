# InnovaPM analytics standard

## Production scope

- GA4 property: `InnovaPM`
- Measurement ID: `G-MVWSMYMWL1`
- Production hostname: `innova.pm`
- `www.innova.pm` and the GitHub Pages URL must redirect to `https://innova.pm/`.
- Localhost, preview deployments and other domains must not load the GA4 library.

## Business-line split (prepared 2026-09-13)

One GA4 property and one Google tag serve both pages. Do not add a second tag or property: this preserves cross-page journeys and avoids duplicate page views.

| URL pathname | content_group | service_line | form_id |
| --- | --- | --- | --- |
| `/` or `/index.html` | Doradztwo | advisory | contact |
| `/cross-media/` and descendants | Cross-media | zpr_cross_media | cross_media |
| Other pages | Pozostale | other | — |

The shared tag sets grouping before its automatic page view and attaches it to every `innovaTrack` event, including mail and telephone clicks. Query parameters do not change the group. `content_group` is the built-in Content group dimension; no custom definition is needed. Register event-scoped `service_line` (Linia biznesowa) and `form_id` (Formularz).

Use page-path filters for separate reports: homepage `^/(index\\.html)?$`; cross-media `^/cross-media(/.*)?$`. They work on historical page-path data too. New custom dimensions only populate after deployment and processing; they do not backfill history. Users visiting both pages may appear in both reports, so their totals are not additive. Select `generate_lead` in the key-event metric when comparing genuine inquiries, rather than the historical all-key-events total.

Cross-media additionally sends `media_brand_click`, `form_start`, `form_submit_attempt` and `form_error`. These are diagnostic, not conversions. A successful Formspree response sends exactly one `generate_lead`; failures do not. Avoid summing automatic Enhanced Measurement form events with custom form events as distinct leads. No form values or uploaded filenames are added to analytics by the custom tracking code.

Reference: https://support.google.com/analytics/answer/11523339 and https://support.google.com/analytics/answer/13844077

## Event definitions

| Event | Meaning | Key event |
| --- | --- | --- |
| `generate_lead` | Contact form accepted successfully by Formspree | Yes |
| `form_start` | Visitor starts the contact form; collected by GA4 Enhanced Measurement | No |
| `cta_click` | Visitor selects a consultation CTA | No |
| `mailto_click` | Visitor selects the email contact link | No |
| `phone_click` | Visitor selects the telephone contact link | No |
| `linkedin_click` | Visitor selects an InnovaPM LinkedIn link | No |
| `qualify_lead` | Lead confirmed as qualified in the sales process | Yes, only after a CRM or server-side integration exists |

`first_visit`, clicks and form starts are diagnostic events, not business conversions. Event parameters must never contain names, email addresses, telephone numbers, message text or other personal data.

## UTM convention

Every external campaign link must include `utm_source`, `utm_medium` and `utm_campaign`. Use lowercase ASCII values and underscores; do not add UTMs to internal links.

Pattern:

```text
https://innova.pm/?utm_source=<source>&utm_medium=<medium>&utm_campaign=<yyyy-mm_offer_audience>&utm_content=<placement>
```

Examples:

```text
https://innova.pm/?utm_source=linkedin&utm_medium=organic_social&utm_campaign=2026-09_pmo_msp&utm_content=founder_post
https://innova.pm/?utm_source=newsletter&utm_medium=email&utm_campaign=2026-09_ai_audit&utm_content=primary_cta
```

Allowed `utm_medium` values:

- `organic_social`
- `paid_social`
- `email`
- `referral`
- `cpc`

Before publication, verify the final URL in a private browser window and confirm the source, medium and campaign in GA4 Realtime or DebugView.
