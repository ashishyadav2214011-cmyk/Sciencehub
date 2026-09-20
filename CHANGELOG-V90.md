# ScienceHub V90 — Core Integrated

## Brand
- Replaced the static brand direction with a live atomic-genetic icon: DNA helix + nucleus + real-time electron revolution.
- Added the generated polished icon as the PWA/app-icon artwork.

## Core integration fixes
- UPMSP Class 11/12 topics now carry persistent topic identity and mastery state.
- Topic status can be updated directly from Subject pages.
- Practice questions can be linked to class/topic identity.
- Correct/OK/Bad practice results update linked topic mastery; Bad creates a topic-linked revision trigger and mistake record.
- Revision records preserve class/topic identity through adaptive follow-ups.
- Progress now reports topic mastery separately for Class 11 and Class 12.
- Academic view is class-aware.
- Task records preserve class/section identity.
- Global search routes class-aware subject results.
- Schema migration preserves existing local data and upgrades records without resetting progress.
- Version/cache/service-worker references moved to V90.

## Validation
- JavaScript syntax checked with Node.
- JSON files validated.
- ZIP root remains deployable for GitHub Pages.
