(()=>{"use strict";
const K="sciencehub-upgrade-guard-state-v2",H="sciencehub-upgrade-guard-history-v2",C="sciencehub-upgrade-guard-checkpoints-v2";
const DEFAULT={
 product:"ScienceHub",component:"Upgrade Guard AI",phase:2,version:"UGAI-P2.0.0",
 mode:"ACTIVE",frozenPhase:null,
 permissions:{
  inspectCode:"ALLOW",compareVersions:"ALLOW",runTests:"ALLOW",createCheckpoint:"ALLOW",
  autoSafeFixes:"ASK_FIRST",schemaMigration:"ASK_FIRST",replaceLockedFeature:"ASK_FIRST",
  privacyChange:"ASK_FIRST",permanentDelete:"ASK_FIRST",externalAction:"ASK_FIRST"
 },
 queue:[],lastAudit:null,lastValidation:null,lastError:null
};
const clone=x=>JSON.parse(JSON.stringify(x));
const id=()=>Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);
function read(k,f){try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??clone(f)}catch(e){return clone(f)}}
let state=read(K,DEFAULT),history=read(H,[]),checkpoints=read(C,[]);
function save(){localStorage.setItem(K,JSON.stringify(state));localStorage.setItem(H,JSON.stringify(history));localStorage.setItem(C,JSON.stringify(checkpoints))}
function log(type,detail={}){const x={id:id(),type,at:new Date().toISOString(),phase:state.frozenPhase?.phase??null,version:state.version,detail:clone(detail)};history.unshift(x);history=history.slice(0,500);save();return x}
function permission(name){return state.permissions[name]||"DENY"}
function requireApproval(name){const p=permission(name);if(p==="DENY")throw new Error("Permission denied: "+name);return p}
function safePath(p){return typeof p==="string"&&p.length>0&&!p.includes("\0")&&!p.startsWith("/")&&!p.split("/").includes("..")}
function compareManifest(a,b){
 const A=new Map((a?.files||[]).map(x=>[x.path,x])),B=new Map((b?.files||[]).map(x=>[x.path,x]));
 return {added:[...B.keys()].filter(x=>!A.has(x)),removed:[...A.keys()].filter(x=>!B.has(x)),
 changed:[...B.keys()].filter(x=>A.has(x)&&A.get(x).sha256!==B.get(x).sha256)};
}
function validateManifest(m){
 const errors=[],warnings=[],seen=new Set();
 if(!m||typeof m!=="object")errors.push("Manifest missing or invalid");
 for(const x of m?.files||[]){
  if(!x?.path)errors.push("File entry has no path");
  else if(!safePath(x.path))errors.push("Unsafe path: "+x.path);
  if(seen.has(x?.path))errors.push("Duplicate path: "+x.path); seen.add(x?.path);
  if(x?.sha256&&!/^[a-f0-9]{64}$/i.test(x.sha256))errors.push("Invalid SHA-256: "+x.path);
 }
 if(!m?.version)errors.push("Version missing");
 if(m?.phase==null)warnings.push("Phase not specified");
 return {ok:errors.length===0,errors,warnings};
}
async function sha256(input){
 if(!crypto?.subtle)return null;
 const data=typeof input==="string"?new TextEncoder().encode(input):input;
 const digest=await crypto.subtle.digest("SHA-256",data);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function auditRuntime(){
 const checks=[
  ["document",!!document],["localStorage",!!window.localStorage],
  ["crypto.subtle",!!window.crypto?.subtle],["online-state",typeof navigator.onLine==="boolean"],
  ["service-worker-api","serviceWorker"in navigator],["indexedDB-api","indexedDB"in window],
  ["upgrade-guard-global",!!window.UpgradeGuardAI]
 ];
 const result={ok:checks.every(x=>x[1]),at:new Date().toISOString(),checks:checks.map(([name,ok])=>({name,ok}))};
 state.lastAudit=result.at;state.lastValidation=result;log("RUNTIME_AUDIT",result);return result;
}
function checkpoint(reason="pre-upgrade"){
 requireApproval("createCheckpoint");
 const x={id:id(),reason,at:new Date().toISOString(),state:clone(state),historyLength:history.length};
 checkpoints.unshift(x);checkpoints=checkpoints.slice(0,50);log("CHECKPOINT_CREATED",{checkpointId:x.id,reason});save();return x;
}
function queueUpgrade(meta){
 const x={id:id(),status:"PENDING",createdAt:new Date().toISOString(),...clone(meta)};
 state.queue.unshift(x);log("UPGRADE_QUEUED",{upgradeId:x.id,version:x.version||null});save();return x;
}
function decide(idValue,decision){
 const x=state.queue.find(v=>v.id===idValue);if(!x)throw new Error("Upgrade not found");
 if(!["APPROVE","REJECT","HOLD"].includes(decision))throw new Error("Invalid decision");
 x.status=decision;x.decidedAt=new Date().toISOString();log("UPGRADE_DECISION",{upgradeId:idValue,decision});save();return x;
}
function freeze(phase,version,validation){
 if(!validation?.ok)throw new Error("Cannot freeze: validation failed");
 state.frozenPhase={phase,version,at:new Date().toISOString(),validation:clone(validation)};
 state.version=version;log("PHASE_FROZEN",state.frozenPhase);save();return clone(state.frozenPhase);
}
function rollback(idValue){
 const x=checkpoints.find(v=>v.id===idValue);if(!x)throw new Error("Checkpoint not found");
 state=clone(x.state);log("ROLLBACK_COMPLETED",{checkpointId:idValue});save();return clone(state);
}
function setPermission(key,value){
 if(!(key in state.permissions))throw new Error("Unknown permission");
 if(!["ALLOW","ASK_FIRST","DENY"].includes(value))throw new Error("Invalid permission");
 state.permissions[key]=value;log("PERMISSION_CHANGED",{key,value});save();
}
function registerPhase(meta){state.phase=meta.phase;state.version=meta.version;log("PHASE_REGISTERED",meta);save();return clone(state)}
function exportState(){
 const payload={product:"ScienceHub",component:"Upgrade Guard AI",exportedAt:new Date().toISOString(),state,history,checkpoints};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="ScienceHub-UpgradeGuard-P2-backup.json";a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);log("GUARD_BACKUP_EXPORTED");
}
window.UpgradeGuardAI={
 get state(){return clone(state)},get history(){return clone(history)},get checkpoints(){return clone(checkpoints)},
 sha256,safePath,compareManifest,validateManifest,auditRuntime,createCheckpoint:checkpoint,
 queueUpgrade,decide,freeze,rollback,setPermission,registerPhase,exportState,persist:save,log
};
window.dispatchEvent(new CustomEvent("sciencehub:upgrade-guard-ready"));
})();
