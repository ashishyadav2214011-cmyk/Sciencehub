(()=>{"use strict";
const boot=()=>{
 const G=window.UpgradeGuardAI;if(!G)return;
 document.documentElement.dataset.upgradeGuard="ready";
 G.registerPhase({phase:2,version:"UGAI-P2.0.0",status:"ACTIVE"});
 G.auditRuntime().catch(e=>G.log("BOOT_ERROR",{message:String(e)}));
 window.ScienceHubUpgrade={
  status:()=>G.state,audit:()=>G.auditRuntime(),checkpoint:(r)=>G.createCheckpoint(r||"manual"),
  freeze:(p,v,r)=>G.freeze(p,v,r),rollback:(id)=>G.rollback(id),
  queue:(m)=>G.queueUpgrade(m),decide:(id,d)=>G.decide(id,d),
  exportBackup:()=>G.exportState()
 };
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
