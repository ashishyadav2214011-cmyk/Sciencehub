# ScienceHub V102 Repair + PCB Smart Study Assets

## What this package fixes
- Restores the Home hero without deleting the existing Study OS runtime.
- Removes the duplicate old Hero/Mission presentation blocks while keeping their underlying routes/actions.
- Fixes broken asset paths caused by `assets/brand/...` and `assets/hero/...` references while the current repository stores those assets at the repository root.
- Fixes the manifest icon paths.
- Adds a network-first V102 service-worker cache with safe cache retirement.
- Adds responsive mobile layout fixes for the hero, cards and PCB asset library.
- Adds a PCB Smart Study Visual Asset Library.

## PCB visual assets included
### Biology
- DNA & Genetics
- Human Heart
- Human Body
- Cell
- Microscope
- Plant

### Physics
- Atom & Orbit
- Wave
- Circuit
- Force

### Chemistry
- Molecule
- Flask
- Periodic Table
- Beaker
- Reaction

These are study-navigation/visual-anchor assets, not medical advice or diagnostic tools.

## Important preservation rule
This is an **additive repair overlay**. It is designed to be merged into the existing ScienceHub repository, not used as a fresh replacement project.

Do NOT delete the existing `app.js`, `sciencehub-enhancements.js`, `sciencehub-v95-integration.js`, `sciencehub-v101-bridge.js`, syllabus/PYQ data, or existing images.

## Files to merge
- `index.html` — updated script/style references; based on the current repository entry structure.
- `manifest.json` — corrected root icon paths.
- `sw.js` — V102 cache/update-safe service worker.
- `sciencehub-v102-repair.js` — additive runtime repair + PCB library.
- `sciencehub-v102-repair.css` — responsive visual repair layer.
- `assets/pcb/*.svg` — 15 PCB study icons.
- `PCB_Visual_Reference_Live_and_Only_Icons.png` — visual reference sheet.

## Upload method
1. Download/extract this ZIP.
2. Open the existing `Sciencehub` repository.
3. Merge these files into the repository root.
4. Keep all existing ScienceHub files/assets that are not part of this package.
5. Upload/commit the merged files to `main`.
6. After GitHub Pages updates, hard-refresh the site or clear the site's old service-worker cache once if an older screen remains.

## Function-preservation audit
The repair layer does not replace the existing handlers. It continues to use the existing routes/actions such as:
- `shNav`
- `shStartNext`
- `shSukoon`
- `shAI`
- `shCamera`
- `shSpeak`
- `ScienceHubVoice`
- Study/Practice/Recall/Review/Progress/Space/Opportunities/World routes

The repair layer only changes presentation, asset paths, responsive behavior, and adds visual-asset interactions.

## Current repository issues found during inspection
1. `sciencehub-v101-bridge.js` references `./assets/hero/home-hero-character.png`, while the repository tree contains the hero artwork at the root (`home-hero-character.png` / `home-hero-personal.png`).
2. `app.js` references `./assets/brand/sukoon-brain-192.png`, while the repository tree contains the icon at the root (`sukoon-brain-192.png`).
3. The bridge references `./assets/brand/sciencehub-icon-512.png`, while the repository tree contains `sciencehub-icon-512.png` at the root.
4. `manifest.json` references `assets/brand/...` icons, while the current repository tree exposes root-level icon files.
5. The V101 bridge hides the old `.hero` but leaves the separate `.mission` block from `app.js`, creating the duplicated Today’s Mission hierarchy seen in the mobile screenshot.
6. The V101 hero grid is desktop-oriented and needed stronger mobile stacking/spacing rules.

## Verification performed on this package
- JavaScript syntax checked with `node --check` for `sciencehub-v102-repair.js` and `sw.js`.
- All 15 PCB SVG assets generated and file names matched to the runtime library.
- Service-worker references checked against the package's included repair assets.
