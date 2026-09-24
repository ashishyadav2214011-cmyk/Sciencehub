/* ScienceHub Phase 3 — Upgrade Guard AI
   User-controlled guard. AI actions are blocked unless permission is explicit.
   Failed upgrades are recorded locally for the FAILED UPGRADATION profile section.
*/
(function(global){
  const KEY='sciencehub_upgrade_guard_v3';
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{"permission":false,"failed":[],"history":[]}')}catch(e){return {permission:false,failed:[],history:[]}}};
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
  const api={
    getState(){return load()},
    setPermission(allowed){const s=load();s.permission=!!allowed;s.history.push({type:'permission',allowed:!!allowed,at:new Date().toISOString()});save(s);return s.permission},
    canAct(){return load().permission===true},
    recordFailedUpgrade(name,reason){const s=load();s.failed.push({name:String(name),reason:String(reason||'Unknown reason'),at:new Date().toISOString()});save(s);return s.failed[s.failed.length-1]},
    clearFailed(){const s=load();s.failed=[];save(s)},
    runUpgrade(name,fn){if(!api.canAct())return {ok:false,blocked:true,reason:'User permission required'};try{const result=fn();const s=load();s.history.push({type:'upgrade',name:String(name),ok:true,at:new Date().toISOString()});save(s);return {ok:true,result}}catch(e){const rec=api.recordFailedUpgrade(name,e.message);return {ok:false,blocked:false,failed:true,record:rec}}}
  }; global.ScienceHubUpgradeGuard=api;
})(window);
