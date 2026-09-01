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
  if (portrait) portrait.src = "assets/portraits/zraul.png";

  const style = document.createElement("style");
  style.textContent = `.zmsg-layout{display:grid;grid-template-columns:250px 1fr;gap:14px}.zmsg-card{border:1px solid #d8d1c6;background:#fff;border-radius:8px;padding:15px}.zmsg-layout .zmsg-card:first-child{border-left:5px solid var(--player)}.zmsg-layout .zmsg-card:last-child{border-left:5px solid var(--gm)}.zmsg-presence{display:grid;gap:7px}.zmsg-member{padding:8px;background:#f3f0ea;border-radius:6px}.zmsg-member.player{border-left:4px solid var(--player)}.zmsg-member.gm{border-left:4px solid var(--gm)}.zmsg-member:before{content:'●';color:#6e9a60;margin-right:7px}.zmsg-feed{height:360px;overflow:auto;padding:10px;background:#f1ede6;border-radius:7px;display:flex;flex-direction:column;gap:7px}.zmsg-item{max-width:78%;padding:8px 10px;background:white;border:1px solid #d8d0c4;border-left:5px solid var(--player);border-radius:8px}.zmsg-item.from-gm{border-left-color:var(--gm);background:#fff9ec}.zmsg-item.whisper{box-shadow:inset 0 -3px var(--specialization)}.zmsg-item.mine{align-self:flex-end;background:#f1f1ef}.zmsg-item small{display:block;color:#777;margin-top:3px}.zmsg-compose{display:grid;grid-template-columns:180px 1fr auto;gap:7px;margin-top:8px}.zmsg-compose select,.zmsg-compose input{border:1px solid #cfc7bc;border-radius:6px;padding:9px;background:white}.zra-situation{margin-bottom:14px;padding:12px 14px;border:1px solid #d8c8a9;border-left:5px solid var(--gm);border-radius:7px;background:#f3ead9}.zra-situation b{display:block;margin-bottom:5px}.zra-situation span{display:inline-block;margin:3px 5px 0 0;padding:3px 7px;border-radius:999px;background:#4f3a31;color:white;font-size:12px}@media(max-width:800px){.zmsg-layout,.zmsg-compose{grid-template-columns:1fr}}`;
  document.head.appendChild(style);

  const nav = document.getElementById("nav");
  function circleHubUrl() {
    const url = new URL("Vorkana_Cercle_V0_33.html", location.href);
    url.searchParams.set("player", P.playerId);
    const room = new URLSearchParams(location.search).get("room");
    if (room) url.searchParams.set("room", room);
    return url.href;
  }
  const messageButton = document.createElement("button");
  messageButton.dataset.page = "messages";
  messageButton.innerHTML = '<span class="dot player"></span>Messages';
  nav.insertBefore(messageButton, nav.querySelector("details"));
  const messagePage = document.createElement("section");
  messagePage.className = "view";
  messagePage.id = "page-messages";
  document.querySelector("main > div")?.appendChild(messagePage);
  titles.messages = "Messages";
  messageButton.onclick = () => openPage("messages");
  const circleButton = document.createElement("button");
  circleButton.innerHTML = '<span class="dot"></span>Ressources & marché';
  nav.insertBefore(circleButton, nav.querySelector("details"));
  circleButton.onclick = () => window.open(circleHubUrl(), "VorkanaCircle");

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
  announcePlayerReady = function () { playerPost({ type: "earthdawn-player-ready", characterId: P.characterId, characterName: P.name, clientVersion: "0.33" }); };
  connectToCockpit = function () { cockpitConnected = true; renderCockpitStatus(); announcePlayerReady(); };

  function id() { return `zra-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }
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
    const players = new Map([["pj_1", "Kalha"], ["pj_2", "Kal’Zakath"], ["pj_3", "Barbak"], ["pj_4", "Ogunta"], ["pj_5", "Jaskar"], ["pj_6", "Gul’Rak"]]);
    presence.filter(m => m.playerId && m.playerId !== P.playerId).forEach(m => players.set(m.playerId, m.name || m.playerId));
    return [["gm", "MJ"], ["all", "Tout le monde"], ...players.entries()];
  }
  function renderMessages() {
    if (!messagePage) return;
    const members = presence.length ? presence.map(m => `<div class="zmsg-member ${m.role === "gm" ? "gm" : "player"}">${esc(m.name || (m.role === "gm" ? "MJ" : m.playerId || "Invité"))}</div>`).join("") : `<p class="muted">Présences visibles après connexion.</p>`;
    const feed = L.messages.length ? L.messages.map(m => { const fromGm = m.fromId === "gm" || /^mj$/i.test(m.from || ""), targetLabel = m.toLabel || participantName(m.to); return `<div class="zmsg-item ${fromGm ? "from-gm" : "from-player"} ${m.mine ? "mine" : ""} ${m.whisper === false ? "" : "whisper"}"><b>${esc(m.from || "MJ")}</b>${targetLabel ? ` → ${esc(targetLabel)}` : ""}<div>${esc(m.text || "")}</div><small>${new Date(m.sentAt || Date.now()).toLocaleString("fr-FR")} • ${m.whisper === false ? "groupe" : "murmure visible MJ"}</small></div>`; }).join("") : `<p class="muted">Aucun message pour le moment.</p>`;
    messagePage.innerHTML = `<div class="head"><h2>Messages</h2><p>Les murmures entre joueurs restent visibles par le MJ.</p></div><div class="zmsg-layout"><div class="zmsg-card"><h3>Présences</h3><div class="zmsg-presence">${members}</div><p class="notice">L’invitation ne demande aucun mot de passe. Elle identifie seulement la salle et votre personnage.</p></div><div class="zmsg-card"><h3>Fil de la salle</h3><div class="zmsg-feed" id="zmsgFeed">${feed}</div><div class="zmsg-compose"><select id="zmsgTo">${recipientList().map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("")}</select><input id="zmsgText" placeholder="Votre message…"><button class="btn primary" id="zmsgSend">Envoyer</button></div></div></div>`;
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
