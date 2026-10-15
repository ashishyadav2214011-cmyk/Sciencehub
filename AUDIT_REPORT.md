# ScienceHub repository audit — evidence-based snapshot

Date: 2026-10-15
Repository inspected: `ashishyadav2214011-cmyk/Sciencehub`
Default branch reported by GitHub: `main`
Repository visibility: public
Repository size reported by GitHub: 20,288 KB

## Critical finding: the deployed entry page does not mount the integrated Study OS

The live `main/index.html` fetched during the audit is a tiny “ScienceHub — Phase 2” page. It only writes to `localStorage` key `sciencehub_p2` and toggles `sciencehub_ai_allowed`. It does not load `style.css`, `app.js`, the V101 bridge, the Perspective module, or the V102 repair layer.

At the same time, the repository contains a much more developed `app.js` (V100 integrated Study OS), `manifest.json` describing a V102 Personal Study OS, a V101 bridge, a V102 repair script/CSS, and a service worker referring to these assets. This is a release/integration mismatch: the root entry page cannot expose the intended app because it does not load its runtime.

## Other confirmed or strongly evidenced findings

1. `app.js` seeds the Physics chapter “Laws of Motion” twice. The patch removes the duplicate seed entry. This only affects fresh databases with no existing chapters; it does not silently alter existing user data.
2. `sw.js` uses `cache.addAll([...CORE, ...PCB]).catch(()=>{})`. One missing path rejects the entire `addAll` operation, so the install may cache none of the listed assets. The replacement service worker caches assets independently and keeps missing optional assets from blocking the rest.
3. The V102 repair layer references `./assets/pcb/*.svg`. The audit directly attempted to fetch `assets/pcb/dna.svg` and received a 404. Other asset paths need a complete tree-level check; the current connector does not expose a full repository tree listing.
4. `manifest.json` starts at `./?v=102.0`, while the root HTML title/content say Phase 2 and the core `app.js` labels itself V100. These version labels are inconsistent and should be reconciled after the entry-page repair.
5. `README.md` describes the Upgrade Guard package as the Phase 2 upload package and mentions a Phase 3 Regression Guard, while the main page does not load the control-room files. The presence of files alone is not proof that a feature is wired up or working.
6. The repository currently has only the `main` branch reported by branch search. The GitHub connector returned HTTP 403 `Resource not accessible by integration` for branch creation and file writes. Therefore, this bundle has NOT been pushed to GitHub, and the live repository is unchanged by this audit.

## What this bundle changes when applied

- Replaces `index.html` with a mobile-first shell that loads the existing runtime and additive bridge/repair scripts in a defined order.
- Replaces `sw.js` with resilient per-file caching and a clear offline fallback.
- Supplies the 15 SVG PCB visual assets at the paths already referenced by the existing V102 repair layer.
- Includes `app.js.patch` to remove the duplicate Physics chapter seed.
- Preserves existing architecture/feature files rather than replacing the application with a new framework.

## Verification status

- Repository metadata and listed files were fetched from GitHub.
- Static source inspection confirmed the root-entry/runtime mismatch and duplicate seed.
- The old `assets/pcb/dna.svg` path returned 404.
- This environment did not provide a writable GitHub operation, a full repository tree API, or a browser runtime for end-to-end tests.
- Therefore: this is a repair bundle, not a claim that the live app has been fixed or that the complete repository has passed runtime testing.

## Apply order

1. Make a full download/backup of the current repository.
2. Overlay `index.html`, `sw.js`, and the `assets/pcb/` files from this bundle.
3. Apply `app.js.patch` to `app.js` (or remove the repeated `'Laws of Motion'` entry in the Physics seed list manually).
4. Commit the changes, then test the deployed page online and in airplane mode.
5. Verify study task creation, timer start/pause/stop, recall/revision, export/import, camera permissions, voice support, and localStorage persistence before calling the release complete.
