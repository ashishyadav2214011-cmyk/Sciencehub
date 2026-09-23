# Integration note

The current ScienceHub repo already contains a root `upgrade-guard-ai.js` and `upgrade-guard-ai.css`. Phase 2 intentionally provides a hardened version plus a bridge under `core/` and a standalone Control Room.

Before replacing existing files, create a checkpoint/backup. If your repo's current `index.html` does not load `upgrade-guard-ai.js`, add the script before the bridge. The package does not overwrite the app runtime automatically.
