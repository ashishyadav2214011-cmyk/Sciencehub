const KEY="sciencehub-v2";
const LEGACY="sciencehub-v1";
const DEFAULT={tasks:[],notes:[],revision:[],events:[],minutes:0,good:0,bad:0,settings:{hero:true}};
let db=loadDB(), current="home", timer={active:false,paused:false,start:0,elapsed:0,int:null};

function loadDB(){
  try{
    const v=JSON.parse(localStorage.getItem(KEY)||"null");
    if(v)return {...DEFAULT,...v,settings:{...DEFAULT.settings,...(v.settings||{})}};
    const old=JSON.parse(localStorage.getItem(LEGACY)||"null");
    if(old)return {...DEFAULT,...old,settings:{...DEFAULT.settings,...(old.settings||{})}};
  }catch(e){}
  return structuredClone(DEFAULT);
}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function event(type,data={}){db.events.push({id:Date.now()+Math.random(),type,at:new Date().toISOString(),data})}
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>t.classList.remove("show"),2200)}
function go(p){current=p;closeDrawer();render();scrollTo({top:0,behavior:"smooth"})}
function toggleMore(){document.getElementById("drawer").classList.toggle("show")}
function closeDrawer(){document.getElementById("drawer").classList.remove("show")}

function addTask(){
  const title=document.getElementById("taskTitle")?.value.trim(); if(!title)return showToast("Add a specific task first");
  const mins=Math.max(1,+document.getElementById("taskMins").value||45);
  const priority=document.getElementById("taskPri").value;
  db.tasks.push({id:Date.now(),title,minutes:mins,priority,done:false,createdAt:new Date().toISOString()});
  event("TASK_CREATED",{title,priority,minutes:mins}); save(); showToast("Task added");
}
function completeTask(id){
  const t=db.tasks.find(x=>x.id===id); if(!t||t.done)return;
  t.done=true; db.minutes+=t.minutes; db.good+=2;
  event("STUDY_SESSION_COMPLETED",{taskId:id,minutes:t.minutes}); save(); showToast("Mission completed +2");
}
function removeTask(id){db.tasks=db.tasks.filter(x=>x.id!==id);event("TASK_DELETED",{id});save();showToast("Task removed")}
function addRevision(){
  const title=document.getElementById("revTitle")?.value.trim()||"Review an important or weak concept";
  db.revision.push({id:Date.now(),title,createdAt:new Date().toISOString()});
  event("REVISION_ADDED",{title});save();showToast("Revision item added")
}
function completeRevision(id){db.revision=db.revision.filter(x=>x.id!==id);event("REVISION_COMPLETED",{id});db.good+=2;save();showToast("Revision completed")}
function saveNote(){
  const title=document.getElementById("noteTitle")?.value.trim()||"Untitled";
  const body=document.getElementById("noteBody")?.value.trim(); if(!body)return showToast("Write a note first");
  db.notes.unshift({id:Date.now(),title,body,createdAt:new Date().toISOString()});event("NOTE_CREATED",{title});save();showToast("Note saved")
}
async function shareNote(id){
  const n=db.notes.find(x=>x.id===id);if(!n)return;
  const text=`${n.title}\n\n${n.body}\n\nShared from ScienceHub`;
  try{if(navigator.share)await navigator.share({title:n.title,text});else{await navigator.clipboard.writeText(text);showToast("Copied for sharing")}}
  catch(e){}
}
function answer(ok){
  if(ok){db.good+=2;event("QUESTION_ATTEMPTED",{correct:true});showToast("Correct • +2 progress")}
  else{db.bad-=1;event("QUESTION_ATTEMPTED",{correct:false});showToast("Review the concept • -1 progress")}
  save()
}
function startTimer(){
  if(timer.active){if(timer.paused){timer.paused=false;timer.start=Date.now()-timer.elapsed;timer.int=setInterval(tick,500);tick()}return}
  timer={active:true,paused:false,start:Date.now(),elapsed:0,int:setInterval(tick,500)};event("TIME_SESSION_STARTED");tick();showToast("Focus session started")
}
function pauseTimer(){if(!timer.active||timer.paused)return;timer.elapsed=Date.now()-timer.start;timer.paused=true;clearInterval(timer.int);tick();showToast("Paused")}
function stopTimer(){
  if(!timer.active)return;const ms=timer.paused?timer.elapsed:Date.now()-timer.start;
  const mins=Math.max(1,Math.round(ms/60000));db.minutes+=mins;event("TIME_SESSION_COMPLETED",{minutes:mins});
  timer={active:false,paused:false,start:0,elapsed:0,int:null};save();showToast(`${mins} minute session saved`)
}
function tick(){
  const ms=timer.paused?timer.elapsed:(timer.active?Date.now()-timer.start:0),s=Math.floor(ms/1000),m=Math.floor(s/60),ss=s%60;
  const el=document.getElementById("timerClock");if(el)el.textContent=String(m).padStart(2,"0")+":"+String(ss).padStart(2,"0");
}
function openSearch(){
  document.getElementById("modal").innerHTML=`<div class="modal"><div class="modalbox">
  <h2>🌐 Global Search</h2><input id="globalQ" class="field" autofocus placeholder="Search tasks, notes, revisions, subjects..." oninput="runSearch(this.value)">
  <div id="searchResults" class="list" style="margin-top:12px"><div class="empty">Search across your local ScienceHub data.</div></div>
  <div class="modal-actions"><button class="secondary" onclick="closeModal()">Close</button></div></div></div>`;
  document.getElementById("globalQ").focus()
}
function runSearch(q){
  q=q.trim().toLowerCase();const r=document.getElementById("searchResults");if(!q){r.innerHTML='<div class="empty">Search across your local ScienceHub data.</div>';return}
  const arr=[
    ...db.tasks.map(x=>({type:"Task",title:x.title,meta:`${x.priority} • ${x.minutes} min`})),
    ...db.notes.map(x=>({type:"Note",title:x.title,meta:x.body.slice(0,90)})),
    ...db.revision.map(x=>({type:"Revision",title:x.title,meta:"Revision item"})),
    ...["Biology","Physics","Chemistry","English","Hindi","Bioinformatics"].map(x=>({type:"Subject",title:x,meta:"ScienceHub subject"}))
  ].filter(x=>(x.title+" "+x.meta).toLowerCase().includes(q));
  r.innerHTML=arr.length?arr.slice(0,20).map(x=>`<div class="list-item"><div><b>${esc(x.title)}</b><div class="small">${x.type} • ${esc(x.meta)}</div></div><span>›</span></div>`).join(""):'<div class="empty">No matching ScienceHub item found.</div>'
}
function closeModal(){document.getElementById("modal").innerHTML=""}
function openProfileMenu(){
  document.getElementById("modal").innerHTML=`<div class="modal"><div class="modalbox">
  <h2>👤 Ashu.Ayansh</h2><p class="muted">Personal Study OS • Class 11 Current</p>
  <div class="list">
    <div class="list-item"><span>📸 Home hero visual</span><b>${db.settings.hero?"ON":"OFF"}</b></div>
    <div class="list-item"><span>🔕 Quiet Mode</span><b>ON</b></div>
    <div class="list-item"><span>💾 Local data</span><b>${db.tasks.length+db.notes.length} items</b></div>
  </div>
  <div class="modal-actions"><button class="secondary" onclick="closeModal()">Close</button><button class="primary" onclick="settings()">Settings</button></div>
  </div></div>`
}
function settings(){
  document.getElementById("modal").innerHTML=`<div class="modal"><div class="modalbox">
  <h2>⚙️ ScienceHub Settings</h2>
  <p class="muted">Local-first • user-controlled • offline-ready</p>
  <label class="list-item"><span>Personalized Home visual</span><input type="checkbox" ${db.settings.hero?"checked":""} onchange="db.settings.hero=this.checked;save()"></label>
  <div class="btn-row"><button class="secondary" onclick="exportData()">📤 Export data</button><button class="secondary" onclick="resetData()">♻️ Reset local data</button></div>
  <div class="modal-actions"><button class="secondary" onclick="closeModal()">Close</button></div>
  </div></div>`
}
function exportData(){
  const b=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(b);a.download="ScienceHub-AshuAyansh-V2.json";a.click();URL.revokeObjectURL(a.href);showToast("Data exported")
}
function resetData(){if(confirm("Delete all local ScienceHub V2 data?")){localStorage.removeItem(KEY);location.reload()}}

