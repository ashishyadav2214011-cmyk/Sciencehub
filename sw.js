const CACHE="sciencehub-v72-step9-integrated";
const ASSETS=["./","./index.html","./style.css","./app-step9.js","./manifest.json","./icon.svg","./sciencehub-icon.png","./sciencehub-icon-192.png","./home-hero.png"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(e.request.method==="GET"){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return res}).catch(()=>caches.match("./index.html")))));
