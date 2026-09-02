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
    if (badge) { badge.className = `badge ${online ? "connected" : "waiting"}`; badge.textContent = online ? "Salle : synchronisée" : "Salle : mode local"; }
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
