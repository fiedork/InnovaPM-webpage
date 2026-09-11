# InnovaPM analytics standard

## Production scope

- GA4 property: `InnovaPM`
- Measurement ID: `G-MVWSMYMWL1`
- Production hostname: `innova.pm`
- `www.innova.pm` and the GitHub Pages URL must redirect to `https://innova.pm/`.
- Localhost, preview deployments and other domains must not load the GA4 library.

## Events

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
