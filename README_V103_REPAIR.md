# ScienceHub V103 Repair Pack

This is a drop-in repair pack for the current GitHub repo.

## What it fixes
- Removes conflicting V101/V102 hero injection when the pack is loaded last.
- Adds usable original PCB study SVG assets.
- Corrects displayed practice score semantics to +2 / -1.
- Corrects asset path references for common root-level assets.
- Adds Biology/Physics/Chemistry smart-study visuals.
- Does not delete the existing database or replace existing modules.

## Required upload
1. Upload `sciencehub-v103-repair.js`
2. Upload `sciencehub-v103-repair.css`
3. Upload the `assets/pcb/` folder.
4. In `index.html`, load the CSS in `<head>` and JS after the existing scripts.

Important: direct GitHub write access was unavailable in this session, so this pack is upload-ready rather than already committed to the repository.
