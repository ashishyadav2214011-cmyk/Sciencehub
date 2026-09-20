# GitHub upload — ScienceHub V90

## Important
Upload the **contents** of this folder to the root of the repository. Do not upload the outer ZIP folder itself.

The repository root should directly contain:

```text
index.html
manifest.json
sw.js
js/
css/
data/
assets/
```

## Android GitHub web upload
1. Open the Sciencehub repository.
2. Tap **Add file** → **Upload files**.
3. Open/extract the V90 ZIP first.
4. Select the files/folders inside the extracted `Sciencehub/` folder.
5. Make sure `index.html` is visible at repository root.
6. Commit the changes.
7. In GitHub: **Settings → Pages → Deploy from branch → main → /(root)**.
8. Save and wait for GitHub Pages to build.

## PWA
After deployment, open the Pages URL in Chrome. If an older ScienceHub version appears, hard-refresh/clear the old site data once so the V90 service worker can take control.

## V90 identity
- Build: `SCIENCEHUB-V90-CORE-INTEGRATED`
- Live icon: atomic + genetic real-time revolution
- Local data migration: schema 16
