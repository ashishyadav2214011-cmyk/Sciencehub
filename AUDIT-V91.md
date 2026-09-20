# ScienceHub V91 — Full Audit

## Verified in source package
- Root deployment structure is flat and GitHub-Pages-ready.
- `index.html` loads `js/app.js?v=91`.
- `index.html` build badge is V91-FULL-AUDIT-SYNC.
- `js/app.js` APP_VERSION and BUILD_ID are V91-FULL-AUDIT-SYNC.
- Service-worker cache is `sciencehub-v91-full-audit-sync` and registration uses `?v=91`.
- Embedded `data/syllabus-fallback.js` exists so Subjects does not depend on a first network fetch.
- Packaged `data/upmsp_syllabus_2026_27.json` exists.
- Class 11 dataset: 32 sections / 233 topics.
- Class 12 dataset: 35 sections / 219 topics.
- Subjects reads section/topic counts from the syllabus source, not legacy tracked counts.
- Syllabus sync creates/updates class + subject + section + topic records in the local Study data store.
- Subjects now reports source counts and linked Study-data counts.
- Sukoon assets and settings remain present.
- PWA manifest and offline assets remain present.

## Important distinction
- **Local syllabus sync:** verified in code. UPMSP source -> Study data -> Subjects is connected.
- **Cloud/GitHub sync:** NOT automatic. GitHub Pages only receives files after deployment/commit. The app's localStorage data does not sync to GitHub.
- **Live deployment:** must still be checked on the actual GitHub Pages site after uploading this package.

## Not claimed as fully verified by this audit
- Real-time cloud database sync across multiple devices.
- Live current exam/scholarship/opportunity ingestion.
- Full verified PYQ question database for every year/topic.
- External generative AI provider operation without configuration.
- End-to-end graphical/browser interaction testing.

## Release rule
Upload the CONTENTS of this ZIP to the repository root. Do not upload the ZIP as a nested folder.
After deployment, clear/reload the site's old service worker/cache if the browser still shows an older build.
