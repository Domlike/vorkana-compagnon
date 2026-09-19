/* Les marqueurs portent sur chaque ressource ; une mise à jour sans changement
   de ressource ne soigne ni ne recharge un personnage. */
window.VorkanaRuntime={
 reconcile(holder,values,playerId,legacy){
  const spec=window.VorkanaRuntimePublications[playerId];if(!spec)return;
  holder.runtimePublicationRevisions ||= {};
  for(const [field,published]of Object.entries(spec)){
   const before=holder.runtimePublicationRevisions[field];if(before===published.revision)continue;
   const recovered=field==='karma'&&['pj_5','pj_6'].includes(playerId);
   if(before || (recovered&&!legacy) || !Number.isFinite(Number(values[field]))){
    holder.runtimePublicationHistory ||= [];holder.runtimePublicationHistory.push({field,previous:values[field],revision:published.revision});values[field]=published.value;
   }
   holder.runtimePublicationRevisions[field]=published.revision;
  }
 },
 player(P,L,save,render){
  const legacy=L.karmaPublication===(P.playerId==='pj_5'?'Jaskar-karma-20260919':'GulRak-karma-20260919');
  this.reconcile(L,L.draft,P.playerId,legacy);save();render();
  return runtime=>{
   if(!runtime||typeof runtime!=='object')return;
   for(const [field,published]of Object.entries(window.VorkanaRuntimePublications[P.playerId]||{})){
    if(runtime.publicationRevisions?.[field]===published.revision&&Number.isFinite(Number(runtime[field])))L.draft[field]=Number(runtime[field]);
   }
  };
 }
};
