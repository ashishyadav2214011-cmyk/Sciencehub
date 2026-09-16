# ScienceHub — Step 4 + Step 5 Integrated

This package combines the Home/Personalization layer and the Revision Engine on top of the local-first ScienceHub foundation.

## Implemented in this package
- Home V2 command center
- Global local search
- Today's Mission → Next Best Action
- Revision attention on Home
- KuroVen action prompt
- Subjects → Chapters → Status
- Study tasks linked to subjects/chapters
- Revision due queue
- Mistake → automatic revision trigger
- Revision completion → follow-up review
- Live Recall using browser speech recognition when supported
- Practice scoring: Correct/OK +2, Bad −1
- Local notes, flashcards, concept maps, resources
- Progress snapshot
- Export/import JSON backup
- PWA/service worker
- Mobile-first UI

## Important
This is still a client-side/local-first build. It is NOT a finished production cloud Study OS.
Not yet included: authentication, cloud database, multi-device sync, real AI provider integration, verified live opportunities/exam ingestion, advanced spaced-repetition algorithms, production security/observability.

## GitHub upload
Replace the root files:
- index.html
- app.js
- style.css
- sw.js
- manifest.json
- icon.svg
- README.md

Do NOT delete the repository. Keep any existing `home-hero.png` and `ScienceHub.zip` unless intentionally replacing them later.

## ScienceHub Identity / Icon update
- Added `sciencehub-icon.png` (512×512) as the primary PWA/app icon.
- Added `sciencehub-icon-192.png` for installability compatibility.
- Added `icon-lab.html`, an optional interactive 3D ScienceHub icon showcase.
- The 3D lab uses pointer capture for more reliable mobile drag behavior and keeps the JavaScript comments valid (`//` instead of HTML `<!-- -->` inside `<script>`).
- The launcher/PWA icon is intentionally static; the 3D lab remains a separate showcase page so it does not slow down normal app startup.

- Updated the primary ScienceHub icon assets with the supplied ScienceHub emblem artwork.


## Step 6–8 integration
Integrated local-first Intelligence Center, tracking/opportunity storage, World Knowledge notes, schema versioning, and service-worker cache refresh. Existing localStorage data is retained. Fresh external information remains internet-dependent and must be verified before use.
