/* ScienceHub V73 — unified local-first Study OS runtime
 * Single data store, deterministic rendering, migration-safe, offline-first.
 */
const KEY = "sciencehub-v45";
const OLD_KEY = "sciencehub-v1";
const APP_VERSION = "V80-UPMSP-2026-27";
const subjects = ["Biology","Physics","Chemistry","English","Hindi"];
const statuses = ["Not Started","Learning","Learned","Revision Due","Strong","Weak","Mastered"];
const priorities = ["high","normal","low"];
const $ = id => document.getElementById(id);
let current = "home";
let syllabusData = null;
let syllabusClass = 11;
let searchTerm = "";
let focusTimer = { end: 0, started: 0, durationMs: 0, taskId: null, interval: null };

function fresh(){return {
  schemaVersion:15, appVersion:APP_VERSION,
  tasks:[], notes:[], revision:[], events:[], minutes:0, good:0, bad:0,
  chapters:[], topics:[], questions:[], mistakes:[], flashcards:[], maps:[], resources:[],
  goals:[], examTracker:[], opportunities:[], worldKnowledge:[],
  school:{teachers:[],homework:[],practicals:[],schedule:[]},
  space:{bookmarks:[],ideas:[],projects:[],bioinformatics:[]},
  recovery:[],
  step9:{checkins:[],priorities:[],reviews:[],lastBackup:null},
  settings:{quiet:true,cameraMode:"off",sukoonPosition:{x:null,y:null},sukoonContext:true,aiProvider:"local",aiEndpoint:"",aiModel:""}
}}

function seedChapters(){return [
 {id:"bio-1",subject:"Biology",name:"The Living World",status:"Not Started"},
 {id:"bio-2",subject:"Biology",name:"Biological Classification",status:"Not Started"},
 {id:"bio-3",subject:"Biology",name:"Plant Kingdom",status:"Not Started"},
 {id:"bio-4",subject:"Biology",name:"Animal Kingdom",status:"Not Started"},
 {id:"bio-5",subject:"Biology",name:"Morphology of Flowering Plants",status:"Not Started"},
 {id:"phy-1",subject:"Physics",name:"Units and Measurements",status:"Not Started"},
 {id:"phy-2",subject:"Physics",name:"Motion in a Straight Line",status:"Not Started"},
 {id:"phy-3",subject:"Physics",name:"Motion in a Plane",status:"Not Started"},
 {id:"chem-1",subject:"Chemistry",name:"Some Basic Concepts of Chemistry",status:"Not Started"},
 {id:"chem-2",subject:"Chemistry",name:"Structure of Atom",status:"Not Started"},
 {id:"chem-3",subject:"Chemistry",name:"Classification of Elements",status:"Not Started"}
]}

function normalise(raw){
  const base=fresh(), x=raw&&typeof raw==='object'?raw:{};
  const out=Object.assign(base,x);
  for(const k of ["tasks","notes","revision","events","chapters","topics","questions","mistakes","flashcards","maps","resources","goals","examTracker","opportunities","worldKnowledge","recovery"]){if(!Array.isArray(out[k]))out[k]=[]}
  out.school=Object.assign(base.school, x.school||{});
  for(const k of ["teachers","homework","practicals","schedule"]){if(!Array.isArray(out.school[k]))out.school[k]=[]}
  out.space=Object.assign(base.space,x.space||{});
  for(const k of ["bookmarks","ideas","projects","bioinformatics"]){if(!Array.isArray(out.space[k]))out.space[k]=[]}
  out.step9=Object.assign(base.step9,x.step9||{});
  out.step9.backupCount=Number(out.step9.backupCount||0);
  for(const k of ["checkins","priorities","reviews"]){if(!Array.isArray(out.step9[k]))out.step9[k]=[]}
  out.settings=Object.assign(base.settings,x.settings||{});
  out.settings.sukoonPosition=Object.assign(base.settings.sukoonPosition,x.settings?.sukoonPosition||{});
  if(!out.chapters.length)out.chapters=seedChapters();
  out.schemaVersion=Math.max(Number(out.schemaVersion||0),15);
  out.appVersion=APP_VERSION;
  return out;
}

function migrate(){
  try{const currentData=localStorage.getItem(KEY);if(currentData)return normalise(JSON.parse(currentData))}catch(e){}
  try{
    const old=localStorage.getItem(OLD_KEY);
    if(old){const x=JSON.parse(old);const n=normalise(x);n.chapters=seedChapters();localStorage.setItem(KEY,JSON.stringify(n));return n}
  }catch(e){}
  try{
    const s9=localStorage.getItem("sciencehub-step9");
    if(s9){const n=normalise({});n.step9=Object.assign(n.step9,JSON.parse(s9));localStorage.setItem(KEY,JSON.stringify(n));return n}
  }catch(e){}
  return normalise({});
}
let db=migrate();

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function id(){return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function save(reason){db=normalise(db);if(reason)db.events.push({id:id(),type:"STATE_SAVED",at:new Date().toISOString(),data:{reason}});localStorage.setItem(KEY,JSON.stringify(db));render()}
function ev(type,data={},rerender=true){db.events.push({id:id(),type,at:new Date().toISOString(),data});if(rerender)localStorage.setItem(KEY,JSON.stringify(db))}
function go(p){current=p;closeDrawer();render();window.scrollTo(0,0)}
function icon(x){return ({academic:"🎓",learning:"🧠",revision:"🔁",progress:"📈",school:"🏫",opportunities:"🎯",time:"⏱️",space:"🗂️",world:"🌍",focus:"⏳"})[x]||"•"}
function label(x){return ({academic:"Academic",learning:"Learning Lab",revision:"Revision Engine",progress:"Progress & Analytics",school:"School",opportunities:"PCB Opportunities",time:"Time Tracking",space:"My Space",world:"World Knowledge",focus:"Focus Mode"})[x]||x}
function dueRevisions(){return db.revision.filter(r=>r.status!=="done" && (!r.due||r.due<=Date.now())).sort((a,b)=>(a.due||0)-(b.due||0))}
function openTasks(){return db.tasks.filter(t=>!t.done)}
function pct(){const total=db.tasks.length;return total?Math.round(db.tasks.filter(t=>t.done).length/total*100):0}
function intelligenceSnapshot(){
 const open=openTasks();
 const due=dueRevisions();
 const weak=db.chapters.filter(c=>c.status==='Weak');
 const mistakeCounts={};
 db.mistakes.forEach(m=>{const k=`${m.subject||''}|${m.chapter||''}`;mistakeCounts[k]=(mistakeCounts[k]||0)+1});
 const repeated=Object.entries(mistakeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,n])=>({key:k,count:n}));
 const planned=open.reduce((a,t)=>a+Number(t.minutes||0),0);
 return {openCount:open.length,dueCount:due.length,weakCount:weak.length,plannedMinutes:planned,activeMinutes:Number(db.minutes||0),practiceNet:Number(db.good||0)-Number(db.bad||0),repeatedMistakes:repeated};
}
function nextAction(){
 const now=Date.now();
 const candidates=[];
 dueRevisions().slice(0,10).forEach(r=>candidates.push({score:100-(r.due&&r.due<now-86400000?0:10),title:`Revise ${r.title||r.topic}`,why:'Revision is due',action:`completeRevision('${r.id}')`}));
 db.chapters.filter(c=>c.status==='Weak').slice(0,8).forEach(c=>candidates.push({score:80,title:`Repair ${c.name}`,why:`${c.subject} is marked Weak`,action:`quickRevision('${c.id}')`}));
 openTasks().forEach(t=>{const p={high:70,normal:50,low:30}[t.priority]??50;candidates.push({score:p+(Number(t.minutes||0)<=45?8:0),title:t.title,why:`${t.priority||'normal'} priority study task`,action:`startTask('${t.id}')`})});
 const repeated=intelligenceSnapshot().repeatedMistakes[0];
 if(repeated&&repeated.count>=2){const [subject,chapter]=repeated.key.split('|');candidates.push({score:90,title:`Repair repeated mistakes${chapter?` in ${chapter}`:''}`,why:`${repeated.count} mistakes are recorded in the same area`,action:chapter?`addRevision('${subject}','${chapter}','Repeated mistake pattern')`:`go('mistakes')`})}
 candidates.sort((a,b)=>b.score-a.score);
 return candidates[0]||{title:"Create today's first study task",why:"Your active queue is clear",action:"go('study')"};
}

