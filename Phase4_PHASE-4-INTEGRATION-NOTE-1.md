# Phase 4 Integration Note

Phase 4 is intentionally additive.

Load order after the Phase 3 files:

- `core/phase4-data-guardian.js`
- `core/phase4-pwa-guardian.js`
- `core/phase4-bridge.js`

The bridge exposes `window.UpgradeGuardPhase4` with:

- `validate()`
- `freezeIfSafe()`
- `migrationDryRun(plan)`
- `createRestorePoint()`

Do not remove the Phase 3 regression guard. Phase 4 depends on it.
