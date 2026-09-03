/* Vorkana — options de combat. Règles de table prioritaires ; Recueil pp. 403–408.
   Aucun accès réseau ni changement des données de personnage à l'installation. */
(function () {
  'use strict';
  const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const positive = v => Math.max(0, number(v));
  const parts = key => String(key || 'none').split('+');
  const has = (key, part) => parts(key).includes(part);
  const labels = [
    ['none','Aucune option'],['aggressive','Attaque agressive'],['stun','Attaque étourdissante'],
    ['precise','Attaque précise'],['recover','Bond de rétablissement'],['yield','Céder du terrain'],
    ['shield','Contourner le bouclier'],['split','Déplacement en deux temps'],
    ['breakshield','Détruire un bouclier'],['defensive','Garde défensive'],['brace','Réceptionner une charge'],
    ['knockdown','Renverser'],['aim','Viser'],['tailoff','Queue — offensive'],['taildef','Queue — défensive'],
    ['defensive+stun','Garde défensive + étourdir'],['defensive+knockdown','Garde défensive + renverser'],
    ['brace+defensive','Réception de charge + garde défensive'],['brace+stun','Réception de charge + étourdir'],
    ['brace+defensive+stun','Réception de charge + garde défensive + étourdir']
  ];
  const tips = {
    none:'Aucune option. Les états et blessures restent pris en compte.',
    aggressive:'+3 aux niveaux d’attaque et de dommages au contact ; −3 DP/DM. Effort 1 par attaque (minimum 1 pour le round).',
    stun:'Dommages non létaux suivis séparément. Pas de BG ni de saignement : atteindre le seuil de BG étourdit pendant 1 à 4 rounds selon le degré.',
    precise:'−3 au niveau d’attaque. Effort 1 par attaque. La précision ne supprime pas automatiquement l’armure ; le MJ arbitre la zone visée.',
    recover:'Dextérité contre 6, pénalité d’initiative de l’armure déduite du niveau (sans le −3 À terre). Effort 2. Réussite : relevage simple, aucun autre déplacement.',
    yield:'−2 aux attaques ; +1 DP par mètre réellement cédé, dans la limite du rang d’Armes de mêlée ou Combat à mains nues. Effort 1/round. Distance et terrain à confirmer par le MJ.',
    shield:'Le MJ réduit l’initiative du bonus d’armure du bouclier. Si elle reste supérieure à celle de la cible : bouclier ignoré contre cette cible ; sinon −2 à l’attaque.',
    split:'Déplacement avant et après l’attaque, dans le budget total habituel. −2 DP/DM et Effort 1/round ; à pied.',
    breakshield:'Arme de taille 3 minimum. Test contre le seuil de destruction du bouclier (Excellent si magique). Aucun dommage au porteur. Effort 1/round.',
    defensive:'+3 DP/DM contre les attaques perçues ; −3 aux actions. Équilibre exempté. Les exceptions aux réactions défensives restent à décider par le MJ.',
    brace:'Arme de taille 3 minimum, initiative supérieure à celle de la cible montée. La force de la monture et la charge sont à confirmer par le MJ ; désarçonnement sur un résultat Bon.',
    knockdown:'Le résultat après armure devient la difficulté du test d’Équilibre. Aucun dommage ni BG. Échec de l’Équilibre : À terre immédiatement, soit −3 aux attaques et DP/DM.',
    aim:'Aucun déplacement ni autre action. Effort 1 par round. +2 après un round, +3 après deux, sur le tir suivant contre la même cible restée visible. Ne se cumule pas avec un bonus similaire.',
    tailoff:'Attaque caudale supplémentaire : −2 aux tests d’action du round. Pour une attaque de queue seule, choisir Aucune option.',
    taildef:'+1 DP et −1 aux tests d’action. Incompatible avec la queue offensive ; jusqu’à deux parades selon la règle de table.'
  };
  const hint = key => parts(key).map(k=>tips[k]||'Option à vérifier avec le MJ.').join(' ');
  function mods(key) {
    const m={attack:0,damage:0,dp:0,dm:0,action:0};
    for(const k of parts(key)) {
      if(k==='aggressive'){m.attack+=3;m.damage+=3;m.dp-=3;m.dm-=3;}
      if(k==='precise')m.attack-=3;
      if(k==='yield')m.attack-=2;
      if(k==='defensive'){m.dp+=3;m.dm+=3;m.action-=3;}
      if(k==='split'){m.dp-=2;m.dm-=2;}
      if(k==='tailoff')m.action-=2;
      if(k==='taildef'){m.dp++;m.action--;}
    }
    return m;
  }
  function situations(s={},prone=false,stunned=0) {
    // À terre replaces the first Harcelé penalty; Débordé keeps extra sources.
    const down=prone||s.prone, sources=positive(s.harried)+(stunned>0?1:0);
    const distracted=down?-3-Math.max(0,sources-1):sources>0?-2-Math.max(0,sources-1):0;
    const cover=s.cover==='partial'?2:s.cover==='substantial'?4:0;
    return {action:number(s.actionMod)+distracted,dp:number(s.defenseMod)+distracted+cover,
      dm:number(s.defenseMod)+distracted+cover,ds:number(s.defenseMod)};
  }
  function darkness(s={}) {
    if(!s.darknessBypassesVision&&(s.visionSense==='thermographic'||s.visionSense==='night'&&s.darkness!=='total'))return 0;
    if(s.visionSense==='other')return 0; // A specific sense remains an explicit MJ adjustment.
    return ({partial:-1,consequent:-3,total:-5})[s.darkness]||0;
  }
  const known = key => labels.some(x=>x[0]===key);
  window.VorkanaCombatOptions={version:'0.37.0',labels,hint,mods,situations,darkness,parts,has};

  if(typeof combatState==='function') installGM();
  else if(typeof combatFlow==='function') {
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installPlayer,{once:true});
    else installPlayer();
  }

  function installGM() {
    COMBAT_OPTIONS.splice(0,COMBAT_OPTIONS.length,...labels);
    for(const [key] of labels)OPTION_EFFECTS_FR[key]=hint(key);
    OPTION_RULES.precise.scope='attack';
    const oldRule=optionRule,oldEntity=getCombatEntity,oldSave=saveState,oldSnapshot=playerSafeSnapshot;
    const runtime = id => {const p=actorById(id);return p?.kind==='pj'?state.playerRuntime[p.name]:enemyById(id);};
    const context = () => {const c=tunnelContext();if(c.t)c.t.optionContext ||= {};return c;};
    const keyOf = ctx => ctx.p?.option||ctx.actor?.option||'none';
    function syncPhysical() {
      for(const p of combatState().participants||[]) {
        const rt=runtime(p.id);if(!rt)continue;
        if(p.kind==='npc'&&p.optionData)rt.optionData=p.optionData;
        if(p.kind==='pj'){rt.stunned=positive(p.stunned);rt.stunnedSince=p.stunnedSince;}
        const q=p.kind==='pj'?getPlayerQuick(p.name):COMBAT_PROFILES[rt.profile];if(!q)continue;
        if(rt.stunDamage>0) {
          if(positive(rt.damage)>=q.death)p.status='dead';
          else if(!q.noUnconscious&&positive(rt.damage)+positive(rt.stunDamage)>=q.unconscious){p.status='unconscious';rt.stunUnconscious=true;}
          else if(rt.stunUnconscious){p.status=rt.wounds?'wounded':'ok';rt.stunUnconscious=false;}
          if(p.kind==='npc')rt.status=p.status;
        } else if(rt.stunUnconscious) {
          if(p.status==='unconscious'&&positive(rt.damage)<q.unconscious)p.status=rt.wounds?'wounded':'ok';
          if(p.kind==='npc')rt.status=p.status;rt.stunUnconscious=false;
        }
        const down=p.kind==='npc'?!!rt.prone:!!p.prone;
        p.prone=down;p.situations={...normalizeInitialSituation(p.situations),prone:down};
        if(p.kind==='npc')rt.situations={...normalizeInitialSituation(rt.situations),prone:down};
      }
    }
    saveState=function(){syncPhysical();return oldSave();};
    optionRule=function(key){const keys=parts(key);if(keys.length===1)return oldRule(key);return {...oldRule(keys[0]),modes:['melee'],effort:keys.reduce((n,k)=>n+oldRule(k).effort,0)};};
    optionMods=mods;
    optionEligibleForActor=function(key,actor){
      if(!known(key))return false;
      if((actor?.prone||actor?.situations?.prone)&&key!=='none'&&key!=='recover')return false;
      return parts(key).every(k=>{const r=oldRule(k);return (!r.actor||actor?.name===r.actor)&&(!r.condition||actor?.prone||actor?.situations?.prone||actor?.optionData?.recoveredRound===combatState().round);});
    };
    optionEligibleForAttack=function(key,actor,attack){return optionEligibleForActor(key,actor)&&parts(key).every(k=>oldRule(k).modes.includes(attack?.mode||'other'));};
    optionWhyInvalid=function(key,actor,attack){
      if((actor?.prone||actor?.situations?.prone)&&!['none','recover'].includes(key))return 'À terre : aucune option, sauf le Bond de rétablissement. Relevez-vous avant de changer d’option.';
      return optionEligibleForAttack(key,actor,attack)?'':parts(key).map(k=>oldRule(k).reason||'Condition de l’option non remplie.').join(' ');
    };
    getCombatEntity=function(id){
      const e=oldEntity(id),rt=runtime(id),p=actorById(id);if(!e)return e;
      e.stunDamage=positive(rt?.stunDamage);e.lethalDamage=positive(e.damage);e.damage=e.lethalDamage+e.stunDamage;
      e.stunned=positive(p?.stunned??rt?.stunned);e.stunnedSince=p?.stunnedSince??rt?.stunnedSince;
      e.optionData=p?.optionData||rt?.optionData||{};
      if(p&&!p.optionData&&rt?.optionData)p.optionData=rt.optionData;
      if(e.kind==='npc'&&rt?.optionShield){e.shieldP=positive(rt.optionShield.physical);e.shieldM=positive(rt.optionShield.mystical);}
      if(rt?.shieldDestroyed){e.armorP=Math.max(0,e.armorP-positive(rt.destroyedShieldP));e.armorM=Math.max(0,e.armorM-positive(rt.destroyedShieldM));e.shieldP=0;e.shieldM=0;}
      return e;
    };
    situationMods=function(entity){return situations(entity?.situations,entity?.prone,entity?.stunned);};
    const oldTags=situationTags;
    situationTags=function(entity){const out=oldTags(entity);if(entity?.stunned)out.push(`Étourdi : ${entity.stunned} round(s)`);if(entity?.stunDamage)out.push(`${entity.stunDamage} dommages d’étourdissement`);return out;};
    const oldDefense=modifiedDefense;
    modifiedDefense=function(entity,key){const active=optionEligibleForActor(entity?.option||'none',entity)?entity:{...entity,option:'none'};return oldDefense(active,key)+(key==='dp'&&has(active?.option,'yield')?positive(active.optionData?.yieldMeters):0);};
    playerSafeSnapshot=function(id){const d=oldSnapshot(id),e=getCombatEntity(id),rt=state.playerRuntime?.[playerNameFromId(id)]||{};d.runtime.stunDamage=positive(rt.stunDamage);d.runtime.shieldDestroyed=!!rt.shieldDestroyed;d.runtime.shieldArmorLost={physical:rt.shieldDestroyed?positive(rt.destroyedShieldP):0,mystical:rt.shieldDestroyed?positive(rt.destroyedShieldM):0};if(e){Object.assign(d.combat.conditions,{prone:!!e.prone,stunned:e.stunned,stunnedSince:e.stunnedSince,bleeding:positive(actorById(id)?.bleeding)});d.combat.option=actorById(id)?.option||'none';d.combat.optionData=actorById(id)?.optionData||{};}else{d.combat.conditions.stunned=positive(rt.stunned);d.combat.conditions.stunnedSince=rt.stunnedSince;}return d;};
    const oldSetOption=setParticipantOption;
    setParticipantOption=function(id,key){const p=actorById(id);if(!optionEligibleForActor(key,getCombatEntity(id))){showToast(optionWhyInvalid(key,getCombatEntity(id),null));return;}if(p?.initiative!=null&&key!=='none'&&key!==p.option){showToast('Après l’initiative, vous pouvez annuler l’option, pas la remplacer.');return;}return oldSetOption(id,key);};
    const oldPlan=receivePlayerPlan;
    receivePlayerPlan=function(d,source){const p=actorById(d.playerId),key=d.plan?.option||'none';if(p&&(!optionEligibleForActor(key,getCombatEntity(d.playerId))||(p.initiative!=null&&key!=='none'&&key!==p.option))){playerClientPost(d.playerId,{type:'earthdawn-player-plan-ack',accepted:false,round:d.round,note:'Option incompatible avec l’état actuel, ou déjà verrouillée par l’initiative.'});return;}return oldPlan(d,source);};
    function initiativeFor(id,raw) {
      const p=actorById(id);if(!p||raw===''||raw==null)return raw;
      if(has(p.option,'shield')) {
        const target=getCombatEntity(p.target),shield=positive(target?.shieldP);
        p.optionData ||= {};Object.assign(p.optionData,{shieldRound:combatState().round,shieldTarget:p.target,shieldRawInitiative:Number(raw)});
        return Number(raw)-shield;
      }
      return raw;
    }
    const oldInit=setPjInitiative,oldIncomingInit=receivePlayerInitiative;
    setPjInitiative=function(id,n){return oldInit(id,initiativeFor(id,n));};
    receivePlayerInitiative=function(d,source){if(combatState().active&&Number(d.round)===combatState().round)return oldIncomingInit({...d,initiative:initiativeFor(d.playerId,d.initiative)},source);return oldIncomingInit(d,source);};
    rollNpcInitiatives=function(){for(const p of combatState().participants.filter(p=>p.kind==='npc'&&p.participation!=='outside'&&['ok','wounded'].includes(p.status||'ok'))){const e=getCombatEntity(p.id),base=COMBAT_PROFILES[e.profile].initStep,step=Math.max(1,base-woundActionPenalty(e)+situationMods(e).action+mods(p.option).action);p.initiative=initiativeFor(p.id,stepRoll(step));enemyById(p.id).initiative=p.initiative;}cLog('Initiatives PNJ lancées avec les états et options.');saveState();renderCombat();};
    const oldAttackLevel=tunnelAttackLevel,oldDamageLevel=tunnelDamageLevel,oldArmor=effectiveArmorForTunnel,oldAttackEval=tunnelAttackEvaluation;
    const oldTunnelDefense=tunnelDefense,oldReactionLevel=effectiveReactionLevel;
    tunnelDefense=function(ctx){const defense=oldTunnelDefense(ctx);return ctx.t?.defenseOverride===null&&ctx.t?.optionContext?.unperceived&&has(ctx.target?.option,'defensive')&&ctx.t.defenseType!=='social'?Math.max(1,defense-3):defense;};
    effectiveReactionLevel=function(ctx,r){return Math.max(1,oldReactionLevel(ctx,r)+(ctx.t?.optionContext?.reactionExempt?0:mods(ctx.target?.option).action));};
    function shieldPass(ctx){return has(keyOf(ctx),'shield')&&ctx.p?.optionData?.shieldTarget===ctx.target?.id&&ctx.p.initiative!=null&&actorById(ctx.target.id)?.initiative!=null&&Number(ctx.p.initiative)>Number(actorById(ctx.target.id).initiative);}
    function aimBonus(ctx){const a=ctx.p?.optionData?.aim;return ctx.attack?.mode==='ranged'&&a&&a.round===combatState().round-1&&a.targetId===ctx.target?.id&&!movementRecord(ctx.actor.id).used?(a.count>=2?3:2):0;}
    tunnelAttackLevel=function(ctx){let n=oldAttackLevel(ctx)+darkness(ctx.actor?.situations);if(has(keyOf(ctx),'shield')&&!shieldPass(ctx))n-=2;return Math.max(1,n+(ctx.t?.optionContext?.aimVisible&&!ctx.t?.optionContext?.similarBonus?aimBonus(ctx):0));};
    tunnelDamageLevel=function(ctx){let n=oldDamageLevel(ctx),x=ctx.t?.optionContext||{};if(has(keyOf(ctx),'breakshield')&&tunnelAttackEvaluation(ctx)?.critical)n+=positive(x.weaponSize);if(has(keyOf(ctx),'brace')&&x.mountForce!=null&&x.weaponDamage!=null)n=positive(x.weaponDamage)+positive(x.mountForce)*(x.fullCharge?2:1)+mods(keyOf(ctx)).damage+number(ctx.t.damageModifier);return Math.max(1,n);};
    tunnelAttackEvaluation=function(ctx){if(!shieldPass(ctx))return oldAttackEval(ctx);const active=ctx.t.shieldActive;ctx.t.shieldActive=false;try{return oldAttackEval(ctx);}finally{ctx.t.shieldActive=active;}};
    effectiveArmorForTunnel=function(ctx,ev){if(has(keyOf(ctx),'breakshield'))return 0;const n=oldArmor(ctx,ev);return shieldPass(ctx)&&ctx.t.armorOverride===null&&!ev?.critical?Math.max(0,n-tunnelShieldValue(ctx.target,ctx.t.defenseType)):n;};
    const oldEffort=applyOptionEffort;
    applyOptionEffort=function(ctx){if(!ctx?.t||ctx.t.optionEffortApplied)return;for(const key of parts(keyOf(ctx)))oldEffort({...ctx,p:{...ctx.p,option:key}});ctx.t.optionEffortApplied=true;combatState().optionUsed ||= {};combatState().optionUsed[`${combatState().round}:${ctx.actor.id}`]=true;};
    const oldConsequences=tunnelDamageConsequences;
    tunnelDamageConsequences=function(ctx){
      const c=oldConsequences(ctx);if(!c)return c;
      const key=keyOf(ctx),x=ctx.t.optionContext||{};
      if(has(key,'knockdown'))return {...c,kind:'knockdown',effect:c.taken,taken:0,future:ctx.target.damage,wound:false,bleed:false,bleedSuggested:false,balanceDN:c.taken,status:ctx.target.status};
      if(has(key,'breakshield')) {const threshold=positive(x.shieldThreshold),degree=threshold?resultDegree(threshold,c.raw,false):null;return {...c,kind:'breakshield',effect:c.raw,taken:0,future:ctx.target.damage,wound:false,bleed:false,bleedSuggested:false,balanceDN:null,status:ctx.target.status,shieldBroken:!!degree&&(x.shieldMagic?['excellent','extra'].includes(degree.key):degree.success)};}
      if(has(key,'stun')) {const taken=ctx.target.noUnconscious?0:c.taken,degree=ctx.target.wound>0?resultDegree(ctx.target.wound,taken,false):null;return {...c,kind:'stun',taken,future:ctx.target.damage+taken+pendingReactionEffort(ctx),wound:false,bleed:false,bleedSuggested:false,balanceDN:null,stunRounds:({average:1,good:2,excellent:3,extra:4,normal:1})[degree?.key]||(degree?.success?1:0),status:!ctx.target.noUnconscious&&ctx.target.damage+taken>=ctx.target.unconscious?'unconscious':ctx.target.status};}
      const lethalFuture=positive(ctx.target.lethalDamage)+pendingReactionEffort(ctx)+c.taken;
      c.status=lethalFuture>=ctx.target.death?'dead':!ctx.target.noUnconscious&&lethalFuture+positive(ctx.target.stunDamage)>=ctx.target.unconscious?'unconscious':c.wound?'wounded':ctx.target.status;
      return c;
    };
    function issue(ctx) {
      if(!ctx.actor||!ctx.t)return 'Aucun acteur actif.';
      if(['dead','unconscious','fled','captured'].includes(ctx.actor.status))return 'Cet acteur ne peut pas attaquer dans son état actuel.';
      if(ctx.actor.stunned&&ctx.actor.stunnedSince===combatState().round)return 'Étourdi : seules les actions défensives sont possibles pendant ce premier round.';
      if(ctx.p?.optionData?.noAttackRound===combatState().round)return 'L’action ordinaire de ce round a été consacrée au relevage ou à la visée.';
      const key=keyOf(ctx),x=ctx.t.optionContext||{};
      if(!optionEligibleForAttack(key,ctx.actor,ctx.attack))return optionWhyInvalid(key,ctx.actor,ctx.attack);
      if(has(key,'aim'))return 'Ce round est consacré à viser : validez la visée ci-dessous, sans attaque ni déplacement.';
      if(has(key,'recover')&&ctx.p?.optionData?.recoveredRound!==combatState().round)return 'Résolvez d’abord le Bond de rétablissement ci-dessous.';
      if(has(key,'yield')&&ctx.p?.optionData?.yieldRound!==combatState().round)return 'Confirmez le rang et les mètres réellement cédés ci-dessous.';
      if(has(key,'shield')&&ctx.p?.optionData?.shieldRound!==combatState().round)return 'Confirmez d’abord le contournement : l’initiative doit être corrigée avant de résoudre le coup.';
      if(has(key,'breakshield')) {if(runtime(ctx.target?.id)?.shieldDestroyed)return 'Ce bouclier est déjà détruit.';if(positive(x.weaponSize)<3)return 'Renseignez une arme de taille 3 minimum.';if(positive(x.shieldThreshold)<2||positive(x.shieldThreshold)>40)return 'Renseignez un seuil de destruction de bouclier entre 2 et 40 (hors table : arbitrage MJ).';if(x.shieldP==null||x.shieldM==null||positive(x.shieldP)+positive(x.shieldM)===0)return 'Renseignez les protections du bouclier visé.';}
      if(has(key,'brace')) {if(positive(x.weaponSize)<3||x.mountForce==null||x.weaponDamage==null)return 'Charge : précisez la taille de l’arme, son niveau de dommages et la Force de la monture.';if(!x.mounted||ctx.p.initiative==null||actorById(ctx.target?.id)?.initiative==null||Number(ctx.p.initiative)<=Number(actorById(ctx.target.id).initiative))return 'Réception de charge : cible montée et initiative strictement supérieure requises.';}
      return '';
    }
    window.voCombatIssue=()=>issue(context());
    for(const name of ['rollTunnelAttack','manualTunnelAttack','rollTunnelDamage','manualTunnelDamage','finalizeTunnelMiss','applyTunnelReactionAvoided']) {
      const old=window[name];window[name]=function(...args){const ctx=context(),why=issue(ctx);if(why){showToast(why);return;}const out=old(...args);if(['finalizeTunnelMiss','applyTunnelReactionAvoided'].includes(name)&&combatState().tunnel!==ctx.t&&ctx.p?.optionData?.aim){delete ctx.p.optionData.aim;saveState();}return out;};
    }
    const oldBalance=rollTunnelBalance;
    rollTunnelBalance=function(){const ctx=context(),c=tunnelDamageConsequences(ctx);if(c?.kind!=='knockdown')return oldBalance();const step=Math.max(1,positive(ctx.target.balanceStep)-woundActionPenalty(ctx.target)+situationMods(ctx.target).action);const r=rollStepDetailed(step);ctx.t.balanceResult=r.total;ctx.t.balanceDetail=`Équilibre niveau ${step} — ${r.detail}`;ctx.t.prone=r.total<c.balanceDN;saveState();renderCombat();};
    const oldApply=applyTunnelResolution;
    applyTunnelResolution=function(){
      const ctx=context(),why=issue(ctx);if(why){showToast(why);return;}
      const ev=tunnelAttackEvaluation(ctx),c=tunnelDamageConsequences(ctx);if(!ev?.deg.success){showToast('Évaluez d’abord l’attaque.');return;}
      if(has(keyOf(ctx),'brace')&&ev.deg.index>=1&&!ctx.t.optionContext.braceReviewed){showToast('Résultat Bon ou mieux : le MJ doit résoudre le possible désarçonnement, puis le confirmer dans le rappel de l’option.');return;}
      if(renderReactionGate(ctx,ev).block){showToast('Résolvez d’abord la réaction de la cible.');return;}
      if(!c?.kind){const aim=ctx.p?.optionData?.aim;const out=oldApply();if(combatState().tunnel!==ctx.t&&aim){delete ctx.p.optionData.aim;saveState();}return out;}
      if(c.kind==='knockdown'&&c.balanceDN>0&&ctx.t.balanceResult==null){showToast('Saisissez ou lancez le test d’Équilibre avant de valider.');return;}
      if(!applyAttackKarma(ctx))return;
      applyOptionEffort(ctx);applyAttackEffort(ctx);applyReactionCost(ctx);
      const rt=runtime(ctx.target.id),p=actorById(ctx.target.id);
      let summary='';
      if(c.kind==='knockdown') {const down=c.balanceDN>0&&number(ctx.t.balanceResult)<c.balanceDN;if(down){p.prone=true;if(ctx.target.kind==='npc')rt.prone=true;}summary=down?'À terre immédiatement, sans dommage':'reste debout, sans dommage';}
      if(c.kind==='stun') {rt.stunDamage=positive(rt.stunDamage)+c.taken;p.stunned=Math.max(positive(p.stunned),c.stunRounds);if(c.stunRounds)p.stunnedSince=combatState().round;if(ctx.target.kind==='npc'){rt.stunned=p.stunned;rt.stunnedSince=p.stunnedSince;}summary=`${c.taken} dommages d’étourdissement, aucune BG${c.stunRounds?`, étourdi ${c.stunRounds} round(s)`:''}`;}
      if(c.kind==='breakshield') {if(c.shieldBroken){rt.shieldDestroyed=true;rt.destroyedShieldP=positive(ctx.t.optionContext.shieldP);rt.destroyedShieldM=positive(ctx.t.optionContext.shieldM);}summary=`bouclier ${c.shieldBroken?'détruit':'intact'}, aucun dommage au porteur`;}
      cLog(`${ctx.actor.name} → ${ctx.target.name} : ${optionLabel(keyOf(ctx))}, ${summary}.`);
      markAttackDone(ctx.actor.id);if(ctx.p?.optionData?.aim)delete ctx.p.optionData.aim;combatState().tunnel=null;saveState();renderPlayers();renderCombat();
    };
    window.voContext=function(field,value){const ctx=context();if(!ctx.t)return;ctx.t.optionContext[field]=typeof value==='boolean'?value:value===''?null:Number(value);if(field!=='braceReviewed'){ctx.t.attackResult=null;ctx.t.damageResult=null;ctx.t.balanceResult=null;resetTunnelReaction(ctx.t);}saveState();renderCombat();};
    window.voPrepareOption=function(kind,manual){
      const ctx=context(),p=ctx.p,x=ctx.t?.optionContext||{};if(!p)return;p.optionData ||= {};const d=p.optionData,round=combatState().round;
      if(['dead','unconscious','captured','fled'].includes(ctx.actor?.status)){showToast('Cette préparation est impossible dans l’état actuel.');return;}
      if(kind==='recover'&&has(keyOf(ctx),'recover')) {
        if(d.recoverAttempt===round){showToast('Un seul Bond de rétablissement pour cette déclaration.');return;}
        if(!ctx.actor.prone||x.dexStep==null||x.armorPenalty==null){showToast('À terre : indiquez le niveau de Dextérité et la pénalité de l’armure.');return;}
        const n=manual?Number(document.getElementById('voRecoveryResult')?.value):rollStepDetailed(Math.max(1,number(x.dexStep)-positive(x.armorPenalty)-woundActionPenalty(ctx.actor))).total;
        if(!Number.isFinite(n)||manual&&document.getElementById('voRecoveryResult')?.value===''){showToast('Indiquez le résultat obtenu avec vos dés.');return;}
        applyOptionEffort(ctx);d.recoverAttempt=round;d.noMovementRound=round;d.recoverResult=n;
        if(n>=6){p.prone=false;if(ctx.actor.kind==='npc')runtime(p.id).prone=false;d.recoveredRound=round;}
        cLog(`${p.name} : Bond de rétablissement ${n}/6 — ${n>=6?'debout, action simple':'échec ; relevage ordinaire possible'}.`);
      } else if(kind==='yield'&&has(keyOf(ctx),'yield')) {
        const rank=positive(x.meleeRank),meters=positive(x.yieldMeters);
        if(!rank||meters>rank){showToast('La distance cédée doit être comprise entre 0 et le rang du talent ou de la compétence.');return;}
        d.yieldMeters=meters;d.yieldRound=round;applyOptionEffort(ctx);
        cLog(`${p.name} : ${meters} m réellement cédés, +${meters} DP (déplacement confirmé par le MJ).`);
      } else if(kind==='shield'&&has(keyOf(ctx),'shield')) {
        if(d.shieldRound===round){showToast('Initiative déjà corrigée pour ce round.');return;}
        if(combatState().phase==='action'){showToast('Contournement non préparé : revenez à l’initiative et saisissez le résultat brut. La réduction sera faite avant le classement.');return;}
        const shield=tunnelShieldValue(ctx.target,ctx.t.defenseType);if(!shield||p.initiative==null||actorById(ctx.target.id)?.initiative==null){showToast('Bouclier et initiatives des deux acteurs requis.');return;}
        p.initiative=Number(p.initiative)-shield;d.shieldRound=round;d.shieldTarget=ctx.target.id;
        cLog(`${p.name} contourne le bouclier : initiative corrigée ${p.initiative}. Ordre d’action à confirmer par le MJ.`);
      } else if(kind==='aim'&&has(keyOf(ctx),'aim')) {
        if(d.aim?.round===round){showToast('Visée déjà comptée ce round.');return;}
        const move=movementRecord(p.id);if(move.used||move.attackDone||!x.aimVisible){showToast('Visée : cible visible et aucune autre action ni déplacement.');return;}
        const prior=d.aim;d.aim={round,targetId:ctx.target.id,count:prior?.round===round-1&&prior.targetId===ctx.target.id?Math.min(2,prior.count+1):1};
        applyOptionEffort(ctx);d.noMovementRound=round;d.noAttackRound=round;markAttackDone(p.id);cLog(`${p.name} vise ${ctx.target.name} : ${d.aim.count} round(s).`);
      } else return;
      saveState();renderCombat();
    };
    window.voStandNormally=function(){const ctx=context();if(!ctx.actor?.prone||['dead','unconscious','captured','fled'].includes(ctx.actor.status)||movementRecord(ctx.actor.id).attackDone)return;ctx.p.prone=false;ctx.p.option='none';ctx.p.optionData ||= {};ctx.p.optionData.noMovementRound=combatState().round;ctx.p.optionData.noAttackRound=combatState().round;if(ctx.actor.kind==='npc'){runtime(ctx.actor.id).prone=false;runtime(ctx.actor.id).option='none';}markAttackDone(ctx.actor.id);cLog(`${ctx.actor.name} se relève : action ordinaire consommée, aucun autre déplacement.`);combatState().tunnel=null;saveState();renderCombat();};
    const oldMove=consumeMovement;
    consumeMovement=function(id,...args){if(actorById(id)?.optionData?.noMovementRound===combatState().round){showToast('Cette option ne permet plus de déplacement ce round.');return false;}return oldMove(id,...args);};
    for(const name of ['manualMoveRelative','goToContact']){const old=window[name];if(typeof old==='function')window[name]=function(id,...args){if(actorById(id)?.optionData?.noMovementRound===combatState().round){showToast('Aucun autre déplacement autorisé ce round.');return;}return old(id,...args);};}
    const oldEnd=endRound;
    endRound=function(){
      for(const p of combatState().participants||[]) {if(p.participation==='outside')continue;const key=p.option||'none';if(has(key,'aggressive')&&!combatState().optionUsed?.[`${combatState().round}:${p.id}`]){const ctx={p,actor:getCombatEntity(p.id),attack:{mode:'melee'},t:{}};applyOptionEffort(ctx);}}
      return oldEnd();
    };
    function input(x,key,label){return `<label>${esc(label)} <input type="number" min="0" class="combat-input" value="${x[key]??''}" onchange="voContext('${key}',this.value)"></label>`;}
    function check(x,key,label){return `<label><input type="checkbox" ${x[key]?'checked':''} onchange="voContext('${key}',this.checked)"> ${esc(label)}</label>`;}
    function settings(ctx){const key=keyOf(ctx),x=ctx.t.optionContext||{},fields=[];
      if(has(ctx.target?.option,'defensive'))fields.push(check(x,'unperceived','La cible ne perçoit pas cette attaque : pas de bonus défensif'),check(x,'reactionExempt','MJ : exempter la réaction défensive du malus de garde'));
      if(has(key,'breakshield')||has(key,'brace'))fields.push(input(x,'weaponSize','Taille de l’arme'));
      if(has(key,'breakshield'))fields.push(input(x,'shieldThreshold','Seuil de destruction du bouclier'),input(x,'shieldP','Protection physique du bouclier'),input(x,'shieldM','Protection mystique du bouclier'),check(x,'shieldMagic','Bouclier magique'));
      if(has(key,'brace'))fields.push(input(x,'weaponDamage','Niveau de dommages de l’arme (sans Force)'),input(x,'mountForce','Niveau de Force de la monture'),check(x,'mounted','Cible montée en charge'),check(x,'fullCharge','Charge montée complète'),'<p>Sur un résultat Bon : Équilibre de la cible contre le niveau de Dextérité de l’attaquant. Échec : À terre et dommages de chute niveau 5, sans armure. Le MJ résout ce cas dans Gérer avant de confirmer (sans modifier les dommages du coup).</p>',check(x,'braceReviewed','Désarçonnement examiné et conséquences éventuelles appliquées par le MJ'));
      if(has(key,'yield'))fields.push(input(x,'meleeRank','Rang mêlée / mains nues'),input(x,'yieldMeters','Mètres réellement cédés'),'<button class="btn" onclick="voPrepareOption(\'yield\')">Confirmer le terrain cédé</button>');
      if(has(key,'recover'))fields.push(input(x,'dexStep','Niveau de Dextérité'),input(x,'armorPenalty','Pénalité d’initiative de l’armure'),'<button class="btn" onclick="voPrepareOption(\'recover\')">Lancer le rétablissement</button><input id="voRecoveryResult" type="number" class="combat-input" placeholder="Résultat de vos dés"><button class="btn" onclick="voPrepareOption(\'recover\',true)">Utiliser ce résultat</button>');
      if(ctx.actor.prone)fields.push('<button class="btn" onclick="voStandNormally()">Se relever — action ordinaire</button>');
      if(has(key,'shield'))fields.push('<button class="btn" onclick="voPrepareOption(\'shield\')">Appliquer le contournement à l’initiative</button>');
      if(has(key,'aim')||aimBonus(ctx))fields.push(check(x,'aimVisible','Même cible restée visible, aucune autre action ni déplacement'),check(x,'similarBonus','Un bonus similaire s’applique déjà'),...(has(key,'aim')?['<button class="btn" onclick="voPrepareOption(\'aim\')">Valider ce round de visée</button>']:[]));
      const why=issue(ctx);return `<div class="rule-note" id="voOptionDetails"><b>${esc(optionLabel(key))}</b><p>${esc(hint(key))}</p>${why?`<p class="option-invalid">${esc(why)}</p>`:''}<div class="apply-row">${fields.join('')}</div></div>`;
    }
    const oldPanel=renderResolutionPanel;
    renderResolutionPanel=function(){
      let html=oldPanel();const ctx=context();if(!ctx.t||!ctx.actor||!ctx.target)return html;
      const root=document.createElement('div');root.innerHTML=html;
      const header=root.querySelector('.tunnel-head');if(header)header.insertAdjacentHTML('afterend',settings(ctx));
      const c=tunnelDamageConsequences(ctx);
      if(c?.kind) {
        const box=root.querySelector('.damage-preview');
        let description=c.kind==='knockdown'?`${c.raw} − armure ${c.armor} : Équilibre contre ${c.balanceDN}. Aucun dommage ni BG.`:c.kind==='stun'?`${c.taken} dommages d’étourdissement (non létaux), ${c.stunRounds} round(s) étourdi. Aucune BG ni saignement.`:`Résultat ${c.raw} : bouclier ${c.shieldBroken?'détruit':'intact'}. Aucun dommage au porteur.`;
        const balance=c.kind==='knockdown'&&c.balanceDN>0?`<div class="apply-row"><button class="btn" onclick="rollTunnelBalance()">Lancer Équilibre</button><input id="tunnelBalanceManual" class="combat-input" type="number" placeholder="Résultat des dés"><button class="btn" onclick="manualTunnelBalance()">Évaluer</button><b>${ctx.t.balanceResult==null?'À résoudre':ctx.t.balanceResult<c.balanceDN?'À terre':'Reste debout'}</b></div>`:'';
        if(box)box.innerHTML=`<b>${esc(description)}</b>${balance}<div class="apply-row"><button class="btn primary" onclick="applyTunnelResolution()">Valider cet effet</button></div>`;
        if(c.kind==='breakshield'){const critical=root.querySelector('.critical-note');if(critical)critical.textContent='Critique sur le bouclier : taille de l’arme ajoutée au niveau de dommages ; aucune armure du porteur à soustraire.';}
      }
      return root.innerHTML;
    };
    // Recovery of non-lethal damage is explicit, separate from ordinary healing.
    window.voHealStun=function(id){const rt=runtime(id),p=actorById(id),el=document.getElementById('voStunRecovery');if(!rt||!el||el.value===''||!rt.stunDamage)return;const score=Number(el.value);if(!Number.isFinite(score)||score<0)return;if(p.kind==='pj'){const q=getPlayerQuick(p.name);if(positive(rt.recoveriesUsed)>=q.recoveryMax){showToast('Aucun test de récupération restant. Une aide extérieure est à arbitrer par le MJ.');return;}rt.recoveriesUsed=positive(rt.recoveriesUsed)+1;}const healed=Math.min(positive(rt.stunDamage),score);rt.stunDamage=positive(rt.stunDamage)-healed;cLog(`${p.name} : ${healed} dommages d’étourdissement soignés, un test de récupération consommé (résultat validé par le MJ).`);saveState();renderPlayers();renderCombat();};
    const oldActorPanel=renderActorPanel;
    window.voRestoreShield=function(id){const rt=runtime(id);if(!rt?.shieldDestroyed)return;rt.shieldDestroyed=false;cLog(`${combatActorName(id)} : bouclier remplacé ou réparé, protection rétablie par le MJ.`);saveState();renderPlayers();renderCombat();};
    renderActorPanel=function(id){const e=getCombatEntity(id);let html=oldActorPanel(id);if(e?.stunDamage)html+=`<div class="rule-note"><b>Étourdissement : ${e.stunDamage} dommages séparés</b><p>Ne peuvent pas tuer. Récupération distincte : au premier test, ajouter le niveau de Volonté. Le MJ vérifie le résultat. Valider consomme un test pour un PJ.</p><input id="voStunRecovery" class="combat-input" type="number" min="0" placeholder="Récupération totale"><button class="btn" onclick="voHealStun('${esc(id)}')">Appliquer cette récupération</button></div>`;if(runtime(id)?.shieldDestroyed)html+=`<div class="rule-note"><b>Bouclier détruit : protection retirée.</b><button class="btn" onclick="voRestoreShield('${esc(id)}')">MJ : bouclier réparé ou remplacé</button></div>`;return html;};
  }

  function installPlayer() {
    if(window.__vorkanaOptionsInstalled)return;window.__vorkanaOptionsInstalled=true;
    CR_OPTIONS.splice(0,CR_OPTIONS.length,...labels.filter(([key])=>!key.startsWith('tail')||P.name==='Zra’Ul'||P.name==="Zra'Ul"));
    const cond=()=>L.combatConditions||{},key=()=>combatFlow().declaration.option||'none';
    const originalArmor={...P.combat.armor};
    function applyShieldState(){const lost=L.shieldArmorLost||{};for(const k of ['physical','mystical'])P.combat.armor[k]=Math.max(0,number(originalArmor[k])-positive(lost[k]));}
    applyShieldState();
    const actorConditions=()=>situations(cond(),cond().prone,cond().stunned);
    function mode(a){if(a?.spell||a?.spellId)return 'magic';if(typeof crWeaponFor==='function'){const w=crWeaponFor(a);if(w?.ranged)return 'ranged';}return /bow|shot|throw|tir|lance_j|ranged/.test(a?.id||'')?'ranged':a?.damageDice?'melee':'other';}
    function allowed(a){const m=mode(a);return !parts(key()).some(k=>['aggressive','stun','yield','shield','breakshield','brace','knockdown'].includes(k)&&m!=='melee'||['precise','split'].includes(k)&&!['melee','ranged'].includes(m));}
    const oldSnapshot=applyCockpitSnapshot;
    applyCockpitSnapshot=function(d){
      if(d.combat?.conditions){L.combatConditions={...d.combat.conditions};const health=healthState();health.conditions=(health.conditions||[]).filter(c=>c.source!=='cockpit-options');for(const type of ['prone','stunned','bleeding'])if(cond()[type])health.conditions.push({id:'cockpit-option-'+type,type,label:HEALTH_CONDITIONS[type].label,note:type==='prone'?'−3 aux attaques et DP/DM':type==='stunned'?`${cond().stunned} round(s)`:'Suivi par le MJ',source:'cockpit-options'});}
      if(d.runtime?.stunDamage!=null)L.stunDamage=positive(d.runtime.stunDamage);
      if(d.runtime?.shieldArmorLost){L.shieldArmorLost={...d.runtime.shieldArmorLost};applyShieldState();}
      if(d.combat?.optionData)L.combatOptionData=d.combat.optionData;
      const out=oldSnapshot(d);renderCombatFlow();healthRenderGlobalStrip();return out;
    };
    const oldSet=crSetDeclaration;
    crSetDeclaration=function(k,v){if(k==='option') {if(!known(v))return;if(cond().prone&&!['none','recover'].includes(v)){alert('À terre : seule l’option Bond de rétablissement est disponible.');return;}if(v==='none'&&combatFlow().planLocked){combatFlow().declaration.option='none';save();crSendPlan();renderCombatFlow();return;}}return oldSet(k,v);};
    crOptionOptions=function(){return CR_OPTIONS.filter(([k])=>!cond().prone||['none','recover'].includes(k)).map(([k,l])=>`<option value="${k}" ${key()===k?'selected':''}>${esc(l)}</option>`).join('');};
    const oldAttack=crAttackStepInfo,oldDamage=crDamageProfile;
    crAttackStepInfo=function(a=crSelectedAction(),e=crActiveEntry()){const v=oldAttack(a,e);if(!v)return v;const m=allowed(a)?mods(key()):mods('none'),delta=m.action+m.attack+actorConditions().action+darkness(cond());return {...v,situational:v.situational+delta,final:edStepSpec(Math.max(1,v.baseStep+v.wound+v.situational+delta))};};
    crDamageProfile=function(a=crSelectedAction(),e=crActiveEntry()){const v=oldDamage(a,e);if(v.step==null)return v;const guided=parts(key()).some(k=>['breakshield','brace'].includes(k)),step=guided&&e?.optionEffectStep>0?Number(e.optionEffectStep):Math.max(1,v.step+(allowed(a)?mods(key()).damage:0)),dice=edStepDiceLabel(edStepSpec(step));return {...v,step,dice,label:`Niveau ${step} / ${dice}${guided&&e?.optionEffectStep>0?' · confirmé avec le MJ':''}`};};
    window.voPlayerEffectStep=function(value){const e=crActiveEntry();if(!e)return;e.optionEffectStep=value===''?null:Math.max(1,Math.trunc(Number(value)||1));e.damageResult=null;save();renderCombatFlow();};
    for(const name of ['crRollDamage','crSetManualDamage']){const old=window[name];window[name]=function(...args){if(parts(key()).some(k=>['breakshield','brace'].includes(k))&&!crActiveEntry()?.optionEffectStep){alert('Confirmez d’abord avec le MJ le niveau du test d’effet, puis indiquez-le dans le rappel de l’option.');return;}return old(...args);};}
    for(const name of ['crDodgeStepInfo','crSprintStepInfo','crAnticipationStepInfo']){const old=window[name];if(typeof old==='function')window[name]=function(...args){const v=old(...args);if(!v)return v;const delta=actorConditions().action+mods(key()).action;return {...v,situational:number(v.situational)+delta,final:edStepSpec(Math.max(1,v.baseStep+number(v.wound)+number(v.situational)+delta))};};}
    for(const name of ['crRenderInitiative','crRollInitiative']){const old=window[name];window[name]=function(...args){const initiative=P.combat.initiative,step=initiative.step,dice=initiative.dice;initiative.step=Math.max(1,step-healthActionPenalty()+actorConditions().action+mods(key()).action);initiative.dice=edStepDiceLabel(edStepSpec(initiative.step));try{return old(...args);}finally{initiative.step=step;initiative.dice=dice;}};}
    function canAct(){const a=crSelectedAction();if(L.draft.damage>=P.combat.health.death||positive(L.draft.damage)+positive(L.stunDamage)>=P.combat.health.unconscious){alert('Ce personnage est inconscient ou hors de combat.');return false;}if(cond().stunned&&cond().stunnedSince===combatFlow().round){alert('Étourdi : seules les actions défensives sont possibles pendant ce premier round.');return false;}if(key()==='aim'){alert('Ce round est consacré à viser : le MJ valide la visée, sans autre action ni déplacement.');return false;}if(cond().prone&&!['none','recover'].includes(key())){alert('Cette option n’est plus utilisable À terre.');return false;}if(!allowed(a)){alert('Cette option est incompatible avec l’action choisie.');return false;}return true;}
    for(const name of ['crRollAttack','crSetManualAttack']){const old=window[name];window[name]=function(...args){if(canAct())return old(...args);};}
    const oldResolution=crRenderResolution;
    crRenderResolution=function(){if(parts(key()).some(k=>['knockdown','stun','breakshield'].includes(k))){const e=crActiveEntry(),profile=crDamageProfile();return `<div class="cr-card"><h3>${esc(CR_OPTIONS.find(x=>x[0]===key())?.[1]||'Effet de l’option')}</h3><p>${esc(hint(key()))}</p><p>Résultat d’attaque : <b>${e?.attackResult??'—'}</b></p><p>Niveau d’effet : <b>${esc(profile.label)}</b></p><div class="cr-actions"><button class="cr-btn" onclick="crRollDamage()">Lancer le test d’effet</button><input type="number" placeholder="Résultat de vos dés" value="${e?.damageResult??''}" onchange="crSetManualDamage(this.value)"></div><p>Résultat d’effet : <b>${e?.damageResult??'—'}</b>. Annoncez les résultats au MJ : il confirme l’armure, la réaction puis applique l’effet dans le cockpit. Ce résultat local n’applique pas de blessure à la cible.</p><button class="cr-btn primary" onclick="voFinishPlayerEffect()">Effet résolu avec le MJ — action suivante</button></div>`;}return oldResolution();};
    window.voFinishPlayerEffect=function(){const e=crActiveEntry();if(!e||e.attackResult==null||e.damageResult==null){alert('Renseignez l’attaque et le test d’effet avant de terminer.');return;}crMarkEntryDone(e.id);combatFlow().phase='realisation';save();renderCombatFlow();};
    const oldRender=renderCombatFlow;
    renderCombatFlow=function(){const out=oldRender(),host=document.getElementById('combatPhasePanel');if(host){host.querySelector('#voPlayerOption')?.remove();const m=mods(cond().prone&&!['none','recover'].includes(key())?'none':key()),s=actorConditions(),dp=P.combat.defenses.physical+m.dp+s.dp,dm=P.combat.defenses.magical+m.dm+s.dm,guided=parts(key()).some(k=>['breakshield','brace'].includes(k));host.insertAdjacentHTML('afterbegin',`<div id="voPlayerOption" class="cr-info"><b>${esc(CR_OPTIONS.find(x=>x[0]===key())?.[1]||'Option de combat')}</b><p>${esc(hint(key()))}</p>${guided&&crActiveEntry()?`<label>Niveau du test d’effet confirmé avec le MJ <input type="number" min="1" value="${crActiveEntry().optionEffectStep??''}" onchange="voPlayerEffectStep(this.value)"></label>`:''}<small>Défenses actuelles : physique ${dp} · magique ${dm}${cond().prone?' · À terre : −3 aux attaques et DP/DM':''}${cond().stunned?` · Étourdi ${cond().stunned} round(s)`:''}${L.stunDamage?` · ${L.stunDamage} dommages d’étourdissement (non létaux)`:''}. Les coûts des options sont appliqués par le MJ, pas une seconde fois ici.</small></div>`);}return out;};
    const oldSummary=healthStateSummary;
    healthStateSummary=function(){if(L.draft.damage<P.combat.health.death&&positive(L.draft.damage)+positive(L.stunDamage)>=P.combat.health.unconscious)return {key:'critical',label:'Inconscient — étourdissement',sub:'Dommages non létaux suivis séparément. Récupération à confirmer avec le MJ.'};return oldSummary();};
    const oldStrip=healthRenderGlobalStrip;
    healthRenderGlobalStrip=function(){const out=oldStrip();if(L.stunDamage){const el=document.getElementById('globalHealthStateText');if(el)el.textContent=healthStateSummary().label+` · ${L.stunDamage} étourdissement`;const fill=document.getElementById('globalHealthFill'),max=P.combat.health.death,remaining=Math.max(0,max-positive(L.draft.damage)-positive(L.stunDamage));if(fill){fill.style.width=(100*remaining/max)+'%';fill.parentElement.setAttribute('aria-valuenow',String(remaining));fill.parentElement.setAttribute('aria-valuetext',`${remaining} sur ${max}, dont ${L.stunDamage} dommages non létaux`);}const value=document.getElementById('globalHealthDamage');if(value)value.textContent=`${remaining} / ${max}`;}return out;};
    renderCombatFlow();
  }
})();
