# ScienceHub V74 — Refined Unified Study OS

Personal-use Study OS for Ashu.Ayansh.

## V74 refinement
- Rebuilt More as a real mobile Control Center, not a simple link list.
- Full-screen backdrop and focus-safe drawer; underlying pages cannot compete for interaction.
- Escape/backdrop/close handling and body scroll lock.
- One unified local data model for Study, Learning, Practice, Revision, Progress, Time, My Space, Exam Tracker, PCB Opportunities, World Knowledge, and Step 9 recovery state.
- Removed duplicate Step 6–8 / Step 9 Home rendering.
- Kept Home V2 hero + ScienceHub app icon.
- Cache/version hardening for V74.
- Offline/local-first behavior retained.

## Important
This is a functional client-side/PWA foundation. Real cloud AI, live verified opportunity/exam ingestion, authentication, multi-device sync, and production backend services still require a backend/provider layer.


## Sukoon.Brain integration (V76)
Sukoon.Brain is ScienceHub’s personal companion and reflective understanding layer. It listens to what the user chooses to share, can reflect, analyze expressed patterns, and help with a next action when requested. It does not read minds or diagnose the user.

On Home, Sukoon.Brain appears as a movable floating atom/AI figure. Drag it anywhere on screen; its position is saved locally. Tap it to open the companion panel with Listen, Reflect, Analyze, and Act modes.

Asset: `sukoon-brain-figure.png` — a ScienceHub/Sukoon.Brain representative figure combining the atom, science, learning, AI, friendly-eye/smile visual language.


V76 icon refinement: removed visual clutter from the app icon while preserving the ScienceHub emblem, science/learning identity, glow, and premium look.


## V77 Sukoon + Home
- Home uses the study-room visual as a full-page atmosphere with readable overlays.
- Motivation quotes rotate randomly and are tracked locally so a quote is not repeated until the available set is exhausted.
- Sukoon.Brain opens as a real in-app chat panel rather than browser prompts/alerts.
- Listen, Reflect, Analyze, and Act modes change the companion's response approach.
- Chat history and quote history are stored locally on the device.
- The current chat engine is a deterministic local companion engine. It is fully usable offline, but it is not a generative cloud AI model.
- No API key is embedded in the frontend.


## V78 FINAL — unified finish
This is the final GitHub-Pages-friendly local-first package. It consolidates the Study OS into one local data store and adds a live intelligence layer across tasks, revisions, weak areas, mistakes, practice scoring, time tracking, global search, backup checkpoints, and Sukoon.Brain context.

### Final scoring
- Good / correct: +3
- OK: +2
- Bad: −1

### Adaptive revision
Completing a revision schedules a follow-up using an adaptive interval (bounded to keep reviews practical). Repeated mistakes can raise attention priority.

### Sukoon.Brain
Sukoon.Brain is a movable Home companion and reflective understanding layer. Its local chat can use permitted ScienceHub context when enabled. It does not read minds, diagnose, or pretend to be a human.

### AI boundary
This GitHub Pages package is fully functional without a secret API key, but it is not itself a hosted frontier-model backend. The architecture keeps the AI connection replaceable so a secure server-side model can be attached later without embedding a private API key in the browser.

### Deployment
All website files are at the ZIP root. Upload the contents directly to the `main` branch root, then enable GitHub Pages from `main` / root.


## V79 Home Universe refinement
Home V3 merges five visual directions: Quiet Genius, Neural Lab, Midnight Observatory, Science Command Deck, and Personal Universe. The visual hierarchy is deliberately cleared: identity → mission → next action → compact snapshot → quick access → AI → reflection → future horizon → PCB opportunities. The existing local-first functionality remains the foundation.
