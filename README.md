# ScienceHub V101 — Restore + Integrated Build

V100 runtime preserved; V101 adds safe restoration/integration layers.

This is a clean, dependency-free, local-first ScienceHub build intended for GitHub Pages/PWA use.

## Integrated systems
- Central localStorage Study OS database with schema/app migration markers
- Class 11 subjects: Biology, Physics, Chemistry, English, Hindi
- Subject/chapter status system
- Real-time study timer + saved study sessions
- Daily task system
- Live Recall with Good +2 / Bad -1
- Review queue
- Practice questions + scoring
- Mistake/activity records
- Notes
- Progress/intelligence dashboard
- Global Home search
- Voice input where browser supports SpeechRecognition
- Text-to-voice via speechSynthesis
- Camera preview/capture
- Sukoon.Brain local companion chat
- KuroVen / Hikaitage / HukoVaige role center
- Perspective setting
- My Space + backup/import
- PCB Opportunities
- WORLD / Aui local notes
- Native share-ready data model through export/shareable JSON
- PWA manifest + update-safe service worker
- Offline-safe application shell
- Live orbital ScienceHub header animation

## Important scope boundaries
- Fresh web/world information needs an internet-connected source.
- Browser speech/camera capabilities depend on the device/browser and permissions.
- Camera capture is capture-only in this build; OCR/image understanding is not falsely claimed.
- The launcher/PWA icon is static; the live orbital animation is inside the app UI.
- This build contains the integrated architecture and functional core. Large external PYQ/syllabus datasets can be imported separately without changing the core database design.

## Safe update principle
The service worker uses a versioned cache and network-first handling for HTML/JS/CSS/JSON runtime files. User localStorage data is not cleared by the service worker.
