(()=>{"use strict";
const P3KEY="sciencehub-upgrade-guard-p3-regression-v1";
const clone=x=>JSON.parse(JSON.stringify(x));
const now=()=>new Date().toISOString();
const read=()=>{try{return JSON.parse(localStorage.getItem(P3KEY)||"null")||{baseline:null,runs:[]}}catch(_){return{baseline:null,runs:[]}}};
const write=x=>localStorage.setItem(P3KEY,JSON.stringify(x));
async function fetchText(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error(`HTTP ${r.status}: ${url}`);return r.text()}
async function digest(text){if(!crypto?.subtle)return null;const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function assets(){return {scripts:[...document.scripts].map(x=>x.src).filter(Boolean),styles:[...document.querySelectorAll('link[rel="stylesheet"]')].map(x=>x.href).filter(Boolean),links:[...document.querySelectorAll('link[href]')].map(x=>x.href).filter(Boolean)}}
function duplicates(a){const d={};for(const [k,v] of Object.entries(a)){const seen=new Set(),dupes=[];for(const x of v){if(seen.has(x))dupes.push(x);seen.add(x)}d[k]=dupes}return d}
async function inventory(){const a=assets(),files=[...new Set([...a.scripts,...a.styles])],items=[];for(const u of files){try{const t=await fetchText(u);items.push({url:u,ok:true,sha256:await digest(t),bytes:t.length})}catch(e){items.push({url:u,ok:false,error:String(e)})}}return {at:now(),assets:a,duplicates:duplicates(a),items}}
function runtimeChecks(){const required=["UpgradeGuardAI","ScienceHubUpgrade"];return required.map(k=>({name:`global:${k}`,ok:!!window[k]})).concat([{name:"document",ok:!!document},{name:"localStorage",ok:!!window.localStorage},{name:"serviceWorkerAPI",ok:"serviceWorker" in navigator},{name:"indexedDBAPI",ok:"indexedDB" in window}])}
async function run(){const inv=await inventory();const checks=runtimeChecks();const failed=[...checks.filter(x=>!x.ok).map(x=>x.name),...inv.items.filter(x=>!x.ok).map(x=>"asset:"+x.url),...Object.entries(inv.duplicates).flatMap(([k,v])=>v.map(x=>`duplicate:${k}:${x}`))];const result={id:Date.now().toString(36),at:now(),ok:failed.length===0,failed,checks,inventory:inv};const s=read();s.runs.unshift(result);s.runs=s.runs.slice(0,30);write(s);return clone(result)}
async function baseline(){const r=await run();if(!r.ok)throw Error("Cannot create baseline: regression checks failed");const s=read();s.baseline=r;write(s);return clone(r)}
function status(){return clone(read())}
window.ScienceHubRegressionGuard={run,baseline,status,inventory,runtimeChecks};
})();