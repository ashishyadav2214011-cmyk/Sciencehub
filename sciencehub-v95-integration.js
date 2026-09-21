/* ScienceHub V95 — cumulative integration bridge
   Connects the V74→V95 lineage to one runtime without replacing the V73/V93.1 core.
   Safe additive layer: syllabus normalization, perspective state, and cache-safe hooks.
*/
(()=>{
  "use strict";
  const KEY="sciencehub-v45";
  const SUBJECTS=["Biology","Physics","Chemistry","English","Hindi"];
  const LENSES=[
    ["Student","🎓","What should I understand, practice and finish next?"],
    ["Teacher","🧑‍🏫","What evidence shows that the concept is actually understood?"],
    ["Parent","🏠","What is the study pattern, consistency and visible progress?"],
    ["Self Behavior","🧠","What repeated behavior is helping or blocking progress?"],
    ["Exam Competitive","🏆","What must be recalled, tested and repaired under exam conditions?"]
  ];
  const safeParse=(x,f)=>{try{return JSON.parse(x)}catch(e){return f}};
  function load(){return safeParse(localStorage.getItem(KEY),{})||{}}
  function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
  function normalizeUserSchema(raw){
    const x=raw&&typeof raw==='object'?raw:{};
    if(x.subjects && x.subjects["11"] && x.subjects["12"]) return x;
    const class11={};
    for(const s of SUBJECTS){
      if(x[s]) class11[s]=x[s];
      else if(x.subjects?.[s]) class11[s]=x.subjects[s];
    }
    return {subjects:{"11":class11,"12":{}},conceptMaps:x.conceptMaps||x.maps||{},meta:{migratedFrom:"direct-subject-schema",migratedAt:new Date().toISOString()}};
  }
  function getAllChapters(){
    const x=normalizeUserSchema(load()), out=[];
    for(const cls of ["11","12"]){
      const group=x.subjects?.[cls]||{};
      for(const subject of SUBJECTS){
        const v=group[subject];
        if(!v) continue;
        if(Array.isArray(v)) v.forEach((c,i)=>out.push({classLevel:Number(cls),subject,index:i,name:String(c?.name||c?.title||c)}));
        else if(Array.isArray(v.chapters)) v.chapters.forEach((c,i)=>out.push({classLevel:Number(cls),subject,index:i,name:String(c?.name||c?.title||c)}));
      }
    }
    return out;
  }
  function chapterStatusStats(){
    const chapters=getAllChapters(), stats={total:chapters.length,byStatus:{}};
    chapters.forEach(c=>{const s=c.status||"Not Started";stats.byStatus[s]=(stats.byStatus[s]||0)+1});
    return stats;
  }
  function getStudyStats(){
    const x=load();
    return {tasks:Array.isArray(x.tasks)?x.tasks.length:0,questions:Array.isArray(x.questions)?x.questions.length:0,mistakes:Array.isArray(x.mistakes)?x.mistakes.length:0,revision:Array.isArray(x.revision)?x.revision.length:0,minutes:Number(x.minutes||0)};
  }
  function generatePerspectiveInsight(name){
    const s=getStudyStats(), c=chapterStatusStats();
    const map={
      Student:`Focus on one clear next action. ${s.tasks} task records, ${s.questions} question records and ${s.revision} revision records are currently available.`,
      Teacher:`Look for evidence: practice, mistakes and revision matter more than simply marking a chapter as studied.`,
      Parent:`Visible consistency can be checked through tasks, study minutes and revision activity rather than assumptions.`,
      "Self Behavior":`Use repeated mistakes and revision patterns as feedback about the study method, not as a label about the person.`,
      "Exam Competitive":`Convert weak or unfinished areas into recall → timed practice → mistake repair → revision loops.`
    };
    return `${map[name]||map.Student} Current chapter records: ${c.total}.`;
  }
  function getSelectedPerspective(){return localStorage.getItem("sciencehub-perspective")||"Student"}
  function selectPerspective(name){
    if(!LENSES.some(x=>x[0]===name)) return;
    localStorage.setItem("sciencehub-perspective",name);
    const x=load();x.settings=x.settings||{};x.settings.perspective=name;save(x);
    window.dispatchEvent(new CustomEvent("sciencehub:perspective-change",{detail:{name}}));
    renderPerspective();
  }
  function renderPerspective(){
    const mount=document.getElementById("perspectiveMount"); if(!mount)return;
    const selected=getSelectedPerspective();
    mount.innerHTML=`<section class="sh-perspective"><div class="sh-perspective-head"><div><span class="sh-kicker">SECOND-LEVEL HOME LENS</span><h2>Perspective</h2><p>Switch the same Study OS context between five useful viewpoints.</p></div></div><div class="sh-perspective-grid">${LENSES.map(x=>`<button class="sh-perspective-card ${x[0]===selected?'active':''}" data-perspective="${x[0]}"><span class="sh-perspective-icon">${x[1]}</span><strong>${x[0]}</strong><small>${x[2]}</small></button>`).join('')}</div><div class="sh-perspective-insight"><b>${selected}</b><p>${generatePerspectiveInsight(selected)}</p></div></section>`;
    mount.querySelectorAll("[data-perspective]").forEach(b=>b.addEventListener("click",()=>selectPerspective(b.dataset.perspective)));
  }
  window.ScienceHubSchemaV95={normalizeUserSchema,getAllChapters,chapterStatusStats,getStudyStats};
  window.ScienceHubPerspective={selectPerspective,getSelectedPerspective,renderPerspective,generatePerspectiveInsight};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",renderPerspective); else renderPerspective();
})();
