# ScienceHub V89 — Deep Fix

## Root causes fixed
- Runtime APP_VERSION and script cache-buster were inconsistent (V87 inside a V88 package).
- Old service-worker caches could keep the previous Subjects UI.
- Subjects now uses the UPMSP 2026–27 dataset directly for every class/subject.
- Class 11/12 switching is explicit and class-aware.
- Subject cards show actual syllabus topic counts instead of legacy tracked counts.
- Completion is displayed separately from syllabus size.
- A build badge makes the deployed runtime version visible.
- On load, ScienceHub unregisters stale same-origin service workers and removes old ScienceHub caches, then registers the V89 worker. User study data in localStorage is preserved.
- Supplied Quantum Genetics live icon remains integrated in the header and icon lab.
