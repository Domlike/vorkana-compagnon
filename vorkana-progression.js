/* Vorkana — progression confirmée 0.49.
   Migration approuvée le 14/09/2026 : la fiche actuelle est le socle ;
   les validations antérieures sont historiques, jamais rejouées. */
function installVorkanaProgression(){
  'use strict';
  const copy=x=>JSON.parse(JSON.stringify(x)),base=copy(P),attrBaseline=copy(PR6.attrAdv||{});
  const domains=['attribute','talent','specialization','skill','thread','karma','magic'];
  const budgetBase=Object.fromEntries(domains.map(d=>[d,Number((document.getElementById('pend-'+d)?.previousElementSibling?.textContent||'0').replace(/[^0-9-]/g,''))||0]));
  const id=P.characterId;
  // step, defense, movement, carry, lift, death, unconscious, wound, recoveries, mystical armor
  const table={
    1:[2,2,6,3,5,19,10,3,.5,0],2:[2,3,7,5,10,20,11,4,.5,0],3:[2,3,8,8,15,22,13,4,1,0],
    4:[3,4,9,10,20,23,14,5,1,0],5:[3,4,10,13,25,24,15,5,1,0],6:[3,4,12,15,30,26,17,6,1,0],
    7:[4,5,14,20,40,27,18,6,1,0],8:[4,5,16,25,50,28,19,7,2,0],9:[4,6,18,30,60,30,21,7,2,0],
    10:[5,6,20,35,70,31,22,8,2,0],11:[5,7,22,40,80,32,24,8,2,1],12:[5,7,24,48,95,34,26,9,2,1],
    13:[6,7,26,55,110,35,27,9,2,1],14:[6,8,28,63,125,36,28,10,3,2],15:[6,8,30,70,140,38,30,10,3,2],
    16:[7,9,32,80,160,39,31,11,3,2],17:[7,9,34,90,180,40,32,11,3,3],18:[7,10,36,100,200,42,34,12,3,3],
    19:[8,10,38,115,230,43,35,12,3,3],20:[8,10,40,130,260,44,36,13,4,4],21:[8,11,43,145,290,46,39,13,4,4],
    22:[9,11,46,165,330,47,40,13,4,4],23:[9,12,49,185,370,48,41,14,4,5],24:[9,12,52,205,410,50,43,14,4,5]
  };
  const attrForName={};
  for(const [attr,names]of Object.entries({
    Dextérité:['Arme de tir','Armes de tir','Arme de jet','Armes de jet','Armes de mêlée','Combat à mains nues','Esquive','Sprint','Tir infaillible','Parade','Danse des airs','Coup de pied rapide','Crochetage','Déplacement silencieux','Escalade','Vol à la tire','Deuxième attaque','Deuxième tir','Désarmement'],
    Force:['Coup de bouclier','Stabilité','Charge dévastatrice'],
    Constitution:['Peau de bois'],
    Volonté:['Volonté de fer','Contre-malédiction','Regard terrifiant','Sang-froid'],
    Charisme:['Marchandage','Première impression','Chant émouvant','Déguisement magique','Sens empathique','Éloquence','Inscriptions runiques','Cuisine'],
    Perception:['Flèche de direction','Marque mystique','Anticipation','Évaluation','Perfectionnement de lame','Histoire des armes','Histoire des objets','Don des langues','Lecture et écriture','Lecture et écriture de la magie','Incantation','Vision astrale','Langue des esprits','Imitation de voix','Sens des serrures','Détection des pièges','Alchimie','Botanique','Médecine','Analyse des indices','Recherche','Survie','Connaissance de la rue']
  }))for(const n of names)attrForName[n]=attr;
  attrForName['Déguisement magique']='Perception';
  function attributeOf(t){if(t.step==null||t.rollable===false)return null;if(attrForName[t.name])return attrForName[t.name];if(/^Tissage de filament|^Connaissance|^Sciences/.test(t.name))return 'Perception';if(/^Artisanat/.test(t.name))return 'Dextérité';if(/^Art\s*:/.test(t.name))return 'Charisme';throw Error('Attribut non cartographié : '+t.name);}
  for(const t of [...base.talentsKnown,...base.skills])attributeOf(t);
  const endurance={zraul:[6,5],kalha:[6,5],barbak:[9,7],ogunta:[4,3],jaskar:[6,5],gulrak:[5,4]}[id];
  const actionNames={
    zraul:{bow:'Arme de tir',second_shot:'Deuxième tir',sure_shot:'Tir infaillible',throw:'Arme de jet',sword:'@Dextérité',tail:'@Dextérité',disarm:'Désarmement'},
    kalha:{mace:'Armes de mêlée',shield:'Armes de mêlée'},
    barbak:{axe:'Armes de mêlée',unarmed:'Combat à mains nues',kick:'Coup de pied rapide',second:'Deuxième attaque',wood:'Peau de bois'},
    ogunta:{mace:'Armes de mêlée',fright:'Regard terrifiant',astral:'Vision astrale',hold_pain:'@Volonté'},
    jaskar:{sword:'Armes de mêlée',empathy:'Sens empathique',voice:'Imitation de voix'},
    gulrak:{short:'Armes de mêlée',dagger:'Armes de mêlée',second:'Deuxième attaque',silent:'Déplacement silencieux',detectTrap:'Détection des pièges'}
  }[id];
  const publishedLedger=VorkanaPublished.build(base,attrBaseline);
  function ensure(){return VorkanaPublished.attach(L,publishedLedger);}
  function rank(name,kind='talent'){const items=kind==='talent'?base.talentsKnown:base.skills;return Number(ensure()[kind==='talent'?'talentRanks':'skillRanks'][name]??items.find(t=>t.name===name)?.rank??0);}
  function recalculate(){
    const ledger=ensure();P.attributes=copy(base.attributes);
    for(const [n,a]of Object.entries(P.attributes)){a.value+=Number(ledger.attributeAdv[n]||0)-Number(attrBaseline[n]||0);if(!table[a.value])throw Error('Attribut hors table : '+n+' '+a.value);a.step=table[a.value][0];a.dice=edStepDiceLabel(a.step);PR6.attrAdv[n]=Number(ledger.attributeAdv[n]||0);}
    const delta=(n,k)=>table[P.attributes[n].value][k]-table[base.attributes[n].value][k];
    const stepDelta=n=>P.attributes[n].step-base.attributes[n].step;
    const project=(items,kind)=>items.map(t=>{const x={...t,rank:rank(t.name,kind)},attr=attributeOf(t);if(attr){x.step=t.step+(x.rank-t.rank)+stepDelta(attr);x.dice=edStepDiceLabel(x.step);}return x;});
    P.talentsKnown=project(base.talentsKnown,'talent');P.skills=project(base.skills,'skill');
    const item=(name,original=false)=>[...(original?base:P).talentsKnown,...(original?base:P).skills].find(t=>t.name===name);
    const sourceDelta=name=>name[0]==='@'?stepDelta(name.slice(1)):item(name).step-item(name,true).step;
    const oldReactions=P.combat.reactions;
    P.combat=copy(base.combat);const c=P.combat;
    c.initiative.step+=stepDelta('Dextérité');c.initiative.dice=edStepDiceLabel(c.initiative.step);
    for(const o of c.initiative.options||[]){o.step+=stepDelta('Dextérité')+(/Danse/.test(o.label)?rank('Danse des airs')-Number(item('Danse des airs',true)?.rank||0):0);o.dice=edStepDiceLabel(o.step);}
    if(c.initiative.note)c.initiative.note='Initiative confirmée, modificateur d’armure conservé.';
    for(const [k,n]of Object.entries({physical:'Dextérité',magical:'Perception',social:'Charisme'}))c.defenses[k]+=delta(n,1);
    if(c.defenses.physicalWithAnticipation!=null)c.defenses.physicalWithAnticipation=base.combat.defenses.physicalWithAnticipation+delta('Dextérité',1)+rank('Anticipation')-item('Anticipation',true).rank;
    c.movement.combat+=delta('Dextérité',2);c.movement.run+=delta('Dextérité',2)*2;
    const er=rank('Endurance')-item('Endurance',true).rank;
    c.health.death+=delta('Constitution',5)+endurance[0]*er;c.health.unconscious+=delta('Constitution',6)+endurance[1]*er;c.health.woundThreshold+=delta('Constitution',7);
    c.recovery.maxPerDay+=delta('Constitution',8);if(c.recovery.max!=null)c.recovery.max=c.recovery.maxPerDay;c.recovery.step+=stepDelta('Constitution');c.recovery.dice=edStepDiceLabel(c.recovery.step);
    c.balance.step+=stepDelta('Force')+(item('Stabilité')?rank('Stabilité')-item('Stabilité',true).rank:0);c.balance.dice=edStepDiceLabel(c.balance.step);
    c.armor.mystical+=delta('Volonté',9);
    P.carryCapacity=Number(base.carryCapacity??table[base.attributes.Force.value][3])+delta('Force',3);P.liftCapacity=Number(base.liftCapacity??table[base.attributes.Force.value][4])+delta('Force',4);
    if(P.referenceConfig){P.referenceConfig.capacity=P.carryCapacity;P.referenceConfig.lift=P.liftCapacity;P.referenceConfig.critical=rank('Attaque critique','skill');}
    for(const a of c.actions){const name=actionNames[a.id]||(a.stage==='weave'?base.talentsKnown.find(t=>t.name.startsWith('Tissage de filament')).name:a.stage==='cast'?'Incantation':null);if(!name)throw Error('Action non cartographiée : '+a.id);if(a.attackStep!=null){a.attackStep+=sourceDelta(name);a.attackDice=edStepDiceLabel(a.attackStep);}if(a.damageStep!=null){a.damageStep+=stepDelta('Force');if(id==='kalha'&&a.id==='shield')a.damageStep+=rank('Coup de bouclier')-item('Coup de bouclier',true).rank;a.damageDice=edStepDiceLabel(a.damageStep);}}
    for(const r of c.reactions){const name=r.name||r.label,t=item(name);if(t){r.step+=t.step-item(name,true).step;r.dice=edStepDiceLabel(r.step);r.rank=t.rank;if(!r.actionCost&&r.usesPerRound!=null)r.usesPerRound+=t.rank-item(name,true).rank;}if(oldReactions.find(x=>x.id===r.id)?.usesPerRound===null)r.usesPerRound=null;}
    P.halfMagic={...base.halfMagic,step:base.halfMagic.step+stepDelta('Perception')};P.halfMagic.dice=edStepDiceLabel(P.halfMagic.step);
    for(const m of P.matrices||[])if(m.talentName)m.rank=rank(m.talentName);
    if(id==='ogunta')for(const s of P.referenceConfig.spells){const original=base.referenceConfig.spells.find(x=>x.id===s.id);if(original.effectStep!=null)s.effectStep=original.effectStep+stepDelta('Volonté');if(s.id!=='lance'&&/^7 (rounds|minutes)$/.test(original.duration))s.duration=String(rank('Incantation')+3)+' '+original.duration.split(' ')[1];if(s.id==='mist')s.text=original.text.replace('jusqu’à 4 attaques','jusqu’à '+rank('Incantation')+' attaques');if(s.id==='circle')s.effectLabel=original.effectLabel.replace('niveau 11','niveau '+(P.attributes.Volonté.step+5));}
    P.specializations=[...new Map([...(base.specializations||[]),...(ledger.specializations||[])].map(x=>[x.name||x,x])).values()];
    for(const a of NC_ACTIONS){const trait=NC_TRAIT_ACTIONS.find(t=>t.id===a.id);const source=trait?P.attributes[trait.key]:P.attributes[a.source]||(a.id==='intimidate'?P.attributes.Charisme:null)||(/halfm|halfMagic/i.test(a.id)?P.halfMagic:null)||item(a.label);if(source&&source.step!=null){a.step=source.step;a.dice=source.dice;if(source.value!=null)a.value=source.value;if(source.rank!=null&&a.hint)a.hint=a.hint.replace(/rang \d+/g,'rang '+source.rank);}for(const v of a.variants||[]){const n=Object.keys(P.attributes).find(n=>v.label.includes(n));if(n)Object.assign(v,P.attributes[n]);}}
    P.legend.spent=Number(ledger.publishedSpent);P.legend.available=Math.max(0,P.legend.total-P.legend.spent);
  }
  function commit(){ensure();recalculate();}
  function renderSummary(){
    const ledger=ensure();for(const d of domains){const el=document.getElementById('pend-'+d)?.previousElementSibling;if(el)el.textContent=fmt(ledger.confirmed[d]||0);}const total=document.getElementById('pend-total')?.previousElementSibling;if(total)total.textContent=fmt(P.legend.spent);
    document.querySelectorAll('#page-progression span').forEach(el=>{if(/^Dépensé\s*:/.test(el.textContent)&&el.querySelector('b'))el.querySelector('b').textContent=fmt(P.legend.spent);});
    const social=document.querySelector('.nc-heading .nc-languages');if(social&&/Défense sociale/i.test(social.textContent))social.querySelector('span').textContent=P.combat.defenses.social;
    const load=document.getElementById('gearEncDex')?.parentElement?.parentElement;if(load)load.querySelectorAll('div').forEach(el=>{const title=el.querySelector('small')?.textContent,b=el.querySelector('b');if(b&&title==='Transport')b.textContent=P.carryCapacity+' kg';if(b&&title==='Soulever')b.textContent=P.liftCapacity+' kg';});
    const badge=document.getElementById('healthRecoveryDiceBadge');if(badge)badge.textContent=P.combat.recovery.dice;
  }
  const oldRender=renderProposalSurfaces,oldProgress=renderProgression6;
  renderProgression6=function(){commit();oldProgress();renderSummary();};
  renderProposalSurfaces=function(){oldRender();renderTalents();ncRenderActionList();ncRenderLauncher();ncRenderTraitTests();renderSummary();};
  applyProposalDecisions=function(decisions){if(!Array.isArray(decisions))return;ensure();for(const d of decisions){const p=(L.proposals||[]).find(p=>p.id===d.id);if(!p||p.status!=='sent'||!['approved','rejected'].includes(d.decision))continue;p.status=d.decision;p.integrationStatus=d.integrationStatus||"pending_publication";p.decisionAt=d.decidedAt||new Date().toISOString();p.decisionNote=d.note||'';}commit();};
  if(id==='gulrak'){crDamageProfile=function(a=crSelectedAction(),entry=crActiveEntry()){const w=crWeaponFor(a);if(!w?.damageDice)return {step:null,dice:null,label:'—',reinforced:false};const surprise=!!entry?.surprise,bonus=surprise?rank('Attaque surprise'):0,step=w.damageStep+bonus,dice=edStepDiceLabel(step);return {step,dice,label:'Niveau '+step+' / '+dice+(surprise?' • Attaque surprise +'+bonus:''),reinforced:false,surprise};};}
  window.VorkanaProgression={commit,recalculate,rank,baseline:()=>copy(base),summary:renderSummary};
  commit();save();renderProposalSurfaces();
}
