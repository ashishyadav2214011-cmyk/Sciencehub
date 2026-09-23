(()=>{"use strict";
const G=()=>window.UpgradeGuardAI,R=()=>window.ScienceHubRegressionGuard;
function impact(before,after){if(!before||!after)return {available:false};const B=new Map((before.inventory?.items||[]).map(x=>[x.url,x.sha256])),A=new Map((after.inventory?.items||[]).map(x=>[x.url,x.sha256]));return {available:true,added:[...A.keys()].filter(x=>!B.has(x)),removed:[...B.keys()].filter(x=>!A.has(x)),changed:[...A.keys()].filter(x=>B.has(x)&&A.get(x)!==B.get(x))}}
async function validatePhase3(){const r=await R().run();const s=R().status();const base=s.baseline;const result={ok:r.ok,regression:r,impact:impact(base,r),at:new Date().toISOString()};G()?.log("PHASE3_VALIDATION",{ok:result.ok,failed:r.failed,impact:result.impact});return result}
async function freezeIfSafe(phase,version){const v=await validatePhase3();if(!v.ok)throw Error("Phase 3 freeze blocked: regression validation failed");return G().freeze(phase,version,{ok:true,source:"Phase3RegressionGuard",details:v})}
window.UpgradeGuardPhase3={validate:validatePhase3,createBaseline:()=>R().baseline(),freezeIfSafe,impact};
})();