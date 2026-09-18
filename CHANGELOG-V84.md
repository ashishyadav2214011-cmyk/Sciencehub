# ScienceHub V84 — Final Functional Consolidation

V84 is a functional recovery/consolidation build, not another visual patch.

- Preserves V80 syllabus + PYQ data byte-for-byte.
- Preserves V80-era Study OS routes and local data model.
- Preserves V82 clean Home, organized assets and visible Hero.
- Uses the supplied studying-background Hero image in the Home hero.
- Adds an embedded syllabus fallback so the app works when JSON fetch is blocked (including direct file opening).
- Migrates old local data by adding missing Class 11 syllabus sections without overwriting existing statuses.
- Subjects now shows syllabus-section counts instead of misleading 0/0 for English/Hindi.
- Uses one runtime only: js/app.js.
- Uses a V84 service-worker cache.
- Sukoon remains a local-first companion with optional custom endpoint bridge.
