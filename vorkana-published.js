/* Seuls les fichiers publiés par le MJ définissent les valeurs permanentes. */
window.VorkanaPublished=(()=>{
 const domains=['attribute','talent','specialization','skill','thread','karma','magic'];
 const clone=x=>JSON.parse(JSON.stringify(x));
 const number=el=>Number((el?.textContent||'0').replace(/[^0-9-]/g,''))||0;
 function build(base,attributeAdv={}){
  const confirmed=Object.fromEntries(domains.map(d=>[d,number(document.getElementById('pend-'+d)?.previousElementSibling)]));
  const baselineSpent=number(document.getElementById('pend-total')?.previousElementSibling);
  if(Object.values(confirmed).reduce((n,v)=>n+v,0)!==baselineSpent)throw Error('Dépenses par domaine incohérentes : correction MJ requise avant publication.');
  const ledger={schema:'vorkana-published-1',baselineSpent,confirmed,appliedProposalIds:[],historicalProposalIds:[],talentRanks:Object.fromEntries(base.talentsKnown.map(t=>[t.name,t.rank])),skillRanks:Object.fromEntries(base.skills.map(t=>[t.name,t.rank])),attributeAdv:clone(attributeAdv),specializations:[],threads:[]};
  const updates=JSON.parse(document.getElementById('vorkana-published-updates')?.textContent||'[]');
  for(const d of updates){const p=d.proposal;if(d.playerId!==base.playerId||d.decision!=='approved'||p?.kind!=='progression'||ledger.appliedProposalIds.includes(d.id))continue;
   if(!domains.includes(p.domain)||!Number.isInteger(p.legendCost)||p.legendCost<0)throw Error('Publication invalide : '+d.id);
   ledger.confirmed[p.domain]+=p.legendCost;
   if(p.domain==='talent'||p.domain==='skill')ledger[p.domain==='talent'?'talentRanks':'skillRanks'][p.targetName]=p.toRank;
   if(p.domain==='attribute')ledger.attributeAdv[p.targetName]=p.toRank;
   if(p.domain==='specialization'&&p.activation!=='deferred')ledger.specializations.push(p.targetName);
   if(p.domain==='thread')ledger.threads.push(p.targetName);
   ledger.appliedProposalIds.push(d.id);
  }
  ledger.publishedSpent=baselineSpent+updates.filter(d=>ledger.appliedProposalIds.includes(d.id)).reduce((n,d,i,a)=>n+(a.findIndex(x=>x.id===d.id)===i?d.proposal.legendCost:0),0);
  return ledger;
 }
 function attach(local,ledger){
  if(local.progressionLedger&&local.progressionLedger.schema!=='vorkana-published-1'){
   local.progressionArchives ||= [];
   const old=JSON.stringify(local.progressionLedger);
   if(!local.progressionArchives.some(x=>JSON.stringify(x.ledger)===old))local.progressionArchives.push({at:new Date().toISOString(),ledger:clone(local.progressionLedger)});
  }
  // Les imports locaux ne peuvent pas rétablir une ancienne vérité mécanique.
  local.progressionLedger=clone(ledger);return local.progressionLedger;
 }
 return {build,attach};
})();
