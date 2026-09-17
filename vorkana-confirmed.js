/* Validations publiées : mêmes identifiants que les propositions du joueur. */
(()=>{'use strict';
const node=document.getElementById('vorkana-confirmed-decisions');if(!node)return;
const entries=JSON.parse(node.textContent);let changed=false;const conflicts=[];
for(const d of entries){if(d.playerId!==P.playerId||d.decision!=='approved'||d.proposal?.kind!=='progression')continue;
const p=d.proposal,ledger=L.progressionLedger;
if(ledger?.appliedProposalIds?.includes(d.id))continue;
const existing=(L.proposals||[]).find(x=>x.id===d.id);
const fields=['domain','targetName','fromRank','toRank','legendCost'];
if(existing&&(existing.status==='rejected'||fields.some(k=>JSON.stringify(existing[k]??null)!==JSON.stringify(p[k]??null)))){conflicts.push(d.id);continue;}
L.proposals ||= [];if(!existing)L.proposals.push({...p,id:d.id,status:'sent'});else existing.status='sent';
// Un achat publié consolide sa dépense ; le stock vivant reste celui de la séance.
const karma=L.draft.karma;applyProposalDecisions([d]);if(p.domain==='karma')L.draft.karma=karma;changed=true;
}
if(changed){save();renderProposalSurfaces();}
if(conflicts.length){const notice=document.createElement('p');notice.className='notice';notice.textContent='Une validation publiée diffère des données locales. Contactez le MJ avant toute nouvelle dépense. Références : '+conflicts.join(', ');document.body.prepend(notice);}
})();
