const CACHE="sciencehub-v103-cache";
const CORE=["./","./index.html","./style.css","./manifest.json","./app.js","./sciencehub-enhancements.js","./sciencehub-v103-repair.js","./sciencehub-v103-repair.css"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("sciencehub-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./"))))});
