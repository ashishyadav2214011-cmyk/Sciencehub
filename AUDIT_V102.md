# ScienceHub V102 Deep Repair Audit

## Scope checked
Current public `main` tree of `ashishyadav2214011-cmyk/Sciencehub` was inspected before preparing this repair overlay.

## Findings → fixes
| Area | Finding | V102 action |
|---|---|---|
| Home hero | V101 bridge points to missing nested hero path | Use existing root `home-hero-personal.png` |
| Mission hierarchy | Bridge hides `.hero` but `app.js` still renders `.mission` | Hide legacy `.hero` + `.mission`; render one canonical V102 hero |
| Sukoon icon | Current `app.js` points to missing nested brand path | Normalize to root `sukoon-brain-192.png` |
| ScienceHub icon | V101 bridge points to missing nested brand path | Normalize to root `sciencehub-icon-512.png` |
| PWA manifest | Icon paths point to missing nested brand paths | Normalize to root icon paths |
| Mobile | V101 hero has a two-column minimum that is too dense on small screens | Stack artwork/mission and collapse action cards |
| PCB learning | No dedicated visual asset library | Add 15 study visual anchors |
| Cache | Existing version history can leave stale service-worker files | V102 network-first cache + old-cache retirement |
| Feature preservation | Existing runtime handlers already provide study/practice/voice/camera/AI/etc. | Repair layer calls existing handlers instead of replacing them |

## Functional checks performed
- JS syntax: PASS (`sciencehub-v102-repair.js`, `sw.js`)
- PCB asset count: 15
- PCB asset filename/runtime mapping: PASS
- Manifest icon paths: corrected
- Hero asset path: corrected
- Sukoon asset path: corrected
- ScienceHub live-icon asset path: corrected
- Responsive breakpoints: added for <=720px and <=390px

## Deliberate non-changes
- Existing database schema/data are not cleared.
- Existing app routes and handlers are not rewritten by this overlay.
- Existing syllabus/PYQ data are not removed.
- Existing AI roles are not removed.
- Existing voice/camera/recall/review features are not removed.
- Existing root artwork/icons are not overwritten.
