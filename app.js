const KEY="sciencehub-v45";
const OLD="sciencehub-v1";
const subjects=["Biology","Physics","Chemistry","English","Hindi"];
const statuses=["Not Started","Learning","Learned","Revision Due","Strong","Weak","Mastered"];
let db=load();
let current="home", searchTerm="";

function fresh(){return {tasks:[],notes:[],revision:[],events:[],minutes:0,good:0,bad:0,chapters:[],topics:[],questions:[],mistakes:[],flashcards:[],maps:[],resources:[],settings:{quiet:true}}}
function load(){
  try{const n=JSON.parse(localStorage.getItem(KEY));if(n)return Object.assign(fresh(),n)}catch(e){}
  try{const o=JSON.parse(localStorage.getItem(OLD));if(o){const n=Object.assign(fresh(),o);n.chapters=seedChapters();n.questions=[];n.mistakes=[];n.revision=(o.revision||[]).map(x=>({...x,status:x.done?"done":"due"}));localStorage.setItem(KEY,JSON.stringify(n));return n}}catch(e){}
  const n=fresh();n.chapters=seedChapters();return n
}
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
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function ev(type,data={}){db.events.push({id:Date.now()+Math.random(),type,at:new Date().toISOString(),data})}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function go(p){current=p;closeDrawer();render();scrollTo(0,0)}
function closeDrawer(){document.getElementById("drawer").className=""}
function more(){document.getElementById("drawer").innerHTML=`<div class="drawerbox">
<div class="row"><h2>ScienceHub</h2><button class="iconbtn" onclick="closeDrawer()">✕</button></div>
${["academic","learning","revision","progress","school","opportunities","time","space"].map(x=>`<button onclick="go('${x}')">${icon(x)} ${label(x)}</button>`).join("")}
<button onclick="openSettings()">⚙️ Settings</button><button onclick="openBackup()">💾 Backup / Recovery</button>
</div>`;document.getElementById("drawer").className="show"}
function icon(x){return ({academic:"🎓",learning:"🧠",revision:"🔁",progress:"📈",school:"🏫",opportunities:"🎯",time:"⏱️",space:"🗂️"})[x]||"•"}
function label(x){return ({academic:"Academic",learning:"Learning Lab",revision:"Revision Engine",progress:"Progress & Analytics",school:"School",opportunities:"PCB Opportunities",time:"Time Tracking",space:"My Space"})[x]||x}
function pct(){const a=db.tasks.length,b=db.tasks.filter(x=>x.done).length;return a?Math.round(b/a*100):0}
function dueRevisions(){return db.revision.filter(r=>r.status!=="done" && (!r.due || r.due<=Date.now())).sort((a,b)=>(a.due||0)-(b.due||0))}
function nextAction(){
  const due=dueRevisions()[0]; if(due)return {title:"Revise "+(due.title||due.topic),why:"Revision is due",action:`completeRevision('${due.id}')`};
  const t=db.tasks.find(x=>!x.done); if(t)return {title:t.title,why:"Open study task",action:`doneTask('${t.id}')`};
  const weak=db.chapters.find(x=>x.status==="Weak"); if(weak)return {title:"Recover: "+weak.name,why:"Weak chapter needs attention",action:`quickRevision('${weak.id}')`};
  return {title:"Create today's first task",why:"Your queue is clear",action:"go('study')"}
}
function home(){
  const act=nextAction(), d=dueRevisions().length, p=pct();
  return `<div class="hero">
    <div class="eyebrow">PERSONAL STUDY OS • CLASS 11</div>
    <h1>Good evening, Ashu.Ayansh 👋</h1>
    <p>Understand → Practice → Measure → Improve → Execute.</p>
    <div class="search"><input id="globalSearch" placeholder="Search ScienceHub…" value="${esc(searchTerm)}" oninput="globalSearch(this.value)"><button class="btn" onclick="doSearch()">Search</button></div>
  </div>
  <section class="section"><div class="card mission"><div><span class="tag">TODAY'S MISSION</span><h2 style="margin:7px 0">${esc(act.title)}</h2><div class="muted">${esc(act.why)}</div></div><button class="btn" onclick="${act.action}">Start</button></div></section>
  <section class="section"><h2>Next Best Action</h2><div class="grid"><div class="card stat"><strong>${p}%</strong><span>Task completion</span></div><div class="card stat"><strong>${d}</strong><span>Revision due</span></div><div class="card stat"><strong>${db.good-db.bad}</strong><span>Practice score</span></div></div></section>
  <section class="section"><h2>Revision / Attention</h2>${revisionMini()}</section>
  <section class="section"><h2>Quick Access</h2><div class="grid">${["study","subjects","practice","learning","revision","progress"].map(x=>`<button class="card" onclick="go('${x}')">${icon(x)||"⚡"}<br><b>${label(x)||x}</b><div class="muted">Open</div></button>`).join("")}</div></section>
  <section class="section"><h2>🤖 KuroVen</h2><div class="card"><b>Action Taker</b><p class="muted">I turn the current priority into the next executable study action.</p><button class="btn secondary" onclick="kuro()">What should I do now?</button></div></section>
  <section class="section"><h2>Today's Progress</h2><div class="card"><div class="progress"><i style="width:${p}%"></i></div><p class="muted">${db.tasks.filter(x=>x.done).length} of ${db.tasks.length} tasks completed • ${db.minutes} active study minutes</p></div></section>`;
}
function revisionMini(){const a=dueRevisions().slice(0,3);if(!a.length)return `<div class="card goodtxt">✨ No revision is due right now. Keep learning.</div>`;return `<div class="list">${a.map(r=>`<div class="item"><div class="row"><b>${esc(r.title||r.topic||"Revision")}</b><button class="btn good" onclick="completeRevision('${r.id}')">Done</button></div><div class="muted">${esc(r.subject||"")}${r.chapter?" • "+esc(r.chapter):""}</div></div>`).join("")}</div>`}
function globalSearch(v){searchTerm=v; if(v.length>1) renderSearch(v)}
function doSearch(){renderSearch(searchTerm)}
function renderSearch(q){if(!q||q.length<2)return;const z=q.toLowerCase();const out=[];
 db.chapters.filter(x=>(x.name+" "+x.subject).toLowerCase().includes(z)).forEach(x=>out.push(`📚 ${x.subject} — ${x.name}`));
 db.notes.filter(x=>(x.title+" "+x.body).toLowerCase().includes(z)).forEach(x=>out.push(`🗒️ ${x.title}`));
 db.tasks.filter(x=>x.title.toLowerCase().includes(z)).forEach(x=>out.push(`📅 ${x.title}`));
 const box=document.getElementById("searchResults");if(box)box.innerHTML=out.length?`<div class="card list">${out.slice(0,8).map(esc).map(x=>`<div class="item">${x}</div>`).join("")}</div>`:`<div class="notice">No local match.</div>`
}
function study(){return `<section><div class="row"><div><div class="eyebrow">STUDY</div><h1>Plan → Focus → Finish</h1></div><button class="btn" onclick="openTaskForm()">+ Task</button></div><div id="taskForm"></div><div class="section list">${db.tasks.length?db.tasks.map(t=>`<div class="item ${t.done?"done":""}"><div class="row"><b>${esc(t.title)}</b><span class="tag">${esc(t.priority||"normal")}</span></div><div class="muted">${esc(t.subject||"General")} ${t.chapter?"• "+esc(t.chapter):""} • ${t.minutes||0} min</div><div class="actions">${!t.done?`<button class="btn good" onclick="doneTask('${t.id}')">Complete +2</button>`:"<span class='goodtxt'>✓ Completed</span>"}<button class="btn secondary" onclick="delTask('${t.id}')">Remove</button></div></div>`).join(""):`<div class="card">No tasks yet. Add one small executable task.</div>`}</div></section>`}
function openTaskForm(){document.getElementById("taskForm").innerHTML=`<div class="card form section"><input id="taskTitle" placeholder="e.g. Biology — Plant Kingdom diagrams"><select id="taskSubject">${subjects.map(s=>`<option>${s}</option>`).join("")}</select><select id="taskChapter"><option value="">No chapter</option></select><input id="taskMins" type="number" value="45" min="5"><select id="taskPriority"><option>high</option><option selected>normal</option><option>low</option></select><button class="btn" onclick="addTask()">Add task</button></div>`;fillChapters("taskSubject","taskChapter")}
function fillChapters(a,b){const s=document.getElementById(a),c=document.getElementById(b);if(!s||!c)return;c.innerHTML=`<option value="">No chapter</option>`+db.chapters.filter(x=>x.subject===s.value).map(x=>`<option>${esc(x.name)}</option>`).join("");s.onchange=()=>fillChapters(a,b)}
function addTask(){const title=document.getElementById("taskTitle").value.trim();if(!title)return alert("Write a task first.");db.tasks.push({id:Date.now()+"",title,subject:document.getElementById("taskSubject").value,chapter:document.getElementById("taskChapter").value,minutes:+document.getElementById("taskMins").value||45,priority:document.getElementById("taskPriority").value,done:false});ev("TASK_CREATED",{title});save()}
function doneTask(id){const t=db.tasks.find(x=>x.id==id);if(!t||t.done)return;t.done=true;db.minutes+=t.minutes||0;db.good+=2;ev("STUDY_SESSION_COMPLETED",{taskId:id,minutes:t.minutes});save()}
function delTask(id){db.tasks=db.tasks.filter(x=>x.id!=id);ev("TASK_DELETED",{id});save()}
function subjectsPage(){return `<section><div class="eyebrow">SUBJECTS</div><h1>Class 11 Core</h1><div class="grid">${subjects.map(s=>{const cs=db.chapters.filter(c=>c.subject===s),done=cs.filter(c=>["Learned","Strong","Mastered"].includes(c.status)).length;return `<div class="card"><div class="row"><b>${s}</b><span class="tag">${done}/${cs.length}</span></div><div class="progress" style="margin:10px 0"><i style="width:${cs.length?done/cs.length*100:0}%"></i></div><button class="btn secondary" onclick="subject('${s}')">Open</button></div>`}).join("")}</div></section>`}
function subject(s){current="subject:"+s;render()}
function subjectPage(s){const cs=db.chapters.filter(c=>c.subject===s);return `<section><button class="btn secondary" onclick="go('subjects')">← Subjects</button><h1>${esc(s)}</h1><div class="list section">${cs.map(c=>`<div class="item"><div class="row"><b>${esc(c.name)}</b><select onchange="setStatus('${c.id}',this.value)">${statuses.map(x=>`<option ${x===c.status?"selected":""}>${x}</option>`).join("")}</select></div><div class="muted">Status drives revision attention; one mistake alone does not make a chapter weak.</div><div class="actions"><button class="btn secondary" onclick="quickRevision('${c.id}')">+ Revision</button><button class="btn secondary" onclick="addTopic('${c.id}')">+ Topic</button></div></div>`).join("")}</div></section>`}
function setStatus(id,v){const c=db.chapters.find(x=>x.id===id);if(c){c.status=v;if(v==="Revision Due")addRevision(c.subject,c.name,"Status marked Revision Due");save()}}
function addTopic(id){const c=db.chapters.find(x=>x.id===id),t=prompt("Topic name?");if(!c||!t)return;db.topics.push({id:Date.now()+"",chapterId:id,subject:c.subject,chapter:c.name,name:t});ev("TOPIC_CREATED",{name:t});save()}
function quickRevision(id){const c=db.chapters.find(x=>x.id===id);if(c){addRevision(c.subject,c.name,"Manual revision");save()}}
function addRevision(subject,chapter,reason="Revision"){const id=Date.now()+"r";db.revision.push({id,subject,chapter,title:chapter,due:Date.now(),status:"due",reason,created:Date.now()});return id}
function completeRevision(id){const r=db.revision.find(x=>x.id==id);if(!r)return;r.status="done";r.completed=Date.now();r.next=Date.now()+3*86400000;db.good+=2;ev("REVISION_COMPLETED",{id,subject:r.subject,chapter:r.chapter});save()}
function revision(){const due=dueRevisions();const upcoming=db.revision.filter(r=>r.status==="done").sort((a,b)=>(a.next||0)-(b.next||0)).slice(0,8);return `<section><div class="eyebrow">STEP 5 • REVISION ENGINE</div><h1>Revision that reacts to your study</h1><div class="notice">Priority uses due revision, mistakes, status and recent performance. Completion schedules a follow-up review.</div><div class="section"><h2>Due Today (${due.length})</h2><div class="list">${due.length?due.map(r=>`<div class="item"><div class="row"><b>${esc(r.title)}</b><button class="btn good" onclick="completeRevision('${r.id}')">Complete +2</button></div><div class="muted">${esc(r.subject)} • ${esc(r.reason||"Revision")}</div></div>`).join(""):`<div class="card goodtxt">Nothing due. Nice work. ✨</div>`}</div></div><div class="section"><h2>Upcoming follow-ups</h2><div class="list">${upcoming.length?upcoming.map(r=>`<div class="item"><b>${esc(r.title)}</b><div class="muted">${new Date(r.next).toLocaleDateString()} • ${esc(r.subject)}</div></div>`).join(""):`<div class="card">Complete a revision to create a follow-up.</div>`}</div></div><div class="section"><h2>Live Recall</h2><div class="card"><p class="muted">Use your voice to recall a topic without looking at notes.</p><button class="btn secondary" onclick="startRecall()">🎙️ Start Recall</button><div id="recallBox"></div></div></div></section>`}
function startRecall(){const b=document.getElementById("recallBox");if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){b.innerHTML="<p class='muted'>Voice recall is not supported by this browser. You can still do silent recall.</p>";return}const R=window.SpeechRecognition||window.webkitSpeechRecognition,r=new R();r.lang="en-IN";r.interimResults=false;r.onresult=e=>{b.innerHTML=`<div class="notice">Recall captured locally for this session: ${esc(e.results[0][0].transcript)}</div>`};r.onerror=()=>b.innerHTML="<div class='notice'>Microphone recall stopped. Try again.</div>";r.start();b.innerHTML="<div class='muted'>Listening… explain the topic from memory.</div>"}
function learning(){return `<section><div class="eyebrow">LEARNING LAB</div><h1>Build understanding</h1><div class="grid">${[["notes","🗒️","My Notes"],["flash","🃏","Flashcards"],["maps","🧩","Concept Maps"],["resources","🔗","Resource Hub"]].map(x=>`<button class="card" onclick="go('${x[0]}')">${x[1]}<br><b>${x[2]}</b></button>`).join("")}</div></section>`}
function notes(){return `<section><div class="row"><h1>My Notes</h1><button class="btn" onclick="openNote()">+ Note</button></div><div class="list section">${db.notes.map(n=>`<div class="item"><b>${esc(n.title)}</b><p class="muted">${esc(n.body)}</p><button class="btn secondary" onclick="shareNote('${n.id}')">Share</button></div>`).join("")||`<div class="card">No notes yet.</div>`}</div></section>`}
function openNote(){const t=prompt("Note title?");if(!t)return;const b=prompt("Note body?")||"";db.notes.unshift({id:Date.now()+"",title:t,body:b});ev("NOTE_CREATED",{title:t});save()}
function shareNote(id){const n=db.notes.find(x=>x.id==id);if(!n)return;const text=n.title+"\\n\\n"+n.body+"\\n\\nShared from ScienceHub";if(navigator.share)navigator.share({title:n.title,text}).catch(()=>{});else navigator.clipboard?.writeText(text).then(()=>alert("Copied for sharing."))}
function flash(){return simpleList("Flashcards","flashcards","🃏",["Front","Back"])}
function maps(){return simpleList("Concept Maps","maps","🧩",["Concept","Connections"])}
function resources(){return simpleList("Resource Hub","resources","🔗",["Title","Link / note"])}
function simpleList(title,key,emoji,fields){return `<section><div class="row"><h1>${emoji} ${title}</h1><button class="btn" onclick="addSimple('${key}')">+ Add</button></div><div class="list section">${db[key].map(x=>`<div class="item"><b>${esc(x.a)}</b><p class="muted">${esc(x.b)}</p></div>`).join("")||`<div class="card">Nothing saved yet.</div>`}</div></section>`}
function addSimple(k){const a=prompt(k==="flashcards"?"Front":k==="maps"?"Concept":"Resource title");if(!a)return;const b=prompt(k==="flashcards"?"Back":k==="maps"?"Connections":"Link / note")||"";db[k].push({id:Date.now()+"",a,b});save()}
function practice(){return `<section><div class="eyebrow">PRACTICE LAB</div><h1>Practice → Measure</h1><div class="grid3"><div class="card stat"><strong>${db.questions.length}</strong><span>Saved questions</span></div><div class="card stat"><strong>${db.good}</strong><span>Good / OK</span></div><div class="card stat"><strong>${db.bad}</strong><span>Bad</span></div></div><div class="actions section"><button class="btn" onclick="addQuestion()">+ Question</button><button class="btn secondary" onclick="go('mistakes')">Mistake Book</button></div><div class="list section">${db.questions.map(q=>`<div class="item"><div class="muted">${esc(q.subject)} • ${esc(q.chapter||"")}</div><b>${esc(q.text)}</b><div class="actions"><button class="btn good" onclick="answer('${q.id}',true)">Correct +2</button><button class="btn warn" onclick="answer('${q.id}',false)">Bad −1</button></div></div>`).join("")||`<div class="card">Add your own question to start the local practice bank.</div>`}</div></section>`}
function addQuestion(){const text=prompt("Question?");if(!text)return;const s=prompt("Subject (Biology/Physics/Chemistry/English/Hindi)?")||"General";const c=prompt("Chapter?")||"";db.questions.push({id:Date.now()+"",text,subject:s,chapter:c,created:Date.now()});save()}
function answer(id,ok){const q=db.questions.find(x=>x.id==id);if(!q)return;if(ok){db.good+=2;ev("QUESTION_CORRECT",{id});}else{db.bad+=1;db.mistakes.unshift({id:Date.now()+"",question:q.text,subject:q.subject,chapter:q.chapter,at:Date.now()});if(q.chapter)addRevision(q.subject,q.chapter,"Wrong answer → revision trigger");ev("QUESTION_WRONG",{id});}save()}
function mistakes(){return `<section><div class="eyebrow">MISTAKE BOOK</div><h1>Turn mistakes into revision</h1><div class="list section">${db.mistakes.map(m=>`<div class="item"><b>${esc(m.question)}</b><div class="muted">${esc(m.subject)} • ${esc(m.chapter||"")}</div><div class="actions"><button class="btn secondary" onclick="mistakeRev('${m.id}')">Revise</button></div></div>`).join("")||`<div class="card goodtxt">No recorded mistakes yet.</div>`}</div></section>`}
function mistakeRev(id){const m=db.mistakes.find(x=>x.id==id);if(m){addRevision(m.subject,m.chapter||m.question,"Mistake Book");save()}}
function progress(){const score=db.good*2-db.bad;return `<section><div class="eyebrow">PROGRESS</div><h1>Measure what is improving</h1><div class="grid3"><div class="card stat"><strong>${pct()}%</strong><span>Tasks complete</span></div><div class="card stat"><strong>${db.minutes}</strong><span>Study minutes</span></div><div class="card stat"><strong>${score}</strong><span>Practice net</span></div></div><div class="section list">${subjects.map(s=>{const c=db.chapters.filter(x=>x.subject===s),strong=c.filter(x=>["Strong","Mastered"].includes(x.status)).length,weak=c.filter(x=>x.status==="Weak").length;return `<div class="card"><div class="row"><b>${s}</b><span>${strong} strong • ${weak} weak</span></div><div class="progress" style="margin-top:9px"><i style="width:${c.length?strong/c.length*100:0}%"></i></div></div>`}).join("")}</div></section>`}
function academic(){return `<section><div class="eyebrow">ACADEMIC</div><h1>Class 11 command view</h1><div class="grid">${subjects.map(s=>`<button class="card" onclick="subject('${s}')">📚 <b>${s}</b><div class="muted">${db.chapters.filter(c=>c.subject===s).length} seeded chapters</div></button>`).join("")}</div><div class="section card"><b>Status system</b><p class="muted">${statuses.join(" / ")}</p><p class="muted">Class 12 remains a future layer; Bioinformatics stays a separate long-term track.</p></div></section>`}
function school(){return `<section><div class="eyebrow">SCHOOL</div><h1>School Workspace</h1><div class="grid"><div class="card">🏫 Schedule<br><span class="muted">Plan school commitments.</span></div><div class="card">👨‍🏫 Teachers<br><span class="muted">Keep teacher-related notes.</span></div><div class="card">📚 Homework<br><span class="muted">Convert homework into tasks.</span></div><div class="card">🧪 Practicals<br><span class="muted">Track practical work.</span></div></div></section>`}
function opportunities(){return `<section><div class="eyebrow">PCB OPPORTUNITIES</div><h1>Future Possibilities</h1><div class="notice">This static version does not claim live/verified scholarship or exam data. Current opportunities should be added only after source verification.</div><div class="grid section">${["Scholarships","Courses / Colleges","Research","Internships","Government Opportunities","Career Opportunities","Competitions","Exam Tracker","Future Scope"].map(x=>`<div class="card"><b>${x}</b><div class="muted">Ready for verified data integration.</div></div>`).join("")}</div></section>`}
function time(){return `<section><div class="eyebrow">TIME TRACKING</div><h1>Time is an input</h1><div class="grid3"><div class="card stat"><strong>${db.minutes}</strong><span>Active study min</span></div><div class="card stat"><strong>${db.tasks.length}</strong><span>Tasks</span></div><div class="card stat"><strong>${db.events.length}</strong><span>Events</span></div></div><div class="notice section">Session Duration ≠ Active Study Duration. Current static build records completed task minutes.</div></section>`}
function space(){return `<section><div class="eyebrow">MY SPACE</div><h1>Your study memory</h1><div class="grid">${["Bookmarks","Saved Questions","My Notes","Flashcards","Concept Maps","Saved Resources","Goals","Ideas","Research / Project Space","Bioinformatics Space","Archive","Analytics"].map(x=>`<div class="card"><b>${x}</b><div class="muted">Personal workspace</div></div>`).join("")}</div><div class="card section"><b>Recovery Box</b><p class="muted">Future destructive actions should move items here before permanent deletion.</p><button class="btn secondary" onclick="openBackup()">Open Backup / Recovery</button></div></section>`}
function openBackup(){document.getElementById("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>💾 Backup & Recovery</h2><button class="iconbtn" onclick="closeModal()">✕</button></div><p class="muted">Export a local JSON backup before major changes.</p><div class="actions"><button class="btn" onclick="exportData()">Export JSON</button><button class="btn secondary" onclick="importData()">Import JSON</button></div><p class="muted">No important data is silently deleted by this build.</p></div>`;document.getElementById("modal").style.display="block"}
function exportData(){const b=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="ScienceHub-AshuAyansh-backup.json";a.click()}
function importData(){const i=document.createElement("input");i.type="file";i.accept=".json,application/json";i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{db=Object.assign(fresh(),JSON.parse(r.result));save();alert("Backup imported.")}catch(e){alert("Invalid backup file.")}};r.readAsText(f)};i.click()}
function openSettings(){document.getElementById("modal").innerHTML=`<div class="modalbox"><div class="row"><h2>⚙️ Settings</h2><button class="iconbtn" onclick="closeModal()">✕</button></div><p class="muted">Local-first • PWA • user-controlled data</p><div class="card"><b>Quiet Mode</b><p class="muted">Default preference is ON in the ScienceHub specification. This web app cannot control phone-level calls/notifications.</p></div><div class="actions"><button class="btn" onclick="exportData()">Export Backup</button><button class="btn secondary" onclick="closeModal()">Close</button></div></div>`;document.getElementById("modal").style.display="block"}
function closeModal(){document.getElementById("modal").style.display="none"}
function kuro(){const a=nextAction();alert("KuroVen: Start now → "+a.title+"\\n\\nReason: "+a.why)}
function render(){let html=current==="home"?home():current==="study"?study():current==="subjects"?subjectsPage():current==="practice"?practice():current==="learning"?learning():current==="notes"?notes():current==="flash"?flash():current==="maps"?maps():current==="resources"?resources():current==="revision"?revision():current==="mistakes"?mistakes():current==="progress"?progress():current==="academic"?academic():current==="school"?school():current==="opportunities"?opportunities():current==="time"?time():current==="space"?space():current.startsWith("subject:")?subjectPage(current.slice(8)):home();document.getElementById("app").innerHTML=html}
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
render();


