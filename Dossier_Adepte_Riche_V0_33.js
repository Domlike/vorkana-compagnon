(function () {
  "use strict";

  const playerId = document.documentElement.dataset.playerId;
  const P = window.EARTHDAWN_PLAYER_DATA && window.EARTHDAWN_PLAYER_DATA[playerId];
  if (!P) { document.body.innerHTML = "<p style='padding:30px'>Données du personnage introuvables.</p>"; return; }

  const VERSION = "0.33";
  const STORE = `earthdawn_player_${P.characterId}_v033`;
  const PORTRAITS = {
    pj_1: "assets/portraits/kalha.png", pj_2: "assets/portraits/kalzakath.png", pj_3: "assets/portraits/barbak.png",
    pj_4: "assets/portraits/ogunta.png", pj_5: "assets/portraits/jaskar.png", pj_6: "assets/portraits/gulrak.png"
  };
  const NAV = [
    ["home", "⌂", "Essentiel"], ["explore", "⌕", "Hors combat"], ["combat", "⚔", "Combat"],
    ["progress", "✦", "Progression"], ["discipline", "◈", "Discipline"], ["gear", "▣", "Équipement"],
    ["history", "⌛", "Histoire"], ["messages", "✉", "Messages"]
  ];
  const PLAYER_NAMES = { pj_0: "Zra’Ul", pj_1: "Kalha", pj_2: "Kal’Zakath", pj_3: "Barbak", pj_4: "Ogunta", pj_5: "Jaskar", pj_6: "Gul’Rak" };
  const LORE = {
    pj_1: {
      physical: "1,84 m • 96 kg sans équipement • silhouette compacte et très dense, façonnée par la forge",
      circleTitle: "Le Cercle qui tient",
      circleText: "À Rocheville, Kalha dut réparer l’arbre fendu du moulin communal. Après avoir échoué en voulant travailler seule, elle réunit charpentier, charron, charbonnier et habitants, puis dirigea leurs gestes malgré sa timidité. Marda Braise-Sourde reconnut son troisième Cercle lorsqu’elle comprit qu’une œuvre pouvait rester sienne sans lui appartenir seule.",
      intimateObject: "Les médaillons de Vorkana matérialisent la mémoire artisanale et collective de Kalha.",
      timeline: [
        "30 Strassa 1448 — les deux reforgements de sa masse d’armes sont placés à cette date en hommage à Astendar.",
        "28 Rua — voyage avec Barbak, Ogunta et Kal’Zakath vers Grand-Foire, dans l’ombre des menaces liées à Mordom.",
        "26 Mawag — Koldar lui confie un bloc de métal noirci destiné à devenir cinq anneaux.",
        "28 Mawag — elle forge les médaillons de Vorkana, frappés d’une main ork sur un soleil rayonnant.",
        "6 Gahmil — elle est présente pendant les épreuves des Écorcheurs.",
        "Raquas — son expertise devient prioritaire face au coffre métallique couvert d’écritures.",
        "19–29 Sollus — travail de forge à Grand-Foire, route de Rocnoir puis identification d’un probable élément de mobilier marin.",
        "Nuit du 29 au 30 Sollus — elle défend l’option d’exfiltration ; Katsika est libéré sans alarme ni combat."
      ]
    },
    pj_2: {
      physical: "2,03 m • 126 kg sans équipement • très grand et massif, musculature explosive de Guerrier",
      circleTitle: "Apprendre à revenir",
      circleText: "Lorsqu’une plateforme menaça des passants à Grand-Foire, Barbak tenta d’abord d’en porter seul tout le poids. Koldar le força à demander de l’aide, à répartir l’effort et à accepter de sortir avec les autres. Il reconnut son troisième Cercle lorsque Barbak comprit qu’un Guerrier appartient aussi à ceux qu’il protège.",
      intimateObject: "La vieille boucle du baudrier de Kash, remise par Koldar avec ces mots : « Apprends-lui à revenir. »",
      timeline: [
        "28 Rua 1448 — il rejoint la route de Koldar et découvre les traces de violences liées à Mordom.",
        "26 Mawag — Koldar lui enseigne qu’un Guerrier peut aussi poser son arme, tendre la main ou accepter la fuite.",
        "6 Gahmil — il affronte Nargal, dit le Taureau, et l’emporte par KO.",
        "19–28 Sollus — il achève son harmonisation avec Brise-Tibia.",
        "29 Sollus — il protège Ogunta sous les tirs avec une planche arrachée à la cabane de Katsika."
      ]
    },
    pj_3: {
      physical: "1,87 m • 92 kg sans équipement • grande et solide, port calme et musculature discrète",
      circleTitle: "La Dernière Porte",
      circleText: "À la mort d’Helja Cendre-Basse, Ogunta transmit ses volontés sans les embellir, répartit entre les vivants les responsabilités de la défunte, puis refusa de retenir son esprit lorsqu’il choisit de partir. Doomir reconnut son troisième Cercle lorsqu’elle comprit que son pouvoir sur les morts ne lui donnait aucun droit sur leurs choix.",
      intimateObject: "Aucun objet intime matériel distinct n’est consolidé. Son bâton reste un symbole visuel sans effet particulier.",
      timeline: [
        "28 Rua 1448 — elle accompagne Barbak, Kalha et Kal’Zakath vers Grand-Foire.",
        "26 Mawag — elle avertit un messager ork menacé, attirant l’attention d’Elroën Vélaris.",
        "6 Gahmil — elle résout l’épreuve des runes de vie, mort et renaissance.",
        "18 Sollus — le mot « deuil » touche juste avec Voluptia ; elle emploie une lance spectrale contre les brigands.",
        "29 Sollus — elle porte une attaque magique particulièrement violente sur la plage des Coques."
      ]
    },
    pj_4: {
      physical: "1,89 m • 91 kg sans équipement • ork élancé aux gestes amples et à la présence expressive",
      circleTitle: "Le récit qui n’écrase pas",
      circleText: "Le passage de Jaskar au troisième Cercle est validé dans la continuité de campagne ; son récit détaillé reste à enrichir avec le joueur. Sa Discipline l’engage déjà à porter les histoires sans masquer les vérités qui donnent leur poids aux actes.",
      intimateObject: "Aucun objet intime distinct n’est encore consolidé ; ses instruments, ses cartes et son matériel d’écriture sont ses outils de mémoire.",
      timeline: [
        "26 Mawag 1448 — il transforme les retrouvailles, le chaos, le serment et le feu en matière de légende.",
        "28 Mawag — il recueille l’histoire d’Ysillia, l’Aiguille sur sang.",
        "18 Sollus — il gagne 5 PA avec ses chansons et accompagne la charge de Barbak de notes lugubres.",
        "21–28 Sollus — il mémorise avec Zra’Ul Le Fleuve garde les Noms.",
        "29 Sollus — il obtient un accès accéléré à la Capitainerie."
      ]
    },
    pj_5: {
      physical: "1,96 m • 105 kg sans équipement • grand et athlétique, longues jambes et musculature sèche",
      circleTitle: "Les trois pistes",
      circleText: "Harkan Brumepente présenta à Kal’Zakath trois pistes dont les conséquences comptaient davantage que les traces. Il démasqua un piège, alerta les bonnes personnes face à une substance dangereuse et effaça la piste d’une jeune orke qui ne voulait pas être retrouvée. Harkan reconnut son troisième Cercle lorsqu’il comprit qu’un Éclaireur suit aussi la place qu’il occupe dans le monde.",
      intimateObject: "Aucun objet intime distinct n’est consolidé. Ses armes nommées et l’Œil de Dragon traduisent sa manière de lire et de façonner sa route.",
      timeline: [
        "28 Rua 1448 — il lit les signes de danger liés à Mordom sur la route de Grand-Foire.",
        "Épreuves des Écorcheurs — il retrouve le furet grâce à son pistage.",
        "18 Raquas — il obtient un croquis lié à Tilport Cœurance en échange d’une part du trésor.",
        "Kelpoya — il déclenche un nuage vert empoisonné en manipulant une rune du coffre.",
        "Nuit du 29 au 30 Sollus — il participe à l’exfiltration de Katsika et revendique le sauvetage au nom de Vorkana."
      ]
    },
    pj_6: {
      physical: "1,82 m • 88 kg sans équipement • cheveux noirs épais, peau légèrement verdâtre, yeux orangés ou dorés",
      circleTitle: "J’ai volé leur destination",
      circleText: "Au Chardon Creux, Gul’Rak comprit que l’agrafe d’argent désignée par Miraq Tresse-Sombre était un appât. Il la laissa en place, falsifia le registre, modifia l’itinéraire et déplaça les marques de route afin de détourner des chercheurs dangereux. Miraq reconnut son troisième Cercle lorsqu’il déclara : « Je n’ai pas pris l’agrafe. J’ai volé leur destination. »",
      intimateObject: "Le mouchoir noir brodé « Gullûz » porte trois points d’argent ajoutés par Miraq. Il n’est pas un objet à trame.",
      timeline: [
        "Né en 1431 de Vargan Zug-Rak, convoyeur et négociateur de routes, et de Sura Fil-d’Argent, brodeuse et petite marchande itinérante.",
        "En 1442, il remplace les faux poids d’un marchand, subtilise son sceau et conserve une pièce d’argent pour ses frais ; Miraq reconnaît son potentiel de Voleur.",
        "Sura lui donne un mouchoir noir brodé « Gullûz » : il peut cacher son visage, sa route et ses intentions, mais personne ne doit lui voler son Nom.",
        "Miraq ajoute un point d’argent au revers du mouchoir après chacun de ses trois passages de Cercle.",
        "Le 3 Rua 1448, il détourne les chercheurs vers la Combe des Trois Mélèzes et passe au troisième Cercle.",
        "Il connaît depuis longtemps les autres PJ comme figure de passage à Rocheville, utile mais longtemps semi-extérieure au groupe.",
        "18 Sollus — il reprend par surprise et par vol l’argent donné aux brigands.",
        "29 Sollus — son réseau ouvre l’accès à Nicodémus ; il contribue à l’achat de l’ornement marin.",
        "Nuit du 29 au 30 Sollus — il contourne le camp des Naufrageurs, observe sous la tente violette et participe à l’exfiltration de Katsika."
      ]
    }
  };
  const OPTIONS = ["Aucune", "Agressive", "Défensive", "Effort supplémentaire", "Mouvement", "Réserve / attente"];
  const COSTS = { 1: 100, 2: 200, 3: 300, 4: 500, 5: 800, 6: 1300, 7: 2100, 8: 3400 };
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = value => Number(value || 0).toLocaleString("fr-FR");
  const now = () => new Date().toISOString();
  const id = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  function circleHubUrl() {
    const url = new URL("Vorkana_Cercle_V0_33.html", location.href);
    url.searchParams.set("player", P.playerId);
    const room = new URLSearchParams(location.search).get("room");
    if (room) url.searchParams.set("room", room);
    return url.href;
  }

  function baseState() {
    return {
      version: VERSION,
      page: "home",
      room: new URLSearchParams(location.search).get("room") || "",
      draft: clone(P.snapshot),
      plan: { round: 0, option: "Aucune", target: "", note: "", actions: [], status: "Brouillon local", initiative: "" },
      combat: { active: false, round: 0, phase: "", situation: "", conditions: [] },
      proposals: [], decisions: [], messages: [], rollHistory: [], presence: [],
      inventoryFilter: "Tous", progressionDraft: { item: "", rank: 1, note: "" }
    };
  }
  let S = (() => { try { return { ...baseState(), ...JSON.parse(localStorage.getItem(STORE) || "{}") }; } catch (_) { return baseState(); } })();
  S.draft = { ...clone(P.snapshot), ...(S.draft || {}) };
  S.plan = { ...baseState().plan, ...(S.plan || {}) };
  S.combat = { ...baseState().combat, ...(S.combat || {}) };
  S.combat.conditions = conditionLabels(S.combat.conditions);
  ["proposals", "decisions", "messages", "rollHistory", "presence"].forEach(key => { if (!Array.isArray(S[key])) S[key] = []; });
  S.presence = [];
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (_) { /* mode privé */ } }

  document.body.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">E</div><div><small>Prélude à la Guerre</small><strong>Dossier d’Adepte</strong></div></div>
        <div class="side-person"><b>${esc(P.name)}</b><span>${esc(P.discipline)} • Cercle ${P.circle}</span></div>
        <nav class="nav">${NAV.map(([key, icon, label]) => `<button data-page="${key}"><span class="ico">${icon}</span><span>${label}</span></button>`).join("")}</nav>
        <div class="side-foot"><div><i class="sync-dot" id="syncDot"></i><b id="syncLabel">Salle locale</b></div><small id="syncRoom">Préparation…</small></div>
      </aside>
      <section class="shell">
        <header class="topbar"><h1 id="topTitle">${esc(P.name)}</h1><div class="top-actions"><span class="badge" id="roomBadge">Salle</span><span class="badge">V${VERSION}</span></div></header>
        <main>${NAV.map(([key]) => `<section class="page" id="page-${key}"></section>`).join("")}</main>
      </section>
    </div><div class="toast" id="toast"></div>`;

  const $ = selector => document.querySelector(selector);
  const page = key => document.getElementById(`page-${key}`);
  function toast(message) { const el = $("#toast"); el.textContent = message; el.classList.add("show"); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2600); }
  function openPage(key, push) {
    if (!NAV.some(item => item[0] === key)) key = "home";
    S.page = key; save();
    document.querySelectorAll(".page").forEach(el => el.classList.toggle("active", el.id === `page-${key}`));
    document.querySelectorAll("[data-page]").forEach(el => el.classList.toggle("active", el.dataset.page === key));
    $("#topTitle").textContent = NAV.find(item => item[0] === key)[2];
    if (push !== false) location.hash = key;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", () => openPage(el.dataset.page)));
  addEventListener("hashchange", () => openPage(location.hash.slice(1) || S.page, false));

  function attributeCard(a) { return `<button type="button" class="stat rollable-stat sem-attribute" data-home-roll="${esc(a.dice)}" data-home-label="${esc(a.name)}" title="Lancer ${esc(a.name)}"><small>${esc(a.name)}</small><strong>${a.value}</strong><span>Niveau ${a.step}</span><div class="dice">🎲 ${esc(a.dice)}</div></button>`; }
  function ratio(current, max) { return Math.max(0, Math.min(100, (Number(current || 0) / Math.max(1, Number(max || 1))) * 100)); }
  function pendingCount() { return S.proposals.filter(p => p.status === "draft" || p.status === "sent").length; }
  function heroMetric(label, value, detail, semantic) { return `<div class="metric${semantic ? ` sem-${semantic}` : ""}"><small>${label}</small><b>${value}</b><span>${detail || ""}</span></div>`; }

  function renderHome() {
    const c = P.combat, legend = P.legend;
    page("home").innerHTML = `
      <div class="hero">
        <div class="hero-portrait"><img src="${PORTRAITS[P.playerId]}" alt="Portrait de ${esc(P.name)}"></div>
        <div class="hero-copy"><span class="eyebrow">${esc(P.people)} • ${esc(P.discipline)} du Cercle ${P.circle}</span>
          <h2>${esc(P.name)}</h2><p class="lead">${esc(P.identityLine)}</p>
          <div class="chips">${(P.traits || []).map(x => `<span class="chip">${esc(x)}</span>`).join("")}</div>
          <div class="hero-stats">${heroMetric("Défenses", `${c.defenses.physical} / ${c.defenses.magical} / ${c.defenses.social}`, "Physique • Mystique • Sociale")}${heroMetric("Armure", `${c.armor.physical} / ${c.armor.mystical}`, c.armor.label)}${heroMetric("Karma", `${S.draft.karma} / ${c.karma.max}`, c.karma.dice, "karma")}${heroMetric("Légende disponible", fmt(legend.available), `${fmt(legend.spent)} dépensés`)}</div>
        </div>
      </div>
      <div class="grid three mt">
        <article class="card sem-card sem-wound"><h3>État opérationnel</h3><div class="meters">
          <div><div class="meter-head"><b>Dommages</b><span>${S.draft.damage} / ${c.health.death}</span></div><div class="meter wound"><i style="width:${ratio(S.draft.damage, c.health.death)}%"></i></div></div>
          <div><div class="meter-head"><b>Karma</b><span>${S.draft.karma} / ${c.karma.max}</span></div><div class="meter karma"><i style="width:${ratio(S.draft.karma, c.karma.max)}%"></i></div></div>
          <div><div class="meter-head"><b>Récupérations</b><span>${S.draft.recoveriesUsed} / ${c.recovery.max}</span></div><div class="meter"><i style="width:${ratio(S.draft.recoveriesUsed, c.recovery.max)}%"></i></div></div>
        </div><div class="button-row mt"><button class="btn primary" data-health>Gérer l’état</button><button class="btn" data-page-jump="combat">Préparer le round</button></div></article>
        <article class="card sem-card sem-player"><h3>Repères</h3><p><b>${esc(P.player)}</b> joue ${esc(P.name)}.</p><p>${esc(P.birth)} • ${esc(P.age)}<br>${esc(P.origin)}<br>${esc(P.location)}</p><p class="subtle">${esc(P.halfMagic)}</p></article>
        <article class="card sem-card sem-gm"><h3>Salle de jeu</h3><p id="homeSyncText">Connexion en cours…</p><div class="button-row"><button class="btn blue" data-page-jump="messages">Messages</button><button class="btn" data-page-jump="combat">Vision tactique</button><button class="btn" id="openCircleHub">Ressources & marché</button></div><p class="subtle">Le dossier communique directement avec le poste du MJ. Il n’ouvre jamais le cockpit.</p></article>
      </div>
      <article class="card mt"><h3>Caractéristiques</h3><div class="statline">${P.attributes.map(attributeCard).join("")}</div><div class="roll-output" id="homeRollOutput"><small>Cliquez sur une caractéristique pour lancer ses dés.</small></div></article>
      <div class="grid two mt"><article class="card"><h3>Présence physique</h3><p>${esc(LORE[P.playerId]?.physical || "Non consolidée")}</p></article><article class="card"><h3>Gahad</h3>${(P.gahad || []).map(x => `<p>${esc(x)}</p>`).join("")}</article></div>`;
    page("home").querySelector("[data-health]").onclick = () => { openPage("combat"); setTimeout(() => $("#healthWorkbench")?.scrollIntoView({ behavior: "smooth" }), 100); };
    page("home").querySelectorAll("[data-page-jump]").forEach(btn => btn.onclick = () => openPage(btn.dataset.pageJump));
    $("#openCircleHub").onclick = () => window.open(circleHubUrl(), "VorkanaCircle");
    page("home").querySelectorAll("[data-home-roll]").forEach(btn => btn.onclick = () => {
      const r = rollDice(btn.dataset.homeRoll), label = btn.dataset.homeLabel;
      S.rollHistory.unshift({ at: now(), label, total: r.total, dn: 0 }); S.rollHistory = S.rollHistory.slice(0, 20); save();
      $("#homeRollOutput").innerHTML = `<strong>${r.total}</strong> — ${esc(label)}<br><small>${esc(btn.dataset.homeRoll)} • ${r.rolls.map(x => `d${x.sides}:${x.roll}${x.exploded ? "↻" : ""}`).join(" · ")}</small>`;
    });
    refreshSyncLabels();
  }

  const COMBAT_ONLY = /^(armes? de mêlée|arme de tir|arme de jet|combat à mains nues|esquive|parade|peau de bois|danse des airs|anticipation|coup de pied rapide|coup de bouclier|stabilité|manœuvre|sprint|attaque surprise|attaque critique|deuxième attaque|deuxième tir|charge dévastatrice|saut de géant)$/i;
  function isCombatOnly(item) { return COMBAT_ONLY.test(String(item?.label || item?.name || "").trim()); }
  function allRollables(context) {
    const attributes = P.attributes.map(a => ({ label: a.name, step: a.step, dice: a.dice, group: "Caractéristique" }));
    const talents = (P.talents || []).filter(t => t.rollable !== false).map(t => {
      const attr = P.attributes.find(a => /mêlée|parade|esquive|vol|déplacement|escalade|attaque/i.test(t.name) ? a.name === "Dextérité" : /évaluation|histoire|serrure|piège/i.test(t.name) ? a.name === "Perception" : false);
      const step = t.step || ((attr && t.rank) ? attr.step + t.rank : t.rank || 0);
      return { label: t.name, step, dice: stepDice(step), group: "Talent", rank: t.rank };
    });
    const skills = (P.skills || []).filter(s => s.rollable !== false).map(s => { const step = s.step || Math.max(1, (P.attributes.find(a => a.name === "Perception")?.step || 0) + (s.rank || 0)); return { label: s.name, step, dice: s.dice || stepDice(step), group: "Compétence", rank: s.rank }; });
    const all = [...attributes, ...talents, ...skills].filter(x => x.step > 0);
    if (context === "outside") return all.filter(x => x.group === "Caractéristique" || !isCombatOnly(x));
    if (context === "combat") return all.filter(x => x.group !== "Caractéristique" && isCombatOnly(x));
    return all;
  }
  function stepDice(step) {
    const table = { 1: "D4-2", 2: "D4-1", 3: "D4", 4: "D6", 5: "D8", 6: "D10", 7: "D12", 8: "2D6", 9: "D8+D6", 10: "D10+D6", 11: "D10+D8", 12: "2D10", 13: "D12+D10", 14: "2D12", 15: "D20+D6", 16: "D20+D8", 17: "D20+D10", 18: "D20+D12", 19: "D20+2D6", 20: "D20+D8+D6" };
    return table[Number(step)] || `Niveau ${step}`;
  }
  function parseDice(text) {
    const clean = String(text || "").toUpperCase().replace(/\s/g, "");
    const terms = []; let modifier = 0;
    (clean.match(/[+-]?[^+-]+/g) || []).forEach(term => {
      const dice = term.match(/^([+-]?)(\d*)D(\d+)$/);
      if (dice) terms.push({ sign: dice[1] === "-" ? -1 : 1, count: Number(dice[2] || 1), sides: Number(dice[3]) });
      else if (/^[+-]?\d+$/.test(term)) modifier += Number(term);
    });
    return { terms, modifier };
  }
  function randomInt(max) {
    if (window.crypto && window.crypto.getRandomValues) { const box = new Uint32Array(1); window.crypto.getRandomValues(box); return (box[0] % max) + 1; }
    return Math.floor(Math.random() * max) + 1;
  }
  function rollDice(notation) {
    const parsed = parseDice(notation), rolls = []; let total = parsed.modifier;
    parsed.terms.forEach(term => { for (let i = 0; i < term.count; i++) { let dieTotal = 0, roll, explosions = 0; do { roll = randomInt(term.sides); dieTotal += roll; rolls.push({ sides: term.sides, roll, exploded: roll === term.sides }); explosions++; } while (roll === term.sides && explosions < 50); total += term.sign * dieTotal; } });
    return { total: Math.max(1, total), rolls, modifier: parsed.modifier };
  }
  function degree(total, difficulty) { const dn = Number(difficulty); if (!dn) return "Résultat brut"; const margin = total - dn; return margin < 0 ? "Échec" : margin < 5 ? "Succès moyen" : margin < 10 ? "Bon succès" : margin < 15 ? "Excellent succès" : "Succès extraordinaire"; }
  function renderExplore() {
    const rolls = allRollables("outside");
    const outsideTalents = (P.talents || []).filter(t => !isCombatOnly(t));
    const outsideSkills = (P.skills || []).filter(s => !isCombatOnly(s));
    const rollIndex = (group, name) => rolls.findIndex(item => item.group === group && item.label === name);
    const rollCell = (group, item) => { const index = rollIndex(group, item.name), semantic = group === "Talent" ? "talent" : group === "Compétence" ? "skill" : "attribute"; return index >= 0 ? `<button class="btn small semantic-key sem-${semantic}" data-explore-roll="${index}">🎲 Niv. ${rolls[index].step} • ${esc(rolls[index].dice)}</button>` : `<span class="subtle">Effet passif ou intégré</span>`; };
    page("explore").innerHTML = `<div class="page-head"><div><h2>Hors combat</h2><p>Choisir une approche, lancer les dés et conserver les résultats utiles.</p></div></div>
      <article class="card"><h3>Lanceur contextuel</h3><div class="roller"><div class="field"><label>Action</label><select id="rollChoice">${rolls.map((r, i) => `<option value="${i}">${esc(r.group)} — ${esc(r.label)} • niv. ${r.step} (${esc(r.dice)})</option>`).join("")}</select></div><div class="field"><label>Difficulté</label><input id="rollDifficulty" type="number" min="0" placeholder="Facultative"></div><div class="field"><label>Karma / bonus</label><select id="rollBonus"><option value="">Aucun</option><option value="${P.combat.karma.dice}">Karma ${P.combat.karma.dice}</option><option value="D6">Bonus D6</option></select></div><button class="btn primary" id="rollNow">Lancer</button></div><div class="roll-output" id="rollOutput"><small>Le résultat apparaîtra ici. Les dés maximaux sont relancés automatiquement.</small></div></article>
      <div class="grid two mt"><article class="card sem-card sem-talent"><h3>Talents utiles hors combat</h3><div class="table-wrap"><table><thead><tr><th>Talent</th><th>Rang</th><th>Jet</th><th>Repère</th></tr></thead><tbody>${outsideTalents.map(t => `<tr><td><span class="pill talent">Talent</span> <b>${esc(t.name)}</b></td><td>${t.rank}</td><td>${rollCell("Talent", t)}</td><td>${esc(t.note || "—")}</td></tr>`).join("")}</tbody></table></div></article><article class="card sem-card sem-skill"><h3>Compétences utiles hors combat</h3><div class="table-wrap"><table><thead><tr><th>Compétence</th><th>Rang</th><th>Jet</th></tr></thead><tbody>${outsideSkills.map(s => `<tr><td><span class="pill skill">Compétence</span> ${esc(s.name)}</td><td>${s.rank}</td><td>${rollCell("Compétence", s)}</td></tr>`).join("")}</tbody></table></div></article></div>
      <article class="card mt sem-card sem-talent"><h3>Demi-magie de ${esc(P.discipline)}</h3><p>${esc(P.halfMagic)}</p><div class="notice">Une application inhabituelle reste une proposition au MJ ; la fiche ne crée pas automatiquement un nouveau pouvoir.</div></article>`;
    const launch = index => {
      const chosen = rolls[Number(index)], bonus = $("#rollBonus").value; if (!chosen) return;
      $("#rollChoice").value = String(index);
      const first = rollDice(chosen.dice), second = bonus ? rollDice(bonus) : { total: 0, rolls: [] }, total = first.total + second.total;
      const all = [...first.rolls, ...second.rolls]; const dn = Number($("#rollDifficulty").value || 0);
      S.rollHistory.unshift({ at: now(), label: chosen.label, total, dn }); S.rollHistory = S.rollHistory.slice(0, 20); save();
      $("#rollOutput").innerHTML = `<strong>${total}</strong> — ${degree(total, dn)}<br><small>${esc(chosen.label)} : ${esc(chosen.dice)}${bonus ? ` + ${esc(bonus)}` : ""} • ${all.map(x => `<span class="${x.exploded ? "explode" : ""}">d${x.sides}:${x.roll}${x.exploded ? "↻" : ""}</span>`).join(" · ")}</small>`;
    };
    $("#rollNow").onclick = () => launch(Number($("#rollChoice").value));
    page("explore").querySelectorAll("[data-explore-roll]").forEach(btn => btn.onclick = () => launch(Number(btn.dataset.exploreRoll)));
  }

  function actionRows() {
    return P.actions.map(a => `<div class="action sem-talent"><div><b>${esc(a.label)}</b><small>${esc(a.kind)}${a.note ? ` • ${esc(a.note)}` : ""}${a.effort ? ` • Effort ${a.effort}` : ""}</small></div><div class="action-rolls"><button class="btn small semantic-key sem-talent" data-roll="${esc(a.testDice)}" data-label="${esc(a.label)} — test">Test ${a.testStep} • ${esc(a.testDice)}</button>${a.damageDice ? `<button class="btn small danger" data-roll="${esc(a.damageDice)}" data-label="${esc(a.label)} — dommages">Dommages ${a.damageStep} • ${esc(a.damageDice)}</button>` : ""}<button class="btn small" data-add-action="${esc(a.id)}">+ plan</button></div></div>`).join("");
  }
  function proposal(changes, label, kind) {
    const p = { id: id("proposal"), playerId: P.playerId, kind: kind || "combatState", label, changes, status: "draft", createdAt: now() };
    S.proposals.push(p); save(); renderCombat(); toast("Proposition ajoutée — à transmettre au MJ.");
  }
  function renderCombat() {
    const c = P.combat, active = S.combat.active;
    const combatAbilities = allRollables("combat");
    const combatAbilityBlock = combatAbilities.length ? `<details class="card mt sem-card sem-talent"><summary><b>Talents et compétences de combat complémentaires</b> — ${combatAbilities.length}</summary><div class="action-list mt">${combatAbilities.map(a => `<div class="action ${a.group === "Talent" ? "sem-talent" : "sem-skill"}"><div><b>${esc(a.label)}</b><small><span class="pill ${a.group === "Talent" ? "talent" : "skill"}">${esc(a.group)}</span>${a.rank ? ` • Rang ${a.rank}` : ""}</small></div><button class="btn small semantic-key ${a.group === "Talent" ? "sem-talent" : "sem-skill"}" data-roll="${esc(a.dice)}" data-label="${esc(a.label)}">Niv. ${a.step} • ${esc(a.dice)}</button></div>`).join("")}</div></details>` : "";
    const initiativeOptions = c.initiative.options || [{ label: "Initiative", step: c.initiative.step, dice: c.initiative.dice }];
    const initiativeChooser = initiativeOptions.length > 1 ? `<select id="initiativeMode">${initiativeOptions.map((option, index) => `<option value="${index}">${esc(option.label)} • niv. ${option.step} (${esc(option.dice)})${option.effort ? ` • Effort ${option.effort}` : ""}</option>`).join("")}</select>` : "";
    page("combat").innerHTML = `<div class="page-head"><div><h2>Combat</h2><p>Le plan du round fait office de déclaration.</p></div></div>
      <div class="combat-banner"><div><strong>${active ? `Round ${S.combat.round} — ${esc(S.combat.phase || "combat")}` : "Aucun combat actif"}</strong><small>${esc(S.combat.situation || "Le brouillon reste disponible hors combat.")}</small>${(S.combat.conditions || []).length ? `<div class="condition-list">${S.combat.conditions.map(x => `<span class="condition">${esc(typeof x === "string" ? x : x.label || x.id)}</span>`).join("")}</div>` : ""}</div><button class="btn" id="openVision">Ouvrir ma vision tactique</button></div>
      <div class="grid two mt"><article class="card sem-card sem-wound" id="healthWorkbench"><h3>État du personnage</h3><div class="form-grid"><div class="field sem-wound"><label>Dommages</label><input id="damage" type="number" min="0" max="${c.health.death}" value="${S.draft.damage}"></div><div class="field sem-wound"><label>Blessures graves</label><input id="wounds" type="number" min="0" value="${S.draft.wounds}"></div><div class="field sem-karma"><label>Karma</label><input id="karma" type="number" min="0" max="${c.karma.max}" value="${S.draft.karma}"></div><div class="field"><label>Récupérations utilisées</label><input id="recoveries" type="number" min="0" max="${c.recovery.max}" value="${S.draft.recoveriesUsed}"></div></div><div class="notice red mt">Inconscience ${c.health.unconscious} • Mort ${c.health.death} • Seuil de blessure ${c.health.woundThreshold} • Récupération ${c.recovery.dice}</div><div class="button-row mt"><button class="btn primary" id="proposeHealth">Proposer ces changements au MJ</button><button class="btn" id="rollRecovery">Jet de récupération</button></div><div class="roll-output" id="combatRoll"><small>Les jets de combat apparaissent ici.</small></div></article>
        <article class="card sem-card sem-gm"><h3>Plan du round ${S.combat.round || "—"}</h3><div class="form-grid"><div class="field"><label>Option de combat</label><select id="planOption">${OPTIONS.map(x => `<option ${S.plan.option === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label>Cible / objectif</label><input id="planTarget" value="${esc(S.plan.target)}" placeholder="Nom ou intention"></div><div class="field wide sem-gm"><label>Note au MJ</label><textarea id="planNote">${esc(S.plan.note)}</textarea></div></div><h4>Séquence prévue</h4><div class="sequence" id="planSequence">${S.plan.actions.length ? S.plan.actions.map((a, i) => `<div class="sequence-row"><span>${esc(a.label)}</span><button class="btn small danger" data-remove="${i}">Retirer</button></div>`).join("") : "<p class='subtle'>Ajoutez une action depuis la liste ci-dessous.</p>"}</div><div class="button-row mt"><button class="btn primary" id="sendPlan">Transmettre le plan</button><span class="pill ${S.plan.status.includes("Pris") ? "ok" : ""}">${esc(S.plan.status)}</span></div></article></div>
      <article class="card mt sem-card sem-talent"><h3>Actions disponibles</h3><div class="action-list">${actionRows()}</div></article>${combatAbilityBlock}
      <div class="grid two mt"><article class="card sem-card sem-talent"><h3>Réactions</h3>${(P.reactions || []).map(r => `<div class="action sem-talent"><div><b>${esc(r.name)}</b><small>Rang ${r.rank} • Effort ${r.effort || 0} • ${esc(r.limit || "")}</small></div><button class="btn small semantic-key sem-talent" data-roll="${esc(r.dice)}" data-label="${esc(r.name)}">${r.step} • ${esc(r.dice)}</button></div>`).join("")}</article><article class="card"><h3>Paramètres défensifs</h3><div class="statline" style="grid-template-columns:repeat(3,1fr)">${[['Déf. physique',c.defenses.physical],['Déf. mystique',c.defenses.magical],['Déf. sociale',c.defenses.social],['Armure physique',c.armor.physical],['Armure mystique',c.armor.mystical],['Initiative',c.initiative.step]].map(([l,v])=>`<div class="stat"><small>${l}</small><strong>${v}</strong></div>`).join("")}</div><div class="field mt"><label>Initiative du round</label>${initiativeChooser}<div class="button-row"><input id="initiative" type="number" value="${esc(S.plan.initiative)}" style="width:110px"><button class="btn" id="rollInitiative">Lancer ${esc(initiativeOptions[0].dice)}</button><button class="btn primary" id="sendInitiative">Transmettre</button></div></div></article></div>`;
    $("#proposeHealth").onclick = () => {
      const next = { damage: Number($("#damage").value), wounds: Number($("#wounds").value), karma: Number($("#karma").value), recoveriesUsed: Number($("#recoveries").value) };
      const changes = Object.keys(next).filter(k => next[k] !== Number(S.draft[k])).map(k => ({ field: k, from: Number(S.draft[k]), to: next[k] }));
      if (!changes.length) return toast("Aucun changement à proposer.");
      Object.assign(S.draft, next); proposal(changes, "État du personnage", "healthState");
    };
    $("#rollRecovery").onclick = () => showCombatRoll("Récupération", c.recovery.dice);
    const selectedInitiative = () => initiativeOptions[Number($("#initiativeMode")?.value || 0)] || initiativeOptions[0];
    if ($("#initiativeMode")) $("#initiativeMode").onchange = () => { const option = selectedInitiative(); $("#rollInitiative").textContent = `Lancer ${option.dice}`; };
    $("#rollInitiative").onclick = () => { const option = selectedInitiative(), r = rollDice(option.dice); S.plan.initiative = r.total; save(); $("#initiative").value = r.total; showCombatRoll(option.label, option.dice, r); };
    $("#sendInitiative").onclick = () => { S.plan.initiative = Number($("#initiative").value); save(); Sync.sendToGM({ type: "earthdawn-player-initiative", round: S.combat.round, initiative: S.plan.initiative }); toast("Initiative transmise."); };
    $("#planOption").onchange = e => { S.plan.option = e.target.value; save(); };
    $("#planTarget").oninput = e => { S.plan.target = e.target.value; save(); };
    $("#planNote").oninput = e => { S.plan.note = e.target.value; save(); };
    page("combat").querySelectorAll("[data-add-action]").forEach(btn => btn.onclick = () => { const action = P.actions.find(x => x.id === btn.dataset.addAction); if (action) { S.plan.actions.push({ id: action.id, label: action.label }); save(); renderCombat(); } });
    page("combat").querySelectorAll("[data-remove]").forEach(btn => btn.onclick = () => { S.plan.actions.splice(Number(btn.dataset.remove), 1); save(); renderCombat(); });
    page("combat").querySelectorAll("[data-roll]").forEach(btn => btn.onclick = () => showCombatRoll(btn.dataset.label, btn.dataset.roll));
    $("#sendPlan").onclick = sendPlan;
    $("#openVision").onclick = requestVision;
  }
  function showCombatRoll(label, dice, result) { const r = result || rollDice(dice); const out = $("#combatRoll"); if (out) out.innerHTML = `<strong>${r.total}</strong> — ${esc(label)}<br><small>${esc(dice)} • ${r.rolls.map(x => `d${x.sides}:${x.roll}${x.exploded ? "↻" : ""}`).join(" · ")}</small>`; }
  function sendPlan() {
    S.plan.round = S.combat.round; S.plan.status = "Envoyé — attente du MJ"; save();
    Sync.sendToGM({ type: "earthdawn-player-plan", round: S.combat.round, submittedAt: now(), plan: { option: S.plan.option, target: S.plan.target, note: S.plan.note, sequence: S.plan.actions.map((a, i) => ({ index: i + 1, kind: "action", actionId: a.id, label: a.label })) } });
    renderCombat(); toast("Plan transmis au MJ.");
  }
  let visionWindow = null;
  function requestVision() {
    visionWindow = window.open("", "EarthdawnPlayerView", "width=1280,height=800");
    if (!visionWindow) return toast("Le navigateur a bloqué la fenêtre tactique.");
    visionWindow.document.write("<!doctype html><html lang='fr'><head><meta charset='utf-8'><title>Earthdawn — Vision joueur</title></head><body style='margin:0;background:#101214;color:#ead9b8;font:16px Georgia;padding:30px'><b>Connexion à la vision tactique…</b><p>Le MJ prépare la vue partagée.</p></body></html>"); visionWindow.document.close();
    Sync.sendToGM({ type: "earthdawn-player-view-request" });
  }

  function progressionCost(rank) { return COSTS[Number(rank)] || 0; }
  function renderProgress() {
    const available = P.legend.available;
    page("progress").innerHTML = `<div class="page-head"><div><h2>Progression</h2><p>Préparer des dépenses de Points de Légende, sans modifier la continuité.</p></div></div>
      <div class="grid four">${heroMetric("Total acquis", fmt(P.legend.total), "PL")}${heroMetric("Dépensés", fmt(P.legend.spent), "PL")}${heroMetric("Disponibles", fmt(available), "PL")}${heroMetric("Propositions", pendingCount(), "en attente ou envoyées")}</div>
      <div class="grid two mt"><article class="card"><h3>Nouvelle proposition</h3><div class="form-grid"><div class="field wide"><label>Talent ou compétence</label><select id="progressItem"><option value="">Choisir…</option><optgroup label="Talents">${(P.talents || []).map(x => `<option>${esc(x.name)}</option>`).join("")}</optgroup><optgroup label="Compétences">${(P.skills || []).map(x => `<option>${esc(x.name)}</option>`).join("")}</optgroup></select></div><div class="field"><label>Nouveau rang</label><input id="progressRank" type="number" min="1" max="15" value="1"></div><div class="field"><label>Coût indicatif</label><input id="progressCost" readonly value="${progressionCost(1)} PL"></div><div class="field wide"><label>Contexte / entraînement</label><textarea id="progressNote" placeholder="Mentor, temps consacré, intention…"></textarea></div></div><div class="button-row mt"><button class="btn primary" id="addProgress">Ajouter à la liste</button></div><div class="notice mt"><span class="pill talent">Talent</span> <span class="pill skill">Compétence</span> Le coût est un repère de préparation. Le MJ confirme la catégorie, les prérequis, le temps et le coût final.</div></article>
      <article class="card sem-card sem-gm"><h3>File de validation MJ</h3><div id="proposalList">${renderProposalList()}</div><div class="button-row mt"><button class="btn blue" id="sendProposals">Transmettre au MJ</button></div></article></div>`;
    $("#progressRank").oninput = e => $("#progressCost").value = `${progressionCost(e.target.value)} PL`;
    $("#addProgress").onclick = () => { const item = $("#progressItem").value, rank = Number($("#progressRank").value), cost = progressionCost(rank); if (!item) return toast("Choisissez un talent ou une compétence."); S.proposals.push({ id: id("progress"), playerId: P.playerId, kind: "progression", label: `${item} — rang ${rank}`, cost, note: $("#progressNote").value, status: "draft", createdAt: now() }); save(); renderProgress(); };
    page("progress").querySelectorAll("[data-delete-proposal]").forEach(btn => btn.onclick = () => { S.proposals = S.proposals.filter(x => x.id !== btn.dataset.deleteProposal); save(); renderProgress(); });
    $("#sendProposals").onclick = sendProposals;
  }
  function renderProposalList() { const items = S.proposals.filter(p => p.status !== "approved" && p.status !== "rejected"); return items.length ? items.map(p => `<div class="action"><div><b>${esc(p.label)}</b><small>${esc(p.kind)}${p.cost ? ` • ${fmt(p.cost)} PL` : ""} • ${esc(p.status)}</small></div>${p.status === "draft" ? `<button class="btn small danger" data-delete-proposal="${p.id}">Retirer</button>` : `<span class="pill">${esc(p.status)}</span>`}</div>`).join("") : "<p class='subtle'>Aucune proposition en attente.</p>"; }
  function sendProposals() { const outgoing = S.proposals.filter(p => p.status === "draft"); if (!outgoing.length) return toast("Aucune nouvelle proposition."); outgoing.forEach(p => p.status = "sent"); save(); Sync.sendToGM({ type: "earthdawn-player-proposals", proposals: clone(outgoing), proposedRuntime: clone(S.draft), baseSnapshot: clone(P.snapshot) }); renderProgress(); toast(`${outgoing.length} proposition(s) transmise(s).`); }

  function renderDiscipline() {
    const circleText = [LORE[P.playerId]?.circleTitle || "Passage au troisième Cercle", LORE[P.playerId]?.circleText || "Passage validé dans la continuité de campagne."];
    const spellBlock = (P.spells || []).length ? `<div class="grid two mt"><article class="card sem-card sem-magic"><h3>Sorts connus</h3><div class="chips">${P.spells.map(spell => `<span class="pill magic">${esc(spell)}</span>`).join("")}</div></article><article class="card sem-card sem-thread"><h3>Matrices et filaments préparés</h3><div class="table-wrap"><table><thead><tr><th>Cercle maximal</th><th>Type</th><th>Sort placé</th></tr></thead><tbody>${(P.matrices || []).map(matrix => `<tr><td>${matrix.rank}</td><td><span class="pill thread">${esc(matrix.type)}</span></td><td><b>${esc(matrix.spell)}</b></td></tr>`).join("")}</tbody></table></div></article></div>` : "";
    page("discipline").innerHTML = `<div class="page-head"><div><h2>${esc(P.discipline)} — Cercle ${P.circle}</h2><p>Talents, identité et lecture de la Discipline.</p></div></div><div class="grid two"><article class="card sem-card sem-talent"><h3>Talents connus</h3><div class="table-wrap"><table><thead><tr><th>Talent</th><th>Rang</th><th>Note</th></tr></thead><tbody>${(P.talents || []).map(t => `<tr><td><span class="pill talent">Talent</span> <b>${esc(t.name)}</b></td><td>${t.rank}</td><td>${esc(t.note || "—")}</td></tr>`).join("")}</tbody></table></div></article><article class="card sem-card sem-talent"><h3>Demi-magie</h3><p>${esc(P.halfMagic)}</p><h3>Passage au troisième Cercle</h3><h4>${circleText[0]}</h4><p>${circleText[1]}</p><div class="notice green">Ce passage est un fait de continuité validé, pas une proposition mécanique supplémentaire.</div></article></div>${spellBlock}<article class="card mt"><h3>Traits et tensions</h3><div class="chips">${(P.traits || []).map(x => `<span class="chip">${esc(x)}</span>`).join("")}</div>${(P.gahad || []).length ? `<h4>Gahad</h4>${P.gahad.map(x => `<p>${esc(x)}</p>`).join("")}` : ""}</article>`;
  }

  function renderGear() {
    const locations = ["Tous", ...new Set((P.equipment || []).map(x => x.location))], filtered = S.inventoryFilter === "Tous" ? P.equipment : P.equipment.filter(x => x.location === S.inventoryFilter);
    const companion = P.companion ? `<article class="card mt"><h3>Compagnon animal — ${esc(P.companion.name)}</h3><div class="grid four">${heroMetric("État", esc(P.companion.state), "état actuel")}${heroMetric("Défenses", esc(P.companion.defenses), "physique / mystique / sociale")}${heroMetric("Santé", esc(P.companion.health), "inconscience / mort")}${heroMetric("Morsure", esc(P.companion.attack), `initiative ${P.companion.initiative}`)}</div><p>${esc(P.companion.note)}</p><div class="notice">Déplacement ${esc(P.companion.movement)}. Sur une réussite supérieure ou une blessure grave par morsure : test d’Équilibre DN 7 ou chute.</div></article>` : "";
    page("gear").innerHTML = `<div class="page-head"><div><h2>Équipement</h2><p>Objets, emplacements et disponibilité réelle.</p></div></div><div class="grid three">${heroMetric("Armure", `${P.combat.armor.physical} / ${P.combat.armor.mystical}`, P.combat.armor.label)}${heroMetric("Mouvement", `${P.combat.movement.combat} / ${P.combat.movement.run}`, "combat / course")}${heroMetric("Ressources", P.resources.length, "repères consignés")}</div><article class="card mt"><div class="page-head" style="margin:0 0 12px"><div><h3>Inventaire opérationnel</h3></div><div class="field"><label>Emplacement</label><select id="gearFilter">${locations.map(x => `<option ${S.inventoryFilter === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></div></div><div class="table-wrap"><table><thead><tr><th>Objet</th><th>Qté</th><th>Emplacement</th><th>État</th><th>Note</th></tr></thead><tbody>${filtered.map(x => { const semantic = /filament|trame/i.test(`${x.name} ${x.note || ""}`) ? "thread" : /magique|enchant/i.test(`${x.name} ${x.note || ""}`) ? "magic" : ""; return `<tr><td>${semantic ? `<span class="pill ${semantic}">${semantic === "thread" ? "Filament" : "Magique"}</span> ` : ""}<b>${esc(x.name)}</b></td><td>${x.quantity || 1}</td><td>${esc(x.location)}</td><td><span class="pill ${/équip|dispon/i.test(x.status) ? "ok" : ""}">${esc(x.status)}</span></td><td>${esc(x.note || "—")}</td></tr>`; }).join("")}</tbody></table></div></article>${companion}<div class="grid two mt"><article class="card"><h3>Ressources confirmées</h3>${P.resources.map(x => `<p>${esc(x)}</p>`).join("")}</article><article class="card sem-card sem-gm"><h3>Proposer un changement</h3><div class="form-grid"><div class="field"><label>Objet</label><input id="gearItem" placeholder="Objet concerné"></div><div class="field"><label>Opération</label><select id="gearOperation"><option>Acquérir</option><option>Vendre</option><option>Déplacer</option><option>Consommer</option><option>Réparer</option></select></div><div class="field wide sem-gm"><label>Détail transmis au MJ</label><textarea id="gearNote" placeholder="Quantité, prix, nouvel emplacement, circonstance…"></textarea></div></div><button class="btn primary mt" id="gearProposal">Ajouter comme proposition</button></article></div>`;
    $("#gearFilter").onchange = e => { S.inventoryFilter = e.target.value; save(); renderGear(); };
    $("#gearProposal").onclick = () => { const item = $("#gearItem").value.trim(); if (!item) return toast("Indiquez l’objet concerné."); S.proposals.push({ id: id("inventory"), playerId: P.playerId, kind: "inventory", label: `${$("#gearOperation").value} — ${item}`, note: $("#gearNote").value, status: "draft", createdAt: now() }); save(); toast("Proposition ajoutée à la file de progression."); };
  }

  function splitRelation(text) { const parts = String(text).split(/\s+[—–-]\s+/); return [parts.shift(), parts.join(" — ")]; }
  function renderHistory() {
    const timeline = [...P.history, ...(LORE[P.playerId]?.timeline || [])];
    page("history").innerHTML = `<div class="page-head"><div><h2>Histoire et relations</h2><p>La continuité connue du personnage, sans révélation réservée au MJ.</p></div></div><div class="grid two"><article class="card"><h3>Repères de parcours</h3><div class="timeline">${timeline.map((text, i) => `<div class="timeline-item"><h4>${i === 0 ? "Origines" : i === timeline.length - 1 ? "Situation actuelle" : `Repère ${i + 1}`}</h4><p>${esc(text)}</p></div>`).join("")}</div></article><article class="card"><h3>Relations</h3><div class="relations">${P.relationships.map(text => { const [name, relation] = splitRelation(text); return `<div class="relation"><b>${esc(name)}</b><span>${esc(relation || "Relation connue")}</span></div>`; }).join("")}</div><h3 class="mt">Origine et présence actuelle</h3><p><b>${esc(P.origin)}</b><br>${esc(P.location)}</p><h3 class="mt">Objet intime</h3><p>${esc(LORE[P.playerId]?.intimateObject || "Aucun objet intime distinct n’est encore consolidé.")}</p></article></div><article class="card mt"><h3>Illustration collective</h3><img src="assets/illustrations/groupe.png" alt="Illustration collective des personnages" style="display:block;width:100%;max-height:620px;object-fit:contain;border-radius:10px;background:#efe8dc"></article>`;
  }

  function addMessage(payload, mine) {
    const msg = { id: payload.messageId || id("message"), at: payload.sentAt || now(), from: payload.from || (mine ? P.name : "MJ"), fromId: payload.fromId || "", to: payload.to || "", toLabel: payload.toLabel || participantName(payload.to), text: payload.text || "", whisper: payload.whisper !== false, mine: !!mine };
    if (!S.messages.some(x => x.id === msg.id)) S.messages.push(msg);
    S.messages = S.messages.slice(-150); save(); renderMessages();
  }
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
  function recipients() {
    const known = Object.entries(PLAYER_NAMES).filter(([id]) => id !== P.playerId);
    const online = dedupePresence(S.presence).filter(m => m && m.playerId && m.playerId !== P.playerId);
    const unique = new Map(known.map(([id, name]) => [id, { playerId: id, name }]));
    online.forEach(m => unique.set(m.playerId, m));
    return [["gm", "MJ"], ["all", "Tout le monde"], ...[...unique.values()].map(m => [m.playerId, m.name || participantName(m.playerId)])];
  }
  function renderMessages() {
    const target = page("messages"); if (!target) return;
    const livePresence = dedupePresence(S.presence);
    target.innerHTML = `<div class="page-head"><div><h2>Messages</h2><p>Les murmures entre joueurs restent visibles par le MJ.</p></div></div><div class="chat-layout"><article class="card sem-card sem-player"><h3>Présences</h3><div class="presence">${livePresence.length ? livePresence.map(m => `<div class="member ${m.role === "gm" ? "gm" : "player"}"><i></i><span>${esc(m.name || (m.role === "gm" ? "MJ" : participantName(m.playerId) || "Invité"))}</span></div>`).join("") : "<p class='subtle'>Présences visibles après connexion à la salle.</p>"}</div><div class="notice mt">Sans mot de passe : le lien identifie la salle et le personnage. Le MJ reçoit une copie de chaque murmure.</div></article><article class="card sem-card sem-gm"><h3>Fil de la salle</h3><div class="messages" id="messageList">${S.messages.length ? S.messages.map(m => { const fromGm = m.fromId === "gm" || /^mj$/i.test(m.from || ""), targetLabel = m.toLabel || participantName(m.to); return `<div class="message ${fromGm ? "from-gm" : "from-player"} ${m.mine ? "mine" : ""} ${m.whisper ? "whisper" : ""}"><b>${esc(m.from)}</b>${targetLabel ? ` → ${esc(targetLabel)}` : ""}<div>${esc(m.text)}</div><small>${new Date(m.at).toLocaleString("fr-FR")} ${m.whisper ? "• murmure visible MJ" : "• groupe"}</small></div>`; }).join("") : "<p class='subtle'>Aucun message pour le moment.</p>"}</div><div class="chat-compose"><select id="messageTo">${recipients().map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join("")}</select><input id="messageText" placeholder="Votre message…"><button class="btn primary" id="sendMessage">Envoyer</button></div></article></div>`;
    const list = $("#messageList"); if (list) list.scrollTop = list.scrollHeight;
    $("#sendMessage").onclick = () => { const text = $("#messageText").value.trim(); if (!text) return; const to = $("#messageTo").value, label = recipients().find(x => x[0] === to)?.[1] || to; const payload = { type: "earthdawn-whisper", messageId: id("whisper"), sentAt: now(), from: P.name, fromId: P.playerId, to, toLabel: label, text, whisper: to !== "all", visibility: "gm_and_recipients" }; const targets = to === "all" ? ["all"] : to === "gm" ? ["gm"] : [to, "gm"]; Sync.send(payload, { targets }); addMessage(payload, true); };
  }

  function renderAll() { renderHome(); renderExplore(); renderCombat(); renderProgress(); renderDiscipline(); renderGear(); renderHistory(); renderMessages(); openPage(location.hash.slice(1) || S.page || "home", false); }

  const Sync = window.EarthdawnSync || { configure: () => Sync, start: () => Sync, send: () => false, sendToGM: () => false, status: () => ({ room: "locale", status: "local", presence: [] }) };
  function refreshSyncLabels(detail) {
    const status = detail || Sync.status(), online = status.status === "online", connecting = status.status === "connecting";
    $("#syncDot")?.classList.toggle("online", online); $("#syncDot")?.classList.toggle("connecting", connecting);
    if ($("#syncLabel")) $("#syncLabel").textContent = online ? "Salle en ligne" : connecting ? "Connexion…" : "Salle locale";
    if ($("#syncRoom")) $("#syncRoom").textContent = `Salle : ${status.room || Sync.status().room}`;
    if ($("#roomBadge")) $("#roomBadge").textContent = `Salle ${status.room || Sync.status().room}`;
    if ($("#homeSyncText")) $("#homeSyncText").innerHTML = online ? "<b>Synchronisation distante active.</b><br>Le MJ et les joueurs peuvent utiliser des appareils séparés." : "<b>Mode local actif.</b><br>La configuration distante est prête mais pas encore activée.";
  }
  addEventListener("earthdawn-sync-status", e => refreshSyncLabels(e.detail));
  addEventListener("earthdawn-sync-presence", e => { S.presence = dedupePresence(e.detail.members); save(); renderMessages(); });
  addEventListener("earthdawn-sync-message", e => {
    const d = e.detail.payload || {};
    if (d.type === "earthdawn-cockpit-state" || d.type === "earthdawn-cockpit-hello") {
      if (d.runtime) Object.keys(S.draft).forEach(k => { if (Number.isFinite(Number(d.runtime[k]))) S.draft[k] = Number(d.runtime[k]); });
      if (d.combat) { S.combat = { ...S.combat, ...d.combat, conditions: conditionLabels(d.combat.conditions) }; if (S.plan.round !== S.combat.round) S.plan = { ...baseState().plan, round: S.combat.round }; }
      if (Array.isArray(d.decisions)) applyDecisions(d.decisions); save(); renderHome(); renderCombat();
    } else if (d.type === "earthdawn-player-plan-ack") {
      S.plan.status = d.accepted ? "Pris en compte par le MJ" : `Refusé : ${d.note || "round incompatible"}`; save(); renderCombat();
    } else if (d.type === "earthdawn-player-proposal-decisions") { applyDecisions(d.decisions || []); }
    else if (d.type === "earthdawn-player-view-render" && visionWindow && !visionWindow.closed && d.html) { visionWindow.document.open(); visionWindow.document.write(d.html); visionWindow.document.close(); }
    else if (d.type === "earthdawn-whisper") addMessage(d, false);
  });
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
    if (Array.isArray(value)) return value.map(item => typeof item === "string" ? item : item.label || item.id || "Situation").filter(Boolean);
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
  function applyDecisions(decisions) { decisions.forEach(decision => { const p = S.proposals.find(x => x.id === decision.id); if (p) p.status = decision.decision === "approved" ? "approved" : "rejected"; }); save(); renderProgress(); }

  Sync.configure({ role: "player", playerId: P.playerId, name: P.name }).start();
  S.presence = dedupePresence(Sync.status().presence); save();
  renderAll(); refreshSyncLabels();
  setTimeout(() => Sync.sendToGM({ type: "earthdawn-player-ready", characterId: P.characterId, characterName: P.name, clientVersion: VERSION }), 250);
  setInterval(() => Sync.sendToGM({ type: "earthdawn-player-ping" }), 10000);
})();