function home(){
 const action=nextAction(), done=db.tasks.filter(t=>t.done).length, due=dueRevisions().length, task=openTasks()[0];
 return `<section class="page home-page home-v3">
  <div class="home-ambient" aria-hidden="true"></div>
  <div class="home-v3-head">
   <div><div class="eyebrow">SCIENCEHUB • PERSONAL KNOWLEDGE UNIVERSE</div><h1>Good evening, Ashu.Ayansh.</h1><p>Calm enough to think. Clear enough to act.</p></div>
   <div class="home-core" aria-hidden="true"><img src="sciencehub-icon.png" alt=""><span></span></div>
  </div>
  <div class="search home-search"><input value="${esc(searchTerm)}" placeholder="🌐 Search your ScienceHub..." oninput="search(this.value)"><button class="btn secondary" onclick="go('world')">Aui</button></div>
  ${searchTerm?searchResults():''}
  <div class="mission-core">
   <div class="mission-kicker"><span>🎯 TODAY'S MISSION</span><span class="mission-status">${task?'READY':'OPEN'}</span></div>
   <h2>${esc(task?.title||"Create your first study mission")}</h2>
   <p>${task?`${esc(task.priority||"normal")} • ${task.minutes||0} min`:'One clear target. One focused session. No noise.'}</p>
   <button class="btn mission-btn" onclick="${task?`startTask('${task.id}')`:`go('study')`}">${task?'START MISSION':'CREATE MISSION'} <span>→</span></button>
  </div>
  <div class="next-action-card"><div><div class="eyebrow">⚡ NEXT BEST ACTION</div><h3>${esc(action.title)}</h3><p>${esc(action.why)}</p></div><button class="btn secondary" onclick="${action.action}">DO IT</button></div>
  <div class="home-strip"><div><small>REVISION</small><b>${due} due</b></div><div><small>ACTIVE STUDY</small><b>${db.minutes} min</b></div><div><small>TASKS DONE</small><b>${done}</b></div><div><small>COMPLETION</small><b>${pct()}%</b></div></div>
  <div class="home-section-heading"><div><div class="eyebrow">EXPLORE YOUR UNIVERSE</div><h2>Quick Access</h2></div><span>Only what you need often</span></div>
  <div class="quick-grid home-quick">${["study","academic","subjects","learning","practice","revision","progress","space"].map(x=>`<button class="quick" onclick="go('${x}')"><span class="quick-icon">${icon(x)}</span><b>${label(x)}</b></button>`).join("")}</div>
  <div class="card section ai-center home-ai"><div class="eyebrow">AI COMMAND CENTER</div><h2>Choose your intelligence</h2><div class="ai-grid"><button onclick="aiRole('KuroVen')"><b>🖤 KuroVen</b><span>Action → execution</span></button><button onclick="aiRole('Hikaitage')"><b>🧭 Hikaitage</b><span>Learning + strategy</span></button><button onclick="aiRole('HukoVaige')"><b>🧠 HukoVaige</b><span>Patterns + reflection</span></button><button onclick="go('world')"><b>🌍 WORLD / Aui</b><span>Open when you call Aui</span></button></div></div>
  <div class="home-quote"><span>✦</span><div><small>YOUR NEXT THOUGHT</small><b>${esc(sukoonQuote())}</b></div></div>
  ${sukoonCompanionMarkup()}
  ${step68Markup()}
  ${step9Markup()}
  <section class="card section home-future"><div class="eyebrow">YOUR HORIZON</div><h2>Future Possibilities</h2><p class="muted">Bioinformatics • research • scholarships • careers • competitions</p><button class="btn secondary" onclick="go('opportunities')">Explore</button></section>
  <section class="card section pcb-final"><div class="eyebrow">FINAL SECTION</div><h2>🎯 PCB Opportunities</h2><p class="muted">Scholarships • Research • Courses • Internships • Careers • Competitions • Exam Tracker</p><div class="actions"><button class="btn" onclick="go('opportunities')">Open PCB Opportunities</button><button class="btn secondary" onclick="go('exam')">Exam Tracker</button></div></section>
 </section>`;
}

