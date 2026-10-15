SCIENCEHUB.IO — ORDERED REPAIR PACKAGE
======================================

IMPORTANT
This is an ordered repair bundle, NOT a complete clone of the GitHub repository.
The GitHub connector rejected write operations (HTTP 403), so these changes have NOT been pushed live.
Back up/download the existing repository before applying any replacement.

FILE ORDER / APPLY ORDER
------------------------
01. index.html
    Replace the repository root index.html. This reconnects the app shell to the existing runtime files.
02. sw.js
    Replace the repository root service worker. It caches files independently so one missing optional file
    does not cancel the entire precache operation.
03. assets/pcb/*.svg
    Copy the included assets/ folder into the repository root, preserving assets/pcb/ paths.
04. app.js.patch
    This is a small patch, NOT a replacement app.js. It removes one duplicate Physics chapter seed entry.
    Apply only after reviewing the diff and backing up app.js.
05. audit/AUDIT_REPORT.md
    Read the findings, evidence, limitations, and verification checklist.

AFTER APPLYING
--------------
- Confirm every script and stylesheet requested by index.html exists in the repository.
- Run JavaScript syntax checks on all JS files.
- Test online/offline navigation, task creation, study timer, recall/revision, backup export/import,
  and camera/voice permission flows.
- Confirm there is no data loss and that the live deployed page loads the intended app.
- Do not mark the release complete until browser/runtime tests pass.

The bundle intentionally does not invent or replace missing core project files.
