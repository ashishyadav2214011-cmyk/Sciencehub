# Recommended ScienceHub repository layout

```text
Sciencehub/
├── index.html                 # single live entry point — V95
├── app.js                     # core runtime
├── style.css                  # core styling
├── sciencehub-v95-integration.js
├── sciencehub-perspective.js
├── perspective.css
├── sciencehub-enhancements.js
├── sciencehub-live-icon.js
├── sciencehub-live-icon.css
├── sw.js
├── manifest.json
├── assets/
├── data/
├── versions/
│   ├── V74/
│   ├── V75/
│   └── ... V95/
└── archive/
    └── V74-V94/
```

Do not use ZIP files as the live site's source. ZIPs belong in `archive/`; executable HTML/JS/CSS/assets belong directly in the publishing root or their proper subfolders.