/* === ScienceHub Step 6: Intelligence Center === */
(function(){
  const KEY='sciencehub-v1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  function getNextAction(x){
    const due=(x.revision||[]).filter(v=>!v.done);
    const tasks=(x.tasks||[]).filter(v=>!v.done);
    if(due.length) return ['Revision is due','Start the highest-priority revision now.'];
    if(tasks.length) return ['Complete your next study task',tasks[0].title||'Continue your planned study.'];
    if((x.bad||0)>0) return ['Review your mistakes','Open Mistake Book and repair one weak area.'];
    return ['Set today’s mission','Create one clear goal and start it.'];
  }
  window.ScienceHubIntelligence={
    snapshot:function(){
      const x=load(), a=getNextAction(x);
      return {nextAction:a, openTasks:(x.tasks||[]).filter(v=>!v.done).length, dueRevision:(x.revision||[]).filter(v=>!v.done).length};
    }
  };
})();


/* === ScienceHub Step 7: Tracking & Opportunities === */
(function(){
  const KEY='sciencehub-v1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const init=()=>{
    const x=load();
    x.goals=Array.isArray(x.goals)?x.goals:[];
    x.examTracker=Array.isArray(x.examTracker)?x.examTracker:[];
    x.opportunities=Array.isArray(x.opportunities)?x.opportunities:[];
    x.minutes=Number(x.minutes||0);
    save(x); return x;
  };
  window.ScienceHubTracking={
    addGoal:function(title){const x=init();x.goals.push({id:Date.now(),title,done:false});save(x);},
    addExam:function(name,date,status){const x=init();x.examTracker.push({id:Date.now(),name,date:date||'',status:status||'Upcoming'});save(x);},
    saveOpportunity:function(title,type){const x=init();x.opportunities.push({id:Date.now(),title,type:type||'PCB',savedAt:new Date().toISOString()});save(x);},
    summary:function(){const x=init();return {minutes:x.minutes,goals:x.goals.length,exams:x.examTracker.length,opportunities:x.opportunities.length};}
  };
})();