function home(){
  const pending=db.tasks.filter(x=>!x.done), mission=pending[0], completed=db.tasks.filter(x=>x.done).length;
  const revision=db.revision.length, total=db.tasks.length+completed, accuracy=total?Math.round((db.good/(Math.max(1,db.good+Math.max(0,-db.bad))))*100):0;
  const minutes=db.minutes;
  return `<section class="page">
  <section class="hero">
    <div class="hero-media">${db.settings.hero?'<img src="home-hero.png" alt="ScienceHub personalized study hero">':''}</div>
    <div class="hero-copy">
      <div class="eyebrow">Good evening,</div>
      <h1>Ashu.Ayansh 👋</h1>
      <p>Discipline today, success tomorrow.</p>
      <div class="hero-actions">
        <button class="primary" onclick="go('study')">Start studying →</button>
        <button class="secondary" onclick="openSearch()">⌕ Search ScienceHub</button>
      </div>
      <div class="hero-chip">Personal Study OS • Class 11 Current</div>
    </div>
  </section>

  <div class="searchbar"><input placeholder="🌐 Search ScienceHub..." onclick="openSearch()" readonly><button class="secondary" onclick="openSearch()">Search</button></div>

  <div class="grid3">
    <article class="card mission">
      <div class="bookmark">★</div><div class="label cyan">🎯 TODAY'S MISSION</div>
      <div class="mission-main"><div><h2>${esc(mission?.title||"Create your first focused mission")}</h2><p>${mission?`${esc(mission.priority)} • ${mission.minutes} min`:"One clear task. One focused session."}</p>
      <button class="primary" onclick="${mission?`go('study')`:`go('study')`}">${mission?"Start Mission":"Plan Mission"} ▷</button></div>
      <div><div class="progress-ring"><b>${mission?"75":"0"}%</b></div><div class="small" style="text-align:center;margin-top:6px">Progress</div></div></div>
    </article>

    <article class="card mini"><div class="label gold">⚡ NEXT BEST ACTION</div><span class="mini-icon">⚛</span><h3>${esc(pending[0]?.title||"Create a focused task")}</h3><p>${pending[0]?"Do the highest-priority unfinished task.":"No pending task yet."}</p><button class="secondary" onclick="go('study')">Do Now →</button></article>

    <article class="card mini"><div class="label purple">🔄 REVISION DUE</div><span class="mini-icon">◫</span><h3>${revision} Topic${revision===1?"":"s"}</h3><p>Use recall → practice → retest.</p><button class="secondary" onclick="go('revision')">Review Now →</button></article>

    <article class="card mini"><div class="label blue">📅 UPCOMING</div><span class="mini-icon">⚗</span><h3>Plan your next test</h3><p>Connect exams to your Study Plan.</p><button class="secondary" onclick="go('academic')">View Plan →</button></article>

    <article class="card stats">
      <div class="stat"><span class="small">◷ Study Time</span><strong>${Math.floor(minutes/60)}h ${minutes%60}m</strong><div class="bar"><i style="width:${Math.min(100,Math.round(minutes/240*100))}%"></i></div><span class="small">/ 4h goal</span></div>
      <div class="stat"><span class="small">▧ Tasks Done</span><strong>${completed}</strong><div class="bar"><i style="width:${Math.min(100,completed*20)}%"></i></div><span class="small">today</span></div>
      <div class="stat"><span class="small">▣ Tests</span><strong>0</strong><div class="bar"><i style="width:0%"></i></div><span class="small">/ 2 goal</span></div>
      <div class="stat"><span class="small">◎ Trend</span><strong>${db.good>=db.bad? "Good":"Needs work"}</strong><div class="bar"><i style="width:${Math.min(100,50+db.good*5)}%"></i></div><span class="small">${db.good} good • ${Math.max(0,-db.bad)} bad</span></div>
      <div class="stat score"><span class="small">Daily Score</span><div class="score-ring"><span><b>${Math.max(0,Math.min(1000,500+db.good*80+minutes*2))}</b><small>/1000</small></span></div></div>
    </article>

    <article class="card attention"><div class="label red">⚠ NEEDS ATTENTION</div><h3>${pending.length?"Finish the oldest pending task":"Nothing urgent right now"}</h3><p>${pending.length?`${pending.length} pending task(s) need attention.`:"Keep momentum with a small next action."}</p><button class="secondary" onclick="go('study')">${pending.length?"Improve Now":"Add Task"} →</button></article>

    <article class="card kuro"><div class="label purple">🖤 KuroVen (AI Coach)</div><div class="coach"><div class="kuro-avatar">◉</div><p>${mission?"Start with your highest-priority task. No extra planning—execute it now. 💪":"No task exists. Create one small, specific action and start."}</p></div></article>

    <article class="card focus-strip">
      <div><span>🔥</span> <b>${Math.min(99,Math.floor(minutes/30))}</b> Day Streak</div>
      <div><span class="small">Today's Focus</span><br><b>Biology • Physics</b></div>
      <div><span class="small">Daily Goal</span><br><b>${Math.min(100,Math.round(minutes/240*100))}%</b></div>
    </article>
  </div>
  </section>`
}

