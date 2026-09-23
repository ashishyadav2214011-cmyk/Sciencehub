# Upload / Update
1. Export Guard backup.
2. Upload next phase files.
3. Load ScienceHub.
4. Guard audits and compares the phase manifest.
5. Create checkpoint before approved risky changes.
6. Validate.
7. PASS → freeze. FAIL → recovery/rollback and report.

Browser-side Guard cannot guarantee a remote GitHub commit; repository upload remains an authorized external operation.
