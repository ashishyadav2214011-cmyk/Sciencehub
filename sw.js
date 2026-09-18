const CACHE="sciencehub-v80-upmsp";
const ASSETS=["./","./index.html","./style.css","./app-step9.js?v=80","./app.js","./manifest.json","./icon.svg","./sciencehub-icon.png","./sciencehub-icon-192.png","./home-hero.png","./sukoon-brain-figure.png","./data/upmsp_syllabus_2026_27.json","./data/pyq_registry_2020_2026.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("sciencehub-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match("./index.html"))))});
