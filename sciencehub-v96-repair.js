/* ScienceHub V96 — safe local DB migration + cache repair
   Preserves existing ScienceHub local data. Never clears localStorage.
*/
(() => {
  "use strict";
  const DB_KEY = "sciencehub-v45";
  const TARGET_SCHEMA = 16;
  const TARGET_APP = "V96-CACHE-MIGRATION";

  function parse(raw) {
    try { return JSON.parse(raw); } catch (_) { return null; }
  }
  function preserveArray(x, key) {
    if (!Array.isArray(x[key])) x[key] = [];
  }

  function migrateLocalDB() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return {found:false, changed:false};
    const db = parse(raw);
    if (!db || typeof db !== "object") return {found:true, changed:false, invalid:true};

    [
      "tasks","notes","revision","events","chapters","topics","questions",
      "mistakes","flashcards","maps","resources","goals","examTracker",
      "opportunities","worldKnowledge","recovery"
    ].forEach(k => preserveArray(db,k));

    db.school = Object.assign(
      {teachers:[],homework:[],practicals:[],schedule:[]}, db.school || {}
    );
    ["teachers","homework","practicals","schedule"].forEach(k => preserveArray(db.school,k));

    db.space = Object.assign(
      {bookmarks:[],ideas:[],projects:[],bioinformatics:[]}, db.space || {}
    );
    ["bookmarks","ideas","projects","bioinformatics"].forEach(k => preserveArray(db.space,k));

    db.step9 = Object.assign(
      {checkins:[],priorities:[],reviews:[],lastBackup:null,backupCount:0}, db.step9 || {}
    );
    ["checkins","priorities","reviews"].forEach(k => preserveArray(db.step9,k));
    db.step9.backupCount = Number(db.step9.backupCount || 0);

    db.settings = Object.assign(
      {
        quiet:true,cameraMode:"off",sukoonPosition:{x:null,y:null},
        sukoonContext:true,aiProvider:"local",aiEndpoint:"",aiModel:"",
        sukoonBotEnabled:true,sukoonBotName:"Sukoon.Brain",sukoonDefaultMode:"Listen"
      }, db.settings || {}
    );
    db.settings.sukoonPosition = Object.assign({x:null,y:null}, db.settings.sukoonPosition || {});

    db.schemaVersion = Math.max(Number(db.schemaVersion || 0), TARGET_SCHEMA);
    db.appVersion = TARGET_APP;
    db.migratedAt = new Date().toISOString();
    db.migrationNote = "V78/V15-compatible data preserved; upgraded to V16 marker.";
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return {found:true, changed:true, schema:db.schemaVersion, app:db.appVersion};
  }

  async function repairCaches() {
    if (!("serviceWorker" in navigator)) return {serviceWorkers:0,caches:0};
    let serviceWorkers = 0, cacheCount = 0;
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        try { if (await reg.unregister()) serviceWorkers++; } catch (_) {}
      }
    } catch (_) {}
    try {
      if (window.caches) {
        const keys = await caches.keys();
        for (const key of keys) {
          if (/sciencehub/i.test(key)) {
            try { if (await caches.delete(key)) cacheCount++; } catch (_) {}
          }
        }
      }
    } catch (_) {}
    return {serviceWorkers, caches:cacheCount};
  }

  async function boot() {
    const migration = migrateLocalDB();
    const repair = await repairCaches();
    window.__SCIENCEHUB_V96__ = {migration, repair, readyAt:new Date().toISOString()};

    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.register("./sw.js?v=96.0", {updateViaCache:"none"});
        await reg.update();
      } catch (_) {}
    }
  }

  window.ScienceHubV96 = {migrateLocalDB, repairCaches, boot};
  boot();
})();