/* === ScienceHub Step 8: World Knowledge & Data Hardening === */
(function(){
  const KEY='sciencehub-v1';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const x=load();
  x.worldKnowledge=Array.isArray(x.worldKnowledge)?x.worldKnowledge:[];
  x.schemaVersion=8;
  save(x);
  window.ScienceHubWorld={
    saveNote:function(title,summary){
      const d=load();
      d.worldKnowledge=Array.isArray(d.worldKnowledge)?d.worldKnowledge:[];
      d.worldKnowledge.push({id:Date.now(),title,summary:summary||'',savedAt:new Date().toISOString()});
      d.schemaVersion=8; save(d);
    },
    count:function(){return (load().worldKnowledge||[]).length;}
  };
})();


/* === Step 6–8 UI === */
(function(){
  function mount(){
    if(document.getElementById('sh68')) return;
    const host=document.querySelector('main')||document.body;
    const s=document.createElement('section');
    s.id='sh68'; s.className='sh68-panel';
    s.innerHTML='<div class="sh68-head"><div><span class="sh68-kicker">STEP 6–8</span><h2>Intelligence & Future Center</h2><p>Decide → Track → Save → Learn</p></div><button id="sh68-refresh">Refresh</button></div>'+
      '<div class="sh68-grid"><article><b>Next Best Action</b><div id="sh68-action">—</div></article><article><b>Open Tasks</b><div id="sh68-tasks">0</div></article><article><b>Due Revision</b><div id="sh68-revision">0</div></article><article><b>Saved Opportunities</b><div id="sh68-opps">0</div></article><article><b>World Notes</b><div id="sh68-world">0</div></article></div>'+
      '<div class="sh68-actions"><button id="sh68-goal">+ Goal</button><button id="sh68-exam">+ Exam</button><button id="sh68-opp">+ PCB Opportunity</button><button id="sh68-worldadd">+ World Note</button></div>';
    host.prepend(s);
    function render(){
      const i=ScienceHubIntelligence.snapshot(), t=ScienceHubTracking.summary();
      document.getElementById('sh68-action').textContent=i.nextAction[0];
      document.getElementById('sh68-tasks').textContent=i.openTasks;
      document.getElementById('sh68-revision').textContent=i.dueRevision;
      document.getElementById('sh68-opps').textContent=t.opportunities;
      document.getElementById('sh68-world').textContent=ScienceHubWorld.count();
    }
    document.getElementById('sh68-refresh').onclick=render;
    document.getElementById('sh68-goal').onclick=()=>{const v=prompt('Goal name?');if(v){ScienceHubTracking.addGoal(v);render();}};
    document.getElementById('sh68-exam').onclick=()=>{const v=prompt('Exam name?');if(v){ScienceHubTracking.addExam(v,'','Upcoming');render();}};
    document.getElementById('sh68-opp').onclick=()=>{const v=prompt('PCB opportunity to save?');if(v){ScienceHubTracking.saveOpportunity(v,'PCB');render();}};
    document.getElementById('sh68-worldadd').onclick=()=>{const v=prompt('World knowledge note?');if(v){ScienceHubWorld.saveNote(v,'');render();}};
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
