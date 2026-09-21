/* ScienceHub V102 — update-safe network-first service worker */
const CACHE='sciencehub-v102-cache';
const CORE=[
 './','./index.html','./style.css','./manifest.json','./app.js',
 './perspective.css','./sciencehub-enhancements.js','./sciencehub-perspective.js',
 './sciencehub-v95-integration.js','./sciencehub-v101-bridge.js','./sciencehub-v101.css',
 './sciencehub-live-icon.js','./sciencehub-live-icon.css','./sciencehub-v102-repair.js','./sciencehub-v102-repair.css',
 './sciencehub-icon-192.png','./sciencehub-icon-512.png','./sukoon-brain-192.png','./sukoon-brain-512.png',
 './home-hero-personal.png','./home-hero-character.png'
];
const PCB=['dna','heart','body','cell','microscope','plant','atom','wave','circuit','force','molecule','flask','periodic','beaker','reaction'].map(x=>'./assets/pcb/'+x+'.svg');
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...CORE,...PCB]).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 if(r.mode==='navigate'||new URL(r.url).origin===location.origin){
  e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res}).catch(()=>caches.match(r).then(x=>x||caches.match('./index.html'))));
 }
});
