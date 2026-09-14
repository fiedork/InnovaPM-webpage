# Cross-media landing — implementation and verification

Date: 2026-09-13. Preview only; production has not been published.

Implemented in an isolated copy of the existing static website, based on commit `cf75cd9` from `/Users/fiedork/01-Work/InnovaPM/07-Webpage/InnovaPM-webpage`. Original checkout was clean and remains unchanged.

## Changes

- `cross-media/index.html`: full Polish landing, seven official brand logos, six channel cards, scenarios, process, FAQ and dedicated brief.
- `cross-media/cross-media.css`: responsive InnovaPM visual system, desktop/tablet/mobile layouts, keyboard focus and reduced motion.
- `cross-media/cross-media.js`: menu, scenario preselection, Formspree submission, success/error/timeout handling, duplicate guard, analytics events without PII and cookie preference controls.
- `cross-media/logos/`: seven original PNGs from official Grupa ZPR assets. See `cross-media-logo-sources.md`; artwork is displayed without recoloring or cropping. Source assets are monochrome variants.
- `sitemap.xml`: canonical cross-media route.
- `scripts/check-cross-media.mjs` and `package.json`: added focused checks to existing check command.

The new form reuses the verified existing endpoint `https://formspree.io/f/mnngrewp`, with `service_line=zpr_cross_media`. The existing production-only analytics gate and consent mechanism are preserved. Source/UTM persistence and CRM integration were not part of this implementation.

## Verification

- `npm run check`: existing site and analytics checks plus cross-media checks pass.
- `node --check cross-media/cross-media.js`: pass.
- UI at 390, 768 and 1440 px: no horizontal overflow; images loaded; mobile menu open/Escape, scenario preselection and native required-field validation verified.
- HTTP success, HTTP failure, network failure, timeout, duplicate submission guard, blocked local storage and analytics payload privacy: simulated tests pass; no actual Formspree submissions sent.
- Local assets, anchors, canonical and sitemap checked.
- 17 official external destinations returned HTTP 200. The old Architektura-murator destination timed out and was replaced by the verified official ZPR brand directory.

## Publication

Review the local preview first. Confirm brand-use conditions for ZPR logos before production publication, as requested in the approved plan. Merge/copy only the files listed above into the current production checkout after checking for newer changes; preserve existing user changes. No push, commit, DNS change, or production deployment was performed.

The preview form is functional: manually submitting a valid brief sends a real request. Automated verification never contacted Formspree.