function study(){
  return `<section class="page"><div class="section-title"><h2>📅 Study Plan</h2><button class="primary" onclick="document.getElementById('taskTitle').focus()">+ Quick Add</button></div>
  <div class="card"><div class="grid3">
    <div style="grid-column:span 2"><input id="taskTitle" class="field" placeholder="e.g. Biology — revise Cell Cycle"></div>
    <input id="taskMins" class="field" type="number" min="1" value="45" placeholder="Minutes">
    <select id="taskPri" class="field"><option>Critical</option><option>High</option><option selected>Normal</option><option>Optional</option></select>
  </div><button class="primary" onclick="addTask()">Add Task</button></div>
  <div class="section-title"><h2>Today's Tasks</h2><span class="muted">${db.tasks.filter(x=>!x.done).length} pending</span></div>
  <div class="list">${db.tasks.length?db.tasks.map(t=>`<div class="list-item ${t.done?"done":""}"><div><b>${esc(t.title)}</b><div class="small">${esc(t.priority)} • ${t.minutes} min</div></div><div>${t.done?"✓":`<button class="primary" onclick="completeTask(${t.id})">Done</button>`}<button class="secondary" onclick="removeTask(${t.id})">×</button></div></div>`).join(""):'<div class="empty">No tasks. Add one specific action.</div>'}</div>
  <div class="section-title"><h2>⏱️ Focus Timer</h2></div><div class="card" style="text-align:center"><div id="timerClock" style="font-size:50px;font-variant-numeric:tabular-nums">00:00</div><button class="primary" onclick="startTimer()">Start</button><button class="secondary" onclick="pauseTimer()">Pause</button><button class="secondary" onclick="stopTimer()">Stop</button></div></section>`
}
function subjects(){
  const s=["Biology","Physics","Chemistry","English","Hindi"];
  return `<section class="page"><div class="section-title"><h2>📖 Subjects</h2></div><div class="grid3">${s.map(x=>`<div class="card"><div class="label cyan">${x}</div><h3>Class 11</h3><p>Chapters → Topics → Concepts</p><button class="secondary" onclick="showToast('${x}: subject workspace ready')">Open Subject →</button></div>`).join("")}
  <div class="card"><div class="label green">🧬 BIOINFORMATICS</div><h3>Long-term track</h3><p>Programming • Biology • Genomics • Statistics • Projects</p></div>
  <div class="card"><div class="label purple">📚 CLASS 12 — FUTURE</div><h3>Connected foundations</h3><p>Class 11 first; deeper Class 12 links when useful.</p></div></div></section>`
}
function practice(){
  return `<section class="page"><div class="section-title"><h2>📝 Practice</h2></div><div class="card"><div class="label cyan">Quick Science Check</div><h3>Which molecule carries genetic information in most living organisms?</h3><div class="btn-row"><button class="secondary" onclick="answer(false)">RNA</button><button class="primary" onclick="answer(true)">DNA</button><button class="secondary" onclick="answer(false)">ATP</button><button class="secondary" onclick="answer(false)">Protein</button></div></div>
  <div class="grid3">${["Quiz","MCQs","Question Bank","PYQs 2020→Latest","Chapter Tests","Subject Tests","Mock Tests","Competitive","Mistake Book"].map(x=>`<div class="card"><h3>${x}</h3><p class="small">Practice → result → mistake tracking</p></div>`).join("")}</div></section>`
}
function revision(){
  return `<section class="page"><div class="section-title"><h2>🔄 Revision</h2></div><div class="card"><p>Revision priority should come from learning history, recall, mistakes, practice, tests and exam urgency.</p><input id="revTitle" class="field" placeholder="What should be revised?"><button class="primary" onclick="addRevision()">Add Revision</button></div>
  <div class="list">${db.revision.length?db.revision.map(r=>`<div class="list-item"><div><b>${esc(r.title)}</b><div class="small">Due / personal revision item</div></div><button class="primary" onclick="completeRevision(${r.id})">Done</button></div>`).join(""):'<div class="empty">No revision items due.</div>'}</div></section>`
}
function progress(){
  return `<section class="page"><h2>📊 Progress</h2><div class="grid3"><div class="card"><div class="small">Tasks completed</div><h2>${db.tasks.filter(x=>x.done).length}</h2></div><div class="card"><div class="small">Study minutes</div><h2>${db.minutes}</h2></div><div class="card"><div class="small">Internal trend</div><h2>${db.good} good / ${Math.max(0,-db.bad)} bad</h2></div></div><div class="card"><h3>Progress Intelligence</h3><p>What happened → Why → What is weak → What improved → What next.</p></div></section>`
}
function timePage(){
  return `<section class="page"><h2>⏱️ Time Tracking</h2><div class="card" style="text-align:center"><div id="timerClock" style="font-size:55px">${timer.active?"00:00":"00:00"}</div><button class="primary" onclick="startTimer()">Start</button><button class="secondary" onclick="pauseTimer()">Pause</button><button class="secondary" onclick="stopTimer()">Stop</button><p class="muted">Tracked total: ${db.minutes} minutes</p></div><div class="grid3">${["Overview","Daily Timeline","Weekly Report","Monthly Report","Subject Analysis","Chapter Analysis","Topic Analysis","Planned vs Actual","Focus Analysis"].map(x=>`<div class="card"><h3>${x}</h3><p class="small">Time Intelligence</p></div>`).join("")}</div></section>`
}
function myspace(){
  return `<section class="page"><div class="section-title"><h2>🗂️ My Space</h2><span class="muted">Personal only</span></div><div class="card"><input id="noteTitle" class="field" placeholder="Note title"><textarea id="noteBody" class="textarea" placeholder="Your personal note..."></textarea><button class="primary" onclick="saveNote()">Save Note</button></div><div class="list">${db.notes.length?db.notes.map(n=>`<div class="card"><div class="section-title" style="margin:0 0 8px"><b>${esc(n.title)}</b><button class="secondary" onclick="shareNote(${n.id})">📤 Share</button></div><p>${esc(n.body)}</p></div>`).join(""):'<div class="empty">Your notes, saved questions, resources and projects live here.</div>'}</div></section>`
}
function simple(title,body){return `<section class="page"><h2>${title}</h2><div class="card"><p>${body}</p></div></section>`}

