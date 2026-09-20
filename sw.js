const CACHE="sciencehub-v90-sukoon-ai-bot";
const ASSETS=[
 "./","./index.html","./css/style.css","./js/app.js","./data/syllabus-fallback.js","./manifest.json",
 "./assets/brand/sciencehub-icon.svg","./assets/brand/sciencehub-icon-192.png","./assets/brand/sciencehub-icon-512.png",
 "./assets/hero/home-hero-personal.png","./assets/companion/sukoon-brain-figure.png","./assets/companion/sukoon-brain-icon.png",
 "./data/upmsp_syllabus_2026_27.json","./data/pyq_registry_2020_2026.json","./icon-lab.html"
];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match("./index.html"))))});
