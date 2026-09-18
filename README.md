# ScienceHub V73 — Unified Clean Build

ScienceHub is Ashu.Ayansh's personal-use Study OS built around:
**Understand → Practice → Measure → Improve → Execute**.

## What V73 fixes
- One shared local data store (`sciencehub-v45`) for the core app and Step 6–9.
- Step 6–8 are rendered inside the normal Home render cycle; no fragile DOM injection.
- Step 9 is rendered inside Home and stored inside the same main database.
- Safe migration from the earlier `sciencehub-v1` store and older standalone Step 9 state.
- Service worker V73 deletes older `sciencehub-*` caches on activation.
- Service worker registration uses `updateViaCache: none` and requests an update.
- Home V2 retained: hero, global search, mission, next action, revision attention, snapshot, KuroVen, quick access.
- Study tasks with subject/chapter/priority, focus sessions, active-study tracking, and completion scoring.
- Revision queue with follow-up review, mistake-triggered revision, and browser Live Recall when supported.
- Practice scoring: Good/OK `+2`, Bad `−1`.
- Learning Lab: notes, flashcards, concept maps, resource hub, and native Share where supported.
- School workspace: schedule, teachers, homework, practicals.
- Exam Tracker with `Exam went smoothly` and `Exam went with trouble` states.
- PCB Opportunities is kept as the final Home section, with source field; no fabricated live data.
- World Knowledge / KnownWorld is a separate on-demand area reached from the Home `Aui` trigger; it is not treated as a normal social/feed section.
- My Space with archive/recovery workflow; Recovery Box is the final section.
- Backup/import with explicit confirmation before replacing local data.
- Quiet Mode preference and Camera Mode preference are stored locally; phone-level notification/call control is not claimed.
- Mobile-first responsive UI and PWA assets.

## Deliberate limitations
This remains a client-side/local-first build. It does **not** pretend to provide:
- real cloud authentication,
- multi-device cloud sync,
- a production AI provider,
- automatically verified live scholarship/exam feeds,
- fabricated PYQs or current opportunities.

Fresh external information must be verified before being treated as current.

## GitHub Pages upload
Replace the root files with the contents of this package. Upload the extracted files, not the ZIP itself.
Required runtime files:
- `index.html`
- `app-step9.js`
- `app.js` (compatibility copy)
- `style.css`
- `sw.js`
- `manifest.json`
- `sciencehub-icon.png`
- `sciencehub-icon-192.png`
- `icon.svg`
- `home-hero.png`

After committing, wait for GitHub Pages to rebuild, then open the live URL in a normal browser tab before testing any old installed shortcut.
