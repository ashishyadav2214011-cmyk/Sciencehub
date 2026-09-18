/* ScienceHub V73 — unified local-first Study OS runtime
 * Single data store, deterministic rendering, migration-safe, offline-first.
 */
const KEY = "sciencehub-v45";
const OLD_KEY = "sciencehub-v1";
const APP_VERSION = "V73";
const subjects = ["Biology","Physics","Chemistry","English","Hindi"];
const statuses = ["Not Started","Learning","Learned","Revision Due","Strong","Weak","Mastered"];
const priorities = ["high","normal","low"];
const $ = id => document.getElementById(id);
let current = "home";
let searchTerm = "";
let focusTimer = { end: 0, started: 0, durationMs: 0, taskId: null, interval: null };

function fresh(){return {
  schemaVersion:13, appVersion:APP_VERSION,
  tasks:[], notes:[], revision:[], events:[], minutes:0, good:0, bad:0,
  chapters:[], topics:[], questions:[], mistakes:[], flashcards:[], maps:[], resources:[],
  goals:[], examTracker:[], opportunities:[], worldKnowledge:[],
  school:{teachers:[],homework:[],practicals:[],schedule:[]},
  space:{bookmarks:[],ideas:[],projects:[],bioinformatics:[]},
  recovery:[],
  step9:{checkins:[],priorities:[],reviews:[],lastBackup:null},
  settings:{quiet:true,cameraMode:"off"}
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
  for(const k of ["checkins","priorities","reviews"]){if(!Array.isArray(out.step9[k]))out.step9[k]=[]}
  out.settings=Object.assign(base.settings,x.settings||{});
  if(!out.chapters.length)out.chapters=seedChapters();
  out.schemaVersion=Math.max(Number(out.schemaVersion||0),13);
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
function nextAction(){
  const r=dueRevisions()[0]; if(r)return {title:`Revise ${r.title||r.topic}`,why:"Revision is due",action:`completeRevision('${r.id}')`};
  const t=openTasks().sort((a,b)=>({high:0,normal:1,low:2}[a.priority]??1)-({high:0,normal:1,low:2}[b.priority]??1))[0];
  if(t)return {title:t.title,why:`${t.priority||"normal"} priority study task`,action:`startTask('${t.id}')`};
  const w=db.chapters.find(c=>c.status==="Weak"); if(w)return {title:`Recover ${w.name}`,why:"Weak area needs deliberate practice",action:`quickRevision('${w.id}')`};
  return {title:"Create today's first task",why:"Your active queue is clear",action:"go('study')"};
}

function home(){
 const action=nextAction(), done=db.tasks.filter(t=>t.done).length, due=dueRevisions().length;
 return `<section class="page">
  <div class="home-hero"><img src="home-hero.png" alt="ScienceHub personal study room"><div class="home-hero-content"><div class="muted">Personal Study OS • ${APP_VERSION}</div><h1>Good study session, Ashu.Ayansh.</h1><p>Study • Learn • Grow</p></div></div>
  <div class="search"><input value="${esc(searchTerm)}" placeholder="🌐 Search ScienceHub..." oninput="search(this.value)"><button class="btn secondary" onclick="go('world')">Aui</button></div>
  ${searchTerm?searchResults():''}
  <div class="grid section">
   <div class="card wide"><small>🎯 TODAY'S MISSION</small><h2>${esc(openTasks()[0]?.title||"Create your first study task")}</h2><p>${openTasks()[0]?`${esc(openTasks()[0].priority||"normal")} • ${openTasks()[0].minutes||0} min`:'One clear task. One focused session.'}</p><button class="btn" onclick="${openTasks()[0]?`startTask('${openTasks()[0].id}')`:`go('study')`}">${openTasks()[0]?"START":"PLAN"}</button></div>
   <div class="card"><small>⚡ NEXT BEST ACTION</small><h3>${esc(action.title)}</h3><p class="muted">${esc(action.why)}</p><button class="btn secondary" onclick="${action.action}">Do it</button></div>
   <div class="card"><small>🔄 REVISION</small><h3>${due} due</h3><button class="btn secondary" onclick="go('revision')">Review</button></div>
   <div class="card"><small>📊 SNAPSHOT</small><h3>${db.minutes} active min</h3><p class="muted">${done} tasks completed • ${pct()}% task completion</p></div>
   <div class="card wide"><small>🖤 KUROVEN</small><p>${esc(action.title)} — stop planning and start the next useful action.</p><button class="btn secondary" onclick="kuro()">KuroVen: Start</button></div>
  </div>
  <div class="section"><h2>Quick Access</h2><div class="quick-grid">${["academic","learning","revision","progress","school","time","space","opportunities"].map(x=>`<button class="quick" onclick="go('${x}')">${icon(x)} ${label(x)}</button>`).join("")}</div></div>
  <div class="card section ai-center"><div class="eyebrow">AI COMMAND CENTER</div><h2>Choose the kind of help you need</h2><div class="ai-grid"><button onclick="aiRole('KuroVen')"><b>🖤 KuroVen</b><span>Action → execution</span></button><button onclick="aiRole('Hikaitage')"><b>🧭 Hikaitage</b><span>Learning + strategy</span></button><button onclick="aiRole('HukoVaige')"><b>🧠 HukoVaige</b><span>Psychology + patterns</span></button><button onclick="go('world')"><b>🌍 WORLD / Aui</b><span>Open only when you call Aui</span></button></div></div>
  ${step68Markup()}
  ${step9Markup()}
  <section class="card section pcb-final"><div class="eyebrow">FINAL SECTION</div><h2>🎯 PCB Opportunities</h2><p class="muted">Scholarships • Research • Courses • Internships • Careers • Competitions • Exam Tracker</p><div class="actions"><button class="btn" onclick="go('opportunities')">Open PCB Opportunities</button><button class="btn secondary" onclick="go('exam')">Exam Tracker</button></div></section>
 </section>`;
}

function search(v){searchTerm=v;render()}
function searchResults(){
 const q=searchTerm.toLowerCase().trim(); if(!q)return "";
 const hits=[];
 db.tasks.forEach(x=>{if(`${x.title} ${x.subject||''} ${x.chapter||''}`.toLowerCase().includes(q))hits.push(`Task: ${x.title}`)});
 db.notes.forEach(x=>{if(`${x.title} ${x.body}`.toLowerCase().includes(q))hits.push(`Note: ${x.title}`)});
 db.questions.forEach(x=>{if(`${x.text} ${x.subject||''}`.toLowerCase().includes(q))hits.push(`Question: ${x.text}`)});
 db.chapters.forEach(x=>{if(`${x.subject} ${x.name}`.toLowerCase().includes(q))hits.push(`Chapter: ${x.subject} • ${x.name}`)});
 return `<div class="card section"><b>Search results</b><div class="list section">${hits.slice(0,12).map(esc).map(x=>`<div class="item">${x}</div>`).join("")||'<div class="muted">No local matches.</div>'}</div></div>`;
}

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

function subjectsPage(){return `<section class="page"><div class="eyebrow">SUBJECTS</div><h1>Class 11 Core</h1><p class="muted">Class 12 is the next layer; Bioinformatics remains a long-term track.</p><div class="grid">${subjects.map(s=>{const cs=db.chapters.filter(c=>c.subject===s),done=cs.filter(c=>['Learned','Strong','Mastered'].includes(c.status)).length;return `<div class="card"><div class="row"><b>${s}</b><span class="tag">${done}/${cs.length}</span></div><div class="progress"><i style="width:${cs.length?done/cs.length*100:0}%"></i></div><button class="btn secondary section" onclick="subject('${s}')">Open</button></div>`}).join("")}</div></section>`}
function subject(s){current="subject:"+s;render()}
function subjectPage(s){const cs=db.chapters.filter(c=>c.subject===s);return `<section class="page"><button class="btn secondary" onclick="go('subjects')">← Subjects</button><h1>${esc(s)}</h1><div class="list section">${cs.map(c=>`<div class="item"><div class="row"><b>${esc(c.name)}</b><select onchange="setStatus('${c.id}',this.value)">${statuses.map(x=>`<option ${x===c.status?'selected':''}>${x}</option>`).join('')}</select></div><div class="muted">Status changes revision attention; one mistake alone does not make a chapter weak.</div><div class="actions"><button class="btn secondary" onclick="quickRevision('${c.id}')">+ Revision</button><button class="btn secondary" onclick="addTopic('${c.id}')">+ Topic</button></div></div>`).join("")}</div>${db.topics.filter(t=>t.subject===s).length?`<div class="card section"><b>Topics</b>${db.topics.filter(t=>t.subject===s).map(t=>`<div class="item section">${esc(t.chapter)} • ${esc(t.name)}</div>`).join('')}</div>`:''}</section>`}
function setStatus(cid,v){const c=db.chapters.find(x=>x.id===cid);if(!c)return;c.status=v;if(v==='Revision Due')addRevision(c.subject,c.name,'Status marked Revision Due');ev('CHAPTER_STATUS',{chapter:c.name,status:v},false);save('chapter-status')}
function addTopic(cid){const c=db.chapters.find(x=>x.id===cid),t=prompt('Topic name?');if(!c||!t)return;db.topics.push({id:id(),chapterId:cid,subject:c.subject,chapter:c.name,name:t});save('topic-created')}

function addRevision(subject,topic,reason){const exists=db.revision.find(r=>r.subject===subject&&r.title===topic&&r.status!=='done');if(exists)return exists.id;const rid=id();db.revision.push({id:rid,subject,title:topic,reason,status:'due',due:Date.now()});ev('REVISION_CREATED',{subject,topic,reason},false);return rid}
function completeRevision(rid){const r=db.revision.find(x=>x.id===rid);if(!r)return;r.status='done';r.completedAt=new Date().toISOString();r.nextDue=Date.now()+3*86400000;db.revision.push({id:id(),subject:r.subject,title:r.title,reason:'Follow-up review',status:'due',due:r.nextDue});db.good+=2;ev('REVISION_COMPLETED',{id:rid},false);save('revision-completed')}
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

function practice(){return `<section class="page"><div class="eyebrow">PRACTICE LAB</div><h1>Practice → Measure → Improve</h1><div class="grid3"><div class="card stat"><strong>${db.questions.length}</strong><span>Saved questions</span></div><div class="card stat"><strong>${db.good}</strong><span>Good / OK (+2)</span></div><div class="card stat"><strong>${db.bad}</strong><span>Bad (−1)</span></div></div><div class="actions section"><button class="btn" onclick="addQuestion()">+ Question</button><button class="btn secondary" onclick="go('mistakes')">Mistake Book</button></div><div class="list section">${db.questions.map(q=>`<div class="item"><div class="muted">${esc(q.subject)} ${q.chapter?'• '+esc(q.chapter):''}</div><b>${esc(q.text)}</b><div class="actions"><button class="btn good" onclick="answer('${q.id}',true)">Correct +2</button><button class="btn warn" onclick="answer('${q.id}',false)">Bad −1</button></div></div>`).join('')||'<div class="card">Add a question to start your local practice bank.</div>'}</div></section>`}
function addQuestion(){const text=prompt('Question?');if(!text)return;const s=prompt('Subject? (Biology/Physics/Chemistry/English/Hindi)','Biology')||'General';const c=prompt('Chapter?')||'';db.questions.push({id:id(),text,subject:s,chapter:c,createdAt:new Date().toISOString()});save('question-created')}
function answer(qid,ok){const q=db.questions.find(x=>x.id===qid);if(!q)return;if(ok){db.good+=2;ev('QUESTION_CORRECT',{id:qid},false)}else{db.bad+=1;db.mistakes.unshift({id:id(),question:q.text,subject:q.subject,chapter:q.chapter,at:Date.now()});if(q.chapter)addRevision(q.subject,q.chapter,'Wrong answer → revision trigger');ev('QUESTION_WRONG',{id:qid},false)}save(ok?'question-correct':'question-wrong')}
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

function openDrawer(){
 const d=$("drawer");
 const groups=[
  {title:"Study Core",items:[
   ["home","🏠","Home"],["academic","🎓","Academic"],["study","📅","Study Planner"],
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
function closeDrawer(){$("drawer").className=''}
function openBackup(){
 $("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>💾 Backup & Recovery</h2><button class="iconbtn" onclick="closeModal()">✕</button></div><p class="muted">Export before major changes. Import replaces current local data after confirmation.</p><div class="actions"><button class="btn" onclick="exportData(false)">Export JSON</button><button class="btn secondary" onclick="importData()">Import JSON</button></div><p class="muted">Backup file is local to your device unless you share it yourself.</p></div>`;$("modal").style.display='block'}
function exportData(silent){const b=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`ScienceHub-${APP_VERSION}-backup.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);if(!silent)alert('Backup exported.')}
function importData(){const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const incoming=normalise(JSON.parse(r.result));if(!confirm('Replace current local ScienceHub data with this backup?'))return;db=incoming;save('backup-import');alert('Backup imported.') }catch(e){alert('Invalid backup file.')}};r.readAsText(f)};i.click()}
function openSettings(){
 const q=db.settings.quiet!==false;
 $("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>⚙️ Settings</h2><button class="iconbtn" onclick="closeModal()">✕</button></div><p class="muted">Local-first • PWA • user-controlled data</p><label class="setting"><input type="checkbox" ${q?'checked':''} onchange="setSetting('quiet',this.checked)"> Quiet Mode preference</label><label class="setting"><span>Camera Mode</span><select onchange="setSetting('cameraMode',this.value)"><option ${db.settings.cameraMode==='off'?'selected':''}>off</option><option ${db.settings.cameraMode==='preview'?'selected':''}>preview</option><option ${db.settings.cameraMode==='capture'?'selected':''}>capture</option></select></label><div class="notice section">ScienceHub can store the preference, but a web page cannot silently control phone-level calls or notifications.</div><div class="actions"><button class="btn" onclick="exportData(false)">Export Backup</button><button class="btn secondary" onclick="closeModal()">Close</button></div></div>`;$("modal").style.display='block'}
function setSetting(k,v){db.settings[k]=v;localStorage.setItem(KEY,JSON.stringify(db))}
function closeModal(){$("modal").style.display='none'}
function aiRole(role){const messages={KuroVen:"Action taker: choose one small useful action and start it now.",Hikaitage:"Learning strategist with a 30+ years teaching-style approach: connect where, what, how, why and when before you act.",HukoVaige:"Psychology lens with a 45+ years psychologist-style approach: notice patterns, curiosity, growth and the reality of what is helping or blocking you."};alert(`${role}\n\n${messages[role]||"Choose a role."}`)}
function kuro(){const a=nextAction();alert(`KuroVen: Start now → ${a.title}\n\nReason: ${a.why}`)}

function render(){
 const map={home,study,subjects:subjectsPage,practice,learning,notes,flash,maps,resources,revision,mistakes,progress,academic,school,opportunities,time,space,world,exam:examTracker,recovery};
 const fn=current.startsWith('subject:')?()=>subjectPage(current.slice(8)):(map[current]||home);
 $("app").innerHTML=fn();
}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{}))}
window.addEventListener('beforeunload',()=>{if(focusTimer.interval)clearInterval(focusTimer.interval)});
render();
