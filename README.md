# ScienceHub V84 — Final Functional Consolidation

Personal Study OS for Ashu.Ayansh.

## What this build fixes
- One active runtime (`js/app.js`); no legacy `app-step9.js` loading.
- Home Hero is a real visible image using the supplied studying-space artwork.
- Assets are organized under `assets/brand`, `assets/hero`, and `assets/companion`.
- UPMSP 2026–27 syllabus and PYQ 2020–2026 registry are retained.
- An embedded syllabus fallback makes the app usable even when browser `fetch()` of local JSON is blocked.
- Existing local study data is preserved; missing Class 11 syllabus tracking sections are added during migration.
- Subjects shows actual syllabus-section counts and tracked progress.
- Sukoon.Brain has persistent local conversation plus optional custom AI endpoint support.
- PWA/offline cache is V84-specific.

## Run
### GitHub Pages
Upload the contents of this folder to the root of the `Sciencehub` repository. Keep folders intact.

### Direct Android file opening
Open `index.html` in a browser. Core UI and syllabus fallback work without requiring the JSON fetch. Service-worker/PWA features require a web origin such as GitHub Pages.

## Important
This package does not contain a hidden ChatGPT model or secret API key. Sukoon's generative mode requires a compatible endpoint configured in Settings.
