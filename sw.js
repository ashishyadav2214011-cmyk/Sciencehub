const CACHE="sciencehub-v45-iconfix";
const ASSETS=["./","./index.html","./style.css","./app.js","./manifest.json","./icon.svg","./sciencehub-icon.png","./sciencehub-icon-192.png","./icon-lab.html"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(e.request.method==="GET"){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match("./index.html")))));