function render(){
  const drawerItems=[["academic","🎓 Academic"],["learning","🧠 Learning"],["revision","🔄 Revision"],["progress","📊 Progress"],["school","🏫 School"],["time","⏱️ Time Tracking"],["career","🧭 Career"],["opportunities","🌟 PCB Opportunities"],["myspace","🗂️ My Space"],["settings","⚙️ Settings"]];
  document.getElementById("drawer").innerHTML=drawerItems.map(([p,t])=>`<button onclick="${p==="settings"?"settings()":"go('"+p+"')"}">${t}</button>`).join("");
  const views={
    home,study,subjects,practice,revision,progress,time:timePage,myspace,
    academic:()=>simple("🎓 Academic","Subjects • Syllabus • Exams • Exam Planner • Marks • Targets • Exam Calendar"),
    learning:()=>simple("🧠 Learning","Concept Maps • Flashcards • My Notes • Resource Hub • Ask ScienceHub"),
    school:()=>simple("🏫 School","Schedule • Teachers • Homework • Assignments • Practicals"),
    career:()=>simple("🧭 Career","Bioinformatics roadmap • College • Skills • Projects • Internships • Research"),
    opportunities:()=>simple("🌟 PCB Opportunities","Scholarships • Courses/Colleges • Research • Internships • Government • Competitions • Exam Tracker • Future Scope • Future Possibilities")
  };
  document.getElementById("app").innerHTML=(views[current]||home)();
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===current));
  if(current==="study"||current==="time")tick();
}
render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
