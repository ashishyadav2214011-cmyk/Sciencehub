/* ScienceHub V96 — update-safe service worker */
const CACHE = "sciencehub-v96-cache";
const CORE = [
  "./","./index.html","./style.css","./manifest.json","./app.js",
  "./sciencehub-v95-integration.js","./sciencehub-perspective.js","./perspective.css",
  "./sciencehub-enhancements.js","./sciencehub-live-icon.js","./sciencehub-live-icon.css",
  "./sciencehub-v96-repair.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE).catch(()=>{}))
      .then(()=>self.skipWaiting())
  );
});
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k.startsWith("sciencehub-") && k!==CACHE).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

function isRuntime(request) {
  const u = new URL(request.url);
  return u.pathname.endsWith(".html") || u.pathname.endsWith(".js") ||
         u.pathname.endsWith(".css") || u.pathname.endsWith(".json") ||
         u.pathname.endsWith("/manifest.json");
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const request = event.request;

  if (request.mode === "navigate" || isRuntime(request)) {
    event.respondWith(
      fetch(request,{cache:"no-store"}).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});
        return response;
      }).catch(()=>caches.match(request).then(c=>c||caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});
      return response;
    })).catch(()=>caches.match("./index.html"))
  );
});
