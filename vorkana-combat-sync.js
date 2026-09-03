/* Vorkana 0.38 — reliable, room-scoped combat exchange.
   Uses the existing proposal journal; receipt means application receipt, not broadcast success.
   Only the GM applies consequences. No NPC sheet is sent to a player. */
(function () {
  'use strict';
  const S=window.EarthdawnSync;
  const uid=()=>`cx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const copy=x=>JSON.parse(JSON.stringify(x));
  const n=x=>Number.isFinite(Number(x))?Number(x):0;
  const text=x=>String(x??'').slice(0,500);
  const html=x=>text(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const room=()=>S?.status().room||'local';
  const cleanName=x=>text(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const terminal=r=>['applied','review','closed'].includes(r.stage);
  const labels={pending:'En attente de confirmation du MJ',received:'Reçu par le MJ — à résoudre',applied:'Conséquences appliquées par le MJ',review:'À vérifier avec le MJ'};
  const api=window.VorkanaCombatExchange={version:'0.38.0'};
  const wrap=(name,fn)=>{const old=window[name];if(typeof old==='function')window[name]=fn(old);};
  const style=document.createElement('style');
  style.textContent='.cx-panel{padding:12px;margin:12px 0;border:1px solid #a98b55;border-radius:10px;background:#eee7da;color:#211b15}.cx-panel details{margin:8px 0}.cx-panel p{margin:6px 0}.cx-panel small{display:block}.cx-panel button,.cx-panel select{margin:4px;max-width:100%}.cx-stage{font-weight:700;color:#74511e}.cx-applied{color:#21603b}.cx-review{color:#9a3425}#cxDock{border:2px solid #d5b576}';
  document.head.appendChild(style);
  if(typeof combatState==='function')installGM();
  else if(typeof combatFlow==='function'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installPlayer,{once:true});
    else installPlayer();
  }

  function installGM(){
    let owner,stream,started=0,seq=0,applying=false;
    function book(){const c=combatState();c.exchange ||= {records:[],paid:{}};c.exchange.records ||= [];c.exchange.paid ||= {};return c.exchange;}
    function encounter(){const c=combatState();if(c.active)c.exchangeEncounter ||= uid();return c.exchangeEncounter||'';}
    const records=()=>book().records.filter(r=>r.room===room());
    const find=id=>records().find(r=>r.id===id);
    const current=r=>r.room===room()&&combatState().active&&r.encounter===encounter()&&r.round===Number(combatState().round);
    const costKey=(id,round=Number(combatState().round))=>`${room()}:${encounter()}:${round}:${id}`;
    const paid=id=>book().paid[costKey(id)] ||= {karma:0,effort:0,recoveries:0};
    function persist(){saveState();try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')?.combat?.exchange!=null;}catch(_){return false;}}
    function receipt(r){
      // Never acknowledge a consequence that cannot survive a cockpit reload.
      try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}').combat?.exchange?.records?.find(x=>x.id===r.id);if(!saved||saved.revision>r.revision||saved.stage!==r.stage&&r.stage!=='review')return;}catch(_){return;}
      const payload={type:'earthdawn-player-proposal-decisions',playerId:r.playerId,decisions:[],combatReceipt:{id:r.id,revision:r.revision,stage:r.stage,note:r.note||'',room:r.room,encounter:r.encounter,round:r.round,target:r.targetEffect||null,snapshot:playerSafeSnapshot(r.playerId)}};
      S?.sendToPlayer(r.playerId,payload);
    }
    api.records=records;
    // Consequences and their idempotency ledger must be committed together.
    wrap('saveState',old=>function(){if(applying)return;return old.apply(this,arguments);});
    wrap('beginCombat',old=>function(){const was=combatState().active;const out=old.apply(this,arguments);if(!was&&combatState().active){combatState().exchangeEncounter=uid();saveState();}return out;});
    wrap('playerSafeSnapshot',old=>function(id){
      if(owner!==state){owner=state;stream=uid();started=Math.max(Date.now(),started+1);seq=0;}
      const d=old.apply(this,arguments);d.combat.encounterId=encounter();
      d.combat.exchangeVersion=1;d.combat.paid=copy(paid(id));
      d.exchangeStamp={stream,started,seq:++seq};return d;
    });
    // Only changed projections need a broadcast; hello/ping remain a recovery path.
    const lastSent=new Map();
    wrap('syncAllPlayerClients',old=>function(){
      for(const id of Object.keys(PLAYER_CLIENT_FILES))if(playerClientConnected[id]){
        const d=playerSafeSnapshot(id),fingerprint=JSON.stringify([room(),d.sessionId,d.runtime,d.combat,d.decisions]);
        if(lastSent.get(id)!==fingerprint){lastSent.set(id,fingerprint);playerClientPost(id,d);}
      }
      updatePlayerClientStatus();
    });
    window.addEventListener('message',e=>{const d=e.data;if(d?.type==='earthdawn-player-ping'&&PLAYER_CLIENT_FILES[d.playerId])playerClientPost(d.playerId,playerSafeSnapshot(d.playerId));});
    function accept(d){
      const raw=d.combatResult||d.combatCommand;if(!raw||!PLAYER_CLIENT_FILES[d.playerId])return;
      const env=d.__earthdawnEnvelope;
      if(env&&(env.room!==room()||env.sender?.role!=='player'||env.sender?.playerId!==d.playerId))return;
      if(raw.room!==room()||raw.playerId!==d.playerId||!/^cx-[a-z0-9-]+$/.test(raw.id)||!Number.isInteger(raw.revision)||raw.revision<1||!Number.isInteger(raw.round)||raw.round<1)return;
      if(!['action','reaction','costs'].includes(raw.kind)||JSON.stringify(raw).length>12000)return;
      const prior=find(raw.id);
      if(prior){
        if(prior.playerId!==raw.playerId||prior.encounter!==raw.encounter||prior.round!==raw.round)return;
        if(prior.revision>=raw.revision||terminal(prior)){
          if(prior.stage==='applied'&&raw.revision>prior.revision)receipt({...prior,revision:raw.revision,stage:'review',note:'Ce résultat a déjà été appliqué. Toute correction se fait avec le MJ.'});
          else {persist();receipt(prior);}
          return;
        }
      }
      // Whitelist data fields: never merge remote objects into game state.
      const r={id:raw.id,revision:raw.revision,playerId:d.playerId,room:room(),encounter:text(raw.encounter),round:raw.round,kind:raw.kind,entryId:text(raw.entryId),actionId:text(raw.actionId),label:text(raw.label),target:text(raw.target),option:text(raw.option),attack:raw.attack==null?null:n(raw.attack),damage:raw.damage==null?null:n(raw.damage),allOnes:!!raw.allOnes,attackDetail:text(raw.attackDetail),damageDetail:text(raw.damageDetail),karma:!!raw.karma,ready:!!raw.ready,step:n(raw.step),damageStep:n(raw.damageStep),costs:{karma:Math.max(0,n(raw.costs?.karma)),effort:Math.max(0,n(raw.costs?.effort)),recoveries:Math.max(0,n(raw.costs?.recoveries))},stage:'received',receivedAt:Date.now()};
      if(!current(r)||!actorById(r.playerId)||actorById(r.playerId).participation==='outside'){r.stage='review';r.note='Résultat conservé, mais hors du combat ou round actif de ce personnage. Aucune conséquence appliquée.';}
      if(prior)Object.assign(prior,r);else book().records.push(r);
      if(!persist()){showToast('Résultat reçu mais sauvegarde locale indisponible. Gardez le cockpit ouvert.');return;}
      receipt(prior||r);renderInbox();
    }
    wrap('mergePlayerProposals',old=>function(d){if(d?.combatResult||d?.combatCommand)return accept(d);return old.apply(this,arguments);});
    // Track amounts actually charged by the normal resolution, excluding option effort.
    for(const [name,who,fields] of [['applyAttackKarma','actor',['karma']],['applyAttackEffort','actor',['effort']],['applyReactionCost','target',['karma','effort']]])wrap(name,old=>function(ctx){
      const e=ctx?.[who],rt=e?.kind==='pj'?state.playerRuntime[e.name]:null,before=rt?copy(rt):null;
      const out=old.apply(this,arguments);
      if(rt){const p=paid(e.id);if(fields.includes('karma'))p.karma+=Math.max(0,n(before.karma)-n(rt.karma));if(fields.includes('effort'))p.effort+=Math.max(0,n(rt.damage)-n(before.damage));}
      return out;
    });
    const mapping={pj_0:{bow:'zra_bow',second_shot:'zra_second',sure_shot:'zra_sure',throw:'zra_throw',sword:'zra_sword',tail:'zra_tail',disarm:'zra_disarm'},pj_1:{mace:'kalha_mace',shield:'kalha_shield'},pj_6:{short:'gul_short',dagger:'gul_dagger',second:'gul_second'},pj_3:{axe:'barbak_axe',unarmed:'barbak_unarmed'},pj_5:{sword:'jaskar_sword'},pj_2:{warbow:'kz_bow',throw:'kz_throw',sword:'kz_broad',short:'kz_short',hatchet:'kz_hatchet',second_shot:'kz_second_bow'},pj_4:{mace:'ogunta_mace'}};
    function notice(r){return `<b>${html(playerNameFromId(r.playerId))} · R${r.round} · ${html(r.label)}</b><small class="cx-stage cx-${r.stage}">${labels[r.stage]}${r.note?' — '+html(r.note):''}</small><p>${r.kind==='costs'?`Consommations annoncées : Karma ${r.costs.karma}, Effort ${r.costs.effort}, récupérations ${r.costs.recoveries}`:`${r.kind==='reaction'?'Réaction':'Test'} : ${r.attack??'—'}${r.damage!=null?' · Dommages / effet : '+r.damage:''}${r.target?' · Cible : '+html(r.target):''}`}</p>${r.kind==='action'?`<small>Niveaux utilisés : test ${r.step||'—'}, dommages / effet ${r.damageStep||'—'} · ${r.karma?'avec':'sans'} Karma.</small>`:''}`;}
    function controls(r){
      if(r.stage!=='received'||!current(r))return '';
      if(r.kind==='costs')return `<button onclick="cxApplyCosts('${r.id}')">Vérifier les consommations restantes</button>`;
      if(r.kind==='reaction')return `<button onclick="cxLoadReaction('${r.id}')">Utiliser pour l’attaque actuellement affichée</button><button onclick="cxManualEffect('${r.id}')">Effet traité manuellement</button>`;
      const ent=getCombatEntity(r.playerId),attacks=attacksForEntity(ent),key=mapping[r.playerId]?.[r.actionId]||'';
      const targets=participantTargets(actorById(r.playerId)),target=targets.find(t=>cleanName(getCombatEntity(t.id)?.name)===cleanName(r.target))?.id||'';
      return `<label>Action du cockpit <select id="cxAttack-${r.id}"><option value="">À choisir / effet particulier</option>${attacks.map(a=>`<option value="${html(a.key)}" ${a.key===key?'selected':''}>${html(a.label)}</option>`).join('')}</select></label><label>Cible <select id="cxTarget-${r.id}"><option value="">À choisir</option>${targets.map(t=>`<option value="${html(t.id)}" ${t.id===target?'selected':''}>${html(getCombatEntity(t.id)?.name)}</option>`).join('')}</select></label><button onclick="cxLoadResult('${r.id}')">Charger les résultats</button><button onclick="cxManualEffect('${r.id}')">Effet traité manuellement</button>`;
    }
    function renderInbox(){
      const pending=records().filter(r=>!terminal(r)),review=records().filter(r=>r.stage==='review');
      let dock=document.getElementById('cxDock');if(!dock){const parent=document.getElementById('mjDock');if(parent){dock=document.createElement('button');dock.id='cxDock';dock.onclick=()=>{openCombat();renderInbox();document.getElementById('cxInbox')?.scrollIntoView({block:'start'});};parent.appendChild(dock);}}
      if(dock){dock.textContent=`Résultats : ${pending.length} à traiter${review.length?' · '+review.length+' à vérifier':''}`;dock.hidden=!pending.length&&!review.length;}
      const host=document.getElementById('combatMain');if(!host)return;
      let box=document.getElementById('cxInbox');if(!box){box=document.createElement('section');box.id='cxInbox';box.className='cx-panel';host.prepend(box);}
      // Do not replace the GM's current selections on an unrelated notification.
      const signature=JSON.stringify(records().map(r=>[r.id,r.revision,r.stage,r.note]));if(box.dataset.signature===signature)return;
      const selected=Object.fromEntries([...box.querySelectorAll('select')].map(x=>[x.id,x.value]));
      box.dataset.signature=signature;box.innerHTML=`<b>Résultats des joueurs</b><p>Chargez un résultat, puis validez ses conséquences dans le déroulé habituel. Chaque action est traitée immédiatement.</p>${pending.map(r=>`<details open>${'<summary>'+html(playerNameFromId(r.playerId))+' — '+html(r.label)+'</summary>'}${notice(r)}${controls(r)}</details>`).join('')}${review.length?`<details><summary>${review.length} résultat(s) à vérifier</summary>${review.map(r=>notice(r)+`<button onclick="cxDismiss('${r.id}')">Vérification terminée — archiver le signalement</button>`).join('')}</details>`:''}${!pending.length?'<small>Aucun résultat en attente.</small>':''}`;
      for(const [id,value] of Object.entries(selected)){const el=document.getElementById(id);if(el&&[...el.options].some(o=>o.value===value))el.value=value;}
    }
    function usable(id){const r=find(id);if(!r||r.stage!=='received'||!current(r)){showToast('Ce résultat n’est plus applicable à ce round.');return null;}return r;}
    window.cxLoadResult=function(id){
      const r=usable(id);if(!r)return;
      if(currentTurnId()!==r.playerId){showToast('Affichez d’abord le tour de '+playerNameFromId(r.playerId)+'.');return;}
      const key=document.getElementById('cxAttack-'+id)?.value,target=document.getElementById('cxTarget-'+id)?.value,a=attacksForEntity(getCombatEntity(r.playerId)).find(a=>a.key===key);
      if(!a||!getCombatEntity(target)){showToast('Choisissez l’action et sa cible. Pour un sort ou effet particulier, utilisez le traitement manuel.');return;}
      if(r.attack==null){showToast('Le test n’a pas encore été reçu.');return;}
      const existing=ensureTunnel(),refresh=existing?.exchange?.id===r.id&&existing.attackKey===key&&existing.targetId===target&&existing.attackResult===r.attack&&existing.attackAllOnes===r.allOnes;
      if(existing?.attackResult!=null&&!refresh&&!confirm('Remplacer les résultats actuellement affichés ?'))return;
      const actor=actorById(r.playerId);if(r.option&&r.option!==actor.option){if(!VorkanaCombatOptions.labels.some(x=>x[0]===r.option)||!optionEligibleForActor(r.option,getCombatEntity(r.playerId))){showToast('L’option transmise est incompatible avec l’état actuel. Vérifiez avec le joueur.');return;}if(!confirm('Le résultat utilise une autre option que le cockpit : '+VorkanaCombatOptions.hint(r.option)+' Appliquer cette option avant la résolution ?'))return;actor.option=r.option;}
      // Damage may arrive after the defender's reaction was entered. Keep that work
      // when refreshing the same attack; only damage-dependent balance is invalidated.
      const t=refresh?copy(existing):freshTunnel(r.playerId);
      if(refresh&&t.damageResult!==r.damage){t.balanceResult=null;t.balanceDetail='';t.prone=false;}
      Object.assign(t,{attackKey:key,targetId:target,defenseType:refresh?t.defenseType:a.defense||'physical',attackResult:r.attack,attackAllOnes:r.allOnes,attackDetail:r.attackDetail,damageResult:r.damage,damageDetail:r.damageDetail,attackKarmaUse:r.karma,exchange:{id:r.id,revision:r.revision}});
      actorById(r.playerId).target=target;combatState().tunnel=t;
      const ctx=tunnelContext(),level=tunnelDamageLevel(ctx),ev=tunnelAttackEvaluation(ctx);
      if(t.damageResult!=null&&ev?.critical&&level>0&&t.damageResult<level){t.damageResult=level;t.damageDetail+=` · Minimum critique du cockpit : ${level}`;}
      saveState();renderCombat();
      if(r.step&&r.step!==tunnelAttackLevel(ctx)||r.damageStep&&r.damageStep!==level)showToast('Les niveaux annoncés par le joueur diffèrent de ceux du cockpit. Vérifiez les modificateurs avant validation.');
    };
    window.cxLoadReaction=function(id){
      const r=usable(id),ctx=tunnelContext();if(!r)return;
      if(ctx.target?.id!==r.playerId||ctx.t.attackResult==null||ctx.t.reactionApplied){showToast('Affichez l’attaque reçue par ce personnage, avant d’appliquer sa réaction.');return;}
      const key=({dodge:'dodge',parry:'parry',ironWill:'ironwill'})[r.actionId],reaction=availableDefensiveReactions(ctx.target,ctx).find(x=>x.key===key);
      if(!reaction){showToast('Cette réaction demande un traitement manuel ou n’est pas disponible contre cette attaque.');return;}
      if(!confirm(`Utiliser ${r.label} (${r.attack}) de ${playerNameFromId(r.playerId)} contre cette attaque de ${ctx.actor.name} ?`))return;
      Object.assign(ctx.t,{reactionKey:key,reactionResult:r.attack,reactionDetail:r.attackDetail,reactionAllOnes:r.allOnes,reactionResolved:true,reactionKarmaUse:r.karma,reactionExchange:{id:r.id,revision:r.revision}});saveState();renderCombat();
    };
    function finish(r,targetEffect){r.stage='applied';r.note='';r.targetEffect=targetEffect||null;r.appliedAt=Date.now();}
    for(const name of ['applyTunnelResolution','finalizeTunnelMiss','applyTunnelReactionAvoided'])wrap(name,old=>function(){
      if(applying)return;const t=ensureTunnel(),refs=[t?.exchange,t?.reactionExchange].filter(Boolean),rows=refs.map(x=>find(x.id));
      if(refs.some((x,i)=>!rows[i]||rows[i].stage!=='received'||rows[i].revision!==x.revision||!current(rows[i]))){showToast('Un résultat a changé ou a déjà été appliqué. Rechargez sa dernière version.');return;}
      const before=t?.targetId?getCombatEntity(t.targetId):null,beforeProne=!!before?.prone,beforeDefense=before?{physical:modifiedDefense(before,'dp'),magical:modifiedDefense(before,'dm'),social:modifiedDefense(before,'ds')}:null;
      applying=true;try{
        const result=old.apply(this,arguments);
        if(t&&combatState().tunnel!==t){
          const after=getCombatEntity(t.targetId),effect=after?{name:after.name,prone:!!after.prone,proneChanged:beforeProne!==!!after.prone,defenseDelta:{physical:modifiedDefense(after,'dp')-beforeDefense.physical,magical:modifiedDefense(after,'dm')-beforeDefense.magical,social:modifiedDefense(after,'ds')-beforeDefense.social}}:null;
          rows.forEach(r=>finish(r,effect));
        }
        applying=false;persist();rows.filter(r=>r.stage==='applied').forEach(receipt);renderInbox();
        return result;
      }finally{applying=false;}
    });
    window.cxManualEffect=function(id){const r=usable(id);if(!r)return;if(!confirm('Confirmer que vous avez traité cet effet particulier et ses états dans le cockpit ? Aucun dommage ni coût ne sera ajouté par ce bouton. Les consommations restantes seront vérifiées dans le résumé.'))return;finish(r);persist();receipt(r);renderInbox();};
    window.cxDismiss=function(id){const r=find(id);if(r?.stage!=='review')return;r.stage='closed';persist();renderInbox();};
    window.cxApplyCosts=function(id){
      const r=usable(id);if(!r)return;
      if(records().some(x=>x.id!==id&&x.playerId===r.playerId&&x.encounter===r.encounter&&x.round===r.round&&x.kind!=='costs'&&x.stage!=='applied'&&x.stage!=='closed')){showToast('Traitez d’abord les résultats de ce personnage.');return;}
      const p=paid(r.playerId),delta=Object.fromEntries(['karma','effort','recoveries'].map(k=>[k,Math.max(0,r.costs[k]-p[k])])),rt=state.playerRuntime[playerNameFromId(r.playerId)];
      if(!rt||delta.karma>n(rt.karma)){showToast('Karma insuffisant : vérifier avec le joueur.');return;}
      if(delta.recoveries+n(rt.recoveriesUsed)>n(getPlayerQuick(playerNameFromId(r.playerId)).recoveryMax)){showToast('Tests de récupération insuffisants : vérifier avec le joueur.');return;}
      if(!confirm(`Consommations restant à appliquer, après déduction des coûts déjà traités : ${delta.karma} Karma, ${delta.effort} Effort, ${delta.recoveries} récupération(s). Confirmer ?`))return;
      rt.karma=n(rt.karma)-delta.karma;rt.damage=n(rt.damage)+delta.effort;rt.recoveriesUsed=n(rt.recoveriesUsed)+delta.recoveries;
      const actor=actorById(r.playerId);if(actor){actor.karma=rt.karma;actor.damage=rt.damage;actor.recoveriesUsed=rt.recoveriesUsed;}
      for(const k of Object.keys(delta))p[k]+=delta[k];finish(r);persist();receipt(r);render();
    };
    wrap('endRound',old=>function(){if(records().some(r=>current(r)&&r.stage==='received')&&!confirm('Des résultats attendent encore leur résolution. Passer au round suivant les conservera comme éléments à vérifier, sans appliquer leurs effets. Continuer ?'))return;const out=old.apply(this,arguments),changed=[];for(const r of records())if(r.stage==='received'&&!current(r)){r.stage='review';r.note='Le round a changé avant validation. À vérifier avec le joueur.';changed.push(r);}persist();changed.forEach(receipt);renderInbox();return out;});
    wrap('renderCombat',old=>function(){const out=old.apply(this,arguments);renderInbox();return out;});
    window.addEventListener('vorkana-room-changed',()=>{lastSent.clear();renderInbox();});
    setTimeout(()=>{
      renderInbox();
      wrap('mjUndoConsequence',old=>function(){const applied=records().filter(r=>r.stage==='applied').map(r=>r.id),out=old.apply(this,arguments);for(const id of applied){const r=find(id);if(r?.stage==='received'){r.note='Le MJ a annulé la conséquence : validation à reprendre.';persist();receipt(r);}}renderInbox();return out;});
    },0);
  }

  function installPlayer(){
    const book=()=>L.combatExchange ||= {records:[],stamps:{}};
    const records=()=>book().records.filter(r=>r.room===room());
    const current=r=>r.encounter===book().encounter&&r.round===Number(combatFlow().round);
    const connected=()=>!!book().encounter&&book().room===room()&&combatFlow().active;
    const find=id=>records().find(r=>r.id===id);
    api.records=records;
    function newer(d){
      const stamp=d?.exchangeStamp,last=book().stamps[room()];
      if(!stamp)return !last;
      if(!last)return true;
      return stamp.stream===last.stream?n(stamp.seq)>n(last.seq):n(stamp.started)>n(last.started);
    }
    api.acceptSnapshot=d=>!['earthdawn-cockpit-state','earthdawn-cockpit-hello'].includes(d?.type)||newer(d);
    const oldSnapshot=applyCockpitSnapshot;
    applyCockpitSnapshot=function(d){
      if(!newer(d))return false;
      const previousRound=combatFlow().round,active=crActiveEntry()?.id;
      const focused=document.activeElement,focus=focused&&document.getElementById('combatPhasePanel')?.contains(focused)?{id:focused.id,onchange:focused.getAttribute('onchange'),value:focused.value,start:focused.selectionStart,end:focused.selectionEnd}:null;
      if(d.combat?.encounterId&&book().encounter&&book().encounter!==d.combat.encounterId){L.combatFlow=crDefault(false,'cockpit');}
      oldSnapshot.apply(this,arguments);
      if(d.exchangeStamp)book().stamps[room()]=copy(d.exchangeStamp);
      if(d.combat?.exchangeVersion){book().encounter=d.combat.encounterId;book().room=room();book().paid=d.combat.paid||{};}
      save();renderStatus();
      if(focus&&previousRound===combatFlow().round&&active===crActiveEntry()?.id){const field=focus.id?document.getElementById(focus.id):[...document.querySelectorAll('#combatPhasePanel [onchange]')].find(e=>e.getAttribute('onchange')===focus.onchange);if(field){field.value=focus.value;field.focus?.();try{field.setSelectionRange(focus.start,focus.end);}catch(_){}}}
      return true;
    };
    function send(r,force=false){
      if(terminal(r)||r.stage==='closed'||r.room!==room())return;
      if(!force&&Date.now()-n(r.sentAt)<20000)return;
      r.sentAt=Date.now();save();
      const wire=copy(r);delete wire.stage;delete wire.sentAt;delete wire.note;
      S?.sendToGM({type:'earthdawn-player-proposals',playerId:P.playerId,proposals:[],[r.kind==='costs'?'combatCommand':'combatResult']:wire});
    }
    api.retry=()=>{for(const r of records())send(r,true);S?.retry?.();renderStatus();};
    function record(e,ready=false){
      if(!connected()||!e||(e.attackResult==null&&e.result==null))return;
      const a=crSelectedAction(e)||(['sprint','anticipation'].includes(e.kind)?{id:e.kind,label:e.label||e.kind}:null);if(!a)return;
      let r=records().find(r=>current(r)&&r.kind==='action'&&r.entryId===e.id);
      const data={actionId:a.id,label:a.label,target:e.target||combatFlow().declaration.target||'',option:combatFlow().declaration.option,attack:e.attackResult??e.result,damage:e.damageResult??null,allOnes:!!e.attackAllOnes,attackDetail:e.attackDetail||e.detail||'',damageDetail:e.damageDetail||'',karma:!!(e.usedKarma??crAttackKarma(a,e)),step:e.cxAttackStep||(e.kind==='mechanical'?crAttackStepInfo(a,e)?.final.step:0),damageStep:crDamageProfile(a,e)?.step};
      const signature=JSON.stringify(data);if(r?.signature===signature)return;
      if(!r){r={id:uid(),revision:0,room:room(),playerId:P.playerId,encounter:book().encounter,round:Number(combatFlow().round),entryId:e.id,kind:'action'};book().records.push(r);}
      if(terminal(r))return;
      Object.assign(r,data,{revision:r.revision+1,signature,stage:'pending',sentAt:0});save();send(r,true);renderStatus();
    }
    function priorBlocked(e){const i=crSeq().findIndex(x=>x.id===e?.id);return crSeq().slice(0,i).some(x=>x.kind==='mechanical'&&records().find(r=>current(r)&&r.entryId===x.id&&r.kind==='action')?.stage!=='applied');}
    for(const name of ['crRollAttack','crSetManualAttack','crRollDamage','crSetManualDamage','crRollSprint','crRollAnticipation'])wrap(name,old=>function(v){
      const e=crActiveEntry();if(connected()){
        if(priorBlocked(e)){alert('Le MJ doit d’abord appliquer les conséquences de l’action précédente. Votre action suivante est prête ici.');return;}
        const r=records().find(r=>current(r)&&r.entryId===e?.id&&r.kind==='action');if(r?.stage==='applied'){alert('Cette action a déjà été appliquée. Demandez au MJ pour la corriger.');return;}
      }
      if(name.includes('Manual')&&(v==null||String(v).trim()===''||!Number.isFinite(Number(v)))){alert('Indiquez le résultat de vos dés.');return;}
      const before=JSON.stringify(e),step=e?.kind==='mechanical'?crAttackStepInfo(crSelectedAction(e),e)?.final.step:0;const out=old.apply(this,arguments);if(e&&JSON.stringify(e)!==before){if(name==='crRollAttack'||name==='crSetManualAttack')e.cxAttackStep=step;record(e);}return out;
    });
    wrap('crMarkEntryDone',old=>function(id){
      const e=crEntry(id);if(connected()&&e?.kind==='mechanical'){
        const a=crSelectedAction(e),degree=e.targetDN?crDegree(e):null;
        const applied=records().some(r=>current(r)&&r.entryId===id&&r.stage==='applied');
        if(!applied&&(e.attackResult==null||(crDamageProfile(a,e)?.dice&&degree?.success!==false&&e.damageResult==null))){alert('Renseignez le test, puis les dommages ou l’effet si l’attaque réussit.');return;}
        record(e,true);
      }
      const out=old.apply(this,arguments);combatFlow().phase=crSeq().some(e=>e.status!=='done')?'realisation':'summary';save();renderCombatFlow();return out;
    });
    window.voFinishPlayerEffect=()=>{const e=crActiveEntry();if(e)crMarkEntryDone(e.id);};
    wrap('crRenderResolution',old=>function(){return old.apply(this,arguments).replace(/Marquer cette action résolue|Effet résolu avec le MJ — action suivante/g,'Transmettre — action suivante');});
    wrap('crSelectEntry',old=>function(id){const out=old.apply(this,arguments);if(['resolution','summary'].includes(combatFlow().phase)&&crActiveEntry()?.status!=='done'){combatFlow().phase='realisation';save();renderCombatFlow();}return out;});
    wrap('crSetEntry',old=>function(id,key){const e=crEntry(id),before=e?.targetDN;if(connected()&&records().some(r=>current(r)&&r.entryId===id)&&['target','projectile','levelMod','useKarma','targetDN'].includes(key)){alert('Le test a été transmis. Pour modifier ses paramètres, vérifiez d’abord la correction avec le MJ.');return;}const out=old.apply(this,arguments);if(e&&['targetDN','target'].includes(key)&&before!==e.targetDN){e.cxDefenseAdjustments={};save();}return out;});
    for(const name of ['crUseDodge','crUseReaction'])wrap(name,old=>function(id){
      const rid=name==='crUseDodge'?'dodge':id,karma=!!document.getElementById('reactionKarma_'+rid)?.checked,before=JSON.stringify(combatFlow().reactions),out=old.apply(this,arguments),rs=combatFlow().reactions;
      if(connected()&&JSON.stringify(rs)!==before&&rs.last){const r=P.combat.reactions.find(x=>x.id===rid);const row={id:uid(),revision:1,playerId:P.playerId,room:room(),encounter:book().encounter,round:Number(combatFlow().round),kind:'reaction',actionId:rid,label:r?.label||r?.name||rid,attack:rs.last.total,attackDetail:rs.last.detail,karma,stage:'pending',sentAt:0};book().records.push(row);save();send(row,true);renderStatus();}return out;
    });
    // The GM already pays attack/reaction costs during resolution. The summary sends
    // totals for reconciliation, never a second absolute health/karma proposal.
    wrap('crApplyRoundCosts',old=>function(){
      if(!connected())return old.apply(this,arguments);
      const c=combatFlow();if(c.resourcesApplied)return;
      if(records().some(r=>current(r)&&r.kind!=='costs'&&r.stage!=='applied')){alert('Attendez la validation des résultats par le MJ avant le bilan des consommations.');return;}
      const costs=crRoundCosts(),original=crRoundCosts;
      try{crRoundCosts=()=>({...costs,karma:0,effort:0,recoveries:0});old.apply(this,arguments);}finally{crRoundCosts=original;}
      if(!c.resourcesApplied)return;
      const r={id:uid(),revision:1,playerId:P.playerId,room:room(),encounter:book().encounter,round:Number(c.round),kind:'costs',label:'Bilan des consommations',costs:{karma:n(costs.karma),effort:n(costs.effort),recoveries:n(costs.recoveries)},stage:'pending',sentAt:0};book().records.push(r);save();send(r,true);renderStatus();
    });
    // Existing resource guards ask crRoundCosts for the amount still reserved.
    // Give them the unpaid portion only; leave the visible round summary intact.
    for(const name of ['refBeforeAttack','refKarmaReserved','crUseReaction'])wrap(name,old=>function(){
      if(!connected())return old.apply(this,arguments);
      const original=crRoundCosts;try{crRoundCosts=()=>{const c=original();return {...c,karma:Math.max(0,c.karma-n(book().paid?.karma))};};return old.apply(this,arguments);}finally{crRoundCosts=original;}
    });
    window.addEventListener('message',event=>{
      const d=event.data,r=d?.combatReceipt;if(!r||d.type!=='earthdawn-player-proposal-decisions'||d.playerId!==P.playerId||r.room!==room())return;
      const env=d.__earthdawnEnvelope;if(env&&(env.room!==room()||env.sender?.role!=='gm'))return;
      const local=find(r.id);if(!local||local.encounter!==r.encounter||local.round!==r.round||r.revision!==local.revision)return;
      const stamp=r.snapshot?.exchangeStamp,last=local.receiptStamp;
      if(last&&(!stamp||(stamp.stream===last.stream?n(stamp.seq)<=n(last.seq):n(stamp.started)<=n(last.started))))return;
      if(stamp)local.receiptStamp=copy(stamp);
      const wasApplied=local.stage==='applied';
      local.stage=['received','applied','review'].includes(r.stage)?r.stage:'pending';local.note=text(r.note);
      if(r.snapshot)applyCockpitSnapshot(r.snapshot);
      if(wasApplied&&local.stage!=='applied'&&current(local)){
        for(const e of crSeq())if(e.attackResult==null&&e.cxDefenseAdjustments?.[local.id]!=null){e.targetDN=Math.max(1,n(e.targetDN)-e.cxDefenseAdjustments[local.id]);delete e.cxDefenseAdjustments[local.id];}
        local.effectSeen=false;local.targetEffect=null;
      }
      if(r.target&&local.stage==='applied'&&!local.effectSeen){local.effectSeen=true;local.targetEffect=r.target;
        if(current(local))for(const e of crSeq())if(e.attackResult==null&&cleanName(e.target)===cleanName(r.target.name)&&Number(e.targetDN)>0){const a=crSelectedAction(e),kind=a?.spell?'magical':'physical',before=Number(e.targetDN);e.targetDN=Math.max(1,before+n(r.target.defenseDelta?.[kind]));e.cxDefenseAdjustments ||= {};e.cxDefenseAdjustments[local.id]=e.targetDN-before;}
      }
      save();renderStatus();
    });
    function renderStatus(){
      const host=document.getElementById('combatPhasePanel');if(!host)return;let box=document.getElementById('cxPlayerStatus');
      if(!box){box=document.createElement('section');box.id='cxPlayerStatus';box.className='cx-panel';host.prepend(box);}
      const rows=records().filter(r=>current(r)||r.stage==='review'||!terminal(r));
      box.innerHTML=connected()?`<b>Transmission des résultats</b><small>Le MJ confirme chaque conséquence avant le jet de l’action suivante. Vous pouvez utiliser vos propres dés.</small>${rows.map(r=>`<p><b>R${r.round} · ${html(r.label)}</b> — <span class="cx-stage cx-${r.stage}">${labels[r.stage]||'À vérifier'}</span>${r.note?'<small>'+html(r.note)+'</small>':''}${r.targetEffect?`<small>${html(r.targetEffect.name)} : ${r.targetEffect.prone?'À terre (−3 attaque, DP et DM)':'n’est pas à terre'}. ${r.targetEffect.proneChanged?'Vérifiez la difficulté de l’action suivante avec le MJ.':''}</small>`:''}</p>`).join('')}<button type="button" onclick="VorkanaCombatExchange.retry()">Vérifier / renvoyer les résultats en attente</button>`:records().some(r=>!terminal(r))?'<b>Des résultats restent en attente pour cette salle.</b><p>Ils seront renvoyés automatiquement à la reconnexion.</p>':'';
      if(!connected()&&rows.some(r=>r.stage==='review'))box.innerHTML='<b>Résultats à vérifier avec le MJ</b>'+rows.filter(r=>r.stage==='review').map(r=>`<p>R${r.round} · ${html(r.label)} — ${html(r.note)}</p>`).join('');
      box.hidden=!box.textContent;
      const e=crActiveEntry();if(connected()&&priorBlocked(e))box.insertAdjacentHTML('beforeend','<p class="cx-stage">Action suivante préparée : en attente des conséquences de la précédente.</p>');
    }
    wrap('renderCombatFlow',old=>function(){const out=old.apply(this,arguments);renderStatus();return out;});
    window.addEventListener('vorkana-room-changed',renderStatus);
    setInterval(()=>{for(const r of records())send(r);},10000);
    setTimeout(()=>{for(const r of records())send(r,true);renderStatus();},0);
  }
})();