function sukoonCompanionMarkup(){
 const pos=db.settings?.sukoonPosition||{};
 const style=(Number.isFinite(pos.x)&&Number.isFinite(pos.y))?`left:${pos.x}px;top:${pos.y}px;right:auto;bottom:auto;`:'right:14px;bottom:84px;';
 return `<div id="sukoonCompanion" class="sukoon-float" style="${style}" role="button" tabindex="0" aria-label="Open Sukoon.Brain companion" onclick="sukoonTap(event)" onkeydown="if(event.key==='Enter'||event.key===' ')openSukoon()">
   <div class="sukoon-orbit"><img src="sukoon-brain-figure.png" alt="Sukoon.Brain ScienceHub companion"></div><span class="sukoon-pulse"></span><span class="sukoon-drag" aria-hidden="true">⠿</span>
 </div>`;
}
function sukoonStore(){
 try{return JSON.parse(localStorage.getItem('sciencehub-sukoon-chat-v1')||'[]')}catch(e){return []}
}
function sukoonSaveChat(chat){localStorage.setItem('sciencehub-sukoon-chat-v1',JSON.stringify(chat.slice(-80)))}
function sukoonTap(e){
 if(window.__sukoonDragged){window.__sukoonDragged=false;return}
 openSukoon();
}
function sukoonQuote(){
 const quotes=[
  'Progress becomes easier when the next step is clear.',
  'You do not need a perfect session; you need a real one.',
  'A difficult chapter is a signal to change the method, not to give up.',
  'Small focused sessions compound into serious progress.',
  'Understand first. Then practice until the idea becomes yours.',
  'Your mistakes are useful when they become instructions for the next attempt.',
  'Consistency is built from ordinary sessions done repeatedly.',
  'When motivation is low, reduce the size of the next action.',
  'A strong study system turns confusion into a sequence of actions.',
  'Learning gets stronger when you explain, retrieve, test, and correct.',
  'Do the next useful thing, then let the next thing become visible.',
  'You can restart a session without restarting your whole plan.'
 ];
 let used=[]; try{used=JSON.parse(localStorage.getItem('sciencehub-sukoon-quotes-v1')||'[]')}catch(e){}
 let available=quotes.filter(q=>!used.includes(q));
 if(!available.length){used=[];available=quotes.slice()}
 const q=available[Math.floor(Math.random()*available.length)];
 used.push(q);localStorage.setItem('sciencehub-sukoon-quotes-v1',JSON.stringify(used));
 return q;
}
function sukoonLocalReply(mode,text){
 const t=text.toLowerCase();
 const chat=sukoonStore();
 const recent=chat.filter(x=>x.role==='user').slice(-3).map(x=>x.text);
 const ctx=sukoonContext();
 let reply='';
 if(/^(hi|hello|hey|hii|namaste|salaam|salam)\b/.test(t)) reply=`Hey 👋 I’m here. You can talk normally—study, confusion, plans, or just what is on your mind. ${sukoonQuote()}`;
 else if(/study|padh|chapter|physics|chemistry|biology|bio|english|hindi|exam|test|revision|homework|school/.test(t)){
   const snap=intelligenceSnapshot();
   if(/can't|cant|unable|not able|mann nahi|man nahi|bore|boring|lazy|procrast|avoid|distract/.test(t)) reply=`Let's make the problem smaller instead of forcing a huge session. Pick one concrete target, set a short focus block, and begin with the easiest visible step. If you tell me the subject and chapter, I can turn it into a simple next action.`;
   else if(/confus|understand|samajh|hard|difficult|tough/.test(t)) reply=`Let's separate the confusion into pieces: **what you know → what is unclear → one example → one practice question**. Tell me the exact concept or question and I'll work through it with you.`;
   else reply=`Got it. We can work on this step by step. First identify the exact target, then do one active task—recall, solve, explain, or test. ${snap.dueCount?`You currently have ${snap.dueCount} revision item(s) due. `:''}If you give me the topic, I'll help choose the next move.`;
 } else if(/sad|upset|stress|stressed|tension|worried|overthink|alone|pressure|fear|afraid/.test(t)){
   reply=`I hear that this feels heavy. You don't have to explain everything at once. Start with the part you can put into words, and I'll stay focused on what you actually share. We can then decide whether you want to **reflect** or take one small action.`;
 } else if(/goal|future|career|bioinformatics|dream|plan/.test(t)){
   reply=`Let's turn the bigger goal into a nearer step. A useful plan has **direction → current priority → next action → review**. Tell me what outcome you want and what is currently blocking it.`;
 } else if(/what can you do|how can you help|help me/.test(t)){
   reply=`I can listen, reflect on what you express, help you analyze a study or decision pattern, and turn it into a practical next step. I only use what you choose to share and permitted ScienceHub context.`;
 } else if(/thank|thanks|thx/.test(t)) reply=`You're welcome 🤍. Keep the next step simple and concrete. ${sukoonQuote()}`;
 else {
   const starters={Listen:'Thanks for sharing that. I’m listening first. What part feels most important to you right now?',Reflect:'Let’s slow it down: what happened, what did you expect, and what is bothering you about the difference?',Analyze:'From what you expressed, we can examine the situation without assuming hidden thoughts. What keeps repeating or getting in the way?',Act:'Let’s convert this into one action you can actually do. What is the smallest useful step available right now?'};
   reply=starters[mode]||starters.Listen;
 }
 if(ctx && mode==='Analyze') reply += ` ${ctx}`;
 if(recent.length>1 && mode==='Analyze' && !reply.includes('repeating')) reply += ` You’ve also mentioned ${recent.length} recent points here, so we can compare them rather than judging one moment in isolation.`;
 return reply;
}
function openSukoon(){
 const m=$("modal"), chat=sukoonStore();
 m.innerHTML=`<div class="modalbox sukoon-chat-modal"><div class="row"><div><div class="eyebrow">SCIENCEHUB COMPANION</div><h2>🤍 Sukoon.Brain</h2><p class="muted">Companion + understanding layer • local-first</p></div><button class="iconbtn" onclick="closeModal()" aria-label="Close Sukoon.Brain">✕</button></div>
 <div class="sukoon-chat-head"><img src="sukoon-brain-figure.png" alt="Sukoon.Brain"><div><b>I'm listening.</b><small>Talk naturally. I respond from what you choose to share.</small></div></div>
 <div id="sukoonMessages" class="sukoon-messages">${chat.length?chat.map(sukoonMessageHTML).join(''):`<div class="sukoon-msg bot"><b>Sukoon.Brain</b><div>Hey, Ashu 🤍. You can start anywhere. Tell me what you want to talk through.</div></div>`}</div>
 <div class="sukoon-modebar">${['Listen','Reflect','Analyze','Act'].map(x=>`<button onclick="setSukoonMode('${x}')">${x}</button>`).join('')}</div>
 <div class="sukoon-composer"><textarea id="sukoonInput" rows="2" placeholder="Talk to Sukoon.Brain…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendSukoon()}"></textarea><button class="btn" onclick="sendSukoon()">Send</button></div>
 <div class="sukoon-foot"><span id="sukoonMode">Mode: Listen</span><button class="btn secondary" onclick="clearSukoonChat()">Clear chat</button></div>
 <div class="notice section">Privacy: chat is stored locally on this device. Sukoon.Brain does not read minds or diagnose you.</div></div>`;
 m.style.display='block';
 setTimeout(()=>{const x=$("sukoonInput");if(x)x.focus();const box=$("sukoonMessages");if(box)box.scrollTop=box.scrollHeight},30);
}
function sukoonMessageHTML(x){return `<div class="sukoon-msg ${x.role==='user'?'user':'bot'}"><b>${x.role==='user'?'You':'Sukoon.Brain'}</b><div>${esc(x.text).replace(/\n/g,'<br>')}</div></div>`}
function setSukoonMode(mode){const el=$("sukoonMode");if(el)el.textContent='Mode: '+mode;const input=$("sukoonInput");if(input)input.placeholder=`${mode}: write anything…`;}
function sendSukoon(){
 const input=$("sukoonInput"); if(!input)return; const text=input.value.trim(); if(!text)return;
 const mode=(($("sukoonMode")?.textContent||'Mode: Listen').replace('Mode: ','')||'Listen');
 const chat=sukoonStore(); chat.push({role:'user',text,mode,at:new Date().toISOString()});
 const reply=sukoonLocalReply(mode,text); chat.push({role:'assistant',text:reply,mode,at:new Date().toISOString()}); sukoonSaveChat(chat); input.value=''; openSukoon();
}
function sukoonAction(mode){openSukoon();setTimeout(()=>setSukoonMode(mode),40)}
function clearSukoonChat(){if(!confirm('Clear Sukoon.Brain local chat history?'))return;localStorage.removeItem('sciencehub-sukoon-chat-v1');openSukoon()}
function initSukoonDrag(){
 const el=$("sukoonCompanion"); if(!el)return;
 let drag=false, moved=false, sx=0, sy=0, ox=0, oy=0;
 const start=e=>{if(e.target.closest('button'))return;drag=true;moved=false;const p=e.touches?e.touches[0]:e;const r=el.getBoundingClientRect();sx=p.clientX;sy=p.clientY;ox=r.left;oy=r.top;el.classList.add('dragging');e.preventDefault()};
 const move=e=>{if(!drag)return;const p=e.touches?e.touches[0]:e;if(Math.abs(p.clientX-sx)+Math.abs(p.clientY-sy)>6)moved=true;let x=Math.max(4,Math.min(window.innerWidth-el.offsetWidth-4,ox+p.clientX-sx));let y=Math.max(4,Math.min(window.innerHeight-el.offsetHeight-4,oy+p.clientY-sy));el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto';e.preventDefault()};
 const end=()=>{if(!drag)return;drag=false;el.classList.remove('dragging');window.__sukoonDragged=moved;if(moved){const r=el.getBoundingClientRect();db.settings.sukoonPosition={x:Math.round(r.left),y:Math.round(r.top)};localStorage.setItem(KEY,JSON.stringify(db))}};
 el.addEventListener('pointerdown',start,{passive:false});window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end);el.addEventListener('touchstart',start,{passive:false});window.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);
}
function search(v){searchTerm=v;render()}

