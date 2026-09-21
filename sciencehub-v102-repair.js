/* ScienceHub V102 Repair — additive repair layer
   Purpose: fix broken paths, duplicate hero/mission rendering, mobile compression,
   and add a PCB Smart Study Visual Asset library without replacing app.js.
*/
(()=>{
'use strict';
const VERSION='V102-REPAIR';
const PCB=[
 ['Biology','DNA & Genetics','dna','Core genetics / inheritance visual'],
 ['Biology','Human Heart','heart','Circulation / human physiology'],
 ['Biology','Human Body','body','Human physiology / organ systems'],
 ['Biology','Cell','cell','Cell structure / organelles'],
 ['Biology','Microscope','microscope','Observation / practical biology'],
 ['Biology','Plant','plant','Plant physiology / morphology'],
 ['Physics','Atom & Orbit','atom','Atomic / modern physics'],
 ['Physics','Wave','wave','Waves / oscillations'],
 ['Physics','Circuit','circuit','Current electricity / electronics'],
 ['Physics','Force','force','Motion / Newton laws'],
 ['Chemistry','Molecule','molecule','Bonding / molecular structure'],
 ['Chemistry','Flask','flask','Reactions / laboratory concepts'],
 ['Chemistry','Periodic Table','periodic','Elements / periodicity'],
 ['Chemistry','Beaker','beaker','Solutions / practical chemistry'],
 ['Chemistry','Reaction','reaction','Reaction pathway / stoichiometry']
];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function fixAssetPaths(){
  $$('img').forEach(img=>{
    const src=img.getAttribute('src')||'';
    const map={
      './assets/brand/sukoon-brain-192.png':'./sukoon-brain-192.png',
      './assets/brand/sukoon-brain-512.png':'./sukoon-brain-512.png',
      './assets/brand/sciencehub-icon-512.png':'./sciencehub-icon-512.png',
      './assets/brand/sciencehub-icon-192.png':'./sciencehub-icon-192.png',
      './assets/hero/home-hero-character.png':'./home-hero-personal.png'
    };
    if(map[src]) img.src=map[src];
  });
}
function readDB(){try{return JSON.parse(localStorage.getItem('sciencehub-v100-db')||'{}')}catch(e){return {}}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function stat(){const d=readDB(), tasks=Array.isArray(d.tasks)?d.tasks:[], rev=Array.isArray(d.revision)?d.revision:[], ch=Array.isArray(d.chapters)?d.chapters:[];return{tasks,rev,ch,due:rev.filter(x=>!x.done&&(!x.due||x.due<=Date.now())).length,weak:ch.filter(x=>x.status==='Weak').length,mins:Number(d.stats?.minutes||0)}}
function nav(route){window.shNav?.(route)}
function renderHero(){
 const page=$('.page'); if(!page) return;
 const h1=$('.page h1'); if(!h1 || !/Good evening, Ashu\.Ayansh/i.test(h1.textContent||'')) return;
 const s=stat();
 // Remove old duplicated presentation blocks; functionality remains available through routes.
 $$('.sh-v102-hero',page).forEach((x,i)=>{if(i)x.remove()});
 const oldHero=$('.hero',page); if(oldHero) oldHero.style.display='none';
 const oldMission=$('.mission',page); if(oldMission) oldMission.style.display='none';
 const oldSearch=$('.search',page); if(oldSearch) oldSearch.style.marginBottom='10px';
 if($('.sh-v102-hero',page)) return;
 const next=s.rev.find(x=>!x.done&&(!x.due||x.due<=Date.now())) || s.ch.find(x=>x.status==='Weak') || s.tasks.find(x=>!x.done);
 const hero=document.createElement('section'); hero.className='sh-v102-hero';
 hero.innerHTML=`<div class="sh-v102-hero-top">
   <div class="sh-v102-brand"><img src="./sciencehub-icon-192.png" alt="ScienceHub"><div><b>ScienceHub</b><small>Study Smarter. Score Higher.</small></div></div>
   <div class="sh-v102-greeting">Good evening,</div><div class="sh-v102-name">Ashu.Ayansh 👋</div>
   <div class="sh-v102-tag">One clear target. One connected study system.</div>
 </div>
 <div class="sh-v102-main">
   <article class="sh-v102-mission"><div class="sh-v102-kicker">🎯 TODAY'S MISSION</div><h2>${esc(next?.title||next?.name||'Choose one study target')}</h2><p>Understand → recall → practice → repair mistakes → review.</p><div class="sh-v102-meta"><span>⏱ ${s.mins} min</span><span>🔁 ${s.due} due</span><span>⚠️ ${s.weak} weak</span></div><button class="sh-v102-btn" onclick="window.shNav?.('study')">Start Mission ▶</button></article>
   <div class="sh-v102-art"><img src="./home-hero-personal.png" alt="ScienceHub personal study atmosphere"></div>
 </div>
 <div class="sh-v102-actions">
  <article class="sh-v102-action"><b>⚡ NEXT BEST ACTION</b><h3>${s.weak?'Repair a weak area':'Start the next task'}</h3><p>${s.tasks.filter(x=>!x.done).length} open task(s)</p><button onclick="window.shNav?.('${s.weak?'subjects':'study'}')">Do Now ›</button></article>
  <article class="sh-v102-action"><b>🔄 REVISION DUE</b><h3>${s.due} topic${s.due===1?'':'s'}</h3><p>Use active recall before rereading.</p><button onclick="window.shNav?.('learning')">Review ›</button></article>
  <article class="sh-v102-action"><b>📊 TODAY'S STATS</b><h3>${s.mins} study minutes</h3><p>${s.weak} weak areas need attention.</p><button onclick="window.shNav?.('progress')">Progress ›</button></article>
 </div>`;
 page.insertBefore(hero,page.firstElementChild?.nextElementSibling||page.firstChild);
 fixAssetPaths();
}
function pcbForSubject(subject){return PCB.filter(x=>x[0]===subject)}
function openVisual(item){
 let m=$('.sh-v102-modal'); if(m)m.remove();
 m=document.createElement('div');m.className='sh-v102-modal';
 m.innerHTML=`<div><img src="./assets/pcb/${item[2]}.svg" alt="${esc(item[1])}"><h2>${esc(item[1])}</h2><p class="muted">${esc(item[3])}</p><button>Close</button></div>`;
 m.addEventListener('click',e=>{if(e.target===m||e.target.closest('button'))m.remove()});document.body.appendChild(m);
}
function mountPCB(){
 const page=$('.page'); if(!page)return;
 const title=($('.page h1')?.textContent||'').trim();
 const subject=['Biology','Physics','Chemistry'].includes(title)?title:null;
 if(subject){
   $('.sh-v102-pcb',page)?.remove();
   const items=pcbForSubject(subject).slice(0,6);
   const box=document.createElement('section');box.className='sh-v102-pcb';
   box.innerHTML=`<div class="sh-v102-pcb-head"><div><div class="sh-v102-kicker">🧠 SMART STUDY VISUALS</div><h2>${subject} Study Assets</h2><p>Use visual anchors for faster recall and concept linking.</p></div></div><div class="sh-v102-assets">${items.map((x,i)=>`<button class="sh-v102-asset" data-i="${i}"><img src="./assets/pcb/${x[2]}.svg" alt="${esc(x[1])}"><span><b>${esc(x[1])}</b><small>${esc(x[3])}</small></span></button>`).join('')}</div>`;
   page.insertBefore(box,page.querySelector('.actions')||page.firstElementChild?.nextSibling||null);
   $$('.sh-v102-asset',box).forEach(b=>b.addEventListener('click',()=>openVisual(items[Number(b.dataset.i)])));
 }
 if(title==='Subjects' && !$('.sh-v102-pcb',page)){
   const box=document.createElement('section');box.className='sh-v102-pcb';
   box.innerHTML=`<div class="sh-v102-kicker">🧬⚛️🧪 PCB SMART STUDY ASSET LIBRARY</div><h2>Visual anchors you actually need</h2><p class="muted">Biology: body/heart/cell/DNA • Physics: atom/waves/circuits • Chemistry: molecules/flasks/periodicity.</p><div class="sh-v102-assets">${[['Biology','Human Heart','heart','Circulation'],['Biology','Human Body','body','Physiology'],['Biology','Cell','cell','Cell structure'],['Biology','DNA & Genetics','dna','Genetics'],['Physics','Atom & Orbit','atom','Atomic physics'],['Physics','Wave','wave','Waves'],['Physics','Circuit','circuit','Electricity'],['Chemistry','Molecule','molecule','Bonding'],['Chemistry','Flask','flask','Reactions']].map((x,i)=>`<button class="sh-v102-asset" data-p="${i}"><img src="./assets/pcb/${x[2]}.svg" alt="${esc(x[1])}"><span><b>${esc(x[1])}</b><small>${esc(x[3])}</small></span></button>`).join('')}</div>`;
   page.appendChild(box);
   const items=[['Biology','Human Heart','heart','Circulation'],['Biology','Human Body','body','Physiology'],['Biology','Cell','cell','Cell structure'],['Biology','DNA & Genetics','dna','Genetics'],['Physics','Atom & Orbit','atom','Atomic physics'],['Physics','Wave','wave','Waves'],['Physics','Circuit','circuit','Electricity'],['Chemistry','Molecule','molecule','Bonding'],['Chemistry','Flask','flask','Reactions']];
   $$('.sh-v102-asset',box).forEach(b=>b.addEventListener('click',()=>openVisual(items[Number(b.dataset.p)])));
 }
}
function auditAndRepair(){
 fixAssetPaths();
 // Prevent the old bridge from showing its broken hero image/path again.
 $$('.sh-hero-art img').forEach(x=>x.src='./home-hero-personal.png');
 $$('.sh-live-brand img').forEach(x=>x.src='./sciencehub-icon-512.png');
 $$('.sukoon-icon').forEach(x=>x.src='./sukoon-brain-192.png');
 renderHero();mountPCB();
 document.documentElement.dataset.sciencehubRepair=VERSION;
}
function boot(){auditAndRepair();setTimeout(auditAndRepair,200);setTimeout(auditAndRepair,700);setTimeout(auditAndRepair,1600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
new MutationObserver(()=>{clearTimeout(window.__shV102Timer);window.__shV102Timer=setTimeout(auditAndRepair,30)}).observe(document.body,{childList:true,subtree:true});
window.ScienceHubV102Repair={version:VERSION,auditAndRepair,pcbAssets:PCB};
})();
