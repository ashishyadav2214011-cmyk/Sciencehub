# ScienceHub V84 deployment checklist

1. Upload the CONTENTS of this package to the ROOT of the GitHub `Sciencehub` repository.
2. Do not put the files inside another `ScienceHub-V84-Final/` folder.
3. Keep `assets/`, `css/`, `data/`, and `js/` folders intact.
4. GitHub Pages source: repository root / main branch (or the branch configured for Pages).
5. Open the Pages URL and hard-refresh once after deployment.
6. If an older service worker remains, unregister the old site service worker from browser site settings, then reload.
7. The app can also open directly from `index.html`; the embedded syllabus fallback avoids dependence on JSON fetch for core syllabus rendering.