function study(){return `<section class="page"><div class="row"><div><div class="eyebrow">STUDY</div><h1>Plan → Focus → Finish</h1></div><button class="btn" onclick="openTaskForm()">+ Task</button></div><div id="taskForm"></div>${focusPanel()}<div class="list section">${db.tasks.length?db.tasks.map(taskCard).join(""):`<div class="card">No tasks yet. Add one small executable task.</div>`}</div></section>`}
function taskCard(t){return `<div class="item ${t.done?'done':''}"><div class="row"><b>${esc(t.title)}</b><span class="tag">${esc(t.priority||'normal')}</span></div><div class="muted">${esc(t.subject||'General')} ${t.chapter?'• '+esc(t.chapter):''} • ${t.minutes||0} min</div><div class="actions">${!t.done?`<button class="btn good" onclick="startTask('${t.id}')">Focus</button><button class="btn secondary" onclick="doneTask('${t.id}')">Complete +2</button>`:`<span class="goodtxt">✓ Completed</span>`}<button class="btn secondary" onclick="archiveTask('${t.id}')">Archive</button></div></div>`}
function openTaskForm(){
 const c=`<div class="card form section"><input id="taskTitle" placeholder="e.g. Biology — Plant Kingdom diagrams"><select id="taskSubject">${subjects.map(s=>`<option>${s}</option>`).join("")}</select><select id="taskChapter"><option value="">No chapter</option></select><input id="taskMins" type="number" value="45" min="5" max="600"><select id="taskPriority">${priorities.map(x=>`<option ${x==='normal'?'selected':''}>${x}</option>`).join("")}</select><button class="btn" onclick="addTask()">Add task</button></div>`;
 $("taskForm").innerHTML=c;fillChapters("taskSubject","taskChapter");
}
function fillChapters(a,b){const s=$(a),c=$(b);if(!s||!c)return;c.innerHTML='<option value="">No chapter</option>'+db.chapters.filter(x=>x.subject===s.value).map(x=>`<option>${esc(x.name)}</option>`).join('');s.onchange=()=>fillChapters(a,b)}
function addTask(){const title=$("taskTitle")?.value.trim();if(!title)return alert("Write a task first.");const minutes=Math.max(5,Math.min(600,+$("taskMins").value||45));db.tasks.push({id:id(),title,subject:$("taskSubject").value,chapter:$("taskChapter").value,minutes,priority:$("taskPriority").value,done:false,createdAt:new Date().toISOString()});ev("TASK_CREATED",{title},false);save("task-created")}
function doneTask(tid){const t=db.tasks.find(x=>x.id===tid);if(!t||t.done)return;t.done=true;db.minutes+=Number(t.minutes||0);ev("STUDY_SESSION_COMPLETED",{taskId:tid,minutes:t.minutes},false);stopFocus(false);save("task-completed")}
function startTask(tid){const t=db.tasks.find(x=>x.id===tid);if(!t)return;current="study";render();startFocus(tid)}
function archiveTask(tid){const t=db.tasks.find(x=>x.id===tid);if(!t)return;db.recovery.unshift({id:id(),kind:"task",item:t,archivedAt:new Date().toISOString()});db.tasks=db.tasks.filter(x=>x.id!==tid);save("task-archived")}
function focusPanel(){return `<div class="card focus-panel section"><div class="row"><div><b>⏳ Focus Mode</b><div class="muted">Active Study Duration is counted only while the focus session runs.</div></div><button class="btn secondary" onclick="focusQuick()">25 min</button></div><div id="focusStatus" class="focus-status">No active focus session.</div></div>`}
function focusQuick(){const t=openTasks()[0];if(t)startFocus(t.id);else alert("Create a task first.")}
function startFocus(tid){stopFocus(false);const mins=Math.max(1,Math.min(180,+prompt("Focus duration in minutes?","25")||25));focusTimer={end:Date.now()+mins*60000,started:Date.now(),durationMs:mins*60000,taskId:tid,interval:setInterval(tickFocus,1000)};tickFocus();}
function tickFocus(){const el=$("focusStatus");if(!focusTimer.interval)return;if(Date.now()>=focusTimer.end){const t=db.tasks.find(x=>x.id===focusTimer.taskId);if(t){const minutes=Math.max(1,Math.round(focusTimer.durationMs/60000));db.minutes+=minutes;ev("FOCUS_FINISHED",{taskId:t.id,minutes},false);localStorage.setItem(KEY,JSON.stringify(db));}stopFocus(false);if(el)el.textContent="Focus complete. Review what you learned.";return}const sec=Math.max(0,Math.ceil((focusTimer.end-Date.now())/1000));if(el)el.textContent=`Focus running • ${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function stopFocus(clear=true){if(focusTimer.interval)clearInterval(focusTimer.interval);focusTimer={end:0,started:0,durationMs:0,taskId:null,interval:null};if(clear)render()}

function subjectsPage(){
 const cls=syllabusClass, data=syllabusData?.subjects?.[String(cls)]||{};
 return `<section class="page"><div class="eyebrow">SUBJECTS • UPMSP 2026–27</div><div class="row"><div><h1>Class ${cls} Core</h1><p class="muted">Official UPMSP syllabus structure • headings → topics → PYQ hub.</p></div><button class="btn secondary" onclick="go('syllabus')">Full Syllabus</button></div>
 <div class="segmented section"><button class="${cls===11?'active':''}" onclick="setSyllabusClass(11)">Class 11</button><button class="${cls===12?'active':''}" onclick="setSyllabusClass(12)">Class 12</button></div>
 <div class="grid">${subjects.map(s=>{const v=data[s], tracked=db.chapters.filter(c=>c.subject===s),done=tracked.filter(c=>['Learned','Strong','Mastered'].includes(c.status)).length;return `<div class="card subject-card"><div class="row"><b>${s}</b><span class="tag">${v?.units?.length||0} units</span></div><div class="muted">${tracked.length?`${done}/${tracked.length} tracked`:v?.units?.map(u=>u[0]).slice(0,2).join(' • ')||'Syllabus loading…'}</div><div class="actions section"><button class="btn secondary" onclick="openSyllabusSubject(${cls},'${s}')">Open syllabus</button><button class="btn" onclick="openPYQHub(${cls},'${s}')">PYQs</button></div></div>`}).join('')}</div>
 <div class="card section"><div class="row"><b>⚛️ Class 11 ↔ Class 12 bridge</b><span class="tag">Integrated</span></div><p class="muted">Class 11 is the active foundation; Class 12 is the next layer. Overlapping concepts can be connected without mixing exam-year records.</p></div></section>`;
}
function setSyllabusClass(cls){syllabusClass=cls;render()}
function subject(s){current="subject:"+s;render()}
function subjectPage(s){const cs=db.chapters.filter(c=>c.subject===s);return `<section class="page"><button class="btn secondary" onclick="go('subjects')">← Subjects</button><h1>${esc(s)}</h1><div class="list section">${cs.map(c=>`<div class="item"><div class="row"><b>${esc(c.name)}</b><select onchange="setStatus('${c.id}',this.value)">${statuses.map(x=>`<option ${x===c.status?'selected':''}>${x}</option>`).join('')}</select></div><div class="muted">Status changes revision attention; one mistake alone does not make a chapter weak.</div><div class="actions"><button class="btn secondary" onclick="quickRevision('${c.id}')">+ Revision</button><button class="btn secondary" onclick="addTopic('${c.id}')">+ Topic</button></div></div>`).join('')}</div></section>`}
function syllabus(){
 const cls=syllabusClass, data=syllabusData?.subjects?.[String(cls)]||{};
 if(!syllabusData)return `<section class="page"><div class="eyebrow">UPMSP 2026–27</div><h1>Syllabus loading…</h1><p class="muted">Loading the locally cached syllabus index.</p></section>`;
 return `<section class="page"><div class="eyebrow">UPMSP • SESSION 2026–27</div><div class="row"><div><h1>Complete Syllabus</h1><p class="muted">Class ${cls} • Hindi, English, Physics, Chemistry, Biology</p></div><a class="btn secondary" href="${syllabusData.meta.source_page}" target="_blank" rel="noopener">Official source</a></div><div class="segmented section"><button class="${cls===11?'active':''}" onclick="setSyllabusClass(11)">Class 11</button><button class="${cls===12?'active':''}" onclick="setSyllabusClass(12)">Class 12</button></div><div class="list section">${subjects.map(s=>{const v=data[s];return `<div class="card syllabus-subject"><div class="row"><h2>${s}</h2><span class="tag">${v?.code||''}</span></div><div class="muted">${v?.units?.length||0} syllabus sections • 2026–27</div><div class="list section">${(v?.units||[]).map((u,i)=>`<details class="syllabus-unit" ${i<1?'open':''}><summary><span><b>${esc(u[0])}</b><small>${esc(u[1])}</small></span><span>›</span></summary><div class="syllabus-topics">${(u[2]||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div></details>`).join('')}</div><div class="actions"><a class="btn secondary" href="${v?.url||'#'}" target="_blank" rel="noopener">Official PDF</a><button class="btn" onclick="openPYQHub(${cls},'${s}')">PYQ Hub 2020–26</button></div></div>`}).join('')}</div><div class="notice section"><b>PYQ rule:</b> ScienceHub never fabricates a previous-year question. Each year is treated as a source slot and should be attached only after the paper is verified.</div></section>`;
}
function openSyllabusSubject(cls,s){syllabusClass=cls;current='syllabus';render();setTimeout(()=>{const el=[...document.querySelectorAll('.syllabus-subject h2')].find(x=>x.textContent.trim()===s);el?.closest('.syllabus-subject')?.scrollIntoView({behavior:'smooth',block:'start'});},80)}
function openPYQHub(cls,s){const url=syllabusData?.meta?.pyq_hubs?.[cls===11?'class11':'class12'];if(url)window.open(url,'_blank','noopener');ev('PYQ_HUB_OPENED',{class:cls,subject:s},false)}

function setStatus(cid,v){const c=db.chapters.find(x=>x.id===cid);if(!c)return;c.status=v;if(v==='Revision Due')addRevision(c.subject,c.name,'Status marked Revision Due');ev('CHAPTER_STATUS',{chapter:c.name,status:v},false);save('chapter-status')}
function addTopic(cid){const c=db.chapters.find(x=>x.id===cid),t=prompt('Topic name?');if(!c||!t)return;db.topics.push({id:id(),chapterId:cid,subject:c.subject,chapter:c.name,name:t});save('topic-created')}

function addRevision(subject,topic,reason){const exists=db.revision.find(r=>r.subject===subject&&r.title===topic&&r.status!=='done');if(exists)return exists.id;const rid=id();db.revision.push({id:rid,subject,title:topic,reason,status:'due',due:Date.now()});ev('REVISION_CREATED',{subject,topic,reason},false);return rid}
function completeRevision(rid){const r=db.revision.find(x=>x.id===rid);if(!r)return;const days=Math.max(2,Math.min(14,Number(r.intervalDays||3)+1));r.status='done';r.completedAt=new Date().toISOString();r.intervalDays=days;const nextDue=Date.now()+days*86400000;db.revision.push({id:id(),subject:r.subject,title:r.title,reason:`Adaptive follow-up • ${days} day interval`,status:'due',due:nextDue,intervalDays:days});db.good+=2;ev('REVISION_COMPLETED',{id:rid,nextDue,intervalDays:days},false);save('revision-completed')}
function quickRevision(cid){const c=db.chapters.find(x=>x.id===cid);if(c)addRevision(c.subject,c.name,'Manual revision');save('revision-added')}
function revision(){const due=dueRevisions();return `<section class="page"><div class="eyebrow">REVISION ENGINE</div><h1>Recall → Repair → Revisit</h1><div class="grid3"><div class="card stat"><strong>${due.length}</strong><span>Due now</span></div><div class="card stat"><strong>${db.revision.length}</strong><span>Total review records</span></div><div class="card stat"><strong>${db.good}</strong><span>Positive actions</span></div></div><div class="list section">${due.map(r=>`<div class="item"><div class="row"><b>${esc(r.title)}</b><span class="tag">${esc(r.subject)}</span></div><div class="muted">${esc(r.reason||'Revision')} • due now</div><div class="actions"><button class="btn good" onclick="completeRevision('${r.id}')">Complete +2</button><button class="btn secondary" onclick="liveRecall('${r.id}')">🎙️ Live Recall</button></div></div>`).join('')||'<div class="card goodtxt">Nothing is due right now.</div>'}</div></section>`}
function liveRecall(rid){if(!('webkitSpeechRecognition' in window||'SpeechRecognition' in window)){alert('Speech recognition is not supported in this browser.');return}const R=window.SpeechRecognition||window.webkitSpeechRecognition,rec=new R();rec.lang='en-IN';rec.interimResults=false;rec.maxAlternatives=1;alert('Speak your recall now.');rec.onresult=e=>{const text=e.results[0][0].transcript;db.step9.checkins.unshift({id:id(),text:`Recall for ${rid}: ${text}`,at:new Date().toISOString()});save('live-recall')};rec.onerror=()=>alert('Microphone recall could not start. Check browser microphone permission.');rec.start()}

function learning(){return `<section class="page"><div class="eyebrow">LEARNING LAB</div><h1>Build understanding</h1><div class="grid"><button class="card" onclick="go('notes')">📝 <b>My Notes</b><div class="muted">Write, search, share</div></button><button class="card" onclick="go('flash')">🃏 <b>Flashcards</b><div class="muted">Active recall</div></button><button class="card" onclick="go('maps')">🧩 <b>Concept Maps</b><div class="muted">Connect ideas</div></button><button class="card" onclick="go('resources')">🔗 <b>Resource Hub</b><div class="muted">Save useful resources</div></button></div></section>`}
function notes(){return `<section class="page"><div class="row"><h1>📝 My Notes</h1><button class="btn" onclick="addNote()">+ Note</button></div><div class="list section">${db.notes.map(n=>`<div class="item"><b>${esc(n.title)}</b><p>${esc(n.body)}</p><div class="actions"><button class="btn secondary" onclick="shareNote('${n.id}')">Share</button><button class="btn secondary" onclick="archiveNote('${n.id}')">Archive</button></div></div>`).join('')||'<div class="card">No notes yet.</div>'}</div></section>`}
function addNote(){const t=prompt('Note title?');if(!t)return;const b=prompt('Note body?')||'';db.notes.unshift({id:id(),title:t,body:b,createdAt:new Date().toISOString()});save('note-created')}
function shareNote(nid){const n=db.notes.find(x=>x.id===nid);if(!n)return;const text=`${n.title}\n\n${n.body}\n\nShared from ScienceHub`;if(navigator.share)navigator.share({title:n.title,text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>alert('Copied for sharing.')).catch(()=>alert('Sharing is unavailable.'));else alert(text)}
function archiveNote(nid){const n=db.notes.find(x=>x.id===nid);if(!n)return;db.recovery.unshift({id:id(),kind:'note',item:n,archivedAt:new Date().toISOString()});db.notes=db.notes.filter(x=>x.id!==nid);save('note-archived')}
function simpleList(title,key,emoji,aLabel,bLabel){return `<section class="page"><div class="row"><h1>${emoji} ${title}</h1><button class="btn" onclick="addSimple('${key}')">+ Add</button></div><div class="list section">${db[key].map(x=>`<div class="item"><b>${esc(x.a)}</b><p class="muted">${esc(x.b)}</p></div>`).join('')||'<div class="card">Nothing saved yet.</div>'}</div></section>`}
function flash(){return simpleList('Flashcards','flashcards','🃏','Front','Back')}
function maps(){return simpleList('Concept Maps','maps','🧩','Concept','Connections')}
function resources(){return simpleList('Resource Hub','resources','🔗','Title','Link / note')}
function addSimple(k){const a=prompt(k==='flashcards'?'Front':k==='maps'?'Concept':'Resource title');if(!a)return;const b=prompt(k==='flashcards'?'Back':k==='maps'?'Connections':'Link / note')||'';db[k].push({id:id(),a,b});save('learning-item-created')}

function practice(){return `<section class="page"><div class="eyebrow">PRACTICE LAB</div><h1>Practice → Measure → Improve</h1><div class="grid3"><div class="card stat"><strong>${db.questions.length}</strong><span>Saved questions</span></div><div class="card stat"><strong>${db.good}</strong><span>Good / OK (+2)</span></div><div class="card stat"><strong>${db.bad}</strong><span>Bad (−1)</span></div></div><div class="actions section"><button class="btn" onclick="addQuestion()">+ Question</button><button class="btn secondary" onclick="go('mistakes')">Mistake Book</button></div><div class="list section">${db.questions.map(q=>`<div class="item"><div class="muted">${esc(q.subject)} ${q.chapter?'• '+esc(q.chapter):''}</div><b>${esc(q.text)}</b><div class="actions"><button class="btn good" onclick="answer('${q.id}','good')">Correct +3</button><button class="btn secondary" onclick="answer('${q.id}','ok')">OK +2</button><button class="btn warn" onclick="answer('${q.id}','bad')">Bad −1</button></div></div>`).join('')||'<div class="card">Add a question to start your local practice bank.</div>'}</div></section>`}
function addQuestion(){const text=prompt('Question?');if(!text)return;const s=prompt('Subject? (Biology/Physics/Chemistry/English/Hindi)','Biology')||'General';const c=prompt('Chapter?')||'';db.questions.push({id:id(),text,subject:s,chapter:c,createdAt:new Date().toISOString()});save('question-created')}
function answer(qid,result){const q=db.questions.find(x=>x.id===qid);if(!q)return;if(result==='good'){db.good+=3;ev('QUESTION_GOOD',{id:qid,points:3},false)}else if(result==='ok'){db.good+=2;ev('QUESTION_OK',{id:qid,points:2},false)}else{db.bad+=1;db.mistakes.unshift({id:id(),question:q.text,subject:q.subject,chapter:q.chapter,at:Date.now()});if(q.chapter)addRevision(q.subject,q.chapter,'Wrong answer → revision trigger');ev('QUESTION_BAD',{id:qid,points:-1},false)}save(`question-${result}`)}
function mistakes(){return `<section class="page"><div class="eyebrow">MISTAKE BOOK</div><h1>Turn mistakes into revision</h1><div class="list section">${db.mistakes.map(m=>`<div class="item"><b>${esc(m.question)}</b><div class="muted">${esc(m.subject)} • ${esc(m.chapter||'')}</div><div class="actions"><button class="btn secondary" onclick="mistakeRev('${m.id}')">Revise</button></div></div>`).join('')||'<div class="card goodtxt">No recorded mistakes yet.</div>'}</div></section>`}
function mistakeRev(mid){const m=db.mistakes.find(x=>x.id===mid);if(m){addRevision(m.subject,m.chapter||m.question,'Mistake Book');save('mistake-revision')}}

function progress(){const score=db.good-db.bad;return `<section class="page"><div class="eyebrow">PROGRESS</div><h1>Measure what is improving</h1><div class="grid3"><div class="card stat"><strong>${pct()}%</strong><span>Tasks complete</span></div><div class="card stat"><strong>${db.minutes}</strong><span>Active study min</span></div><div class="card stat"><strong>${score}</strong><span>Practice net</span></div></div><div class="list section">${subjects.map(s=>{const c=db.chapters.filter(x=>x.subject===s),strong=c.filter(x=>['Strong','Mastered'].includes(x.status)).length,weak=c.filter(x=>x.status==='Weak').length;return `<div class="card"><div class="row"><b>${s}</b><span class="muted">${strong} strong • ${weak} weak</span></div><div class="progress"><i style="width:${c.length?strong/c.length*100:0}%"></i></div></div>`}).join('')}</div></section>`}
function academic(){return `<section class="page"><div class="eyebrow">ACADEMIC</div><h1>Class 11 command view</h1><div class="grid">${subjects.map(s=>`<button class="card" onclick="subject('${s}')">📚 <b>${s}</b><div class="muted">${db.chapters.filter(c=>c.subject===s).length} chapters</div></button>`).join('')}</div><div class="card section"><b>Class integration</b><p class="muted">Foundation → Connection → optional depth. Class 12 can broaden overlapping Class 11 concepts.</p></div></section>`}
function school(){return `<section class="page"><div class="eyebrow">SCHOOL</div><h1>School Workspace</h1><div class="grid"><button class="card" onclick="addSchool('schedule')">🗓️ <b>Schedule</b><div class="muted">Add a commitment</div></button><button class="card" onclick="addSchool('teachers')">👨‍🏫 <b>Teachers</b><div class="muted">Add teacher notes</div></button><button class="card" onclick="addSchool('homework')">📚 <b>Homework</b><div class="muted">Convert homework into tasks</div></button><button class="card" onclick="addSchool('practicals')">🧪 <b>Practicals</b><div class="muted">Track practical work</div></button></div><div class="list section">${Object.entries(db.school).flatMap(([k,arr])=>arr.slice(-4).map(x=>`<div class="item"><b>${esc(k)}</b> • ${esc(x.text||x.title||'')}</div>`)).join('')||'<div class="card">No school records yet.</div>'}</div></section>`}
function addSchool(k){const v=prompt(`Add ${k} record?`);if(!v)return;db.school[k].push({id:id(),text:v,createdAt:new Date().toISOString()});save('school-record-created')}

function opportunities(){return `<section class="page"><div class="eyebrow">PCB OPPORTUNITIES</div><h1>Future Possibilities</h1><div class="notice">Fresh scholarships, exams and opportunities are not invented here. Add only verified information and keep its source with the record.</div><div class="grid section">${['Scholarships','Courses / Colleges','Research','Internships','Government Opportunities','Career Opportunities','Competitions','Exam Tracker','Future Scope'].map(x=>`<button class="card" onclick="addOpportunity('${x}')"><b>${x}</b><div class="muted">Add verified item</div></button>`).join('')}</div><div class="list section">${db.opportunities.map(x=>`<div class="item"><b>${esc(x.title)}</b><div class="muted">${esc(x.type)} • ${new Date(x.savedAt).toLocaleDateString()}</div></div>`).join('')||'<div class="card">No saved opportunities.</div>'}</div></section>`}
function addOpportunity(type){const title=prompt(`${type}: title/name?`);if(!title)return;const source=prompt('Source or link (optional)?')||'';db.opportunities.unshift({id:id(),title,type,source,savedAt:new Date().toISOString()});save('opportunity-saved')}
function examTracker(){return `<section class="page"><div class="row"><h1>🧭 Exam Tracker</h1><button class="btn" onclick="addExam()">+ Exam</button></div><div class="list section">${db.examTracker.map(e=>`<div class="item"><div class="row"><b>${esc(e.name)}</b><span class="tag">${esc(e.status)}</span></div><div class="muted">${esc(e.date||'Date not set')}</div><div class="actions"><button class="btn secondary" onclick="setExamStatus('${e.id}','Exam went smoothly')">Smooth</button><button class="btn secondary" onclick="setExamStatus('${e.id}','Exam went with trouble')">Trouble</button></div></div>`).join('')||'<div class="card">No exams tracked yet.</div>'}</div></section>`}
function addExam(){const name=prompt('Exam name?');if(!name)return;const date=prompt('Date?')||'';db.examTracker.push({id:id(),name,date,status:'Upcoming'});save('exam-created')}
function setExamStatus(eid,status){const e=db.examTracker.find(x=>x.id===eid);if(e){e.status=status;save('exam-status')}}

function time(){return `<section class="page"><div class="eyebrow">TIME TRACKING</div><h1>Planned vs active study</h1><div class="grid3"><div class="card stat"><strong>${db.minutes}</strong><span>Active study min</span></div><div class="card stat"><strong>${db.tasks.reduce((a,x)=>a+(Number(x.minutes)||0),0)}</strong><span>Planned task min</span></div><div class="card stat"><strong>${db.events.length}</strong><span>Activity events</span></div></div><div class="notice section">Session Duration ≠ Active Study Duration. Focus sessions and completed task minutes are recorded locally.</div><div class="card section"><b>Recent activity</b><div class="list section">${db.events.slice(-8).reverse().map(e=>`<div class="item"><b>${esc(e.type)}</b><div class="muted">${new Date(e.at).toLocaleString()}</div></div>`).join('')||'<div class="muted">No activity yet.</div>'}</div></div></section>`}

function step68Markup(){const action=nextAction();return `<section class="sh68-panel"><div class="sh68-head"><div><span class="sh68-kicker">STEP 6–8 • INTEGRATED</span><h2>Intelligence & Future Center</h2><p>Priority → Track → Verify → Learn</p></div><button onclick="render()">Refresh</button></div><div class="sh68-grid"><article><b>Next Best Action</b><div>${esc(action.title)}</div></article><article><b>Open Tasks</b><div>${openTasks().length}</div></article><article><b>Due Revision</b><div>${dueRevisions().length}</div></article><article><b>Goals</b><div>${db.goals.filter(g=>!g.done).length}</div></article><article><b>Exams</b><div>${db.examTracker.length}</div></article><article><b>PCB Saves</b><div>${db.opportunities.length}</div></article><article><b>World Notes</b><div>${db.worldKnowledge.length}</div></article></div><div class="sh68-actions"><button onclick="addGoal()">+ Goal</button><button onclick="addExam()">+ Exam</button><button onclick="addOpportunity('PCB')">+ PCB Opportunity</button><button onclick="addWorldNote()">+ World Note</button><button onclick="go('world')">🌍 World</button><button onclick="go('exam')">🧭 Exam Tracker</button></div></section>`}
function addGoal(){const title=prompt('Goal name?');if(!title)return;db.goals.unshift({id:id(),title,done:false,createdAt:new Date().toISOString()});save('goal-created')}
function addWorldNote(){const title=prompt('World knowledge note?');if(!title)return;const summary=prompt('Short summary?')||'';const source=prompt('Source? (optional)')||'';db.worldKnowledge.unshift({id:id(),title,summary,source,savedAt:new Date().toISOString()});save('world-note-created')}
function world(){return `<section class="page"><div class="row"><div><div class="eyebrow">WORLD KNOWLEDGE</div><h1>KnownWorld</h1></div><button class="btn" onclick="addWorldNote()">+ Note</button></div><div class="notice">Use “Aui” from Home when you want this space. Fresh world information requires an internet source; this local build only stores your notes.</div><div class="list section">${db.worldKnowledge.map(x=>`<div class="item"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><div class="muted">${esc(x.source||'No source saved')}</div></div>`).join('')||'<div class="card">No world notes saved.</div>'}</div></section>`}

function step9State(){return db.step9}
function addStep9Priority(){const v=prompt('Priority to remember?');if(!v)return;db.step9.priorities.unshift({id:id(),text:v,done:false,createdAt:new Date().toISOString()});save('step9-priority')}
function addStep9Checkin(){const v=prompt('Quick study check-in?');if(!v)return;db.step9.checkins.unshift({id:id(),text:v,at:new Date().toISOString()});save('step9-checkin')}
function togglePriority(pid){const p=db.step9.priorities.find(x=>x.id===pid);if(p)p.done=!p.done;save('step9-priority-toggle')}
function addStep9Backup(){db.step9.lastBackup=new Date().toISOString();exportData(true);save('step9-backup')}
function step9Markup(){const s=step9State();const open=s.priorities.filter(x=>!x.done);return `<section class="sh-step9-card"><div class="sh-step9-head"><span class="sh-badge">STEP 9</span><h2>Personal Intelligence & Recovery</h2></div><p class="muted">Protect progress, capture priorities, and keep a recoverable local history.</p><div class="sh-step9-grid"><button onclick="addStep9Priority()">➕ Priority</button><button onclick="addStep9Checkin()">🧠 Check-in</button><button onclick="addStep9Backup()">🛡️ Backup Checkpoint</button></div><div class="sh-step9-stats"><span>Open priorities: <b>${open.length}</b></span><span>Check-ins: <b>${s.checkins.length}</b></span><span>Last checkpoint: <b>${s.lastBackup?new Date(s.lastBackup).toLocaleString():'Not recorded'}</b></span></div>${open.slice(0,3).map(p=>`<div class="item section"><label><input type="checkbox" ${p.done?'checked':''} onchange="togglePriority('${p.id}')"> ${esc(p.text)}</label></div>`).join('')}</section>`}

function space(){return `<section class="page"><div class="eyebrow">MY SPACE</div><h1>Your study memory</h1><div class="grid">${[['Bookmarks','bookmarks'],['Saved Questions','questions'],['My Notes','notes'],['Flashcards','flashcards'],['Concept Maps','maps'],['Saved Resources','resources'],['Goals','goals'],['Ideas','ideas'],['Research / Project Space','projects'],['Bioinformatics Space','bioinformatics'],['Archive','recovery'],['Analytics','events']].map(([name,key])=>`<button class="card" onclick="${['bookmarks','ideas','projects','bioinformatics'].includes(key)?`addSpace('${key}')`:`go('${key==='questions'?'practice':key==='notes'?'notes':key==='flashcards'?'flash':key==='maps'?'maps':key==='resources'?'resources':key==='goals'?'progress':key==='events'?'time':key==='recovery'?'recovery':'space'}')`}"><b>${name}</b><div class="muted">${Array.isArray(db[key])?db[key].length:0} saved</div></button>`).join('')}</div><div class="card section"><b>Recovery Box</b><p class="muted">Archived items stay recoverable until you explicitly delete them.</p><button class="btn secondary" onclick="go('recovery')">Open Recovery Box</button></div></section>`}
function addSpace(k){const labels={bookmarks:'Bookmark',ideas:'Idea',projects:'Research / Project',bioinformatics:'Bioinformatics note'};const v=prompt(`${labels[k]}?`);if(!v)return;db.space[k].unshift({id:id(),text:v,createdAt:new Date().toISOString()});save('space-item-created')}
function recovery(){return `<section class="page"><div class="eyebrow">RECOVERY BOX</div><h1>Recover before permanent delete</h1><div class="list section">${db.recovery.map(x=>`<div class="item"><b>${esc(x.kind)}</b><div class="muted">Archived ${new Date(x.archivedAt).toLocaleString()}</div><div class="actions"><button class="btn good" onclick="restoreRecovery('${x.id}')">Restore</button><button class="btn warn" onclick="deleteRecovery('${x.id}')">Permanent Delete</button></div></div>`).join('')||'<div class="card">Recovery Box is empty.</div>'}</div></section>`}
function restoreRecovery(rid){const r=db.recovery.find(x=>x.id===rid);if(!r)return;if(r.kind==='task')db.tasks.push(r.item);if(r.kind==='note')db.notes.push(r.item);db.recovery=db.recovery.filter(x=>x.id!==rid);save('recovery-restore')}
function deleteRecovery(rid){if(!confirm('Permanently delete this archived item?'))return;db.recovery=db.recovery.filter(x=>x.id!==rid);save('recovery-delete')}

function globalSearchIndex(){
 const rows=[];
 const add=(type,label,text,action)=>rows.push({type,label,text:String(text||''),action});
 db.tasks.forEach(x=>add('Task',x.title,`${x.title} ${x.subject||''} ${x.chapter||''}`,`go('study')`));
 db.notes.forEach(x=>add('Note',x.title,`${x.title} ${x.body}`,`go('notes')`));
 db.questions.forEach(x=>add('Question',x.text,`${x.text} ${x.subject||''} ${x.chapter||''}`,`go('practice')`));
 db.chapters.forEach(x=>add('Chapter',x.name,`${x.subject} ${x.name} ${x.status}`,`subject('${x.subject}')`));
 db.topics.forEach(x=>add('Topic',x.name,`${x.subject} ${x.chapter} ${x.name}`,`subject('${x.subject}')`));
 db.flashcards.forEach(x=>add('Flashcard',x.a,`${x.a} ${x.b}`,`go('flash')`));
 db.resources.forEach(x=>add('Resource',x.a,`${x.a} ${x.b}`,`go('resources')`));
 db.goals.forEach(x=>add('Goal',x.title,x.title,`go('progress')`));
 db.opportunities.forEach(x=>add('Opportunity',x.title,`${x.title} ${x.type} ${x.source}`,`go('opportunities')`));
 db.examTracker.forEach(x=>add('Exam',x.name,`${x.name} ${x.date} ${x.status}`,`go('exam')`));
 return rows;
}
function intelligencePanel(){const x=intelligenceSnapshot();const r=x.repeatedMistakes[0];return `<section class="card section intelligence-panel"><div class="row"><div><div class="eyebrow">INTELLIGENCE LAYER</div><h2>What needs attention?</h2></div><span class="tag">Live local analysis</span></div><div class="intel-grid"><div><b>${x.dueCount}</b><small>Revision due</small></div><div><b>${x.weakCount}</b><small>Weak areas</small></div><div><b>${x.openCount}</b><small>Open tasks</small></div><div><b>${x.activeMinutes}m</b><small>Active study</small></div></div><p class="muted">${r?`Repeated pattern: ${r.count} mistakes in ${esc(r.key.replace('|',' • '))}.`:'No repeated mistake pattern detected yet.'}</p></section>`}
function searchResults(){const q=searchTerm.toLowerCase().trim();if(!q)return '';const hits=globalSearchIndex().filter(x=>x.text.toLowerCase().includes(q)).slice(0,20);return `<div class="card section"><div class="row"><b>Global results</b><span class="muted">${hits.length}</span></div><div class="list section">${hits.map(x=>`<button class="item search-hit" onclick="${x.action}"><span class="tag">${esc(x.type)}</span><b>${esc(x.label)}</b></button>`).join('')||'<div class="muted">No local matches.</div>'}</div></div>`}
function sukoonContext(){if(db.settings.sukoonContext===false)return '';const x=intelligenceSnapshot();const weak=db.chapters.filter(c=>c.status==='Weak').slice(0,3).map(c=>c.subject+' • '+c.name);return `ScienceHub context: ${x.openCount} open tasks, ${x.dueCount} revision items due, ${x.weakCount} weak areas, ${x.activeMinutes} active study minutes. ${weak.length?'Weak areas: '+weak.join(', ')+'. ':''}Practice net: ${x.practiceNet}.`; }

function openDrawer(){
 const d=$("drawer");
 const groups=[
  {title:"Study Core",items:[
   ["home","🏠","Home"],["academic","🎓","Academic"],["syllabus","📘","UPMSP Syllabus 2026–27"],["study","📅","Study Planner"],
   ["subjects","📚","Subjects"],["learning","🧠","Learning Lab"],["practice","📝","Practice Lab"],["revision","🔁","Revision Engine"],
   ["progress","📈","Progress & Analytics"]]},
  {title:"Life & Future",items:[
   ["school","🏫","School"],["opportunities","🎯","PCB Opportunities"],["exam","🧭","Exam Tracker"],["time","⏱️","Time Tracking"],
   ["space","🗂️","My Space"],["world","🌍","World Knowledge / Aui"]]},
  {title:"Control & Safety",items:[
   ["focus","⏳","Focus Mode"],["settings","⚙️","Settings"],["backup","💾","Backup & Recovery"]]}
 ];
 const content=groups.map(g=>`<div class="control-group"><div class="control-title">${g.title}</div><div class="control-grid">${g.items.map(([key,ic,txt])=>{
   const action=key==='focus'?"focusQuick()":key==='settings'?"openSettings()":key==='backup'?"openBackup()":`go('${key}')`;
   return `<button class="control-item" onclick="${action}"><span class="control-icon">${ic}</span><span><b>${txt}</b><small>${key==='world'?'Fresh information needs internet':key==='backup'?'Protect or restore local data':'Open workspace'}</small></span></button>`;
 }).join('')}</div></div>`).join('');
 d.innerHTML=`<div class="drawer-backdrop" onclick="closeDrawer()"></div><aside class="drawerbox control-center" role="dialog" aria-modal="true" aria-label="ScienceHub Control Center"><div class="control-head"><div><div class="eyebrow">SCIENCEHUB CONTROL</div><h2>Command Center</h2><p>Navigate, control, and protect your Study OS.</p></div><button class="iconbtn" onclick="closeDrawer()" aria-label="Close control center">✕</button></div><div class="control-summary"><span>Tasks ${openTasks().length}</span><span>Revision ${dueRevisions().length}</span><span>Study ${db.minutes}m</span></div>${content}</aside>`;
 d.className='show'; d.setAttribute('aria-hidden','false'); document.body.classList.add('drawer-open');
 setTimeout(()=>d.querySelector('.control-item')?.focus(),20);
}
function more(){openDrawer()}
function closeDrawer(){const d=$("drawer");d.className='';d.setAttribute('aria-hidden','true');d.innerHTML='';document.body.classList.remove('drawer-open')}
window.addEventListener('keydown',e=>{if(e.key==='Escape' && $("drawer").classList.contains('show'))closeDrawer()});
function openBackup(){
 $("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>💾 Backup & Recovery</h2><button class="iconbtn" onclick="closeModal()">✕</button></div><p class="muted">Export before major changes. Import replaces current local data after confirmation.</p><div class="actions"><button class="btn" onclick="exportData(false)">Export JSON</button><button class="btn secondary" onclick="importData()">Import JSON</button></div><p class="muted">Backup file is local to your device unless you share it yourself.</p></div>`;$("modal").style.display='block'}
function exportData(silent){db.step9.lastBackup=new Date().toISOString();db.step9.backupCount=(db.step9.backupCount||0)+1;localStorage.setItem(KEY,JSON.stringify(db));const b=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ScienceHub-${APP_VERSION}-backup.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);if(!silent)alert('Backup exported.')}
function importData(){const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const incoming=normalise(JSON.parse(r.result));if(!confirm('Replace current local ScienceHub data with this backup?'))return;db=incoming;save('backup-import');alert('Backup imported.') }catch(e){alert('Invalid backup file.')}};r.readAsText(f)};i.click()}
function openSettings(){
 const q=db.settings.quiet!==false;
 $("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>⚙️ Settings</h2><button class="iconbtn" onclick="closeModal()">✕</button></div><p class="muted">Local-first • PWA • user-controlled data</p><label class="setting"><input type="checkbox" ${q?'checked':''} onchange="setSetting('quiet',this.checked)"> Quiet Mode preference</label><label class="setting"><input type="checkbox" ${db.settings.sukoonContext!==false?'checked':''} onchange="setSetting('sukoonContext',this.checked)"> Allow Sukoon.Brain to use permitted ScienceHub context</label><label class="setting"><span>Camera Mode</span><select onchange="setSetting('cameraMode',this.value)"><option ${db.settings.cameraMode==='off'?'selected':''}>off</option><option ${db.settings.cameraMode==='preview'?'selected':''}>preview</option><option ${db.settings.cameraMode==='capture'?'selected':''}>capture</option></select></label><div class="notice section">ScienceHub can store the preference, but a web page cannot silently control phone-level calls or notifications.</div><div class="notice section"><b>AI bridge:</b> this GitHub build stays local-first. An optional server endpoint can be configured in a future hosted backend; no secret API key is embedded in this app.</div><div class="actions"><button class="btn" onclick="exportData(false)">Export Backup</button><button class="btn secondary" onclick="closeModal()">Close</button></div></div>`;$("modal").style.display='block'}
function setSetting(k,v){db.settings[k]=v;localStorage.setItem(KEY,JSON.stringify(db))}
function closeModal(){$("modal").style.display='none'}
function aiRole(role){const messages={KuroVen:"Action taker: choose one small useful action and start it now.",Hikaitage:"Learning strategist with a 30+ years teaching-style approach: connect where, what, how, why and when before you act.",HukoVaige:"Psychology lens with a 45+ years psychologist-style approach: notice patterns, curiosity, growth and the reality of what is helping or blocking you."};alert(`${role}\n\n${messages[role]||"Choose a role."}`)}
function kuro(){const a=nextAction();alert(`KuroVen: Start now → ${a.title}\n\nReason: ${a.why}`)}

function render(){
 const map={home,study,subjects:subjectsPage,syllabus,practice,learning,notes,flash,maps,resources,revision,mistakes,progress,academic,school,opportunities,time,space,world,exam:examTracker,recovery};
 const fn=current.startsWith('subject:')?()=>subjectPage(current.slice(8)):(map[current]||home);
 $("app").innerHTML=fn();
 setTimeout(initSukoonDrag,0);
}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}))}
window.addEventListener('beforeunload',()=>{if(focusTimer.interval)clearInterval(focusTimer.interval)});
async function loadSyllabus(){try{const r=await fetch('./data/upmsp_syllabus_2026_27.json',{cache:'no-store'});if(r.ok)syllabusData=await r.json()}catch(e){syllabusData=null}render()}
loadSyllabus();
