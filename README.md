# ScienceHub V83 — Nail in the Coffin

This package is the clean visual/runtime consolidation of the ScienceHub build.

## What was fixed
- **The cluttered Home bug is removed:** `app-step9.js` is no longer loaded. The cleaner unified `app.js` runtime is the only app runtime.
- **Hero artwork is real and visible:** Home now has a dedicated, prominent hero image at `assets/hero/home-hero-personal.png`; it is not only a dark CSS background.
- **Assets are organized:** brand, hero, companion and data assets have dedicated folders.
- **Brand icon is rebuilt for clarity:** a simple vector atom + `SH` mark is used for the header, favicon and PWA icons.
- **Home hierarchy is explicit:** Hero → Search → Today’s Mission → Next Best Action → Snapshot → Quick Access → AI → Sukoon → Intelligence → Horizon → PCB.
- **Duplicate/legacy visual patches are removed from CSS.**
- **Service-worker cache is versioned to V83** so the old Home should not remain cached after reload/update.
- **UPMSP 2026–27 syllabus + PYQ registry remain included.**

## Folder layout
```
ScienceHub-Nail-in-Coffin-V83/
├─ index.html
├─ manifest.json
├─ sw.js
├─ css/style.css
├─ js/app.js
├─ assets/
│  ├─ brand/
│  │  ├─ sciencehub-icon.svg
│  │  ├─ sciencehub-icon-192.png
│  │  └─ sciencehub-icon-512.png
│  ├─ hero/home-hero-personal.png
│  └─ companion/sukoon-brain-figure.png
└─ data/
   ├─ upmsp_syllabus_2026_27.json
   └─ pyq_registry_2020_2026.json
```

## GitHub Pages
Upload the **contents of this folder** to the root of the `Sciencehub` repository. Keep the folders exactly as shown. Then open the repository's GitHub Pages URL.

## Important cache note
If an older deployment still appears, hard-refresh once and wait for the new service worker to activate. V83 uses a new cache name and a new script query string.

## Runtime note
This remains a local-first static/PWA build. No secret API key is embedded. Generative AI needs a separately configured backend/provider.
