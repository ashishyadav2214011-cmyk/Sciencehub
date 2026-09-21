# ScienceHub V101 — Restore + Integration Build

This build is based on the existing ScienceHub V100 integrated runtime, not a fresh replacement.

## Restored / integrated
- Existing V100 Study OS runtime preserved
- Legacy `sciencehub-v45` data migration into V100 DB without deleting the old DB
- User supplied Sukoon.Brain artwork as chat icon
- User supplied ScienceHub brain/SH artwork as static app icon
- Real-time 4-path electron/orbital animation around the ScienceHub icon; 360° every 3.5 seconds, continuous
- Home hero restored from the supplied reference design: greeting, mission, hero art, next action, revision, study-system cards
- Voice-to-text, text-to-voice, camera, Recall/Review toolbar
- Perspective layer retained
- Network-first versioned service worker
- PWA manifest updated

## Important
The PWA/launcher icon is necessarily a static PNG. The real-time revolving e-paths run inside the ScienceHub UI/header.
Camera capture does not claim OCR/image understanding.
No localStorage database is cleared by this update.

## Upload
Replace the root files in your GitHub Pages repository with the contents of this ZIP. Keep the `assets/` folder and all files together.
After deployment, open the Pages site once and allow the V101 update to load.
