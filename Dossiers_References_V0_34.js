(function () {
  "use strict";
  if (!window.EarthdawnSync || typeof P === "undefined") return;

  const Sync = window.EarthdawnSync;
  const PLAYER_NAMES = { pj_0: "Zra’Ul", pj_1: "Kalha", pj_2: "Kal’Zakath", pj_3: "Barbak", pj_4: "Ogunta", pj_5: "Jaskar", pj_6: "Gul’Rak" };
  let presence = [];
  if (!Array.isArray(L.messages)) L.messages = [];

  const connectButton = document.getElementById("connectCockpit");
  if (connectButton) connectButton.remove();
  const portrait = document.querySelector(".identity-page .portrait img") || document.querySelector(".hero .portrait img");
  if (portrait) portrait.src = P.portrait;

  const style = document.createElement("style");
  style.textContent = `.zmsg-dock{border:1px solid #3f5b4b;border-left:4px solid var(--gm);border-radius:8px;background:#132019;color:#eee9dc;overflow:hidden}.zmsg-dock summary{cursor:pointer;padding:9px 10px;color:#dec99d;font-weight:800;list-style:none;display:flex;justify-content:space-between}.zmsg-dock summary::-webkit-details-marker{display:none}.zmsg-online{font-size:11px;color:#95c28f}.zmsg-presence{display:flex;gap:4px;flex-wrap:wrap;padding:0 8px 7px}.zmsg-member{padding:2px 6px;background:#203129;border-radius:99px;font-size:10px}.zmsg-member:before{content:'●';color:#78ad70;margin-right:4px}.zmsg-member.gm{border:1px solid var(--gm)}.zmsg-feed{height:170px;overflow:auto;padding:7px;background:#0e1713;display:flex;flex-direction:column;gap:5px}.zmsg-item{max-width:92%;padding:6px 7px;background:#203129;border-left:4px solid var(--player);border-radius:6px;font-size:11px}.zmsg-item.from-gm{border-left-color:var(--gm);background:#2a261c;color:#f1dfba}.zmsg-item.whisper{box-shadow:inset 0 -2px var(--specialization)}.zmsg-item.mine{align-self:flex-end}.zmsg-item small{display:block;color:#aeb7b1;margin-top:2px;font-size:9px}.zmsg-compose{display:grid;grid-template-columns:1fr auto;gap:5px;padding:7px}.zmsg-compose select{grid-column:1/-1}.zmsg-compose select,.zmsg-compose input{min-width:0;border:1px solid #4a6556;border-radius:5px;padding:6px;background:#0f1914;color:#f2eee3}.zmsg-compose button{border:1px solid #876b36;border-radius:5px;background:#745326;color:white;padding:6px 8px}.zra-situation{margin-bottom:14px;padding:12px 14px;border:1px solid #d8c8a9;border-left:5px solid var(--gm);border-radius:7px;background:#f3ead9}.zra-situation b{display:block;margin-bottom:5px}.zra-situation span{display:inline-block;margin:3px 5px 0 0;padding:3px 7px;border-radius:999px;background:#4f3a31;color:white;font-size:12px}@media(max-width:700px){.zmsg-feed{height:220px}}`;
  document.head.appendChild(style);

  const messageDock = document.getElementById("playerMessageDock");

  function syncState() { return Sync.status(); }
  renderCockpitStatus = function () {
    cockpitConnected = true;
    const st = syncState(), online = st.status === "online";
    const badge = document.getElementById("cockpitStatus"), mode = document.getElementById("playerModeStatus"), exportButton = document.getElementById("exportProposal");
    if (badge) { badge.className = `badge ${online ? "connected" : "waiting"}`; badge.textContent = online ? "Salle : synchronisée" : "Salle : mode local"; }
    if (mode) mode.textContent = `Salle ${st.room}`;
    if (exportButton) exportButton.textContent = "Transmettre les propositions au MJ";
  };
  playerPost = function (payload) { return Sync.sendToGM({ ...payload, playerId: P.playerId, protocolVersion: "1.2" }); };
  announcePlayerReady = function () { playerPost({ type: "earthdawn-player-ready", characterId: P.characterId, characterName: P.name, clientVersion: "0.34.1" }); };
  connectToCockpit = function () { cockpitConnected = true; renderCockpitStatus(); announcePlayerReady(); };

  function id() { return `reference-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
  function participantName(value) { return value === "gm" ? "MJ" : value === "all" ? "Tout le monde" : PLAYER_NAMES[value] || value || ""; }
  function dedupePresence(members) {
    const unique = new Map();
    (Array.isArray(members) ? members : []).forEach(member => {
      if (!member) return;
      const normalized = { ...member, name: member.name || participantName(member.playerId) || (member.role === "gm" ? "MJ" : "Invité") };
      const identity = normalized.playerId ? `player:${normalized.playerId}` : normalized.role === "gm" ? "role:gm" : `client:${normalized.clientId || normalized.name}`;
      const previous = unique.get(identity);
      if (!previous || Date.parse(normalized.onlineAt || 0) >= Date.parse(previous.onlineAt || 0)) unique.set(identity, normalized);
    });
    return [...unique.values()];
  }
  function addMessage(payload, mine) {
    if (!payload.messageId || L.messages.some(item => item.messageId === payload.messageId)) return;
    L.messages.push({ ...payload, mine: !!mine }); L.messages = L.messages.slice(-150); save(); renderMessages();
  }
  function recipientList() {
    const players = new Map(Object.entries(PLAYER_NAMES).filter(([id]) => id !== P.playerId));
    presence.filter(m => m.playerId && m.playerId !== P.playerId).forEach(m => players.set(m.playerId, m.name || m.playerId));
    return [["gm", "MJ"], ["all", "Tout le monde"], ...players.entries()];
  }
  function renderMessages() {
    if (!messageDock) return;
    const members = presence.length ? presence.map(m => `<div class="zmsg-member ${m.role === "gm" ? "gm" : "player"}">${esc(m.name || (m.role === "gm" ? "MJ" : m.playerId || "Invité"))}</div>`).join("") : `<p class="muted">Présences visibles après connexion.</p>`;
    const feed = L.messages.length ? L.messages.map(m => { const fromGm = m.fromId === "gm" || /^mj$/i.test(m.from || ""), targetLabel = m.toLabel || participantName(m.to); return `<div class="zmsg-item ${fromGm ? "from-gm" : "from-player"} ${m.mine ? "mine" : ""} ${m.whisper === false ? "" : "whisper"}"><b>${esc(m.from || "MJ")}</b>${targetLabel ? ` → ${esc(targetLabel)}` : ""}<div>${esc(m.text || "")}</div><small>${new Date(m.sentAt || Date.now()).toLocaleString("fr-FR")} • ${m.whisper === false ? "groupe" : "murmure visible MJ"}</small></div>`; }).join("") : `<p class="muted">Aucun message pour le moment.</p>`;
    messageDock.innerHTML = `<details class="zmsg-dock" open><summary><span>Messages</span><span class="zmsg-online">${presence.length} connecté${presence.length > 1 ? "s" : ""}</span></summary><div class="zmsg-presence">${members}</div><div class="zmsg-feed" id="zmsgFeed">${feed}</div><div class="zmsg-compose"><select id="zmsgTo">${recipientList().map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("")}</select><input id="zmsgText" placeholder="Votre message…"><button id="zmsgSend">Envoyer</button></div></details>`;
    const feedEl = document.getElementById("zmsgFeed"); if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;
    document.getElementById("zmsgSend").onclick = () => {
      const input = document.getElementById("zmsgText"), text = input.value.trim(); if (!text) return;
      const to = document.getElementById("zmsgTo").value, label = recipientList().find(x => x[0] === to)?.[1] || to;
      const payload = { type: "earthdawn-whisper", messageId: id(), sentAt: new Date().toISOString(), from: P.name, fromId: P.playerId, to, toLabel: label, text, whisper: to !== "all", visibility: "gm_and_recipients" };
      Sync.send(payload, { targets: to === "all" ? ["all"] : to === "gm" ? ["gm"] : [to, "gm"] }); addMessage(payload, true);
    };
  }
  function darknessLabel(value) {
    const rules = { partial: ["Obscurité partielle", -1, 25], consequent: ["Obscurité conséquente", -3, 50], total: ["Obscurité totale", -5, 75] }, rule = rules[value?.darkness];
    if (!rule) return "";
    let penalty = rule[1];
    if (value.visionSense === "other") penalty = null;
    else if (!value.darknessBypassesVision && (value.visionSense === "thermographic" || (value.visionSense === "night" && value.darkness !== "total"))) penalty = 0;
    const effect = penalty === null ? "effet visuel à arbitrer" : penalty === 0 ? "aucun malus visuel" : `${penalty} aux tests basés sur la vue`;
    return `${rule[0]} — ${effect} • déplacement possiblement réduit de ${rule[2]}% (MJ)`;
  }
  function conditionLabels(value) {
    if (!value || typeof value !== "object") return [];
    const labels = [];
    if (value.surprised) labels.push("Surpris");
    if (value.prone) labels.push("À terre");
    if (Number(value.harried) > 0) labels.push(`Harcelé ×${Number(value.harried)}`);
    if (value.cover === "partial") labels.push("Couvert partiel");
    if (value.cover === "substantial") labels.push("Couvert important");
    if (Number(value.actionMod)) labels.push(`Actions ${Number(value.actionMod) > 0 ? "+" : ""}${Number(value.actionMod)}`);
    if (Number(value.defenseMod)) labels.push(`Défenses ${Number(value.defenseMod) > 0 ? "+" : ""}${Number(value.defenseMod)}`);
    if (value.darkness && value.darkness !== "none") labels.push(darknessLabel(value));
    if (value.note) labels.push(String(value.note));
    return labels;
  }
  function renderSituationBanner(combat) {
    const combatPage = document.getElementById("page-combat"); if (!combatPage) return;
    let banner = document.getElementById("zraConnectedSituation");
    if (!banner) { banner = document.createElement("div"); banner.id = "zraConnectedSituation"; combatPage.prepend(banner); }
    const labels = conditionLabels(combat?.conditions);
    banner.className = "zra-situation";
    banner.innerHTML = `<b>${combat?.active ? `Situation attribuée par le MJ — round ${Number(combat.round) || 1}` : "Aucune situation de combat active"}</b>${labels.length ? labels.map(label => `<span>${esc(label)}</span>`).join("") : `<small>${combat?.active ? "Aucun modificateur initial particulier." : "Le dossier reste prêt à recevoir le prochain combat."}</small>`}`;
  }

  window.addEventListener("earthdawn-sync-status", renderCockpitStatus);
  window.addEventListener("earthdawn-sync-presence", event => { presence = dedupePresence(event.detail.members); renderMessages(); });
  window.addEventListener("earthdawn-sync-message", event => { const d = event.detail.payload || {}; if (d.type === "earthdawn-whisper") addMessage(d, false); if (d.type === "earthdawn-cockpit-state" || d.type === "earthdawn-cockpit-hello") renderSituationBanner(d.combat); });
  Sync.configure({ role: "player", playerId: P.playerId, name: P.name }).start();
  presence = dedupePresence(Sync.status().presence);
  renderMessages(); renderSituationBanner(null); renderCockpitStatus(); announcePlayerReady();
  setInterval(() => { cockpitConnected = true; playerPost({ type: "earthdawn-player-ping" }); renderCockpitStatus(); }, 10000);
})();

// This adapter is intentionally loaded only by the four newly harmonised dossiers.
const REF=P.referenceConfig;
const refOriginal={add:crAddMechanical,move:crAddMovement,attack:crRollAttack,manual:crSetManualAttack,editor:crMechanicalEditor,planEditor:crPlanEntryEditor,render:renderCombatFlow,resolution:crRenderResolution,costs:crApplyRoundCosts,initiative:crRenderInitiative,setInitiative:crSetInitiative,setEntry:crSetEntry,showResult:ncShowResult,manualNC:ncManualEvaluate,autoNC:ncAutoRoll,gearLoad:gearRenderLoad};
function refPositive(v){return String(v??'').trim()!==''&&Number.isFinite(Number(v))&&Number(v)>=1;}
function refPropose(label,note,meta={}){const p={id:crUid('reference'),kind:'note',domain:'character',label,note,why:note,meta,status:'sent',createdAt:new Date().toISOString()};L.proposals.push(p);save();sendProposalBundleToCockpit(false);return p;}
function refRecoveryAvailable(){return Math.max(0,P.combat.recovery.maxPerDay-(Number(L.draft.recoveriesUsed)||0)-crSeq().filter(e=>e.attackResult!=null&&crSelectedAction(e)?.recoveryCost&&!combatFlow().resourcesApplied).length);}
function refFirstFor(a){return crSeq().find(e=>{const w=crSelectedAction(e);return w?.weapon&&(a?.repeat==='bow'?w.ammo==='arrows':!w.ranged)});}
crFirstWeaponEntry=function(){return crSeq().find(e=>crSelectedAction(e)?.weapon);};
crWeaponFor=function(a){return a?.repeat?crSelectedAction(refFirstFor(a)):a;};
crSecondReady=function(e,executing=false){const a=crSelectedAction(e);if(!a?.repeat)return true;const first=refFirstFor(a);return !!first&&crSeq().indexOf(first)<crSeq().indexOf(e)&&(!executing||first.attackResult!=null);};
crBudget=function(){const reactionSlots=P.combat.reactions.reduce((n,r)=>n+(r.actionCost||0)*(crReactionState().uses[r.id]||0),0),used=crSeq().length+reactionSlots,capacity=CR_ACTION_CAPACITY();return {used,capacity,remaining:Math.max(0,capacity-used),over:used>capacity};};
crAddMechanical=function(id){
 const a=P.combat.actions.find(x=>x.id===id);if(!a)return;
 if((a.repeat||id==='kick')&&crSeq().some(e=>e.actionId===id)){alert('Cette action supplémentaire est limitée à une fois par round.');return;}
 if(a.repeat&&!refFirstFor(a)){alert(a.repeat==='bow'?'Prévoir d’abord un tir avec l’arc.':'Prévoir d’abord une attaque de mêlée avec l’arme.');return;}
 if(a.spell&&!refSpellReady(a,false))return;
 if(a.recoveryCost&&refRecoveryAvailable()<1){alert('Aucun test de récupération disponible pour Peau de bois.');return;}
 const count=crSeq().length;
 if(id==='sprint'&&crHasRun()){
  if(!crRequireEditablePlan()||!crCanAddSlot('sprint'))return;
  if(crSeq().some(e=>e.actionId==='sprint')){alert('Un seul Sprint pour ce déplacement.');return;}
  const e={id:crUid('mech'),kind:'mechanical',actionId:id,actionClass:'simple',label:a.label,target:'Déplacement',targetDN:1,targetArmor:0,levelMod:0,useKarma:false,attackResult:null,damageResult:null,status:'planned'};crSeq().push(e);combatFlow().economy.activeId=e.id;crTouchPlan();
 }else refOriginal.add(id);
 if(crSeq().length>count){const e=crActiveEntry();if(a.spell){const s=refSpell(a.spell);e.targetDN=a.stage==='weave'?s.weave:(s.castDN||9);}save();renderCombatFlow();}
};
crAddMovement=function(mode='combat'){if(mode==='run'&&crSeq().some(e=>e.kind!=='movement'&&e.actionId!=='sprint')){alert('La course doit rester seule, éventuellement accompagnée de Sprint.');return;}if(mode==='run'&&crSeq().some(e=>e.actionId==='sprint')&&!crSeq().some(e=>e.kind==='movement')){if(!crRequireEditablePlan()||!crCanAddSlot('movement'))return;crSeq().push({id:crUid('move'),kind:'movement',label:'Course',mode:'run',meters:P.combat.movement.run,status:'planned'});crTouchPlan();save();renderCombatFlow();return;}refOriginal.move(mode);};
refReactionSummary=function(){return P.combat.reactions.map(r=>r.label+' : niveau '+r.step+' / '+r.dice+', '+(r.usesPerRound==null?'selon besoin':r.usesPerRound+' utilisations')+(r.actionCost?' • action simple':' • hors plafond d’actions')).join(' ; ');};
function refAttackOptions(e,a){
 if(!e||!a)return '';
 const w=crWeaponFor(a),locked=e.attackResult!=null||combatFlow().resourcesApplied;
 let out='';
 if(REF.id==='kalzakath'&&w?.ranged)out+=`<div class="cr-note sem-magic"><label><input type="checkbox" ${e.eye?'checked':''} ${locked?'disabled':''} onchange="refSetAttackFlag('eye',this.checked)"> Œil de Dragon : +2 au niveau d’attaque, +1 aux dommages</label><small>Bonus appliqué une seule fois. Les 2 dommages permanents sont déjà compris dans les seuils.</small></div>`;
 if(REF.id==='kalzakath'&&w?.ammo==='arrows')out+=`<div class="cr-field"><label>Carquois : ${Number(L.draft.arrows)||0} ordinaires • ${Number(L.draft.sisterArrows)||0} de sœur</label><select ${locked?'disabled':''} onchange="refSetAttackFlag('projectile',this.value)"><option value="normal" ${e.projectile!=='sister'?'selected':''}>Flèche ordinaire</option><option value="sister" ${e.projectile==='sister'?'selected':''}>Flèche de sœur — aucun bonus présumé</option></select></div>`;
 if(REF.critical&&a.damageDice)out+=`<div class="cr-note sem-skill"><label><input type="checkbox" ${e.critical?'checked':''} ${!refCriticalReady(e)||e.damageResult!=null||combatFlow().resourcesApplied?'disabled':''} onchange="refSetAttackFlag('critical',this.checked)"> Attaque critique : +${REF.critical} niveaux aux dommages, Effort 1</label><small>Excellent ou mieux requis ; compétence sans Karma.</small></div>`;
 if(a.id==='kick')out+=`<div class="cr-field"><label><input type="checkbox" ${e.kickAllowed?'checked':''} ${locked?'disabled':''} onchange="refSetAttackFlag('kickAllowed',this.checked)"> Initiative supérieure à la cible et jambe libre, vérifiées avec le MJ</label></div>`;
 return out;
}
function refSetAttackFlag(k,v){const e=crActiveEntry();if(!e||combatFlow().resourcesApplied)return;if(k==='critical'){if(!refCriticalReady(e)||e.damageResult!=null)return;}else if(e.attackResult!=null)return;e[k]=v;save();renderCombatFlow();}
function refCriticalReady(e){const d=crDegree(e);return !!d&&['excellent','extraordinary','extra'].includes(d.key)||!!d&&/Excellent|Extraordinaire/.test(d.label);}
crAttackStepInfo=function(a=crSelectedAction(),e=crActiveEntry()){if(!a||!e)return null;const w=crWeaponFor(a),baseStep=Number(a.attackStep),eye=REF.id==='kalzakath'&&w?.ranged&&e.eye?2:0,wound=-healthActionPenalty(),situational=Math.trunc(Number(e.levelMod)||0)+eye,final=edStepSpec(Math.max(1,baseStep+wound+situational));return {baseStep,wound,situational,final};};
crDamageProfile=function(a=crSelectedAction(),e=crActiveEntry()){const w=crWeaponFor(a);if(!w?.damageDice)return {step:null,dice:null,label:'—',reinforced:false};const eye=REF.id==='kalzakath'&&w.ranged&&e?.eye?1:0,critical=REF.critical&&e?.critical&&refCriticalReady(e)?REF.critical:0,step=w.damageStep+eye+critical,dice=edStepDiceLabel(edStepSpec(step));return {step,dice,label:'Niveau '+step+' / '+dice+(eye?' • Œil +1':'')+(critical?' • critique +'+critical:''),reinforced:false};};
function refAmmoCosts(){const out={arrows:0,sisterArrows:0,daggersThrown:0};for(const e of crSeq()){if(e.attackResult==null)continue;const w=crWeaponFor(crSelectedAction(e));if(w?.ammo==='arrows')out[e.projectile==='sister'?'sisterArrows':'arrows']++;if(w?.ammo==='daggers')out.daggersThrown++;}return out;}
function refBeforeAttack(){
 const e=crActiveEntry(),a=crSelectedAction(e),c=combatFlow();if(!e||!a||!c.active||c.resourcesApplied||e.attackResult!=null)return false;
 if(!crSecondReady(e,true)){alert('Résoudre d’abord la première attaque avec la même arme.');return false;}
 if(a.id==='kick'&&!e.kickAllowed){alert('Vérifier l’initiative supérieure et la jambe libre.');return false;}
 if(a.spell&&!refSpellReady(a,true))return false;
 if(a.recoveryCost&&refRecoveryAvailable()<1){alert('Aucun test de récupération disponible.');return false;}
 if(crAttackKarma(a,e)&&Number(L.draft.karma)<=crRoundCosts().karma){alert('Karma insuffisant après les utilisations déjà effectuées.');return false;}
 const w=crWeaponFor(a),ammo=refAmmoCosts();
 if(w?.ammo==='arrows'){const key=e.projectile==='sister'?'sisterArrows':'arrows';if((Number(L.draft[key])||0)<=ammo[key]){alert('Aucune flèche disponible dans ce stock.');return false;}}
 if(w?.ammo==='daggers'&&(Number(L.draft.daggersAvailable)||0)<=ammo.daggersThrown){alert('Aucune dague de jet disponible.');return false;}
 return true;
}
function refAfterAttack(){const e=crActiveEntry(),a=crSelectedAction(e);if(e.attackResult==null)return;e.usedKarma=crAttackKarma(a,e);if(a.spell)refRecordSpell(e,a);if(a.id==='sprint'){const move=crSeq().find(x=>x.kind==='movement');e.effectNote='Bonus de déplacement : '+e.attackResult+' m, doublé en course.';if(move){move.sprintBase=move.sprintBase??move.meters;move.meters=move.sprintBase+e.attackResult*(move.mode==='run'?2:1);}}if(a.id==='wood')refPropose('Peau de bois',`Résultat ${e.attackResult} : bonus temporaire aux deux seuils pendant 4 heures, à valider par le MJ. Un Karma et une récupération sont réservés dans le résumé du round.`,{result:e.attackResult,hours:4});save();renderCombatFlow();}
crRollAttack=function(){if(!refBeforeAttack())return;refOriginal.attack();refAfterAttack();};
crSetManualAttack=function(v){if(!refPositive(v)){alert('Saisir un résultat de dés valide.');return;}if(!refBeforeAttack())return;refOriginal.manual(v);refAfterAttack();};
crSetEntry=function(id,k,v){const e=crEntry(id);if(e?.attackResult!=null&&['useKarma','projectile','levelMod','targetDN','target'].includes(k)){alert('Le test a déjà été enregistré ; ne pas modifier rétroactivement ses coûts ou son résultat.');return;}refOriginal.setEntry(id,k,v);};window.crSetEntry=crSetEntry;
crMechanicalEditor=function(e){const a=crSelectedAction(e);let html=refOriginal.editor(e);html=html.replace('undefined','');if(a.stage==='hold')html='<div class="cr-note"><label><input type="checkbox" id="painHoldConfirmed"> Douleur encore actif, durée et concentration confirmées avec le MJ</label></div>'+html.replace('Défense / difficulté','Résultat de Volonté adverse');return refAttackOptions(e,a)+(a.spell?refSpellHint(a.spell):'')+html;};
crPlanEntryEditor=function(){const e=crActiveEntry(),a=crSelectedAction(e);return refAttackOptions(e,a)+refOriginal.planEditor();};
crRoundCosts=function(){
 const ammo=refAmmoCosts();let karma=0,effort=0,recoveries=0;
 for(const e of crSeq()){if(e.attackResult==null)continue;const a=crSelectedAction(e);if(!a)continue;if(e.usedKarma??crAttackKarma(a,e))karma++;effort+=Number(a.effort)||0;if(e.critical&&e.damageResult!=null&&refCriticalReady(e))effort++;recoveries+=a.recoveryCost||0;}
 const rs=crReactionState();effort+=P.combat.reactions.reduce((n,r)=>n+(rs.uses[r.id]||0)*r.effort,0);karma+=rs.karmaUsed||0;
 if(combatFlow().initiative!=null&&combatFlow().airDance)effort++;
 return {...ammo,karma,effort,recoveries,specialProjectile:0};
};
crApplyRoundCosts=function(){
 const c=combatFlow();if(c.resourcesApplied)return;const x=crRoundCosts();
 if(x.karma>Number(L.draft.karma)||x.recoveries>P.combat.recovery.maxPerDay-Number(L.draft.recoveriesUsed||0)){alert('Les ressources ont changé ; vérifier les consommations avec le MJ.');return;}
 refOriginal.costs();
 if(x.recoveries)mutate('recoveriesUsed',x.recoveries,'Peau de bois — récupération consacrée',0,P.combat.recovery.maxPerDay);
 if(x.sisterArrows){L.draft.sisterArrows=Math.max(0,L.draft.sisterArrows-x.sisterArrows);refPropose('Flèches de sœur utilisées',x.sisterArrows+' flèche(s) tirée(s), y compris les tirs manqués. Récupération à confirmer.',{quantity:x.sisterArrows,stock:L.draft.sisterArrows});}
 if(x.daggersThrown){L.draft.daggersAvailable=Math.max(0,L.draft.daggersAvailable-x.daggersThrown);refPropose('Dagues de jet à récupérer',x.daggersThrown+' dague(s) lancée(s). Elles ne sont pas détruites ; retour en inventaire à confirmer.',{quantity:x.daggersThrown});}
 save();renderCombatFlow();
};
crQuickStateHtml=function(){const b=crBudget(),d=P.combat.defenses;return [['Actions',b.used+' / '+b.capacity],['Défense physique',d.physical],['Défense magique',d.magical]].map(([k,v])=>`<div><small>${k}</small><b>${v}</b></div>`).join('');};
crUseReaction=function(id,v=null){
 const c=combatFlow(),state=crReactionState(),r=P.combat.reactions.find(x=>x.id===id);if(!r||!c.active||c.resourcesApplied)return;
 if(r.usesPerRound!=null&&(state.uses[id]||0)>=r.usesPerRound)return;
 if(r.actionCost&&(crBudget().remaining<r.actionCost||crHasRun())){alert('L’Esquive par compétence demande une action simple disponible.');return;}
 if(id==='anticipation'&&!document.getElementById('anticipationAllowed')?.checked){alert('Vérifier une initiative supérieure à la cible, différente des adversaires déjà anticipés.');return;}
 if(v!==null&&!refPositive(v)){alert('Saisir un résultat de dés valide.');return;}
 const karma=r.karma==='optional'&&!!document.getElementById('reactionKarma_'+id)?.checked;
 if(karma&&Number(L.draft.karma)<=crRoundCosts().karma){alert('Karma insuffisant.');return;}
 const step=Math.max(1,r.step-healthActionPenalty()),roll=v===null?edRollStep(step,karma?P.combat.karma.dice:''):{total:Number(v),detail:'Dés lancés à la table'};
 state.uses[id]=(state.uses[id]||0)+1;state.karmaUsed=(state.karmaUsed||0)+(karma?1:0);state.last={total:roll.total,detail:roll.detail,label:r.label};c.log.push(r.label+' : '+roll.total+(karma?' avec Karma':''));save();renderCombatFlow();
};
crReactionCards=function(){const s=crReactionState(),c=combatFlow();return P.combat.reactions.map(r=>{const remains=r.usesPerRound==null?'selon besoin':Math.max(0,r.usesPerRound-(s.uses[r.id]||0))+'/'+r.usesPerRound;const disabled=c.resourcesApplied||(r.usesPerRound!=null&&(s.uses[r.id]||0)>=r.usesPerRound);return `<div class="cr-action-preview"><b class="${r.actionCost?'sem-skill':'sem-t'}">${esc(r.label)}${r.actionCost?' — compétence':''}</b><small>Niveau ${Math.max(1,r.step-healthActionPenalty())} • ${remains} • Effort ${r.effort}</small><p class="cr-note">${esc(ARCHER_TALENT_EFFECTS[r.label])}</p>${r.karma==='optional'?`<label><input id="reactionKarma_${r.id}" type="checkbox"> Karma +${P.combat.karma.dice}</label>`:''}${r.id==='anticipation'?'<label><input id="anticipationAllowed" type="checkbox"> Initiative supérieure et nouvel adversaire vérifiés</label>':''}<div class="cr-actions"><button class="cr-btn" ${disabled?'disabled':''} onclick="crUseReaction('${r.id}')">🎲 Lancer</button></div><div class="cr-field"><label>Ou résultat de vos dés</label><input type="number" min="1" id="reactionManual_${r.id}"><button class="cr-btn" ${disabled?'disabled':''} onclick="crUseReaction('${r.id}',document.getElementById('reactionManual_${r.id}').value)">Enregistrer</button></div></div>`;}).join('')+(s.last?`<div class="cr-roll-box"><strong>${s.last.total}</strong> — ${esc(s.last.label)}<p>${esc(s.last.detail)}</p></div>`:'');};
if(REF.id==='barbak')P.combat.reactions.find(r=>r.id==='balance').usesPerRound=null;
function refSetAirDance(v){const c=combatFlow();if(c.initiative!=null)return;c.airDance=!!v;save();renderCombatFlow();}
function refInitStep(){return REF.id==='barbak'&&combatFlow().airDance?8:P.combat.initiative.step;}
function refCheckInitiative(){if(REF.id==='barbak'&&combatFlow().airDance&&!crSeq().some(e=>e.kind==='movement'&&e.mode!=='run')){alert('Danse des airs exige un déplacement de combat dans le plan.');return false;}return true;}
crRollInitiative=function(){if(!refCheckInitiative())return;const c=combatFlow();if(c.initiative!=null)return;const r=edRollStep(refInitStep());c.initiative=r.total;c.planLocked=true;c.log.push('Initiative '+r.total+' — '+r.detail+(c.airDance?' • Danse des airs, Effort 1':''));save();renderCombatFlow();playerPost({type:'earthdawn-player-initiative',round:c.round,initiative:r.total});};
crSetInitiative=function(v){if(!refPositive(v)||!refCheckInitiative())return;refOriginal.setInitiative(v);};
crRenderInitiative=function(){let html=refOriginal.initiative();if(REF.id==='barbak'){const c=combatFlow(),step=refInitStep();html=html.replace('<div class="cr-stat-grid">',`<div class="cr-note"><label><input type="checkbox" ${c.airDance?'checked':''} ${c.initiative!=null?'disabled':''} onchange="refSetAirDance(this.checked)"> Danse des airs — niveau 8 / 2D6, Effort 1</label><p>${esc(ARCHER_TALENT_EFFECTS['Danse des airs'])}</p></div><div class="cr-stat-grid">`).replace('<span>Niveau</span><b>4</b>','<span>Niveau</span><b>'+step+'</b>').replaceAll('D6</b>',edStepDiceLabel(edStepSpec(step))+'</b>').replace('Lancer D6','Lancer '+edStepDiceLabel(edStepSpec(step)));}return html;};

// Non-combat tests share the reference launcher and propose their genuine resource costs.
let refNCPending=null;
function refKarmaReserved(){return combatFlow().active&&!combatFlow().resourcesApplied?crRoundCosts().karma:0;}
function refCanNC(){const a=ncCurrentAction(),karma=a.karma==='required'||a.karma==='optional'&&document.getElementById('ncUseKarma')?.checked;if(karma&&Number(L.draft.karma)<=refKarmaReserved()){alert('Karma insuffisant.');return false;}if(a.recoveryCost&&refRecoveryAvailable()<1){alert('Aucun test de récupération disponible.');return false;}return true;}
ncShowResult=function(total,allOnes,detail){refOriginal.showResult(total,allOnes,detail);const a=ncCurrentAction(),karma=a.karma==='required'||a.karma==='optional'&&!!document.getElementById('ncUseKarma')?.checked;refNCPending={id:crUid('test'),label:a.label,total,karma:karma?1:0,effort:a.effort||0,recovery:a.recoveryCost||0,done:false};const host=document.getElementById('ncResult');host.insertAdjacentHTML('beforeend',`<div class="cr-actions"><button class="cr-btn" onclick="refConfirmNC()">Transmettre ce test au MJ${karma||a.effort||a.recoveryCost?' et préparer ses coûts':''}</button></div>`);};
ncAutoRoll=function(){if(refCanNC())refOriginal.autoNC();};
ncManualEvaluate=function(){if(!refPositive(document.getElementById('ncManualResult')?.value)){alert('Saisir le résultat des dés avant de l’évaluer.');return;}if(refCanNC())refOriginal.manualNC();};
document.getElementById('ncAutoRoll')?.removeEventListener('click',refOriginal.autoNC);
document.getElementById('ncAutoRoll')?.addEventListener('click',ncAutoRoll);
document.getElementById('ncEvaluateManual')?.removeEventListener('click',refOriginal.manualNC);
document.getElementById('ncEvaluateManual')?.addEventListener('click',ncManualEvaluate);
function refConfirmNC(){const x=refNCPending;if(!x||x.done)return;if(x.karma>Number(L.draft.karma)-refKarmaReserved()||x.recovery>refRecoveryAvailable()){alert('Ressources insuffisantes.');return;}x.done=true;if(x.karma)mutate('karma',-x.karma,x.label+' — Karma',0,40);if(x.effort)mutate('damage',x.effort,x.label+' — Effort',0,999);if(x.recovery)mutate('recoveriesUsed',x.recovery,x.label+' — récupération consacrée',0,P.combat.recovery.maxPerDay);refPropose(x.label+' — '+x.total,x.label==='Peau de bois'?`Proposition : +${x.total} aux deux seuils pendant 4 heures, sans soins ni armure supplémentaire.`:'Résultat transmis ; effets à valider par le MJ.',x);document.getElementById('ncResult')?.insertAdjacentHTML('beforeend','<p>Test transmis. Coûts préparés une seule fois.</p>');save();renderHealthState();}

// Magic: separate prepared matrices, weaving, casting and effects, including manual dice.
function refMagic(){
 if(!L.referenceMagic)L.referenceMagic={woven:{},effects:[],log:[]};
 const m=L.referenceMagic;m.weaveRound=m.weaveRound||{};
 const c=combatFlow();
 if(c.active)for(const [id,round] of Object.entries(m.weaveRound))if(c.round>round+1){m.woven[id]=0;delete m.weaveRound[id];}
 return m;
}
function refSpell(id){return REF.spells.find(s=>s.id===id);}
function refPrepared(s){return !!P.matrices?.some(m=>m.spell===s.name&&m.rank>=s.circle);}
function refSpellHint(id){const s=refSpell(id);return s?`<div class="cr-note sem-thread"><b>${esc(s.name)}</b> • Cercle ${s.circle} • ${s.threads} filament(s) • ${esc(s.range)} • ${s.duration}<p>${esc(s.text)}</p></div>`:'';}
function refSpellReady(a,executing){
 const s=refSpell(a.spell),m=refMagic(),c=combatFlow();
 if(a.stage==='hold'){const active=m.effects.findLast(e=>e.spell===a.spell&&!e.finished);if(!active||active.round===c.round){alert('Maintenir Douleur demande un lancement réussi lors d’un round précédent.');return false;}if(executing&&!document.getElementById('painHoldConfirmed')?.checked){alert('Confirmer que Douleur est encore actif et que la concentration est maintenue.');return false;}return true;}
 if(!s||!refPrepared(s)){alert('Ce sort est connu mais n’est pas dans une matrice préparée. Proposer sa préparation au MJ dans le Grimoire.');return false;}
 if(a.stage==='cast'&&(m.woven[s.id]||0)<s.threads){alert('Tisser d’abord les '+s.threads+' filament(s) de ce sort.');return false;}
 if(a.stage==='cast'&&s.threads&&c.active&&m.weaveRound[s.id]===c.round){alert('Le tissage est terminé ; lancer le sort au round suivant.');return false;}
 if(a.stage==='weave'&&(m.woven[s.id]||0)>=s.threads){alert('Les filaments requis sont prêts ; choisir Lancer.');return false;}
 return true;
}
function refWeaveGain(s,degree){return degree?.success?Math.min(s.threads-(refMagic().woven[s.id]||0),/Excellent|Extraordinaire/.test(degree.label)||['excellent','extraordinary','extra'].includes(degree.key)?2:1):0;}
function refRecordSpell(e,a){
 const m=refMagic(),s=refSpell(a.spell),d=crDegree(e);let gain=0;
 if(a.stage==='weave'){
  for(const id of Object.keys(m.woven))if(id!==s.id)m.woven[id]=0;
  gain=refWeaveGain(s,d);m.woven[s.id]=(m.woven[s.id]||0)+gain;m.weaveRound[s.id]=combatFlow().round;
 }
 if(a.stage==='cast'){m.woven[s.id]=0;delete m.weaveRound[s.id];if(d?.success)m.effects.push({id:e.id,spell:s.id,round:combatFlow().round,target:e.target,createdAt:new Date().toISOString(),result:null,detail:''});}
 if(a.stage==='hold')refPropose('Douleur — concentration',`Volonté ${e.attackResult} contre ${e.targetDN} : ${d?.success?'réussite':'échec'}. Pas de dommages ; le MJ applique les restrictions d’action.`,{round:combatFlow().round});
 m.log.push({spell:s.id,stage:a.stage,result:e.attackResult,success:!!d?.success,gain,round:combatFlow().round});
}
function refSpellEffect(entryId,v=null){const m=refMagic(),e=m.effects.find(e=>e.id===entryId),s=e&&refSpell(e.spell);if(!e||e.finished||!s?.effectStep||e.result!=null)return;if(v!==null&&!refPositive(v)){alert('Saisir le résultat des dés.');return;}const r=v===null?edRollStep(Math.max(1,s.effectStep-healthActionPenalty())):{total:Number(v),detail:'Dés lancés à la table'};e.result=r.total;e.detail=r.detail;refPropose(s.name+' — effet '+r.total,s.text+' Cible : '+(e.target||'à préciser')+'. Le MJ applique les conséquences.',{spell:s.id,result:r.total,damage:!!s.damage});save();renderCombatFlow();refRenderSpellBook();}
function refSpellEffectHTML(e,context='combat'){const s=refSpell(e.spell);if(s.id==='mist')return '<div class="cr-card"><h3>Bouclier de brume actif</h3>'+refSpellHint(s.id)+'<p>Le jet d’effet se fait contre chaque attaque dans le Grimoire, sous « Réactions et entretien », pas à la création du bouclier.</p></div>';return `<div class="cr-card"><h3>${esc(s.name)} — effet</h3>${refSpellHint(s.id)}${s.effectStep?`<p>Niveau ${Math.max(1,s.effectStep-healthActionPenalty())} / ${edStepDiceLabel(edStepSpec(Math.max(1,s.effectStep-healthActionPenalty())))}, ${s.damage?'dommages mystiques':'effet, pas des dommages'}.</p><div class="cr-actions"><button class="cr-btn" ${e.result!=null||e.finished?'disabled':''} onclick="refSpellEffect('${e.id}')">🎲 Lancer l’effet</button></div><div class="cr-field"><label>Ou résultat de vos dés</label><input id="${context}_effect_${e.id}" type="number" min="1"><button class="cr-btn" ${e.result!=null||e.finished?'disabled':''} onclick="refSpellEffect('${e.id}',document.getElementById('${context}_effect_${e.id}').value)">Transmettre</button></div>${e.result!=null?'<p><strong>'+e.result+'</strong> — '+esc(e.detail)+' • transmis au MJ</p>':''}`:'<p>Le cercle est créé. La répulsion d’un intrus demande un nouveau test d’Incantation contre sa Défense magique, puis Volonté +5 en dommages mystiques. Utiliser le suivi du Grimoire avec le MJ.</p>'}</div>`;}
crRenderResolution=function(){const e=crActiveEntry(),a=crSelectedAction(e);let html=refOriginal.resolution();if(a?.spell){const effect=refMagic().effects.find(x=>x.id===e.id);html=refSpellHint(a.spell)+html+(effect?refSpellEffectHTML(effect):'');}return html;};
function refProposeMatrix(index,spellId){const s=refSpell(spellId),m=P.matrices?.[index];if(!s||!m||s.circle>m.rank)return;refPropose('Préparation de matrice',`Matrice ${index+1}, rang ${m.rank} : remplacer ${m.spell} par ${s.name}. À confirmer avec le MJ, selon le temps et les règles de réharmonisation.`,{matrix:index,spell:s.name,requiresGM:true});alert('Préparation proposée au MJ. La matrice active reste inchangée tant que ce changement n’est pas confirmé.');}
function refConfirmMatrix(index,spellId){const s=refSpell(spellId),m=P.matrices?.[index];if(!s||!m||s.circle>m.rank)return;if(!confirm('Le MJ a-t-il confirmé cette réharmonisation et ses conditions ?'))return;m.spell=s.name;L.referenceMatrices=clone(P.matrices);refMagic().woven={};save();refPropose('Matrice confirmée en séance','Matrice '+(index+1)+' : '+s.name,{matrix:index,spell:s.name});refRenderSpellBook();renderCombatFlow();}
function refOutSpell(id,stage,v=null){
 if(combatFlow().active){alert('En combat, utiliser le plan du round pour respecter les actions disponibles.');return;}
 if(!['weave','cast'].includes(stage))return;
 const s=refSpell(id),a={spell:id,stage};if(!refSpellReady(a,true))return;if(v!==null&&!refPositive(v)){alert('Saisir le résultat des dés.');return;}
 const entered=Number(document.getElementById('spellDN_'+id)?.value),dn=stage==='weave'?s.weave:Math.max(6,entered);if(stage==='cast'&&!refPositive(entered)){alert('Indiquer la Défense magique ou la difficulté donnée par le MJ.');return;}
 const karma=!!document.getElementById('spellKarma_'+id)?.checked;if(karma&&Number(L.draft.karma)<1){alert('Karma insuffisant.');return;}
 const step=grTalentStep(stage==='weave'?'Tissage de filament (Nécromancie)':'Incantation');
 const r=v===null?edRollStep(step,karma?P.combat.karma.dice:''):{total:Number(v),detail:'Dés lancés à la table',allOnes:!!document.getElementById('spellOnes_'+id)?.checked},degree=ncDegree(dn,r.total,r.allOnes),success=degree.success,m=refMagic();let gain=0;
 if(karma)mutate('karma',-1,s.name+' — '+stage,0,40);
 if(stage==='weave'){for(const other of Object.keys(m.woven))if(other!==id)m.woven[other]=0;gain=refWeaveGain(s,degree);m.woven[id]=(m.woven[id]||0)+gain;delete m.weaveRound[id];}
 if(stage==='cast'){m.woven[id]=0;if(success)m.effects.push({id:crUid('spell'),spell:id,round:0,target:document.getElementById('spellTarget_'+id)?.value.trim()||'Hors combat',result:null,detail:''});}
 m.log.push({spell:id,stage,result:r.total,success,gain,round:0});refPropose(s.name+' — '+(stage==='weave'?'Tissage':'Incantation')+' '+r.total,(success?'Réussite':'Échec')+' contre '+dn+' • '+r.detail,{spell:id,stage,result:r.total,difficulty:dn,gain});
 const input=document.getElementById('spellManual_'+id);if(input)input.value='';
 save();refRenderSpellBook();renderHealthState();
}
function refFollowSpell(spellId,kind,v=null){
 const m=refMagic(),active=m.effects.findLast(e=>e.spell===spellId&&!e.finished);if(!active){alert('Aucun effet actif de ce sort enregistré.');return;}
 if(kind==='pain'&&combatFlow().active){alert('En combat, choisir « Maintenir Douleur » dans le plan du round : la concentration utilise l’action ordinaire.');return;}
 if(!document.getElementById('followConfirmed')?.checked){alert('Confirmer avec le MJ la durée restante, les conditions et, pour Douleur, la concentration.');return;}
 if(v!==null&&!refPositive(v)){alert('Saisir un résultat valide.');return;}
 const key=combatFlow().active?'R'+combatFlow().round:document.getElementById('followRound')?.value.trim();if(!key){alert('Indiquer le round ou repère temporel du suivi.');return;}
 m.follow=m.follow||{};const prefix=active.id+'_'+key+'_'+kind,shieldCount=Object.keys(m.follow).filter(k=>k.startsWith(prefix+'_')).length,usedKey=kind==='shield'?prefix+'_'+(shieldCount+1):prefix;
 if(m.follow[usedKey]||(kind==='shield'&&shieldCount>=4)){alert(kind==='shield'?'Quatre défenses de brume déjà effectuées ce round.':'Ce test a déjà été enregistré pour ce repère.');return;}
 if(kind==='repelDamage'&&!m.follow[active.id+'_'+key+'_repel']?.success){alert('Réussir d’abord l’Incantation contre l’intrus.');return;}
 const step=kind==='repel'?11:kind==='repelDamage'?11:kind==='shield'?12:6;
 const r=v===null?edRollStep(Math.max(1,step-healthActionPenalty())):{total:Number(v),detail:'Dés lancés à la table'};
 const dn=Number(document.getElementById('followDN')?.value);if(kind!=='repelDamage'&&!refPositive(dn)){alert('Indiquer le résultat adverse / la Défense à dépasser.');return;}
 const result={...r,success:kind==='repelDamage'||ncDegree(dn,r.total,r.allOnes).success};m.follow[usedKey]=result;
 refPropose(refSpell(spellId).name+' — suivi '+r.total,(kind==='repelDamage'?'Dommages mystiques':kind==='pain'?'Volonté opposée, sans dommages':kind==='shield'?'Défense par brume':'Incantation de répulsion')+' • '+key+' • '+(result.success?'réussite':'échec')+'. Conséquences appliquées par le MJ.',{spell:spellId,kind,...result});save();document.getElementById('followResult').textContent=r.total+' — '+(result.success?'réussite':'échec')+' ; transmis au MJ';
}
function refRenderSpellBook(){if(REF.id==='ogunta')grRender();}

// Equipment and companions use the same page and visual vocabulary as the reference.
gearBodyLegend=function(mode){return mode==='armor'?P.combat.armor.label+' • physique '+P.combat.armor.physical+' / mystique '+P.combat.armor.mystical:'Répartition préparée de l’équipement connu. Les poids non documentés restent inconnus.';};
gearRenderLoad=function(){refOriginal.gearLoad();const host=document.getElementById('page-gear');for(const el of host.querySelectorAll('p,small'))if(el.childElementCount===0&&el.textContent.includes('retenue de 48 kg'))el.textContent=el.textContent.replace('48 kg',P.carryCapacity+' kg');};
gearRenderContainers=function(){const host=document.getElementById('gearContainers');if(!host)return;host.innerHTML=`<article class="container-card"><h4>Bagages</h4><p>Voir le contenu et préparer sa répartition.</p><button class="cr-btn" onclick="gearOpenContainer('bagages')">Ouvrir</button></article><article class="container-card"><h4>Monnaie</h4><p>${esc(REF.moneyNote)}</p><button class="cr-btn" onclick="gearOpenContainer('purses')">Ouvrir</button></article>`;};
gearOpenContainer=function(id){const drawer=document.getElementById('gearDrawer');if(!drawer)return;document.getElementById('gearDrawerKicker').textContent=id==='bagages'?'CONTENANT':'MONNAIE';document.getElementById('gearDrawerTitle').textContent=id==='bagages'?'Bagages':'Bourse personnelle';document.getElementById('gearDrawerBody').innerHTML=id==='bagages'?gearAllItems().filter(i=>i.location==='bag').map(gearDrawerItem).join(''):`<div class="cr-info">${esc(REF.moneyNote)}</div>`;drawer.classList.add('open');};
function refCompanionTest(step,label,v=null){if(v!==null&&!refPositive(v)){alert('Saisir un résultat de dés valide.');return;}const r=v===null?edRollStep(step):{total:Number(v),detail:'Dés lancés à la table'};refPropose(P.companion.name+' — '+label+' '+r.total,'Test du compagnon : ordres, conditions et malus éventuels sont arbitrés par le MJ.',r);document.getElementById('companionResult').textContent=label+' : '+r.total+' • '+r.detail;}
function refMountCompanion(){if(!P.companion)return;const el=document.createElement('details');el.className='discipline-reference';el.id='companionReference';el.innerHTML=`<summary><b>${esc(P.companion.name)}</b> — compagnon harmonisé</summary><article class="reader"><p>${esc(P.companion.state)}</p><p>${esc(P.companion.note)}</p><p>Défenses ${P.companion.defenses} • seuils ${P.companion.health} • déplacement ${P.companion.movement} m.</p><div class="cr-field"><label>Résultat de vos dés</label><input id="companionManual" type="number" min="1"></div>${[[5,'Initiative'],[8,'Morsure'],[11,'Dommages de morsure']].map(([step,label])=>`<div class="cr-actions"><button class="cr-btn" onclick="refCompanionTest(${step},'${label}')">🎲 ${label} — ${edStepDiceLabel(edStepSpec(step))}</button><button class="cr-btn" onclick="refCompanionTest(${step},'${label}',document.getElementById('companionManual').value)">Mes dés</button></div>`).join('')}<p id="companionResult"></p><p>Les dommages de morsure ne s’appliquent qu’après une attaque réussie. Ces tests ne consomment pas le Karma du personnage.</p></article>`;document.getElementById('page-gear').appendChild(el);}
renderCombatFlow=function(){refOriginal.render();if(REF.id==='ogunta'){const c=combatFlow(),panel=document.getElementById('combatPhasePanel');if(panel)panel.insertAdjacentHTML('afterbegin','<div class="gr-combat-shortcut"><span>'+P.matrices.map(m=>{const s=REF.spells.find(s=>s.name===m.spell);return esc(m.spell)+' : '+(refMagic().woven[s?.id]||0)+'/'+(s?.threads||0)+' filaments';}).join(' • ')+'</span><button class="cr-btn" onclick="grOpen()">Ouvrir le Grimoire</button></div>');}const cost=document.querySelector('.cr-costs');if(cost){const x=crRoundCosts();if(x.recoveries||x.arrows||x.sisterArrows||x.daggersThrown)cost.insertAdjacentHTML('beforeend',`<div class="cr-cost"><span>Récupérations consacrées</span><b>${x.recoveries}</b></div><div class="cr-cost"><span>Flèches ordinaires / de sœur</span><b>${x.arrows} / ${x.sisterArrows}</b></div><div class="cr-cost"><span>Dagues à récupérer</span><b>${x.daggersThrown}</b></div>`);}};
if(REF.id==='kalzakath'){if(!Number.isFinite(L.draft.sisterArrows))L.draft.sisterArrows=6;if(!Number.isFinite(L.draft.daggersAvailable))L.draft.daggersAvailable=10;}
if(REF.id==='ogunta'&&Array.isArray(L.referenceMatrices)&&L.referenceMatrices.length===4)P.matrices=L.referenceMatrices.map((m,i)=>({...P.matrices[i],spell:REF.spells.some(s=>s.name===m.spell&&s.circle<=P.matrices[i].rank)?m.spell:P.matrices[i].spell}));
const refPortrait=document.querySelector('.identity-page .portrait img');if(refPortrait){refPortrait.style.objectFit='cover';refPortrait.style.objectPosition=REF.id==='barbak'?'center top':'center 18%';if(REF.id==='barbak')refPortrait.parentElement.style.alignSelf='start';}
if(REF.id==='ogunta')grMigrateMatrices();
refRenderSpellBook();refMountCompanion();save();renderTalents();renderGear();renderCombatFlow();renderProgression6();

// The workshop lists available specialisations without granting them or exceeding the PL budget.
const refSpendOriginal={fill:fillSpendOptions,current:currentSpend};
function refAvailableSpecs(){return ARCHER_SPECIALIZATIONS.map((s,i)=>({...s,i,min:s.min+(!disciplineParentIsDiscipline(s.talent)?2:0)})).filter(s=>disciplineTalentRank(s.talent)>=s.min&&!(P.specializations||[]).some(k=>(k.name||k)===s.name)&&!progressionList().some(p=>p.domain==='specialization'&&p.targetName===s.name&&isProposalActiveForBudget(p)));}
fillSpendOptions=function(){if($id('spendDomain').value!=='specialization'){refSpendOriginal.fill();return;}const ss=refAvailableSpecs(),select=$id('spendItem');select.innerHTML=ss.length?ss.map(s=>`<option value="${s.i}">${esc(s.name)} — ${esc(s.talent)}</option>`).join(''):'<option value="none">Aucune spécialisation actuellement accessible</option>';select.disabled=!ss.length;renderSpendPreview();};
currentSpend=function(){if($id('spendDomain').value!=='specialization')return refSpendOriginal.current();const s=refAvailableSpecs().find(s=>String(s.i)===$id('spendItem').value);if(!s)return {domain:'specialization',label:'Spécialisation',legendCost:0,silverCost:0,blocked:true,note:'Aucune spécialisation accessible non déjà proposée.'};const band=disciplineTalentBand(s.parentCircle||1),cost=PR6.talentCosts[band]?.[s.min-1];return {domain:'specialization',label:'Spécialisation — '+s.name,targetName:s.name,legendCost:cost||0,silverCost:s.min*25,blocked:cost==null,note:s.talent+' • rang minimal '+s.min+' • Effort '+s.effort+'. Apprentissage et tuteur à valider avec le MJ.'};};
disciplineProposalForSpecialization=function(index){const s=refAvailableSpecs().find(s=>s.i===index);if(!s)return;openPage('progression');$id('spendDomain').value='specialization';fillSpendOptions();$id('spendItem').value=String(index);renderSpendPreview();};window.disciplineProposalForSpecialization=disciplineProposalForSpecialization;
$id('spendDomain').removeEventListener('change',refSpendOriginal.fill);
$id('spendDomain').addEventListener('change',fillSpendOptions);
fillSpendOptions();

// Ogunta's spell workspace. No other dossier loads a new page or spell data.
function grState(){if(!L.grimoire)L.grimoire={selected:'lance',filter:'all',query:'',inputs:{}};if(!L.grimoire.inputs)L.grimoire.inputs={};return L.grimoire;}
function grMigrateMatrices(){
 if(REF.id!=='ogunta')return;
 const aliases={'Matrice — Cercle de vie':'Matrice de sort — essentielle','Matrice — Voix des oiseaux de nuit':'Matrice de sort — option C1','Matrice — Douleur':'Matrice de sort — option C2','Matrice — Lance astrale':'Matrice de sort — option C3'};
 if(!L.matrixNames035){
  for(const p of L.proposals||[])if(p.domain==='talent'&&aliases[p.targetName]){const old=p.targetName;p.targetName=aliases[old];if(p.label)p.label=p.label.replace(old,p.targetName);}
  L.matrixNames035=true;
 }
 titles.grimoire='Grimoire';
}
function grCapture(){const s=grState();for(const el of document.querySelectorAll('#grimoireBook input,#grimoireBook select'))if(el.id)s.inputs[el.id]={value:el.value,checked:el.checked};s.open=[...document.querySelectorAll('#grimoireBook details[id][open]')].map(el=>el.id);}
function grSelect(id){if(!refSpell(id))return;grCapture();grState().selected=id;save();grRender();}
function grFilter(value){grState().filter=value;save();grApplyFilter();}
function grSearch(value){grState().query=value;save();grApplyFilter();}
function grApplyFilter(){const state=grState(),query=state.query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();let count=0;for(const b of document.querySelectorAll('[data-spell-choice]')){const s=refSpell(b.dataset.spellChoice),show=(state.filter!=='prepared'||refPrepared(s))&&(s.name+' '+s.intent).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query);b.hidden=!show;if(show)count++;}document.querySelectorAll('[data-gr-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.grFilter===state.filter)));const empty=document.getElementById('grEmpty');if(empty)empty.hidden=count>0;}
function grActiveEffects(){return refMagic().effects.filter(e=>!e.finished);}
function grTalentStep(name){return Math.max(1,(P.talentsKnown.find(t=>t.name===name)?.step||11)-healthActionPenalty());}
function grDuration(s){return s.duration;}
function grStepLabel(n){return 'Niveau '+n+' · '+edStepDiceLabel(edStepSpec(n));}
function grNextStage(s){return (refMagic().woven[s.id]||0)<s.threads?'weave':'cast';}
function grAbandon(id){if(!refMagic().woven[id])return;if(!confirm('Abandonner les filaments tissés de ce sort ?'))return;refMagic().woven[id]=0;delete refMagic().weaveRound?.[id];save();grRender();renderCombatFlow();}
function grFinishEffect(id){const e=refMagic().effects.find(e=>e.id===id);if(!e||e.finished)return;if(!confirm('Le MJ confirme que cet effet est terminé ? Ce bouton ne dissipe pas le sort.'))return;e.finished=true;save();refPropose(refSpell(e.spell).name+' — suivi terminé','Fin de l’effet reportée après confirmation du MJ.',{spell:e.spell,effect:id});grRender();renderCombatFlow();}
function grToPlan(id){
 const s=refSpell(id);if(!s)return;
 if(!combatFlow().active){alert('Le MJ n’a pas ouvert de combat. Utiliser les tests hors combat du Grimoire.');return;}
 const before=crSeq().length;crAddMechanical(grNextStage(s)+'_'+id);
 if(crSeq().length>before)openPage('combat');
}
function grOpen(){openPage('grimoire');grRender();}
function grSpellCard(s){
 const prepared=refPrepared(s),m=refMagic(),woven=m.woven[s.id]||0,next=grNextStage(s),combat=combatFlow().active;
 const step=grTalentStep(next==='weave'?'Tissage de filament (Nécromancie)':'Incantation');
 const last=m.log.findLast(e=>e.spell===s.id),sameRound=combat&&next==='cast'&&s.threads&&m.weaveRound?.[s.id]===combatFlow().round;
 return `<article class="gr-spell"><header><div><h3>${esc(s.name)}</h3><small>Nécromancie · Cercle ${s.circle}</small></div><span class="gr-tag">${prepared?'En matrice':'À préparer'}</span></header><p class="gr-intent">${esc(s.intent)}</p><div class="gr-facts"><div><small>Portée</small><b>${esc(s.range)}</b></div><div><small>Durée</small><b>${esc(grDuration(s))}</b></div><div><small>Filaments</small><b>${woven} / ${s.threads}${s.threads?'':' · aucun tissage'}</b></div></div><ol class="gr-steps"><li class="${prepared?'done':'current'}">Matrice</li><li class="${woven>=s.threads?'done':prepared?'current':''}">Tissage</li><li class="${prepared&&next==='cast'?'current':''}">Incantation</li><li>Effet</li></ol>
 ${!prepared?'<p class="gr-inactive">Sort connu, mais non préparé. Choisir une matrice de rang suffisant ci-dessus, puis confirmer la préparation avec le MJ.</p>':`<section class="gr-launch"><b>${next==='weave'?'Prochaine étape : tisser':'Prochaine étape : lancer le sort'}</b><p class="sem-t">${grStepLabel(step)}${next==='weave'?' · difficulté '+s.weave:' · '+esc(s.castLabel)}</p>${combat?`<p>Chaque étape utilise l’action ordinaire du round.${sameRound?' Le tissage est terminé : attendre le round suivant pour lancer.':''}</p><button class="cr-btn" ${sameRound?'disabled':''} onclick="grToPlan('${s.id}')">Ajouter ${next==='weave'?'le tissage':'l’Incantation'} au plan du round</button><p class="muted">Le jet sera fait dans Combat, avec l’appli ou vos dés.</p>`:`<div class="cr-form"><div class="cr-field"><label for="spellTarget_${s.id}">Cible / intention</label><input id="spellTarget_${s.id}" placeholder="Qui ou quoi ?"></div><div class="cr-field"><label for="spellDN_${s.id}">Difficulté d’Incantation</label><input id="spellDN_${s.id}" type="number" min="6" value="${s.castDN||''}" placeholder="Donnée par le MJ"></div></div><label class="sem-karma"><input id="spellKarma_${s.id}" type="checkbox"> Ajouter un dé de Karma (${P.combat.karma.dice})</label><div class="cr-actions"><button class="cr-btn" onclick="refOutSpell('${s.id}','${next}')">🎲 ${next==='weave'?'Tisser un filament':'Lancer le sort'}</button></div><div class="cr-form"><div class="cr-field"><label for="spellManual_${s.id}">Ou résultat de vos propres dés, Karma inclus si coché</label><input id="spellManual_${s.id}" type="number" min="1" placeholder="Total obtenu"></div><div class="cr-field"><label><input id="spellOnes_${s.id}" type="checkbox"> Tous les dés ont fait 1</label><button class="cr-btn" onclick="refOutSpell('${s.id}','${next}',document.getElementById('spellManual_${s.id}').value)">Enregistrer mes dés</button></div></div>`}
 ${s.threads?'<p class="muted">Enchaîner le tissage sans interruption ; lancer au round qui suit le dernier tissage. Une pause fait perdre les filaments.</p>':''}${woven?`<button class="cr-btn" onclick="grAbandon('${s.id}')">Abandonner le tissage</button>`:''}</section>`}
 ${last?`<div class="gr-result" role="status">Dernier test : ${last.stage==='weave'?'Tissage':last.stage==='hold'?'Concentration':'Incantation'} <b>${last.result}</b> · ${last.success?'réussite':'échec'}${last.gain?' · '+last.gain+' filament(s) tissé(s)':''} · transmis au MJ</div>`:''}
 <details class="gr-help" id="grRules_${s.id}"><summary>Effet et règles du sort</summary><p>${esc(s.text)}</p><p>${s.threads?'Tissage : '+s.weave+' • ':''}Réharmonisation rapide : ${s.reattune}. Cette difficulté sert à changer une matrice sous pression, pas à lancer le sort. Le MJ encadre cette opération.</p><p>${s.effectStep?grStepLabel(Math.max(1,s.effectStep-healthActionPenalty()))+' · '+esc(s.effectLabel):esc(s.effectLabel)}</p></details></article>`;
}
function grFollowHTML(){
 const active=new Set(grActiveEffects().map(e=>e.spell));
 const actions=[['pain','pain','Douleur — Volonté opposée'],['circle','repel','Cercle — repousser un intrus'],['circle','repelDamage','Cercle — dommages après réussite'],['mist','shield','Bouclier — défense contre une attaque']].filter(([s])=>active.has(s));
 if(!actions.length)return '';
 return `<details class="gr-help" id="grFollow"><summary>Réactions et entretien des effets actifs</summary><p>Douleur : concentration. Cercle de vie : un intrus par round. Bouclier de brume : jusqu’à 4 attaques vues par round, une seule défense active par attaque.</p><label><input type="checkbox" id="followConfirmed"> Durée et conditions confirmées avec le MJ</label><div class="cr-form"><div class="cr-field"><label>Round / repère hors combat</label><input id="followRound" placeholder="Round ou instant"></div><div class="cr-field"><label>Défense ou résultat adverse</label><input id="followDN" type="number" min="1"></div><div class="cr-field"><label>Résultat de vos dés</label><input id="followManual" type="number" min="1"></div></div>${actions.map(([s,k,l])=>`<div class="cr-actions">${s==='pain'&&combatFlow().active?'<button class="cr-btn" onclick="crAddMechanical(\'hold_pain\');openPage(\'combat\')">Ajouter le maintien de Douleur au plan</button>':`<button class="cr-btn" onclick="refFollowSpell('${s}','${k}')">🎲 ${l}</button><button class="cr-btn" onclick="refFollowSpell('${s}','${k}',document.getElementById('followManual').value)">Mes dés — ${l}</button>`}</div>`).join('')}<p id="followResult" role="status"></p></details>`;
}
function grRender(){
 if(REF.id!=='ogunta')return;const host=document.getElementById('grimoireBook');if(!host)return;
 grCapture();const st=grState(),selected=refSpell(st.selected)||REF.spells[0],magic=refMagic(),active=grActiveEffects();st.selected=selected.id;
 host.innerHTML=`<header class="gr-heading"><div><h2>Grimoire</h2><p>Préparer ses matrices, choisir un sort, puis suivre son lancement.</p></div><span class="gr-context">${combatFlow().active?'Combat · round '+combatFlow().round:'Hors combat'}</span></header><section aria-label="Matrices préparées"><h3>Mes matrices</h3><div class="gr-matrices">${P.matrices.map((mat,i)=>{const s=REF.spells.find(s=>s.name===mat.spell);return `<article class="gr-matrix"><small>Matrice ${i+1} · normale · rang ${mat.rank}</small><b>${esc(mat.spell)}</b><p>${s?s.threads+' filament(s) à tisser':'Aucun sort préparé'}</p><button onclick="grSelect('${s?.id||'lance'}')">Consulter ce sort</button><details id="grMatrix_${i}"><summary>Changer le sort préparé</summary><label for="matrix_${i}">Sort de Cercle ${mat.rank} maximum</label><select id="matrix_${i}">${REF.spells.filter(s=>s.circle<=mat.rank).map(s=>`<option value="${s.id}" ${s.name===mat.spell?'selected':''}>${esc(s.name)}</option>`).join('')}</select><div class="gr-matrix-actions"><button onclick="refProposeMatrix(${i},document.getElementById('matrix_${i}').value)">Proposer au MJ</button><button onclick="refConfirmMatrix(${i},document.getElementById('matrix_${i}').value)">Confirmer la préparation en séance</button></div><p>Le choix seul ne remplace pas le sort. La préparation est appliquée après accord du MJ.</p></details></article>`;}).join('')}</div></section>
 <div class="gr-workspace"><section class="gr-catalogue"><h3>Mes Sorts</h3><label for="grQuery">Chercher un sort ou un usage</label><input class="gr-search" id="grQuery" value="${esc(st.query)}" oninput="grSearch(this.value)" placeholder="Protéger, communiquer…"><div class="gr-filters"><button data-gr-filter="all" onclick="grFilter('all')">Tous</button><button data-gr-filter="prepared" onclick="grFilter('prepared')">En matrice</button></div><div class="gr-spell-list">${REF.spells.map(s=>`<button class="gr-choice" data-spell-choice="${s.id}" aria-pressed="${s.id===selected.id}" onclick="grSelect('${s.id}')"><b>${esc(s.name)}</b><small>Cercle ${s.circle} · ${refPrepared(s)?'en matrice':'à préparer'} · ${s.threads} fil.</small></button>`).join('')}</div><p id="grEmpty" hidden>Aucun sort ne correspond.</p></section>${grSpellCard(selected)}</div>
 <section class="gr-active"><h3>Effets à suivre${active.length?' · '+active.length:''}</h3>${active.length?active.map(e=>`<article class="gr-effect-entry"><small>${esc(e.target||'Cible à préciser')} · ${e.round?'round '+e.round:'hors combat'}</small>${refSpellEffectHTML(e,'grimoire')}<button class="gr-expiry" onclick="grFinishEffect('${e.id}')">Reporter la fin de cet effet</button></article>`).join(''):'<p>Aucun effet en cours de suivi. Les effets d’un lancement réussi apparaîtront ici.</p>'}${grFollowHTML()}</section>
 <details class="gr-help" id="grHelp"><summary>Matrices, filaments et lancement : le rappel</summary><p>Les quatre matrices normales contiennent chacune un sort connu de Cercle inférieur ou égal à leur rang. Elles ne stockent aucun filament pré-tissé. Réharmoniser une matrice ne change ni le talent acquis ni son rang.</p><p>Tisser un filament demande une action ordinaire. Une réussite Excellente tisse un filament supplémentaire. Une fois le tissage terminé, attendre le round suivant pour l’Incantation ; toute interruption d’un round fait perdre les filaments. Les effets sont ensuite résolus séparément avec le MJ.</p><p>Ce Grimoire est l’aide de jeu des sorts connus. Il n’active pas la méthode particulière « lancer depuis un grimoire » ni la magie brute. Recueil p.282–287.</p></details>
 <details class="gr-help gr-log" id="grLog"><summary>Historique des derniers tests</summary><ul>${magic.log.slice(-12).reverse().map(e=>`<li>${esc(refSpell(e.spell)?.name||e.spell)} · ${e.stage==='weave'?'Tissage':e.stage==='cast'?'Incantation':'Concentration'} ${e.result} · ${e.success?'réussite':'échec'}${e.round?' · round '+e.round:''}</li>`).join('')||'<li>Aucun test enregistré.</li>'}</ul></details>`;
 for(const [id,value] of Object.entries(st.inputs)){const el=document.getElementById(id);if(el&&id!=='grQuery'){el.value=value.value;el.checked=value.checked;}}
 for(const id of st.open||[])document.getElementById(id)?.setAttribute('open','');
 grApplyFilter();
}
if(REF.id==='ogunta'){
 grMigrateMatrices();
 const previousOpenPage=openPage;openPage=function(id,push=true){previousOpenPage(id,push);if(id==='grimoire')grRender();};window.openPage=openPage;
 grRender();
 if(location.hash==='#grimoire')openPage('grimoire',false);
}
