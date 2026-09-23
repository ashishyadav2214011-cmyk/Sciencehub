# Phase 2 Test Matrix

1. Core script loads without syntax error.
2. Bridge sets `data-upgrade-guard=ready`.
3. `window.UpgradeGuardAI` exists.
4. Runtime audit checks document, storage, crypto, online state, service worker and IndexedDB.
5. Permission changes persist.
6. Upgrade queue accepts a pending item and records a decision.
7. Checkpoint is created before an upgrade.
8. Failed validation cannot freeze a phase.
9. Successful validation can freeze a phase.
10. Rollback restores a checkpoint state.
11. History persists across reload.
12. Backup export is generated locally.
13. No external credentials or remote mutation are used.

Freeze only after all applicable tests pass.
