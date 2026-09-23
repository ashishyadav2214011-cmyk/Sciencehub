# Upgrade Guard AI — Phase 3 tests

Phase 3 adds regression protection before freeze.

1. Load `index.html` and confirm `data-upgrade-guard-phase3=ready`.
2. Confirm a baseline is created on first run.
3. Run the regression guard.
4. Verify missing assets, duplicate script/style URLs, runtime globals, IndexedDB and service-worker API are reported.
5. Change a loaded asset and rerun: the impact report must list it as changed.
6. A failed regression run must block `freezeIfSafe`.
7. A passing run may be frozen by the user.
8. Verify Phase 2 checkpoint/rollback/history remain available.
