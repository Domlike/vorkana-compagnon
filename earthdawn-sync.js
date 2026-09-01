(function () {
  "use strict";

  const VERSION = "0.33";
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
    pending: []
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
    return targets.includes("all") || targets.includes(state.role) || (state.playerId && targets.includes(state.playerId));
  }
  function receive(envelope, transport) {
    if (!envelope || envelope.room !== state.room || !envelope.eventId || state.seen.has(envelope.eventId)) return;
    remember(envelope.eventId);
    if (!intendedForMe(envelope)) return;
    const payload = { ...(envelope.payload || {}), __earthdawnEnvelope: envelope, __earthdawnTransport: transport };
    emit("earthdawn-sync-message", { envelope, payload, transport });
    try { window.dispatchEvent(new MessageEvent("message", { data: payload })); } catch (_) { /* anciens navigateurs */ }
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
    if (CONFIG.enabled && CONFIG.supabaseUrl && CONFIG.supabasePublishableKey && state.status !== "online") {
      state.pending.push(envelope);
      if (state.pending.length > 100) state.pending.shift();
    } else sendRemote(envelope);
    return true;
  }
  function updatePresence() {
    if (!state.remoteChannel) {
      state.presence = [{ role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId, local: true }];
      emit("earthdawn-sync-presence", { room: state.room, members: state.presence });
      return;
    }
    const raw = state.remoteChannel.presenceState ? state.remoteChannel.presenceState() : {};
    const members = [];
    Object.values(raw || {}).forEach(list => (Array.isArray(list) ? list : []).forEach(member => members.push(member)));
    state.presence = members;
    emit("earthdawn-sync-presence", { room: state.room, members });
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
    if (!CONFIG.enabled || !CONFIG.supabaseUrl || !CONFIG.supabasePublishableKey) { setStatus("local", "Synchronisation sur cet appareil"); return; }
    setStatus("connecting", "Connexion à la salle en ligne");
    try {
      await loadSupabaseScript();
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
          if (status === "SUBSCRIBED") {
            await state.remoteChannel.track({ role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId, onlineAt: new Date().toISOString() });
            setStatus("online", "Salle en ligne synchronisée");
            updatePresence();
            while (state.pending.length) sendRemote(state.pending.shift());
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setStatus("local", "Réseau indisponible — continuité locale conservée");
          }
        });
    } catch (_) { setStatus("local", "Service distant indisponible — continuité locale conservée"); }
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
    state.localChannel = null; state.remoteChannel = null; state.remoteClient = null; state.started = false; state.room = next;
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
    status: () => ({ role: state.role, playerId: state.playerId, name: state.name, clientId: state.clientId, room: state.room, status: state.status, remote: !!state.remoteChannel, presence: state.presence.slice() })
  };
  window.EarthdawnSync = api;
})();
