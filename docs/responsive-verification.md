# Responsive preview verification — 2026-09-13

Scope: local homepage and cross-media preview; no production deployment.

- Process introduction now uses normal document flow below 1024 px width or 900 px height. Sticky positioning remains on wide, tall screens.
- Anchor offsets, short-screen menu scrolling, mobile bottom-CTA clearance, tablet hero layout and narrow contact/header spacing are covered by `assets/responsive-layout.css`.
- The About section clips its horizontal entrance animation so its initial 30 px translation cannot widen the mobile document.

Browser checks at 320×640, 390×844, 768×1024, 850×700, 1024×768 and 1440×900:

- Homepage: scrolled through process cards; no intro/card overlap and no document horizontal overflow in all six viewports.
- Cross-media: navigated through channels, process and contact; no document horizontal overflow in all six viewports.
- Cross-media menu at 568×320: content 396 px, scrollable viewport 241 px; bottom brief link successfully clicked.
- Visually inspected homepage process at 850×700 and 390×844.

`npm run check` and `git diff --check` passed. Form tests are mocked; no inquiry was sent. Viewport emulation is not physical-device testing.
