# Upgrade Guard AI — Phase 4 Tests

Phase 4 extends Phase 3 with three guarded areas:

1. Data Guardian — localStorage integrity, ScienceHub DB presence, restore-point metadata, migration dry-run.
2. PWA Guardian — service-worker registration, Cache Storage visibility, asset/runtime environment checks.
3. Freeze Gate — Phase 4 cannot freeze unless regression + data + PWA validation pass.

## Required test order

Audit → repair (if needed) → test → compare → user approval where required → freeze.

## Migration rule

Destructive or schema-changing migrations are never silently applied by this layer. The dry-run records source/target versions, changes, and blockers first.

## Privacy boundary

The guard operates on the current ScienceHub browser/runtime. It does not receive GitHub credentials, commit remotely, or silently perform external actions.

## Technical basis

IndexedDB is transactional and supports offline structured data; service workers and Cache Storage provide the browser mechanisms used for offline PWA validation.
