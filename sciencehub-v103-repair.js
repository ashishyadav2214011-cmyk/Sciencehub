/* ScienceHub V103 Repair Layer
   Safe, non-destructive fixes for the current V100/V102 runtime.
*/
(()=>{'use strict';
const KEY='sciencehub-v100-db';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const PCB={
 Biology:[['Human Heart','heart','Circulation / human physiology'],['Human Body','body','Human physiology / organ systems'],['Cell','cell','Cell structure / organelles'],['DNA & Genetics','dna','Genetics / inheritance'],['Microscope','microscope','Practical biology'],['Plant','plant','Plant physiology']],
 Physics:[['Atom & Orbit','atom','Atomic / modern physics'],['Wave','wave','Waves / oscillations'],['Circuit','circuit','Current electricity'],['Force','force','Motion / Newton laws']],
 Chemistry:[['Molecule','molecule','Bonding / molecular structure'],['Flask','flask','Reactions / laboratory concepts'],['Periodic Table','periodic','Elements / periodicity'],['Beaker','beaker','Solutions / practical chemistry'],['Reaction','reaction','Reaction pathway / stoichiometry']]
};
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(d){localStorage.setItem(KEY,JSON.stringify(d))}
function scoreFix(){
 window.shScore=(good,id)=>{
   const d=read(); if(!d)return;
   d.stats=d.stats||{minutes:0,good:0,bad:0};
   if(good)d.stats.good=(d.stats.good||0)+2; else d.stats.bad=(d.stats.bad||0)-1;
   d.events=d.events||[]; d.events.push({id:Date.now().toString(36),type:good?'PRACTICE_GOOD':'PRACTICE_BAD',at:new Date().toISOString(),data:{questionId:id,score:good?2:-1}});
   write(d); window.shNav?.('practice');
 };
}
function recallFix(){
 const old=window.shRecall;
 if(!old || old.__v103)return;
 const f=function(id){
   const before=read(); old(id);
   setTimeout(()=>{
     const d=read(); if(!d||!before)return;
     // V100 increments good/bad by counts; convert the newly added event into the requested score.
     const ev=(d.events||[]).slice(-1)[0];
     if(ev && (ev.type==='RECALL_GOOD'||ev.type==='RECALL_BAD')){
       d.stats=d.stats||{minutes:0,good:0,bad:0};
       if(ev.type==='RECALL_GOOD'){d.stats.good=Math.max(0,(d.stats.good||0)-1)+2}
       else {d.stats.bad=(d.stats.bad||0)+(-1)-0}
       ev.data=Object.assign({},ev.data,{score:ev.type==='RECALL_GOOD'?2:-1});
       write(d);
     }
   },50);
 };
 f.__v103=true; window.shRecall=f;
}
function assetFix(){
 const map={
  './assets/brand/sukoon-brain-192.png':'./sukoon-brain-192.png',
  './assets/brand/sukoon-brain-512.png':'./sukoon-brain-512.png',
  './assets/brand/sciencehub-icon-192.png':'./sciencehub-icon-192.png',
  './assets/brand/sciencehub-icon-512.png':'./sciencehub-icon-512.png',
  './assets/hero/home-hero-character.png':'./home-hero-personal.png'
 };
 $$('img').forEach(i=>{const s=i.getAttribute('src');if(map[s])i.src=map[s]});
}
function pcb(){
 const page=$('.page'); if(!page)return;
 const title=($('.page h1')?.textContent||'').trim();
 if(!PCB[title] && title!=='Subjects')return;
 if($('.sh-v103-pcb',page))return;
 const list=title==='Subjects'
  ? [['Biology','Human Heart','heart','Circulation'],['Biology','Human Body','body','Physiology'],['Biology','Cell','cell','Cell structure'],['Biology','DNA & Genetics','dna','Genetics'],['Physics','Atom & Orbit','atom','Atomic physics'],['Physics','Wave','wave','Waves'],['Physics','Circuit','circuit','Electricity'],['Chemistry','Molecule','molecule','Bonding'],['Chemistry','Flask','flask','Reactions']]
  : PCB[title].map(x=>[title,x[0],x[1],x[2]]);
 const box=document.createElement('section'); box.className='card sh-v103-pcb';
 box.innerHTML='<div class="eyebrow">🧠 SMART STUDY VISUALS</div><h2>Usable study assets</h2><p class="muted">Visual anchors for recall and concept linking.</p><div class="sh-v103-assets">'+list.map(x=>`<button class="sh-v103-asset" data-src="${x[2]}" data-label="${x[1].replace(/"/g,'&quot;')}"><img src="./assets/pcb/${x[2]}.svg" alt="${x[1]}"><span><b>${x[1]}</b><small>${x[3]}</small></span></button>`).join('')+'</div>';
 page.appendChild(box);
}
function homeClean(){
 const page=$('.page'); if(!page)return;
 const h=page.querySelector('h1'); if(!h || !/Good evening/i.test(h.textContent||''))return;
 // If an older repair layer inserted a second hero, keep only the canonical app.js hero.
 const injected=$$('.sh-v102-hero,.sh-v101-hero,.sh-hero-v101',page);
 injected.forEach(x=>x.remove());
 const duplicateGreetings=$$('.sh-v102-greeting,.sh-v101-greeting',page); duplicateGreetings.forEach(x=>x.closest('section')?.remove());
}
function boot(){
 scoreFix(); recallFix(); assetFix(); homeClean(); pcb();
}
boot();
new MutationObserver(()=>{clearTimeout(window.__v103t);window.__v103t=setTimeout(boot,50)}).observe(document.body,{childList:true,subtree:true});
window.ScienceHubV103={version:'V103',boot};
})();