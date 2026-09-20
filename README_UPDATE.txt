SCIENCEHUB V94 UPDATE PATCH
============================

Prepared for the existing ScienceHub repository:
ashishyadav2214011-cmyk/Sciencehub

FILES
-----
1. index.html
   - fixes root-level style/app/data paths
   - loads the new enhancement layer

2. sw.js
   - fixes root-level cache paths
   - bumps cache to V94 so stale V93 cache is replaced

3. manifest.json
   - V94 description
   - keeps existing brand icons

4. sciencehub-enhancements.js
   - voice-to-text for the active text field
   - text-to-voice/read aloud
   - camera open/capture/close
   - Quick Recall storage
   - Review/read-aloud of saved recall

IMPORTANT
---------
Upload/replace these files at the repository ROOT.
Do not delete the existing assets, app.js, style.css, or data folders.

After upload, open the deployed ScienceHub once with a fresh reload.
Camera and microphone require browser permissions.
SpeechRecognition availability depends on the browser/device.

This is an additive patch; it does not replace the existing ScienceHub app.js.
