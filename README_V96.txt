# ScienceHub V96 — Cache + Local DB Migration Update

Based on the supplied local database (`schemaVersion: 15`, `appVersion: V78-FINAL`) and the current repository runtime.

## Fixes
- Preserves the existing local ScienceHub database.
- Moves the saved schema marker to **16** without clearing study data.
- Replaces cache-first runtime behavior with **network-first + cache fallback** for HTML/JS/CSS/JSON.
- Removes old ScienceHub Service Worker registrations and ScienceHub caches on first V96 boot.
- Adds query-versioning (`?v=96.0`) to the current runtime files.
- Keeps the existing V95 integration, Perspective layer, voice/camera/Recall tools, Sukoon.Brain and live icon.

## Upload
Replace these root files:
- `index.html`
- `sw.js`
- `manifest.json`

Add:
- `sciencehub-v96-repair.js`

Do **not** delete the existing `app.js`, `style.css`, assets, or V95 integration files.

## Important
This package does not recreate unknown historical V1–V78 source code. It is a current-runtime repair/update package based on the actual repository files inspected and the supplied V78/V15 local database.

## Expected result
After deployment, the local DB should report at least:
- `schemaVersion: 16`
- current runtime version marker
and the browser should stop being trapped by the old V95/V78 Service Worker cache.
