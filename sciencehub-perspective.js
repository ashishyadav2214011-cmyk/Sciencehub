/* ScienceHub Perspective V1 */
(function(){
const K="sciencehub-perspective-v1",L=[
["student","👨‍🎓","Student","clarity • workload • next action","What do I need to understand, practice, and do next?"],
["teacher","👨‍🏫","Teacher","concept • practice • mastery","Where is the learning gap?"],
["parent","👪","Parent","routine • consistency • progress","What does my progress show?"],
["self","🧠","Self / Behavior","patterns • friction • habits","What study pattern is helping or blocking me?"],
["exam","🎯","Exam / Competitive","PYQ • practice • revision","What should I practice or revise?"]];
function esc(v){return String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function render(){
 const h=document.getElementById("perspectiveMount");if(!h)return;
 const s=localStorage.getItem(K)||"student",l=L.find(x=>x[0]===s)||L[0],d=window.db||{},t=Array.isArray(d.tasks)?d.tasks:[],q=Array.isArray(d.questions)?d.questions:[],m=Array.isArray(d.mistakes)?d.mistakes:[];
 const insight={student:`${t.filter(x=>!x.done).length} open task(s). Focus on one next action.`,teacher:`${m.length} mistake record(s). Use mistakes and practice as evidence.`,parent:`${t.filter(x=>x.done).length} completed task(s), ${t.filter(x=>!x.done).length} open task(s).`,self:`${t.filter(x=>!x.done).length} open task(s) and ${m.length} mistake record(s) to reflect on.`,exam:`${q.length} question(s), ${m.length} mistake record(s) available for exam-focused work.`}[s];
 h.innerHTML=`<section class="card section perspective-panel"><div class="eyebrow">HOME → PERSPECTIVE</div><h2>Perspective 👁️</h2><p class="muted">One study situation, multiple useful lenses.</p><div class="perspective-grid">${L.map(x=>`<button class="perspective-card ${x[0]===s?"active":""}" data-p="${x[0]}"><span class="perspective-icon">${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small><span>${x[4]}</span></button>`).join("")}</div><div class="perspective-insight"><div class="eyebrow">CURRENT LENS</div><h3>${l[1]} ${l[2]}</h3><p>${esc(insight)}</p><div class="perspective-flow"><span>Context</span><i>→</i><span>Lens</span><i>→</i><span>Insight</span><i>→</i><span>Action</span></div></div></section>`;
 h.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>{localStorage.setItem(K,b.dataset.p);render()});
}
window.ScienceHubPerspective={render};document.addEventListener("DOMContentLoaded",render);
})();