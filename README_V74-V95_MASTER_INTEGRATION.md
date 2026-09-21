# ScienceHub V74 → V95 Master Integration

This package is a **cumulative integration patch**, not a replacement for the existing V73/V93.1 core runtime.

## Goal
Connect the V74→V95 lineage into one clean V95 runtime while keeping the existing `app.js` and `style.css` as the core engine.

## Version organization
Every version has a named record under `versions/Vxx/VERSION.md`. Where the current repository still contains a version-specific changelog, that source is referenced instead of inventing missing historical details.

## V95 runtime changes
- `index.html` → V95 master entry point.
- `sciencehub-v95-integration.js` → cumulative schema/perspective bridge.
- `perspective.css` → responsive Perspective UI.
- `sw.js` → V95 cache namespace; old V94 cache is retired on activation.
- `manifest.json` → V95 metadata.
- Live ScienceHub icon files are included.
- Existing V94 voice/camera/recall enhancement is retained.

## Important
The repository's current V93.1 `app.js` remains the core runtime. This package deliberately does not fabricate missing V74–V81 source patches. The version folders preserve the lineage and the final V95 bridge connects the currently available functionality into one runtime.

## GitHub Pages
The publishing source must keep `index.html` at the top level of the selected source. GitHub Pages publishes changes from the configured branch/folder; therefore the final integration files must be placed into the repository's actual publishing root. See GitHub Pages documentation.
