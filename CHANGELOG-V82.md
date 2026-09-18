# V82 change log

Observed issue in supplied screenshots:
1. Home was still rendering the legacy Step 6–9 dashboard (`app-step9.js`).
2. The hero artwork existed as an asset/background but was not presented as a dominant Home hero.
3. Brand artwork was visually busy at small icon sizes.
4. CSS contained layered/duplicated Home patches and a malformed modal fragment.

V82 response:
- one runtime: `js/app.js`
- explicit hero `<img>` block
- clean icon set
- organized assets
- fresh service-worker cache
- retained syllabus/PYQ data and local-first features
