(function () {
  "use strict";
  if (!window.EarthdawnSync || typeof P === "undefined") return;

  const Sync = window.EarthdawnSync;
  const PLAYER_NAMES = { pj_0: "Zra’Ul", pj_1: "Kalha", pj_2: "Kal’Zakath", pj_3: "Barbak", pj_4: "Ogunta", pj_5: "Jaskar", pj_6: "Gul’Rak" };
  let presence = [], messageLimit=150, messageRoom=null, storageFailed=false;
  if (!Array.isArray(L.messages)) L.messages = [];
  L.messages.forEach(m=>{m.room ||= m.__earthdawnEnvelope?.room || Sync.status().room;});

  const connectButton = document.getElementById("connectCockpit");
  if (connectButton) connectButton.remove();
  const portrait = document.querySelector(".identity-page .portrait img") || document.querySelector(".hero .portrait img");
  if (portrait) portrait.src = "assets/portraits/kalha.png";

  const style = document.createElement("style");
  style.textContent = `.zmsg-dock{border:1px solid #3f5b4b;border-left:4px solid var(--gm);border-radius:8px;background:#132019;color:#eee9dc;overflow:hidden}.zmsg-dock summary{cursor:pointer;padding:9px 10px;color:#dec99d;font-weight:800;list-style:none;display:flex;justify-content:space-between}.zmsg-dock summary::-webkit-details-marker{display:none}.zmsg-online{font-size:11px;color:#95c28f}.zmsg-presence{display:flex;gap:4px;flex-wrap:wrap;padding:0 8px 7px}.zmsg-member{padding:2px 6px;background:#203129;border-radius:99px;font-size:10px}.zmsg-member:before{content:'●';color:#78ad70;margin-right:4px}.zmsg-member.gm{border:1px solid var(--gm)}.zmsg-feed{height:170px;overflow:auto;padding:7px;background:#0e1713;display:flex;flex-direction:column;gap:5px}.zmsg-item{max-width:92%;padding:6px 7px;background:#203129;border-left:4px solid var(--player);border-radius:6px;font-size:11px}.zmsg-item.from-gm{border-left-color:var(--gm);background:#2a261c;color:#f1dfba}.zmsg-item.whisper{box-shadow:inset 0 -2px var(--specialization)}.zmsg-item.mine{align-self:flex-end}.zmsg-item small{display:block;color:#aeb7b1;margin-top:2px;font-size:9px}.zmsg-compose{display:grid;grid-template-columns:1fr auto;gap:5px;padding:7px}.zmsg-compose select{grid-column:1/-1}.zmsg-compose select,.zmsg-compose input{min-width:0;border:1px solid #4a6556;border-radius:5px;padding:6px;background:#0f1914;color:#f2eee3}.zmsg-compose button{border:1px solid #876b36;border-radius:5px;background:#745326;color:white;padding:6px 8px}.zra-situation{margin-bottom:14px;padding:12px 14px;border:1px solid #d8c8a9;border-left:5px solid var(--gm);border-radius:7px;background:#f3ead9}.zra-situation b{display:block;margin-bottom:5px}.zra-situation span{display:inline-block;margin:3px 5px 0 0;padding:3px 7px;border-radius:999px;background:#4f3a31;color:white;font-size:12px}@media(max-width:700px){.zmsg-feed{height:220px}}`;
  document.head.appendChild(style);

  const messageDock = document.getElementById("playerMessageDock");

  function syncState() { return Sync.status(); }
  renderCockpitStatus = function () {
    cockpitConnected = true;
    const st = syncState(), online = st.status === "online";
    const badge = document.getElementById("cockpitStatus"), mode = document.getElementById("playerModeStatus"), exportButton = document.getElementById("exportProposal");
    if (badge) { badge.className = `badge ${online && st.memory==='ready' && !storageFailed ? "connected" : "waiting"}`; badge.textContent = storageFailed?'Sauvegarde locale impossible':!online?'Salle : mode local':st.memory==='ready'?(st.pending?'En ligne · envois en attente':'En ligne · mémoire disponible'):'En ligne · mémoire indisponible'; }
    if (mode) mode.textContent = `Salle ${st.room}`;
    if (exportButton) exportButton.textContent = "Transmettre les propositions au MJ";
  };
  playerPost = function (payload) { return Sync.sendToGM({ ...payload, playerId: P.playerId, protocolVersion: "1.2" }); };
  announcePlayerReady = function () { playerPost({ type: "earthdawn-player-ready", characterId: P.characterId, characterName: P.name, clientVersion: "0.34.1" }); };
  connectToCockpit = function () { cockpitConnected = true; renderCockpitStatus(); announcePlayerReady(); };

  function id() { return `kalha-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
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
    const room=payload.__earthdawnEnvelope?.room||Sync.status().room;
    if(!payload.messageId||L.messages.some(m=>m.messageId===payload.messageId&&m.room===room))return;
    L.messages.push({...payload,room,mine:!!mine||payload.fromId===P.playerId});save();renderMessages();
  }
  function recipientList() {
    const players = new Map(Object.entries(PLAYER_NAMES).filter(([id]) => id !== P.playerId));
    presence.filter(m => m.playerId && m.playerId !== P.playerId).forEach(m => players.set(m.playerId, m.name || m.playerId));
    return [["gm", "MJ"], ["all", "Tout le monde"], ...players.entries()];
  }
  function renderMessages() {
    if (!messageDock) return;
    const room=Sync.status().room;
    L.messageDrafts ||= {};
    const draft=L.messageDrafts[room] ||= {text:'',to:'gm'};
    const existing=document.getElementById('zmsgText');
    if(!existing){
      messageDock.innerHTML=`<details class="zmsg-dock" open><summary><span>Messages</span><span class="zmsg-online" id="zmsgOnline"></span></summary><div class="zmsg-presence" id="zmsgPresence"></div><div style="padding:6px"><button id="zmsgOlder" type="button">Afficher les messages précédents</button> <button id="zmsgRecover" type="button">Retrouver l’historique</button><small id="zmsgHistoryStatus" role="status"></small></div><div class="zmsg-feed" id="zmsgFeed"></div><div class="zmsg-compose"><select id="zmsgTo" aria-label="Destinataire"></select><input id="zmsgText" placeholder="Votre message…" aria-label="Votre message"><button id="zmsgSend">Envoyer</button></div></details>`;
      document.getElementById('zmsgText').addEventListener('input',e=>{(L.messageDrafts[Sync.status().room] ||= {}).text=e.target.value;save();});
      document.getElementById('zmsgTo').addEventListener('change',e=>{(L.messageDrafts[Sync.status().room] ||= {}).to=e.target.value;save();});
      document.getElementById('zmsgOlder').onclick=()=>{messageLimit+=150;renderMessages();};
      document.getElementById('zmsgRecover').onclick=async()=>{
        const button=document.getElementById('zmsgRecover'),status=document.getElementById('zmsgHistoryStatus');button.disabled=true;status.textContent=' Lecture de la mémoire partagée…';
        try{const result=await Sync.recoverMessages();status.textContent=` ${result.count} message(s) retrouvé(s) dans la mémoire partagée.`;}catch(error){status.textContent=' '+error.message;}finally{button.disabled=false;}
      };
      document.getElementById('zmsgSend').onclick=()=>{
        const input=document.getElementById('zmsgText'),text=input.value.trim();if(!text)return;
        const to=document.getElementById('zmsgTo').value,label=participantName(to);
        const payload={type:'earthdawn-whisper',messageId:id(),sentAt:new Date().toISOString(),from:P.name,fromId:P.playerId,to,toLabel:label,text,whisper:to!=='all',visibility:'gm_and_recipients'};
        L.messageDrafts[Sync.status().room]={text:'',to};input.value='';addMessage(payload,true);
        Sync.send(payload,{targets:to==='all'?['all']:to==='gm'?['gm']:[to,'gm']});renderMessages();
      };
    }
    const input=document.getElementById('zmsgText'),select=document.getElementById('zmsgTo');
    const changedRoom=messageRoom!==room;
    if(changedRoom||!existing){input.value=draft.text||'';messageRoom=room;messageLimit=150;}
    const to=!changedRoom&&existing&&select.value?select.value:draft.to||'gm';
    const options=recipientList().map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('');
    if(select.innerHTML!==options){select.innerHTML=options;select.value=to;}
    if(!select.value)select.value='gm';
    document.getElementById('zmsgOnline').textContent=`${presence.length} présent${presence.length>1?'s':''}`;
    document.getElementById('zmsgPresence').innerHTML=presence.map(m=>`<div class="zmsg-member ${m.role==='gm'?'gm':'player'}">${esc(m.name||participantName(m.playerId))}</div>`).join('');
    const messages=L.messages.filter(m=>m.room===room).slice().sort((a,b)=>String(a.sentAt||'').localeCompare(String(b.sentAt||'')));
    const visible=messages.slice(-messageLimit),feed=document.getElementById('zmsgFeed'),bottom=feed.scrollHeight-feed.scrollTop-feed.clientHeight<35,previousTop=feed.scrollTop;
    const html=visible.map(m=>{
      const delivery=Sync.delivery(m.messageId),receipts=delivery.recipients||{},target=m.to||'gm';
      const receipt=target==='all'?(Object.values(receipts).includes('read')?'Lu par au moins un destinataire':Object.values(receipts).length?'Reçu par au moins un destinataire':'Réception à confirmer'):receipts[target]==='read'?'Lu par le destinataire':receipts[target]==='received'?'Reçu par le destinataire':'Réception à confirmer';
      const status=m.mine?`${delivery.saved?'Conservé dans la mémoire partagée':'Sauvegarde distante en attente'} · ${receipt}`:'';
      return `<div class="zmsg-item ${m.fromId==='gm'?'from-gm':'from-player'} ${m.mine?'mine':''}"><b>${esc(m.from||participantName(m.fromId))}</b> → ${esc(m.toLabel||participantName(m.to))}<div>${esc(m.text||'')}</div><small>${esc(new Date(m.sentAt||Date.now()).toLocaleString('fr-FR'))}${status?' · '+esc(status):''}</small></div>`;
    }).join('')||'<p>Aucun message pour le moment.</p>';
    if(feed.innerHTML!==html){feed.innerHTML=html;feed.scrollTop=bottom?feed.scrollHeight:previousTop;}
    document.getElementById('zmsgOlder').hidden=messages.length<=messageLimit;
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

  window.addEventListener('vorkana-storage-error',()=>{storageFailed=true;renderCockpitStatus();});
  window.addEventListener('vorkana-storage-restored',()=>{storageFailed=false;renderCockpitStatus();});
  window.addEventListener('vorkana-memory',()=>{renderCockpitStatus();renderMessages();});
  window.addEventListener('vorkana-delivery',()=>{renderCockpitStatus();renderMessages();});
  window.addEventListener('vorkana-history-message',event=>addMessage(event.detail.payload,false));
  window.addEventListener('vorkana-room-changed',()=>{presence=[];messageRoom=null;renderMessages();renderCockpitStatus();});
  window.addEventListener("earthdawn-sync-status", renderCockpitStatus);
  window.addEventListener("earthdawn-sync-presence", event => { presence = dedupePresence(event.detail.members); renderMessages(); });
  window.addEventListener("earthdawn-sync-message", event => { const d = event.detail.payload || {}; if (d.type === "earthdawn-whisper") addMessage(d, false); if (d.type === "earthdawn-cockpit-state" || d.type === "earthdawn-cockpit-hello") renderSituationBanner(d.combat); });
  Sync.configure({ role: "player", playerId: P.playerId, name: P.name }).start();
  presence = dedupePresence(Sync.status().presence);
  renderMessages(); renderSituationBanner(null); renderCockpitStatus(); announcePlayerReady();
  setInterval(() => { cockpitConnected = true; playerPost({ type: "earthdawn-player-ping" }); renderCockpitStatus(); }, 10000);
})();
