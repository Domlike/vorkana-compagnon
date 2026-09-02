(function () {
  "use strict";

  const VERSION = "0.35";
  const PLAYER_NAMES = { pj_0: "Zra’Ul", pj_1: "Kalha", pj_2: "Kal’Zakath", pj_3: "Barbak", pj_4: "Ogunta", pj_5: "Jaskar", pj_6: "Gul’Rak" };
  const LOCAL_KEY = "earthdawn-room-envelope-v033";
  const CONFIG = window.EARTHDAWN_REALTIME_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const savedRoom = (() => { try { return localStorage.getItem("earthdawn_room_v033") || ""; } catch (_) { return ""; } })();
  const state = {
    role: "observer",
    playerId: "",
    name: "",
    clientId: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    room: cleanRoom(params.get("room") || savedRoom || CONFIG.defaultRoom || "cale-chaos"),
    status: "offline",
    localChannel: null,
    remoteChannel: null,
    remoteClient: null,
    presence: [],
    seen: new Map(),
    started: false,
    pending: [], outbox: [], delivery: {}, memory: "checking", cursor: 0, busy: false,
    generation: 0, retryAt: 0
  };

  function cleanRoom(value) {
    const normalized = String(value || "cale-chaos").trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return (normalized || "cale-chaos").slice(0, 64);
  }
  function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
  function setStatus(status, note) {
    state.status = status;
    emit("earthdawn-sync-status", { status, note: note || "", room: state.room, remote: !!state.remoteChannel });
  }
  function remember(id) {
    const now = Date.now();
    state.seen.set(id, now);
    if (state.seen.size > 500) for (const [key, at] of state.seen) if (now - at > 600000) state.seen.delete(key);
  }
  function intendedForMe(envelope) {
    const targets = Array.isArray(envelope.targets) ? envelope.targets : ["all"];
    const payload = envelope.payload || {};
    if (state.role === "gm" && payload.type === "earthdawn-whisper") return true;
    if (payload.type === "earthdawn-whisper" && (envelope.sender?.playerId || envelope.sender?.role) === identity()) return true;
    return targets.includes("all") || targets.includes(state.role) || (state.playerId && targets.includes(state.playerId));
  }
  function receive(envelope, transport) {
    if (!envelope || envelope.room !== state.room || !envelope.eventId || state.seen.has(envelope.eventId)) return;
    remember(envelope.eventId);
    if (!intendedForMe(envelope)) return;
    const payload = { ...(envelope.payload || {}), __earthdawnEnvelope: envelope, __earthdawnTransport: transport };
    if (payload.type === "vorkana-receipt") {
      const entry = state.delivery[payload.messageId] || { recipients: {} };
      entry.recipients ||= {};
      const who = envelope.sender?.playerId || envelope.sender?.role;
      if (who && entry.recipients[who] !== "read") entry.recipients[who] = payload.stage === "read" ? "read" : "received";
      state.delivery[payload.messageId] = entry;
      saveMail(); emit("vorkana-delivery", { messageId: payload.messageId });
      return;
    }
    emit("earthdawn-sync-message", { envelope, payload, transport });
    try { window.dispatchEvent(new MessageEvent("message", { data: payload })); } catch (_) { /* anciens navigateurs */ }
    if (payload.type === "earthdawn-whisper" && envelope.sender?.clientId !== state.clientId && (envelope.sender?.playerId || envelope.sender?.role) !== identity()) receipt(payload, "received");
  }
  function makeEnvelope(payload, options) {
    const opts = options || {};
    return {
      version: VERSION,
      eventId: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      room: state.room,
      sentAt: new Date().toISOString(),
      sender: { role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId },
      targets: Array.isArray(opts.targets) && opts.targets.length ? opts.targets : ["all"],
      payload: { ...(payload || {}), playerId: (payload && payload.playerId) || state.playerId, protocolVersion: "1.2" }
    };
  }
  function sendLocal(envelope) {
    if (state.localChannel) try { state.localChannel.postMessage(envelope); } catch (_) { /* stockage ci-dessous */ }
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ nonce: Math.random(), envelope })); } catch (_) { /* file:// privé */ }
  }
  async function sendRemote(envelope) {
    if (!state.remoteChannel) return false;
    try {
      const result = await state.remoteChannel.send({ type: "broadcast", event: "earthdawn", payload: envelope });
      return result === "ok" || result === undefined;
    } catch (_) { return false; }
  }
  function send(payload, options) {
    const envelope = makeEnvelope(payload, options);
    remember(envelope.eventId);
    sendLocal(envelope);
    if (durable(payload)) {
      state.outbox.push(envelope); saveMail();
      if (payload.messageId) { state.delivery[payload.messageId] ||= { recipients: {} }; emit("vorkana-delivery", { messageId: payload.messageId }); }
      pumpMail();
    }
    if (CONFIG.enabled && CONFIG.supabaseUrl && CONFIG.supabasePublishableKey && state.status !== "online") {
      state.pending.push(envelope);
      if (state.pending.length > 100) state.pending.shift();
    } else sendRemote(envelope);
    return true;
  }

  // Device storage is only the pending-send cache. The shared journal is authoritative
  // once the supplied SQL has been installed; no map HTML or MJ notes are archived.
  const DURABLE_TYPES = new Set(["earthdawn-whisper", "earthdawn-player-proposals", "earthdawn-player-proposal-decisions", "vorkana-market-proposal", "vorkana-market-decision", "vorkana-hub-state", "vorkana-gm-hub-state", "vorkana-market-command", "vorkana-receipt"]);
  function durable(payload) { return DURABLE_TYPES.has(payload?.type); }
  function identity() { return state.playerId || state.role; }
  function mailKey() { return `vorkana_mail_v035_${state.room}_${identity()}_${encodeURIComponent(location.pathname || 'page')}`; }
  function saveMail() {
    try { localStorage.setItem(mailKey(), JSON.stringify({ outbox: state.outbox, delivery: state.delivery, cursor: state.cursor })); }
    catch (_) { emit("vorkana-storage-error", { note: "Impossible de conserver les envois sur cet appareil." }); }
  }
  function loadMail() {
    let saved = {}; try { saved = JSON.parse(localStorage.getItem(mailKey()) || "{}"); } catch (_) {}
    state.outbox = Array.isArray(saved.outbox) ? saved.outbox.filter(e => e.room === state.room && durable(e.payload)) : [];
    state.delivery = saved.delivery || {}; state.cursor = Number(saved.cursor) || 0;
  }
  function memoryStatus(status) { if (state.memory === status) return; state.memory = status; emit("vorkana-memory", { status, pending: state.outbox.length }); }
  function receipt(payload, stage) {
    if (!payload?.messageId) return;
    const target = payload.fromId || payload.__earthdawnEnvelope?.sender?.playerId || "gm";
    send({ type: "vorkana-receipt", messageId: payload.messageId, stage }, { targets: [target] });
  }
  async function pumpMail() {
    if (state.busy || !state.remoteClient || state.status !== "online" || Date.now() < state.retryAt) return;
    const generation = state.generation, room = state.room, client = state.remoteClient;
    state.busy = true;
    try {
      const read = await client.rpc("vorkana_read_events", { p_room: room, p_after: state.cursor });
      if (generation !== state.generation) return;
      if (read.error) {
        memoryStatus(read.error.code === "PGRST202" || read.error.code === "42883" ? "setup" : "unavailable");
        state.retryAt = Date.now() + 30000; return;
      }
      memoryStatus("ready");
      for (const row of read.data || []) {
        receive(row.envelope, "memory");
        state.cursor = Math.max(state.cursor, Number(row.seq) || 0);
      }
      saveMail();
      for (const envelope of state.outbox.slice(0, 25)) {
        const result = await client.rpc("vorkana_append_event", { p_room: room, p_event: envelope });
        if (generation !== state.generation) return;
        if (result.error) { memoryStatus("unavailable"); state.retryAt = Date.now() + 15000; break; }
        state.outbox = state.outbox.filter(e => e.eventId !== envelope.eventId);
        const id = envelope.payload?.messageId;
        if (id && envelope.payload.type === "earthdawn-whisper") {
          state.delivery[id] ||= { recipients: {} }; state.delivery[id].saved = true;
          emit("vorkana-delivery", { messageId: id });
        }
        saveMail();
      }
    } catch (_) { if (generation === state.generation) { memoryStatus("unavailable"); state.retryAt = Date.now() + 15000; } }
    finally { if (generation === state.generation) state.busy = false; }
  }
  function normalizedPresence(members) {
    const unique = new Map();
    (Array.isArray(members) ? members : []).forEach(member => {
      if (!member) return;
      const normalized = { ...member, name: member.name || PLAYER_NAMES[member.playerId] || (member.role === "gm" ? "MJ" : "Invité") };
      const identity = normalized.playerId ? `player:${normalized.playerId}` : normalized.role === "gm" ? "role:gm" : `client:${normalized.clientId || normalized.name}`;
      const previous = unique.get(identity);
      if (!previous || Date.parse(normalized.onlineAt || 0) >= Date.parse(previous.onlineAt || 0)) unique.set(identity, normalized);
    });
    return [...unique.values()].sort((a, b) => (a.role === "gm" ? -1 : 0) - (b.role === "gm" ? -1 : 0) || String(a.name).localeCompare(String(b.name), "fr"));
  }
  function updatePresence() {
    if (!state.remoteChannel) {
      state.presence = normalizedPresence([{ role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId, local: true }]);
      emit("earthdawn-sync-presence", { room: state.room, members: state.presence });
      return;
    }
    const raw = state.remoteChannel.presenceState ? state.remoteChannel.presenceState() : {};
    const members = [];
    Object.values(raw || {}).forEach(list => (Array.isArray(list) ? list : []).forEach(member => members.push(member)));
    state.presence = normalizedPresence(members);
    emit("earthdawn-sync-presence", { room: state.room, members: state.presence });
  }
  function loadSupabaseScript() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-earthdawn-supabase]");
      if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.dataset.earthdawnSupabase = "true";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  async function startRemote() {
    if (!CONFIG.enabled || !CONFIG.supabaseUrl || !CONFIG.supabasePublishableKey) { memoryStatus("local"); setStatus("local", "Synchronisation sur cet appareil"); return; }
    const generation = state.generation;
    setStatus("connecting", "Connexion à la salle en ligne");
    try {
      await loadSupabaseScript();
      if(generation !== state.generation)return;
      state.remoteClient = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 20 } }
      });
      state.remoteChannel = state.remoteClient.channel(`earthdawn:${state.room}`, {
        config: { broadcast: { self: false, ack: true }, presence: { key: state.clientId } }
      });
      state.remoteChannel
        .on("broadcast", { event: "earthdawn" }, event => receive(event.payload, "supabase"))
        .on("presence", { event: "sync" }, updatePresence)
        .on("presence", { event: "join" }, updatePresence)
        .on("presence", { event: "leave" }, updatePresence)
        .subscribe(async status => {
          if(generation !== state.generation)return;
          if (status === "SUBSCRIBED") {
            await state.remoteChannel.track({ role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId, onlineAt: new Date().toISOString() });
            if(generation !== state.generation)return;
            setStatus("online", "Salle en ligne synchronisée");
            updatePresence();
            while (state.pending.length) sendRemote(state.pending.shift());
            state.outbox.forEach(sendRemote); pumpMail();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            memoryStatus("unavailable");
            setStatus("local", "Réseau indisponible — continuité locale conservée");
          }
        });
    } catch (_) { if(generation === state.generation){memoryStatus("unavailable");setStatus("local", "Service distant indisponible — continuité locale conservée");} }
  }
  function configure(identity) {
    const input = identity || {};
    state.role = input.role || state.role;
    state.playerId = input.playerId || state.playerId;
    state.name = input.name || state.name;
    if (input.room) state.room = cleanRoom(input.room);
    try { localStorage.setItem("earthdawn_room_v033", state.room); } catch (_) { /* facultatif */ }
    return api;
  }
  function start(room) {
    if (room) configure({ room });
    if (state.started) return api;
    state.started = true;
    loadMail();
    if ("BroadcastChannel" in window) {
      try { state.localChannel = new BroadcastChannel(`earthdawn:${state.room}`); state.localChannel.onmessage = event => receive(event.data, "local"); } catch (_) { /* localStorage reste disponible */ }
    }
    window.addEventListener("storage", event => {
      if (event.key !== LOCAL_KEY || !event.newValue) return;
      try { receive(JSON.parse(event.newValue).envelope, "storage"); } catch (_) { /* message incomplet */ }
    });
    updatePresence();
    startRemote();
    return api;
  }
  function setRoom(room) {
    const next = cleanRoom(room);
    if (next === state.room) return api;
    try { state.localChannel && state.localChannel.close(); } catch (_) {}
    try { state.remoteChannel && state.remoteClient && state.remoteClient.removeChannel(state.remoteChannel); } catch (_) {}
    saveMail(); state.generation++; state.busy = false; state.retryAt = 0;
    state.pending = []; state.seen.clear(); state.presence = []; state.memory = "checking";
    state.localChannel = null; state.remoteChannel = null; state.remoteClient = null; state.started = false; state.room = next;
    try { localStorage.setItem("earthdawn_room_v033", next); } catch (_) {}
    emit("vorkana-room-changed", { room: next });
    return start();
  }
  function invitationUrl(filename, playerId) {
    const base = String(CONFIG.playerBaseUrl || "").trim();
    let url;
    try { url = new URL(filename, base ? (base.endsWith("/") ? base : `${base}/`) : location.href); }
    catch (_) { return `${filename}?room=${encodeURIComponent(state.room)}${playerId ? `&player=${encodeURIComponent(playerId)}` : ""}`; }
    url.searchParams.set("room", state.room);
    if (playerId) url.searchParams.set("player", playerId);
    return url.href;
  }
  const api = {
    version: VERSION,
    configure,
    start,
    setRoom,
    send,
    sendToPlayer: (playerId, payload) => send(payload, { targets: [playerId] }),
    sendToGM: payload => send(payload, { targets: ["gm"] }),
    invitationUrl,
    markRead: payload => receipt(payload, "read"),
    delivery: id => state.delivery[id] || { recipients: {} },
    retry: () => { state.retryAt = 0; pumpMail(); },
    status: () => ({ role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId, room: state.room, status: state.status, remote: !!state.remoteChannel, presence: state.presence.slice(), memory: state.memory, pending: state.outbox.length })
  };
  window.EarthdawnSync = api;
  setInterval(pumpMail, 5000);
})();
