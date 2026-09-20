/* ScienceHub V94 — safe additive enhancements.
   Does not replace the existing Study OS runtime.
   Adds voice writing, read-aloud, camera control, and quick Recall/Review.
*/
(()=>{"use strict";
const SH={rec:null,stream:null};

function speak(text){
  if(!("speechSynthesis" in window)){alert("Text-to-voice is not supported by this browser.");return;}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(String(text||"").slice(0,5000));
  u.rate=.95; u.pitch=1;
  speechSynthesis.speak(u);
}

function startVoice(target){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("Voice-to-text is not supported in this browser.");return;}
  if(SH.rec){SH.rec.stop();SH.rec=null;return;}
  const r=new SR(); SH.rec=r;
  r.lang=navigator.language||"en-IN"; r.interimResults=true; r.continuous=false;
  let base=target.value||"";
  r.onresult=e=>{
    let text="";
    for(let i=e.resultIndex;i<e.results.length;i++) text+=e.results[i][0].transcript;
    target.value=(base?base+" ":"")+text;
    target.dispatchEvent(new Event("input",{bubbles:true}));
  };
  r.onerror=()=>{SH.rec=null;};
  r.onend=()=>{SH.rec=null;};
  r.start();
}

function camera(){
  if(SH.stream){SH.stream.getTracks().forEach(t=>t.stop());SH.stream=null;document.getElementById("shCamera")?.remove();return;}
  if(!navigator.mediaDevices?.getUserMedia){alert("Camera is not supported by this browser.");return;}
  const box=document.createElement("div"); box.id="shCamera";
  box.style="position:fixed;inset:0;z-index:9999;background:#050b13;display:flex;flex-direction:column;gap:10px;padding:12px";
  box.innerHTML='<video autoplay playsinline style="width:100%;height:calc(100% - 70px);object-fit:contain;border-radius:14px;background:#000"></video><div style="display:flex;gap:8px"><button id="shSnap">📸 Capture</button><button id="shClose">✕ Close</button></div>';
  document.body.appendChild(box);
  const video=box.querySelector("video");
  navigator.mediaDevices.getUserMedia({video:true,audio:false}).then(stream=>{
    SH.stream=stream; video.srcObject=stream;
  }).catch(()=>{box.remove();alert("Camera permission was not granted.");});
  box.querySelector("#shClose").onclick=camera;
  box.querySelector("#shSnap").onclick=()=>{
    if(!video.videoWidth)return;
    const c=document.createElement("canvas"); c.width=video.videoWidth;c.height=video.videoHeight;
    c.getContext("2d").drawImage(video,0,0);
    const a=document.createElement("a");a.download="sciencehub-capture.png";a.href=c.toDataURL("image/png");a.click();
  };
}

function recall(){
  const key="sciencehub-quick-recall";
  const previous=localStorage.getItem(key)||"";
  const answer=prompt("Quick Recall — write what you remember:");
  if(answer===null)return;
  localStorage.setItem(key,answer);
  if(typeof ev==="function") ev("QUICK_RECALL",{answer,previous});
  alert(previous?("Previous recall saved. Current answer: "+answer):"Recall saved.");
}
function review(){
  const answer=localStorage.getItem("sciencehub-quick-recall")||"";
  if(!answer){alert("No Quick Recall saved yet. Do Recall first.");return;}
  speak("Your saved recall is: "+answer);
  alert("Review started. Your saved recall is ready for read-aloud.");
}

function addTools(){
  if(document.getElementById("shTools"))return;
  const p=document.createElement("div");p.id="shTools";
  p.style="position:fixed;right:12px;bottom:92px;z-index:80;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end";
  p.innerHTML='<button title="Voice to text">🎙️</button><button title="Text to voice">🔊</button><button title="Camera">📷</button><button title="Quick Recall">🧠</button><button title="Review">🔁</button>';
  const b=p.querySelectorAll("button");
  b[0].onclick=()=>{const t=document.activeElement?.tagName==="TEXTAREA"||document.activeElement?.tagName==="INPUT"?document.activeElement:document.querySelector("textarea,input[type=text]");if(t)startVoice(t);else alert("Tap a text field first, then press 🎙️.");};
  b[1].onclick=()=>{const t=document.activeElement?.value||document.querySelector("textarea")?.value||document.querySelector("main")?.innerText||"";speak(t);};
  b[2].onclick=camera;b[3].onclick=recall;b[4].onclick=review;
  p.querySelectorAll("button").forEach(x=>x.style="border:1px solid rgba(120,210,255,.35);border-radius:999px;background:#0b1727;color:#fff;padding:8px 10px");
  document.body.appendChild(p);
}
window.ScienceHubVoice={startVoice,speak,camera,recall,review};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addTools);else addTools();
setTimeout(addTools,1200);
})();
