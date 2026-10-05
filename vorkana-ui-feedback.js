/* Vorkana UI Feedback — 2026-10-06
   Couche commune dossiers PJ + Cockpit :
   - images reçues : miniature + visionneuse flottante déplaçable/redimensionnable
   - chansons : transmission titre/auteur/paroles
   - thème "Parchemin doux" (Ogunta par défaut)
   - métadonnées de messagerie compactes
   - aide contextuelle des options de combat, alignée sur 06_Regles_et_decisions_de_table
*/
(function(){
  "use strict";

  const VERSION = "2026.10.06.2";
  const KEY_PREFIX = "vorkana-ui-feedback:";
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

  function playerObject(){
    try { return (typeof P !== "undefined" && P && typeof P === "object") ? P : null; }
    catch(_){ return null; }
  }
  function cockpitState(){
    try { return (typeof state !== "undefined" && state && typeof state === "object") ? state : null; }
    catch(_){ return null; }
  }
  function isPlayerPage(){ return !!document.getElementById("playerMessageDock"); }
  function isCockpitPage(){
    try { return typeof playerClientPost === "function" && !!cockpitState()?.players; }
    catch(_){ return false; }
  }
  function storageGet(key, fallback){
    try{
      const raw = localStorage.getItem(KEY_PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    }catch(_){ return fallback; }
  }
  function storageSet(key, value){
    try{ localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value)); }catch(_){}
  }

  /* ---------- Styles communs ---------- */
  function installStyles(){
    if(document.getElementById("vuiFeedbackStyles")) return;
    const style = document.createElement("style");
    style.id = "vuiFeedbackStyles";
    style.textContent = `
      .vui-hidden{display:none!important}
      .vui-meta{
        display:block!important;margin-top:4px!important;
        font-size:10px!important;line-height:1.25!important;
        color:inherit!important;opacity:.8!important;font-weight:400!important;
        letter-spacing:0!important
      }
      .player-message-dock small,.player-message-dock time,
      .player-message-dock [class*="meta"],.player-message-dock [class*="status"]{
        font-size:10px!important;opacity:.8
      }
      .player-message-dock img[data-vui-image]{
        display:block!important;position:static!important;
        width:auto!important;max-width:100%!important;height:auto!important;
        max-height:170px!important;object-fit:contain!important;
        margin:7px 0!important;border-radius:7px!important;
        cursor:zoom-in!important;box-shadow:0 2px 8px #0002!important
      }
      .vui-song-shelf{display:grid;gap:7px;margin-top:7px}
      .vui-song{
        border:1px solid rgba(135,111,72,.42);border-radius:7px;
        background:rgba(255,249,235,.92);color:#3e3428;overflow:hidden
      }
      .vui-song summary{cursor:pointer;padding:8px 9px;list-style:none}
      .vui-song summary::-webkit-details-marker{display:none}
      .vui-song summary b{display:block;font-size:12px}
      .vui-song summary small{display:block;margin-top:2px;color:#766a59;font-size:10px}
      .vui-song pre{
        margin:0;padding:10px 11px 12px;border-top:1px solid #ded0b9;
        white-space:pre-wrap;overflow-wrap:anywhere;
        font:12px/1.48 Georgia,"Times New Roman",serif;color:#3f362c;
        background:rgba(245,237,220,.92)
      }

      /* Visionneuse */
      .vui-image-viewer{
        position:fixed;z-index:100000;left:56vw;top:12vh;
        width:min(620px,42vw);height:min(650px,72vh);min-width:300px;min-height:220px;
        resize:both;overflow:hidden;border:1px solid #8d7b62;border-radius:9px;
        background:#29251f;box-shadow:0 16px 48px #0008;color:#eee3cf
      }
      .vui-image-viewer.minimized{height:auto!important;min-height:0!important;resize:none}
      .vui-image-viewer.minimized .vui-viewer-body{display:none}
      .vui-viewer-head{
        min-height:38px;display:flex;align-items:center;gap:6px;padding:5px 7px;
        cursor:move;user-select:none;background:#40382e;border-bottom:1px solid #675a49
      }
      .vui-viewer-head b{flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .vui-viewer-head button{
        border:1px solid #756653;border-radius:4px;background:#554b3f;color:#f4ead7;
        min-width:30px;height:28px;padding:0 7px;cursor:pointer
      }
      .vui-viewer-body{
        width:100%;height:calc(100% - 39px);overflow:auto;
        display:grid;place-items:center;background:
        linear-gradient(45deg,#2b2926 25%,transparent 25%),
        linear-gradient(-45deg,#2b2926 25%,transparent 25%),
        linear-gradient(45deg,transparent 75%,#2b2926 75%),
        linear-gradient(-45deg,transparent 75%,#2b2926 75%),#23211f;
        background-size:22px 22px;background-position:0 0,0 11px,11px -11px,-11px 0
      }
      .vui-viewer-body img{
        max-width:96%;max-height:96%;object-fit:contain;transform-origin:center center;
        transition:transform .08s ease;box-shadow:0 5px 24px #0009
      }

      /* Combat */
      .vui-combat-help{
        margin-top:6px;padding:8px 9px;border-left:4px solid #7d958d;
        border-radius:4px;background:#edf2ed;color:#44564f;font-size:11px;line-height:1.38
      }
      .vui-combat-help b{color:#294557}
      .vui-combat-help .vui-effort{font-weight:800;color:#8b5142}
      .vui-combat-help .vui-source{display:block;margin-top:3px;font-size:9px;opacity:.65}

      /* Bouton thème */
      .vui-theme-button{
        width:100%;margin:3px 0;padding:7px;border:1px solid #c7c7c2;
        border-radius:4px;background:white;color:#333;cursor:pointer
      }

      /* Parchemin doux : réduit les extrêmes noir/blanc sans sacrifier la lisibilité. */
      body.vui-soft-parchment{
        --paper:#d8c9aa!important;--white:#e2d4b8!important;--ink:#3a332c!important;
        --muted:#6f665b!important;--side:#51493f!important;--line:#b5a486!important
      }
      body.vui-soft-parchment,
      body.vui-soft-parchment .content{background:#51493f!important;color:#3a332c!important}
      body.vui-soft-parchment aside{background:#5a5145!important;border-right-color:#796c59!important;color:#eee4d1!important}
      body.vui-soft-parchment .brand{background:#4c453c!important;border-bottom-color:#796c59!important}
      body.vui-soft-parchment nav button,
      body.vui-soft-parchment nav summary{color:#efe5d3!important}
      body.vui-soft-parchment nav button:hover,
      body.vui-soft-parchment nav summary:hover,
      body.vui-soft-parchment nav button.active{background:#716657!important}
      body.vui-soft-parchment .top{
        background:rgba(207,192,161,.97)!important;border-bottom-color:#a38f70!important;color:#342e27!important
      }
      body.vui-soft-parchment .identity-page,
      body.vui-soft-parchment .progression-page,
      body.vui-soft-parchment .combat-round-page,
      body.vui-soft-parchment .notes-page{
        background:linear-gradient(135deg,#d6c5a4,#c9b48e)!important;
        color:#3b332b!important
      }
      body.vui-soft-parchment .c,
      body.vui-soft-parchment .rb,
      body.vui-soft-parchment .act,
      body.vui-soft-parchment .reader,
      body.vui-soft-parchment .nc-card,
      body.vui-soft-parchment .cr-card,
      body.vui-soft-parchment .discipline-section,
      body.vui-soft-parchment .notes-card,
      body.vui-soft-parchment .interlude-card,
      body.vui-soft-parchment table,
      body.vui-soft-parchment td{
        background:#e0d1b5!important;color:#3c342c!important;border-color:#b8a587!important
      }
      body.vui-soft-parchment input,
      body.vui-soft-parchment select,
      body.vui-soft-parchment textarea{
        background:#e9dcc2!important;color:#332d27!important;border-color:#ab9879!important
      }
      body.vui-soft-parchment .notice,
      body.vui-soft-parchment .quote,
      body.vui-soft-parchment .cr-note,
      body.vui-soft-parchment .cr-info{
        background:#d4c5a9!important;color:#40382f!important
      }
      body.vui-soft-parchment .sidebar-state{background:#484238!important;border-color:#756a58!important}
      body.vui-soft-parchment .sidebar-wounds{background:#5a4840!important}
      body.vui-soft-parchment .player-message-dock{color:#eee4d1}
      body.vui-soft-parchment .vui-song{background:#d8c8aa;color:#3c342b}
      body.vui-soft-parchment .vui-song pre{background:#cfbd9c;color:#3b332b}

      body.vui-soft-parchment .identity-languages,
      body.vui-soft-parchment .discipline-reference,
      body.vui-soft-parchment .nc-card,
      body.vui-soft-parchment .spend-preview,
      body.vui-soft-parchment .training-grid div,
      body.vui-soft-parchment .vui-theme-button{background:#dac9a9!important;color:#3c342c!important}
      body.vui-soft-parchment .top h1{color:#3c342c!important}
      body.vui-soft-parchment .zmsg-dock,body.vui-soft-parchment .zmsg-feed{background:#48463a!important}
      body.vui-soft-parchment .zmsg-item{background:#595544!important}
      .vui-viewer-head{touch-action:none}
      /* Cockpit : composeur chansons */
      #vuiSongOpen{
        position:fixed;right:18px;bottom:18px;z-index:99990;
        border:1px solid #8d7650;border-radius:99px;background:#5b472d;color:#fff3dc;
        padding:9px 13px;font-weight:800;box-shadow:0 5px 18px #0005;cursor:pointer
      }
      .vui-modal-backdrop{
        position:fixed;inset:0;z-index:100100;background:#0009;
        display:grid;place-items:center;padding:20px
      }
      .vui-modal{
        width:min(760px,96vw);max-height:90vh;overflow:auto;border:1px solid #9d835d;
        border-radius:10px;background:#eee1c7;color:#302920;box-shadow:0 16px 55px #0009;padding:18px
      }
      .vui-modal h2{margin:0 0 12px;font:700 24px Georgia,"Times New Roman",serif;color:#3f3428}
      .vui-modal label{display:block;margin-top:9px;font-size:11px;font-weight:800;color:#61523f}
      .vui-modal input,.vui-modal select,.vui-modal textarea{
        width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border:1px solid #b19b79;
        border-radius:5px;background:#fffaf0;color:#302920;font:inherit
      }
      .vui-modal textarea{min-height:280px;resize:vertical;white-space:pre-wrap}
      .vui-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:13px}
      .vui-modal-actions button{
        border:1px solid #8f7855;border-radius:5px;padding:8px 12px;background:#fff8ea;color:#413528;cursor:pointer
      }
      .vui-modal-actions button.primary{background:#5a482f;color:#fff4df}
      .vui-modal-note{font-size:11px;color:#6f6353;margin-top:7px}

      @media(max-width:760px){
        .vui-image-viewer{left:8px!important;top:8px!important;width:calc(100vw - 16px)!important;height:calc(100vh - 16px)!important;resize:none}
        #vuiSongOpen{right:10px;bottom:10px}
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- Thème ---------- */
  function themeKey(){
    const p = playerObject();
    return "theme:" + (p?.playerId || p?.characterId || p?.name || "player");
  }
  function isOgunta(){
    const p = playerObject();
    return norm(p?.name || p?.usualName || document.title).includes("ogunta");
  }
  function getThemePreference(){
    const explicit = storageGet(themeKey(), null);
    if(explicit === "soft" || explicit === "standard") return explicit;
    return isOgunta() ? "soft" : "standard";
  }
  function applyTheme(pref){
    document.body.classList.toggle("vui-soft-parchment", pref === "soft");
    const btn = document.getElementById("vuiThemeToggle");
    if(btn){
      btn.setAttribute("aria-pressed", pref === "soft" ? "true" : "false");
      btn.textContent = pref === "soft" ? "Contraste : parchemin doux" : "Contraste : standard";
    }
  }
  function installThemeToggle(){
    if(!isPlayerPage() || document.getElementById("vuiThemeToggle")) return;
    const tools = $(".tools");
    if(!tools) return;
    const btn = document.createElement("button");
    btn.id = "vuiThemeToggle";
    btn.className = "vui-theme-button";
    btn.type = "button";
    btn.onclick = () => {
      const next = document.body.classList.contains("vui-soft-parchment") ? "standard" : "soft";
      storageSet(themeKey(), next); applyTheme(next);
    };
    tools.appendChild(btn);
    applyTheme(getThemePreference());
  }

  function compactMessageMetadata(){}
  /* ---------- Visionneuse d'images ---------- */
  let viewer = null, viewerImg = null, viewerZoom = 1;
  function viewerStorageKey(){
    const p = playerObject();
    return "viewer:" + (p?.playerId || p?.name || "player");
  }
  function saveViewerGeometry(){
    if(!viewer || matchMedia("(max-width:760px)").matches) return;
    storageSet(viewerStorageKey(), {
      left:viewer.style.left, top:viewer.style.top, width:viewer.style.width, height:viewer.style.height
    });
  }
  function restoreViewerGeometry(){
    if(!viewer || matchMedia("(max-width:760px)").matches) return;
    const g = storageGet(viewerStorageKey(), null);
    if(!g) return;
    ["left","top","width","height"].forEach(k => { if(g[k]) viewer.style[k] = g[k]; });
  }
  function setViewerZoom(z){
    viewerZoom = Math.max(.25, Math.min(4, z));
    if(viewerImg) viewerImg.style.transform = `scale(${viewerZoom})`;
  }
  function closeViewer(){ if(viewer){ saveViewerGeometry(); viewer.remove(); viewer=null; viewerImg=null; } }
  function openViewer(src, title="Image reçue"){
    closeViewer();
    viewer = document.createElement("section");
    viewer.className = "vui-image-viewer";
    viewer.innerHTML = `
      <div class="vui-viewer-head">
        <b>${esc(title)}</b>
        <button type="button" data-vui="minus" title="Réduire">−</button>
        <button type="button" data-vui="plus" title="Agrandir">+</button>
        <button type="button" data-vui="fit" title="Ajuster">Ajuster</button>
        <button type="button" data-vui="min" title="Réduire la fenêtre">▁</button>
        <button type="button" data-vui="close" title="Fermer">×</button>
      </div>
      <div class="vui-viewer-body"><img alt="${esc(title)}"></div>`;
    document.body.appendChild(viewer);
    viewerImg = $("img", viewer);
    viewer.setAttribute('role','dialog');viewer.setAttribute('aria-label',title);
    viewerImg.src = src;
    viewerZoom = 1;
    restoreViewerGeometry();
    viewer.style.left=Math.max(0,Math.min(parseFloat(viewer.style.left)||40,innerWidth-viewer.offsetWidth))+'px';
    viewer.style.top=Math.max(0,Math.min(parseFloat(viewer.style.top)||40,innerHeight-50))+'px';

    $("[data-vui='minus']", viewer).onclick = () => setViewerZoom(viewerZoom - .2);
    $("[data-vui='plus']", viewer).onclick = () => setViewerZoom(viewerZoom + .2);
    $("[data-vui='fit']", viewer).onclick = () => setViewerZoom(1);
    $("[data-vui='min']", viewer).onclick = () => viewer.classList.toggle("minimized");
    $("[data-vui='close']", viewer).onclick = closeViewer;

    const head = $(".vui-viewer-head", viewer);
    let drag = null;
    head.addEventListener("pointerdown", e => {
      if(e.target.closest("button") || matchMedia("(max-width:760px)").matches) return;
      const r = viewer.getBoundingClientRect();
      drag = {dx:e.clientX-r.left, dy:e.clientY-r.top};
      head.setPointerCapture(e.pointerId); e.preventDefault();
    });
    head.addEventListener("pointermove", e => {
      if(!drag) return;
      const left = Math.max(0, Math.min(innerWidth-viewer.offsetWidth, e.clientX-drag.dx));
      const top  = Math.max(0, Math.min(innerHeight-42, e.clientY-drag.dy));
      viewer.style.left = left+"px"; viewer.style.top = top+"px";
    });
    head.addEventListener("pointerup", e => {
      drag = null; try{ head.releasePointerCapture(e.pointerId); }catch(_){}
      saveViewerGeometry();
    });
    viewer.addEventListener("mouseup", saveViewerGeometry);
    head.addEventListener('pointercancel',()=>{drag=null;});
    viewerImg.addEventListener("wheel", e => {
      e.preventDefault(); setViewerZoom(viewerZoom + (e.deltaY < 0 ? .1 : -.1));
    }, {passive:false});
  }
  function enhanceMediaPanel(){
    const panel=document.getElementById('vdPlayerPanel'),img=document.getElementById('vdPlayerImage');
    if(!panel||!img)return;
    if(!panel.dataset.vuiBridge){
      panel.dataset.vuiBridge='1';
      const syncPanel=()=>{
        if(!panel.hidden&&!document.getElementById('vdImageWrap').hidden&&img.getAttribute('src')){
          openViewer(img.src,img.alt||'Image reçue');panel.hidden=true;
        }
      };
      new MutationObserver(syncPanel).observe(panel,{attributes:true,subtree:true,attributeFilter:['hidden','src']});
      syncPanel();
      window.addEventListener('vorkana-room-changed',closeViewer);
      const button=document.getElementById('vdViewImage');
      if(button)new MutationObserver(()=>{if(button.hidden)closeViewer();}).observe(button,{attributes:true,attributeFilter:['hidden']});
    }
  }
  function enhanceMessageImages(){
    enhanceMediaPanel();
    const dock = document.getElementById("playerMessageDock");
    if(!dock) return;
    $$("img", dock).forEach(img => {
      if(img.dataset.vuiImage === "1") return;
      img.dataset.vuiImage = "1";
      img.title = "Ouvrir l’image dans une fenêtre déplaçable";
      img.addEventListener("click", e => {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        openViewer(img.currentSrc || img.src, img.alt || "Image reçue");
      }, true);
    });
  }

  function renderSongs(){}
  /* ---------- Aide des options de combat ---------- */

  function combatOptionSelects(){
    return $$("label").filter(l => norm(l.textContent).includes("option de combat"))
      .map(l => l.parentElement?.querySelector("select")).filter(Boolean);
  }
  function updateCombatHelp(select){
    if(!select) return;
    let help = select.parentElement?.querySelector(":scope > .vui-combat-help");
    if(!help){
      help = document.createElement("div");
      help.className = "vui-combat-help";
      select.insertAdjacentElement("afterend", help);
    }
    const rules=window.VorkanaCombatOptions;
    const html='<b>'+esc(select.options[select.selectedIndex]?.text||'Option')+'</b><br>'+esc(rules?.hint(select.value)||'Consulter le MJ.');
    if(help.dataset.content!==html){help.dataset.content=html;help.innerHTML=html;}
  }
  function enhanceCombatOptions(){
    combatOptionSelects().forEach(select => {
      if(select.dataset.vuiCombat !== "1"){
        select.dataset.vuiCombat = "1";
        select.addEventListener("change", () => updateCombatHelp(select));
      }
      updateCombatHelp(select);
    });
  }

  /* ---------- Cockpit : composeur de chansons ---------- */
  function cockpitPlayers(){
    const st = cockpitState();
    return (st?.players || []).map((p,i) => ({id:`pj_${i}`,name:p?.name || `PJ ${i+1}`}));
  }
  function cockpitSendSong(target,title,author,lyrics){
    const sync=window.EarthdawnSync,st=cockpitState();
    if(!sync||!st)throw Error('Messagerie indisponible.');
    const payload={type:'earthdawn-whisper',kind:'song',messageId:crypto.randomUUID(),sentAt:new Date().toISOString(),from:'MJ',fromId:'gm',to:target,toLabel:target==='all'?'Tout le monde':cockpitPlayers().find(p=>p.id===target)?.name||target,room:sync.status().room,whisper:target!=='all',title,author,lyrics,text:'♫ '+title+' — '+author+'\n\n'+lyrics};
    st.playerMessages ||= [];st.playerMessages.push(payload);
    if(typeof saveState==='function')saveState();
    sync.send(payload,{targets:target==='all'?['all']:[target]});
    if(typeof window.mjShowMessages==='function')window.mjShowMessages(target);
  }
  function openSongComposer(){
    if(document.getElementById("vuiSongModal")) return;
    const players = cockpitPlayers();
    const back = document.createElement("div");
    back.id = "vuiSongModal"; back.className = "vui-modal-backdrop";
    back.innerHTML = `<section class="vui-modal" role="dialog" aria-modal="true" aria-labelledby="vuiSongTitle">
      <h2 id="vuiSongTitle">Transmettre les paroles d’une chanson</h2>
      <label>Destinataire<select id="vuiSongTarget"><option value="all">Tous les PJ</option>${players.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("")}</select></label>
      <label>Auteur / interprète<input id="vuiSongAuthor" value="Jaskar" maxlength="120"></label>
      <label>Titre<input id="vuiSongName" placeholder="Titre de la chanson" maxlength="180"></label>
      <label>Paroles<textarea id="vuiSongLyrics" maxlength="10000" placeholder="Coller les paroles ici…"></textarea></label>
      <div class="vui-modal-note">Les retours à la ligne sont conservés. Chez le joueur, les paroles restent repliées tant qu’il ne choisit pas de les ouvrir.</div>
      <div class="vui-modal-actions"><button type="button" data-act="cancel">Annuler</button><button type="button" class="primary" data-act="send">Transmettre</button></div>
    </section>`;
    document.body.appendChild(back);
    $("[data-act='cancel']",back).onclick = () => back.remove();
    back.addEventListener("click",e=>{if(e.target===back)back.remove()});
    $("[data-act='send']",back).onclick = () => {
      const target = $("#vuiSongTarget",back).value;
      const title = $("#vuiSongName",back).value.trim() || "Chanson";
      const author = $("#vuiSongAuthor",back).value.trim() || "Jaskar";
      const lyrics = $("#vuiSongLyrics",back).value.trim();
      if(!lyrics){ alert("Ajoute les paroles avant l’envoi."); return; }
      if(lyrics.length>10000){alert('Limite : 10 000 caractères de paroles.');return;}
      try{cockpitSendSong(target,title,author,lyrics);}catch(error){alert(error.message);return;}
      try{ if(typeof showToast==="function") showToast(`Paroles transmises : ${title}`); }catch(_){}
      back.remove();
    };
    setTimeout(()=>$("#vuiSongName",back)?.focus(),0);
  }
  function installCockpitSongButton(){
    if(!isCockpitPage() || document.getElementById("vuiSongOpen")) return;
    const btn = document.createElement("button");
    btn.id="vuiSongOpen";btn.type="button";btn.textContent="♫ Paroles";
    btn.title="Transmettre une chanson avec ses paroles";
    btn.onclick=openSongComposer;
    document.body.appendChild(btn);

  }

  /* ---------- Installation joueur ---------- */
  let playerObserver = null;
  let refreshScheduled = false;
  function refreshPlayerUi(){
    refreshScheduled=false;
    installThemeToggle(); compactMessageMetadata(); enhanceMessageImages(); renderSongs(); enhanceCombatOptions();
  }
  function scheduleRefresh(){
    if(refreshScheduled) return; refreshScheduled=true;
    requestAnimationFrame(refreshPlayerUi);
  }
  function installPlayer(){
    installThemeToggle();
    renderSongs();
    compactMessageMetadata();
    enhanceMessageImages();
    enhanceCombatOptions();



    if(!playerObserver){
      playerObserver = new MutationObserver(scheduleRefresh);
      playerObserver.observe(document.body,{childList:true,subtree:true,characterData:false});
    }

    /* Capture avant les anciens gestionnaires d'image pour éviter l'ouverture d'un panneau fixe. */
    document.addEventListener("click",e=>{
      const img=e.target?.closest?.("#playerMessageDock img");
      if(!img) return;
      if(img.dataset.vuiImage!=="1") img.dataset.vuiImage="1";
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      openViewer(img.currentSrc||img.src,img.alt||"Image reçue");
    },true);
  }

  function boot(){
    installStyles();
    window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeViewer();document.getElementById('vuiSongModal')?.remove();}});
    if(isPlayerPage()) installPlayer();
    if(isCockpitPage()) installCockpitSongButton();
    document.documentElement.dataset.vuiFeedback = VERSION;
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
