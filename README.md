# ScienceHub — Upgrade Guard AI P1

Upload-ready Upgrade Guard AI foundation.

## Included
- runtime audit
- manifest validation
- safe-path and duplicate checks
- SHA-256 helper
- upgrade queue
- user permission matrix: ALLOW / ASK_FIRST / DENY
- checkpoints
- rollback
- phase freeze guard (failed validation cannot freeze)
- audit/history log
- JSON Guard backup export
- ScienceHub bridge
- mobile-friendly Control Room

## Install in ScienceHub
Add:
```html
<link rel="stylesheet" href="./upgrade-guard-ai/core/upgrade-guard-ai.css">
<script src="./upgrade-guard-ai/core/upgrade-guard-ai.js"></script>
<script src="./upgrade-guard-ai/core/sciencehub-upgrade-bridge.js"></script>
```

Open `control-room.html` to inspect the Guard.

## Governance
The Guard can govern the runtime and files/data actually supplied to it. It does not obtain GitHub credentials, bypass permissions, or silently commit to a remote repository. Remote repository actions remain explicitly authorized external operations.
