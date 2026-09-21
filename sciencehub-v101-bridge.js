/* ScienceHub V101 — safe restoration bridge
   Keeps the V100 runtime and adds: legacy DB migration, restored hero shell,
   supplied Sukoon/ScienceHub artwork, live e-orbit icon, voice/camera tools,
   and a lightweight Perspective mount. Never deletes legacy localStorage.
*/
(()=>{
'use strict';
const OLD='sciencehub-v45', NEW='sciencehub-v100-db', MIG='sciencehub-v101-migrated';
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
const arr=(x,k)=>Array.isArray(x?.[k])?x[k]:[];
const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
function mergeUnique(dst,src,key){const seen=new Set(dst.map(x=>key(x)));for(const x of src){const k=key(x);if(!seen.has(k)){dst.push(x);seen.add(k)}}}
function migrate(){
  const old=parse(OLD); if(!old || sessionStorage.getItem(MIG)==='1') return false;
  let cur=parse(NEW);
  if(!cur || typeof cur!=='object') cur={schemaVersion:1,appVersion:'V101-RESTORE'};
  const keys=['tasks','notes','sessions','questions','mistakes','revision','events','topics','chapters','goals','opportunities','maps','resources','school'];
  for(const k of keys){ if(!Array.isArray(cur[k]))cur[k]=[]; const src=k==='sessions'?[]:arr(old,k); mergeUnique(cur[k],src,x=>String(x?.id??x?.title??x?.name??JSON.stringify(x))); }
  if(!cur.exams)cur.exams=[]; mergeUnique(cur.exams,arr(old,'examTracker'),x=>String(x?.id??x?.title??JSON.stringify(x)));
  if(!cur.world)cur.world=[]; mergeUnique(cur.world,arr(old,'worldKnowledge'),x=>String(x?.id??x?.title??JSON.stringify(x)));
  if(!cur.recovery)cur.recovery=[]; mergeUnique(cur.recovery,arr(old,'recovery'),x=>String(x?.id??JSON.stringify(x)));
  cur.space=Object.assign({bookmarks:[],ideas:[],projects:[],bioinformatics:[]},cur.space||{});
  if(old.space && typeof old.space==='object') for(const k of Object.keys(cur.space)){ if(Array.isArray(old.space[k])) mergeUnique(cur.space[k],old.space[k],x=>String(x?.id??x?.text??JSON.stringify(x))); }
  cur.settings=Object.assign({quiet:true,cameraMode:'off',perspective:'Student',sukoonEnabled:true,sukoonPosition:null},cur.settings||{},old.settings||{});
  cur.stats=Object.assign({minutes:0,good:0,bad:0},cur.stats||{});
  cur.stats.minutes=Math.max(Number(cur.stats.minutes||0),Number(old.minutes||0));
  cur.stats.good=Math.max(Number(cur.stats.good||0),Number(old.good||0));
  cur.stats.bad=Math.max(Number(cur.stats.bad||0),Number(old.bad||0));
  cur.schemaVersion=Math.max(Number(cur.schemaVersion||1),2); cur.appVersion='V101-RESTORE-INTEGRATED';
  localStorage.setItem(NEW,JSON.stringify(cur));
  sessionStorage.setItem(MIG,'1');
  return true;
}
if(migrate()){ location.reload(); return; }

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderHero(){
 const app=document.getElementById('app'); if(!app || !location.hash && !window.__shLastRoute){}
 if(!app || !document.querySelector('.page')) return;
 const title=app.querySelector('.page h1');
 if(!title || !/Good evening, Ashu\.Ayansh/i.test(title.textContent)) return;
 if(app.querySelector('.sh-hero-v101')) return;
 const stats=parse(NEW)||{};
 const tasks=Array.isArray(stats.tasks)?stats.tasks:[], rev=Array.isArray(stats.revision)?stats.revision:[], ch=Array.isArray(stats.chapters)?stats.chapters:[];
 const due=rev.filter(x=>!x.done&&(!x.due||x.due<=Date.now())).length;
 const weak=ch.filter(x=>x.status==='Weak').length;
 const mins=Number(stats.stats?.minutes||0);
 const hero=document.createElement('section'); hero.className='sh-hero-v101';
 hero.innerHTML=`
 <div class="sh-hero-copy">
   <div class="sh-brandline"><span class="sh-mini-logo">🧬</span><div><b>Science<span>Hub</span></b><small>Study Smarter. Score Higher.</small></div></div>
   <div class="sh-greeting">Good evening,</div><div class="sh-name">Ashu.Ayansh 👋</div>
   <div class="sh-tagline">Discipline today, success tomorrow.</div>
   <div class="sh-hero-grid">
    <article class="sh-mission-v101"><div class="sh-kicker">🎯 TODAY'S MISSION</div><h2>${esc(tasks.find(x=>!x.done)?.title||'Biology — Revision')}</h2><p>Keep one clear target active and turn study time into measurable progress.</p><div class="sh-mission-meta"><span>⏱ ${mins} min logged</span><span>↗ ${due} review due</span></div><button class="sh-primary" onclick="window.shNav('study')">Start Mission ▶</button></article>
    <div class="sh-hero-art"><img src="./assets/hero/home-hero-character.png" alt="ScienceHub study atmosphere"></div>
   </div>
 </div>
 <div class="sh-hero-actions">
  <article><b>⚡ NEXT BEST ACTION</b><h3>${weak?'Repair a weak area':'Start your next study task'}</h3><p>${weak} weak area(s) • ${tasks.filter(x=>!x.done).length} open task(s)</p><button onclick="window.shNav('${weak?'subjects':'study'}')">Do Now ›</button></article>
  <article><b>🔄 REVISION DUE</b><h3>${due} topic${due===1?'':'s'}</h3><p>Use recall → practice → review.</p><button onclick="window.shNav('learning')">Review Now ›</button></article>
  <article><b>📅 STUDY SYSTEM</b><h3>One connected OS</h3><p>Syllabus • Learn • Recall • Practice</p><button onclick="window.shNav('subjects')">View Plan ›</button></article>
 </div>`;
 const page=app.querySelector('.page'); page.insertBefore(hero,page.querySelector('.hero')||page.firstChild.nextSibling);
 const oldHero=page.querySelector(':scope > .hero'); if(oldHero) oldHero.style.display='none';
}
function replaceLiveIcon(){
 const old=document.getElementById('brandCanvas'); if(!old||old.dataset.v101)return;
 const wrap=document.createElement('span'); wrap.className='sh-live-brand'; wrap.innerHTML='<img src="./assets/brand/sciencehub-icon-512.png" alt="ScienceHub app icon"><canvas id="shLiveOrbit" aria-label="Live revolving ScienceHub icon"></canvas>';
 old.replaceWith(wrap);
 const c=wrap.querySelector('canvas'),ctx=c.getContext('2d'),img=wrap.querySelector('img');
 const paths=[{rx:.39,ry:.18,rot:-.35,phase:0,h:195},{rx:.39,ry:.18,rot:.35,phase:Math.PI,h:285},{rx:.35,ry:.23,rot:.78,phase:Math.PI/2,h:35},{rx:.35,ry:.23,rot:-.78,phase:Math.PI*1.5,h:315}];
 function resize(){const d=Math.min(devicePixelRatio||1,2),s=wrap.clientWidth||42;c.width=s*d;c.height=s*d;ctx.setTransform(d,0,0,d,0,0);c._s=s} resize(); addEventListener('resize',resize);
 function pt(p,a,s){const x=Math.cos(a)*p.rx*s,y=Math.sin(a)*p.ry*s,c=Math.cos(p.rot),q=Math.sin(p.rot);return{x:x*c-y*q,y:x*q+y*c}}
 function frame(t){const s=c._s||42,cx=s/2,cy=s/2;ctx.clearRect(0,0,s,s);const base=(t/1000%3.5)/3.5*Math.PI*2;for(const p of paths){ctx.save();ctx.translate(cx,cy);ctx.rotate(p.rot);ctx.beginPath();ctx.ellipse(0,0,p.rx*s,p.ry*s,0,0,Math.PI*2);ctx.strokeStyle=`hsla(${p.h},100%,74%,.55)`;ctx.lineWidth=Math.max(.5,s*.008);ctx.stroke();ctx.restore();const z=pt(p,base+p.phase,s),px=cx+z.x,py=cy+z.y,r=Math.max(1.4,s*.035);ctx.fillStyle=`hsl(${p.h},100%,82%)`;ctx.shadowColor=`hsl(${p.h},100%,70%)`;ctx.shadowBlur=r*3;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}requestAnimationFrame(frame)} requestAnimationFrame(frame); old.dataset.v101='1';
}
function toolDock(){if(document.getElementById('shV101Dock'))return;const d=document.createElement('div');d.id='shV101Dock';d.innerHTML='<button data-a="voice">🎙️</button><button data-a="speak">🔊</button><button data-a="camera">📷</button><button data-a="recall">🧠</button><button data-a="review">🔁</button>';document.body.appendChild(d);d.onclick=e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;if(a==='camera')window.shCamera?.();if(a==='speak')window.shSpeak?.(document.querySelector('main')?.innerText||'');if(a==='recall')window.shNav?.('learning');if(a==='review')window.shNav?.('learning');if(a==='voice'){const t=document.activeElement?.matches?.('input,textarea')?document.activeElement:document.querySelector('textarea,input[type=text]');if(t)window.ScienceHubVoice?.startVoice(t);else alert('Tap a text field first, then press 🎙️.')}}}
function patchPerspective(){if(document.getElementById('perspectiveMount'))return;const p=document.createElement('div');p.id='perspectiveMount';document.querySelector('main')?.after(p);}
function boot(){window.db=parse(NEW)||{};replaceLiveIcon();toolDock();patchPerspective();renderHero();setTimeout(renderHero,250);setTimeout(renderHero,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
new MutationObserver(()=>{replaceLiveIcon();renderHero()}).observe(document.body,{childList:true,subtree:true});
})();
