/* ScienceHub V102 repair bundle — resilient offline cache.
   Each asset is cached independently so one missing optional image cannot cancel the whole install. */
const CACHE = 'sciencehub-v103-cache';
const CORE = [
  './', './index.html', './style.css', './manifest.json', './app.js',
  './perspective.css', './sciencehub-enhancements.js', './sciencehub-perspective.js',
  './sciencehub-v101-bridge.js', './sciencehub-v101.css',
  './sciencehub-v102-repair.js', './sciencehub-v102-repair.css',
  './sciencehub-icon-192.png', './sciencehub-icon-512.png',
  './sukoon-brain-192.png', './sukoon-brain-512.png',
  './home-hero-personal.png', './home-hero-character.png',
  ...['dna','heart','body','cell','microscope','plant','atom','wave','circuit',
      'force','molecule','flask','periodic','beaker','reaction']
      .map(name => `./assets/pcb/${name}.svg`)
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map(async path => {
      try {
        const response = await fetch(path, {cache: 'no-store'});
        if (response.ok) await cache.put(path, response);
      } catch (_) {
        // Optional/missing assets must not break caching of the rest of the app.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, {cache: 'no-store'});
        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match('./index.html')) ||
          new Response('ScienceHub is offline and the page is not cached yet.', {
            status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
          });
      }
    })());
    return;
  }
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
