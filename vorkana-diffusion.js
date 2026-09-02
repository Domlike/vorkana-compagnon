(function(){
  'use strict';
  const Sync=window.EarthdawnSync;if(!Sync||window.VorkanaDiffusion)return;
  const isGM=Sync.status().role==='gm';
  if((isGM&&typeof window.openDrawer!=='function')||(!isGM&&!document.getElementById('playerMessageDock')))return;
  const CFG=window.EARTHDAWN_REALTIME_CONFIG||{},BUCKET='vorkana-medias';
  const PEOPLE={'pj_0':'Zra’Ul','pj_1':'Kalha','pj_2':'Kal’Zakath','pj_3':'Barbak','pj_4':'Ogunta','pj_5':'Jaskar','pj_6':'Gul’Rak'};
  const SLOTS={image:'Illustration',document:'À écouter',ambience:'Ambiance',effect:'Effet sonore'};
  const WORDS={received:'Reçu',ready:'Chargé',playing:'Lecture en cours',blocked:'Clic requis',error:'Erreur de chargement',ended:'Terminé',paused:'En pause',stopped:'Arrêté',missed:'Effet passé'};
  const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const root=new URL('.',document.currentScript?.src||location.href),born=Date.now();
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('vorkana-diffusion.css?v=0.36.0',root).href;document.head.appendChild(css);
  let room=Sync.status().room,epoch=0,clientPromise=null,editor=false,userId='',catalog=[],selected=null,examplesPromise=null;
  let controls={},receipts={},playerStates={},audioSlots={},clockOffset=0,refreshing=null,publishBusy=false,uploadBusy=false;
  let retryAt=0,backendMessage='Connexion au partage…',permission=false,panelSlot='image',volume=.65,muted=false;
  try{const pref=JSON.parse(localStorage.getItem('vorkana-media-preferences')||'{}');volume=Number.isFinite(pref.volume)?Math.max(0,Math.min(1,pref.volume)):.65;muted=!!pref.muted;}catch(_){}
  const now=()=>Date.now()+clockOffset;
  const targetsMe=c=>c.targets?.includes('all')||c.targets?.includes(Sync.status().playerId);
  const active=c=>c&&c.action!=='stop'&&c.media;
  const current=(slot,version)=>controls[slot]?.version===version;
  function message(s){if($('vdStatus'))$('vdStatus').textContent=s;}
  function problem(e){const t=e?.message||String(e);return /does not exist|schema cache|PGRST202|Could not find/i.test(t)?'Le partage doit être installé dans Supabase (Installer_la_diffusion.sql).':/anonymous.*disabled/i.test(t)?'Active les connexions anonymes dans Supabase, puis réessaie.':t;}
  function mediaUrl(m){
    if(!m?.path||m.path.includes('..')||/[?#\\]/.test(m.path)||!m.path.includes('/'))throw Error('Chemin de support invalide.');
    return CFG.supabaseUrl.replace(/\/$/,'')+'/storage/v1/object/public/'+BUCKET+'/'+m.path.split('/').map(encodeURIComponent).join('/');
  }
  async function client(){
    if(!CFG.enabled||!CFG.supabaseUrl||!CFG.supabasePublishableKey)throw Error('La synchronisation distante est désactivée.');
    if(!clientPromise)clientPromise=(async()=>{
      for(let i=0;i<150&&!window.supabase?.createClient;i++)await new Promise(r=>setTimeout(r,100));
      if(!window.supabase?.createClient)throw Error('Connexion indisponible. Vérifie Internet puis réessaie.');
      return window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey,{auth:{persistSession:isGM,autoRefreshToken:isGM,detectSessionInUrl:false,storageKey:'vorkana-media-mj-v036'}});
    })().catch(e=>{clientPromise=null;throw e;});return clientPromise;
  }
  async function checkEditor(){
    const db=await client(),session=await db.auth.getSession();if(session.error)throw session.error;
    userId=session.data?.session?.user?.id||'';const r=await db.rpc('vorkana_media_is_editor');if(r.error)throw r.error;
    editor=r.data===true;paintSetup();return editor;
  }
  async function authorize(){
    message('Identification de ce navigateur MJ…');
    try{const db=await client();await checkEditor();if(!userId){const r=await db.auth.signInAnonymously();if(r.error)throw r.error;userId=r.data.user.id;}await checkEditor();message(editor?'Poste autorisé. Tu peux importer tes supports.':'Copie l’autorisation ci-dessous, exécute-la dans SQL Editor, puis clique sur Vérifier.');paintSetup();}catch(e){message(problem(e));}
  }
  const grantSql=()=>`insert into vorkana_private.media_editors(user_id) values ('${userId}') on conflict do nothing;`;
  function paintSetup(){
    if(!$('vdSetup'))return;
    const expanded=$('vdSetup').open;
    $('vdSetup').innerHTML=`<summary>Installation et autorisation du poste ${editor?'· prête':''}</summary><p>${editor?'Ce navigateur MJ peut importer et piloter les supports.':'Une seule installation dans Supabase, puis une autorisation de ce navigateur MJ. Aucun compte joueur à créer.'}</p><div class="vd-actions"><button id="vdAuthorize">Autoriser ce poste</button><button id="vdCheck">Vérifier</button></div>${userId&&!editor?`<label>Autorisation à exécuter dans SQL Editor<textarea id="vdGrant" readonly rows="4">${esc(grantSql())}</textarea></label><button id="vdCopyGrant">Copier l’autorisation</button>`:''}<p class="vd-muted">Le tutoriel dans C:\\Vorkana détaille ces étapes. Aucune clé secrète à copier.</p>`;
    $('vdSetup').open=expanded||!!userId&&!editor;$('vdAuthorize').onclick=authorize;
    $('vdCheck').onclick=async()=>{try{await checkEditor();await library();await refresh(true);paintGallery();paintSelection();message(editor?'Poste autorisé.':'Poste encore en attente d’autorisation.');}catch(e){message(problem(e));}};
    if($('vdCopyGrant'))$('vdCopyGrant').onclick=async()=>{try{await navigator.clipboard.writeText(grantSql());message('Autorisation copiée.');}catch(_){$('vdGrant').focus();$('vdGrant').select();message('Sélectionne ce texte puis Ctrl+C.');}};
    paintUploadState();
  }
  async function examples(){
    if(!examplesPromise)examplesPromise=(async()=>{
      if(!window.VorkanaMediaExamples)await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL('vorkana-medias-exemples.js',root).href;s.onload=resolve;s.onerror=()=>reject(Error('Exemples locaux indisponibles. Choisis les fichiers sur ton ordinateur.'));document.head.appendChild(s);});
      for(const x of window.VorkanaMediaExamples||[])if(!catalog.some(y=>y.example_key===x.key))catalog.push({...x,example_key:x.key,id:'local-'+x.key,url:`data:${x.mime};base64,${x.base64}`,local:true});
    })().catch(e=>{examplesPromise=null;throw e;});return examplesPromise;
  }
  async function library(){
    if(!editor)return;const db=await client(),r=await db.from('vorkana_media_library').select('*').order('created_at',{ascending:false}).limit(500);if(r.error)throw r.error;
    const remote=(r.data||[]).map(m=>({...m,url:mediaUrl(m),local:false})),old=catalog.find(x=>x.id===selected);
    catalog=[...remote,...catalog.filter(x=>x.local&&!remote.some(m=>m.example_key&&m.example_key===x.example_key))];
    if(old?.local&&old.example_key)selected=remote.find(x=>x.example_key===old.example_key)?.id||selected;
  }
  function sniff(bytes){
    const a=Array.from(bytes.slice(0,16)),ascii=(from,n)=>String.fromCharCode(...a.slice(from,from+n));
    if(a[0]===137&&ascii(1,3)==='PNG')return ['image','image/png','png'];
    if(a[0]===255&&a[1]===216&&a[2]===255)return ['image','image/jpeg','jpg'];
    if(ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP')return ['image','image/webp','webp'];
    if(ascii(0,3)==='ID3'||(a[0]===255&&(a[1]&224)===224))return ['audio','audio/mpeg','mp3'];
    if(ascii(0,4)==='RIFF'&&ascii(8,4)==='WAVE')return ['audio','audio/wav','wav'];
    if(ascii(0,4)==='OggS')return ['audio','audio/ogg','ogg'];
    if(ascii(4,4)==='ftyp'&&/M4A|M4B|mp4|isom/.test(ascii(8,4)))return ['audio','audio/mp4','m4a'];
    throw Error('Format non reconnu : PNG, JPEG, WebP, MP3, WAV, OGG ou M4A attendu.');
  }
  async function stageFile(file){
    if(!file||!file.size||file.size>20*1024*1024)throw Error('Choisis un fichier non vide de 20 Mo maximum.');
    const [kind,mime,ext]=sniff(new Uint8Array(await file.slice(0,16).arrayBuffer()));if(kind==='image'&&file.size>10*1024*1024)throw Error('Illustration trop lourde : 10 Mo maximum.');
    const id='local-'+crypto.randomUUID();catalog.push({id,title:file.name.replace(/\.[^.]+$/,''),name:file.name,kind,mime,ext,bytes:file.size,blob:file,url:URL.createObjectURL(file),local:true});selected=id;paintGallery();paintSelection();message('Aperçu local prêt. Clique sur Importer pour le mettre en ligne.');
  }
  async function upload(){
    const item=catalog.find(x=>x.id===selected);if(!item?.local||uploadBusy)return;uploadBusy=true;paintUploadState();
    try{
      if(!await checkEditor())throw Error('Autorise d’abord ce poste MJ.');
      const title=($('vdTitle')?.value||item.title).trim().slice(0,160);if(!title)throw Error('Donne un titre au support.');
      let blob=item.blob;if(!blob){const bytes=Uint8Array.from(atob(item.base64),c=>c.charCodeAt(0));blob=new Blob([bytes],{type:item.mime});}
      const [kind,mime,ext]=sniff(new Uint8Array(await blob.slice(0,16).arrayBuffer()));if(!blob.size||blob.size>(kind==='image'?10:20)*1024*1024)throw Error('Le fichier dépasse la taille autorisée.');
      const db=await client();message('Import en ligne en cours… Garde cette fenêtre ouverte.');
      if(!item.pendingImport){const id=crypto.randomUUID();item.pendingImport={record:{id,owner_id:userId,title,kind,mime,path:userId+'/'+id+'.'+ext,bytes:blob.size,example_key:item.example_key||null},uploaded:false};}
      const pending=item.pendingImport,record=pending.record;
      if(record.owner_id!==userId)throw Error('Reviens au navigateur utilisé au début de cet import.');
      if(!pending.uploaded){const r=await db.storage.from(BUCKET).upload(record.path,blob,{contentType:mime,upsert:false,cacheControl:'3600'});if(r.error&&!/^(409|Duplicate)$/.test(String(r.error.statusCode||r.error.code)))throw r.error;pending.uploaded=true;}
      // En cas de réponse réseau perdue, retrouver le même enregistrement avant de réessayer.
      const found=await db.from('vorkana_media_library').select('*').eq('id',record.id).maybeSingle();if(found.error)throw found.error;
      if(!found.data){const saved=await db.from('vorkana_media_library').insert(record).select().single();if(saved.error)throw saved.error;}
      catalog=catalog.filter(x=>x.id!==item.id);catalog.unshift({...record,url:mediaUrl(record),local:false});selected=record.id;
      if(item.blob)URL.revokeObjectURL(item.url);paintGallery();paintSelection();message('Import terminé. Support en ligne, mais pas encore montré aux joueurs.');
    }catch(e){
      message(problem(e)+(item.pendingImport?' Import non confirmé : réessaie sans fermer la page. Le même fichier sera repris, sans écraser ni supprimer un support. Référence : '+item.pendingImport.record.path:''));
    }finally{uploadBusy=false;paintUploadState();}
  }
  function paintUploadState(){if($('vdUpload'))$('vdUpload').disabled=uploadBusy||!editor;if($('vdFile'))$('vdFile').disabled=uploadBusy;}
  function chosenTargets(){if($('vdEveryone')?.checked)return ['all'];const ids=Array.from(document.querySelectorAll('[data-vd-target]:checked')).map(x=>x.value);if(!ids.length)throw Error('Choisis au moins un destinataire.');return ids;}
  function selectedSlot(){return catalog.find(x=>x.id===selected)?.kind==='image'?'image':($('vdMode')?.value||'document');}
  async function publish(action,slot=selectedSlot(),fromCurrent=false){
    if(publishBusy)return;const capturedRoom=room,capturedEpoch=epoch;
    try{
      const old=controls[slot],item=fromCurrent?old?.media:catalog.find(x=>x.id===selected);if(action!=='stop'&&(!item||item.local))throw Error('Importe ce support avant de le diffuser.');
      const targets=fromCurrent?(old?.targets||['all']):chosenTargets();if(!editor)throw Error('Ce poste MJ doit être autorisé.');
      publishBusy=true;message('Transmission…');const db=await client();if(capturedEpoch!==epoch)throw Error('La salle a changé. Réessaie dans la nouvelle salle.');
      const r=await db.rpc('vorkana_media_publish',{p_room:capturedRoom,p_slot:slot,p_media_id:item?.id||null,p_action:action,p_targets:targets,p_loop:fromCurrent?!!old?.loop:!!$('vdLoop')?.checked,p_volume:1});if(r.error)throw r.error;
      if(capturedEpoch!==epoch)return;apply(r.data);Sync.send({type:'vorkana-media-notice',room,slot},{targets:['all']});message('Commande enregistrée. Les confirmations de chargement arrivent ci-dessus.');
    }catch(e){message(problem(e));}finally{publishBusy=false;}
  }
  async function refresh(force=false){
    if(refreshing)return refreshing;if(!force&&Date.now()<retryAt)return;
    const token=epoch,capturedRoom=room,started=Date.now();
    const job=(async()=>{try{
      const db=await client(),r=await db.rpc('vorkana_media_read',{p_room:capturedRoom});if(r.error)throw r.error;if(token!==epoch)return;
      const server=Date.parse(r.data?.server_time);if(Number.isFinite(server))clockOffset=server-(started+Date.now())/2;
      retryAt=0;backendMessage='Partage disponible';apply(r.data);
    }catch(e){if(token!==epoch)return;retryAt=Date.now()+30000;backendMessage=problem(e);paintReceiver();if(isGM&&$('vdBackend'))$('vdBackend').textContent=backendMessage;}})();
    refreshing=job;await job;if(refreshing===job)refreshing=null;
  }
  function apply(data){
    if(!data||!Array.isArray(data.controls))return;let changed=false;
    for(const c of data.controls){
      if(c.room!==room||!SLOTS[c.slot]||!Number.isSafeInteger(Number(c.version)))continue;c.version=Number(c.version);if(controls[c.slot]?.version>=c.version)continue;
      if(c.media)try{c.media={...c.media,url:mediaUrl(c.media)};}catch(_){continue;}
      controls[c.slot]=c;receipts[c.slot]={};changed=true;if(!isGM)receiveControl(c);
    }
    if(isGM){paintCurrent();if(changed)Sync.send({type:'vorkana-media-receipts-request',room},{targets:['all']});}else paintReceiver();
  }
  function acknowledge(c,status){
    if(c.room!==room||!current(c.slot,c.version))return;playerStates[c.slot]=status;
    Sync.sendToGM({type:'vorkana-media-receipt',room,slot:c.slot,version:c.version,playerId:Sync.status().playerId,status});paintReceiver();
  }
  function stopAudio(slot){const s=audioSlots[slot];if(!s)return;clearTimeout(s.timer);s.ticket++;s.audio.pause();s.audio.oncanplay=null;s.audio.onloadedmetadata=null;s.audio.onerror=null;s.audio.onended=null;}
  function receiveControl(c){
    if(c.slot!=='image')stopAudio(c.slot);
    if(!active(c)||!targetsMe(c)){
      playerStates[c.slot]='stopped';if(c.slot==='document'&&audioSlots.document){audioSlots.document.audio.removeAttribute('src');audioSlots.document.audio.load();}
      if(panelSlot===c.slot)$('vdPlayerPanel').hidden=true;if(targetsMe(c))acknowledge(c,'stopped');return;
    }
    acknowledge(c,'received');if(c.slot==='image'){showPanel('image');return;}
    let s=audioSlots[c.slot];if(!s){const audio=document.createElement('audio');audio.preload='auto';audio.controls=c.slot==='document';s=audioSlots[c.slot]={audio,ticket:0,timer:null,control:null};(c.slot==='document'?$('vdDocumentAudio'):$('vdAudioNodes')).appendChild(audio);}
    s.control=c;const a=s.audio,ticket=s.ticket,still=()=>c.room===room&&current(c.slot,c.version)&&ticket===s.ticket;
    a.oncanplay=()=>{if(still()&&playerStates[c.slot]!=='missed'){acknowledge(c,c.action==='pause'?'paused':'ready');if(c.action==='play')scheduleAudio(c,s);}};
    a.onloadedmetadata=()=>{if(still()&&c.action==='pause')seekAudio(c,s);};a.onerror=()=>{if(still())acknowledge(c,'error');};a.onended=()=>{if(still())acknowledge(c,'ended');};
    a.loop=c.loop&&c.slot==='ambience';setVolumes();const changed=a.getAttribute('src')!==c.media.url;if(changed){a.src=c.media.url;a.load();}else if(a.error||a.networkState===3)a.load();
    if(c.slot==='document'){a.onplay=()=>{if(still())acknowledge(c,'playing');};showPanel('document');}
    else if(c.action==='pause'){seekAudio(c,s);acknowledge(c,'paused');}
    else if(c.action==='play'){
      const start=Date.parse(c.started_at);if(c.slot==='effect'&&(start<born+clockOffset||now()-start>8000)){acknowledge(c,'missed');return;}scheduleAudio(c,s);
    }
    if(a.readyState>=2)a.oncanplay?.();
  }
  function seekAudio(c,s){
    let pos=Number(c.position)||0;if(c.action==='play')pos+=Math.max(0,(now()-Date.parse(c.started_at))/1000);
    if(s.audio.loop&&s.audio.duration>0)pos%=s.audio.duration;
    if(!s.audio.loop&&Number.isFinite(s.audio.duration)&&pos>=s.audio.duration){acknowledge(c,'ended');return false;}
    try{s.audio.currentTime=Math.max(0,pos);}catch(_){}return true;
  }
  function scheduleAudio(c,s){
    clearTimeout(s.timer);if(c.room!==room||!current(c.slot,c.version)||c.action!=='play'||playerStates[c.slot]==='missed')return;
    if(!permission){acknowledge(c,'blocked');return;}const delay=Math.max(0,Date.parse(c.started_at)-now());
    if(delay>0){s.timer=setTimeout(()=>startAudio(c,s),delay);return;}startAudio(c,s);
  }
  function startAudio(c,s){
    if(c.room!==room||!current(c.slot,c.version)||!targetsMe(c)||c.action!=='play')return;
    if(c.slot==='effect'&&now()-Date.parse(c.started_at)>8000){acknowledge(c,'missed');return;}if(!seekAudio(c,s))return;
    const ticket=++s.ticket;s.audio.oncanplay=null;if(s.audio.error||s.audio.networkState===3)s.audio.load();
    s.audio.onloadedmetadata=()=>{if(c.room===room&&current(c.slot,c.version)&&ticket===s.ticket)seekAudio(c,s);};
    s.audio.onerror=()=>{if(current(c.slot,c.version))acknowledge(c,'error');};s.audio.onended=()=>{if(current(c.slot,c.version))acknowledge(c,'ended');};
    try{Promise.resolve(s.audio.play()).then(()=>{
      if(!current(c.slot,c.version)||ticket!==s.ticket){const latest=controls[c.slot];if(!latest||latest.action!=='play'||!targetsMe(latest))s.audio.pause();return;}acknowledge(c,'playing');
    }).catch(e=>{if(current(c.slot,c.version)&&ticket===s.ticket)acknowledge(c,/NotAllowed|autoplay/i.test((e?.name||'')+' '+(e?.message||''))?'blocked':'error');});}catch(e){acknowledge(c,/NotAllowed|autoplay/i.test((e?.name||'')+' '+(e?.message||''))?'blocked':'error');}
  }
  function setVolumes(){for(const s of Object.values(audioSlots)){s.audio.volume=volume*(s.control?.volume??1);s.audio.muted=muted;}}
  function savePreferences(){try{localStorage.setItem('vorkana-media-preferences',JSON.stringify({volume,muted}));}catch(_){}setVolumes();}
  function enableSound(){permission=true;for(const slot of ['ambience','effect']){const c=controls[slot],s=audioSlots[slot];if(active(c)&&c.action==='play'&&s&&targetsMe(c))scheduleAudio(c,s);}paintReceiver();}
  function showPanel(slot){
    const c=controls[slot];if(!active(c)||!targetsMe(c))return;panelSlot=slot;$('vdPlayerPanel').hidden=false;$('vdPanelTitle').textContent=c.media.title;$('vdImageWrap').hidden=slot!=='image';$('vdDocumentWrap').hidden=slot!=='document';
    if(slot==='image'){const img=$('vdPlayerImage');img.onload=()=>acknowledge(c,'ready');img.onerror=()=>acknowledge(c,'error');img.alt=c.media.title;if(img.getAttribute('src')!==c.media.url||(img.complete&&!img.naturalWidth))img.src=c.media.url;else if(img.complete&&img.naturalWidth>0)acknowledge(c,'ready');}
  }
  function playerUI(){
    const box=document.createElement('section');box.id='vdReceiver';box.className='vd vd-sidebar';
    box.innerHTML='<b>Supports reçus</b><p id="vdReceiverStatus" class="vd-muted" aria-live="polite"></p><div class="vd-actions"><button id="vdViewImage" hidden>Illustration</button><button id="vdViewDocument" hidden>À écouter</button></div><div class="vd-actions"><button id="vdSound">Activer le son</button><button id="vdMute">Couper mon son</button></div><label>Mon volume<input id="vdVolume" type="range" min="0" max="100" aria-label="Mon volume"></label><p class="vd-muted">Le volume et la coupure ne concernent que toi.</p>';
    $('playerMessageDock').insertAdjacentElement('afterend',box);
    const panel=document.createElement('section');panel.id='vdPlayerPanel';panel.className='vd vd-player-panel';panel.hidden=true;panel.setAttribute('aria-label','Support partagé par le MJ');
    panel.innerHTML='<header><h3 id="vdPanelTitle"></h3><div class="vd-actions"><button id="vdExpand">Agrandir</button><button id="vdClose">Fermer</button></div></header><div id="vdImageWrap"><img id="vdPlayerImage" alt=""></div><div id="vdDocumentWrap" hidden><p>Document à écouter à ton rythme.</p><div id="vdDocumentAudio"></div></div><div id="vdAudioNodes" hidden></div>';
    document.body.appendChild(panel);$('vdViewImage').onclick=()=>showPanel('image');$('vdViewDocument').onclick=()=>showPanel('document');$('vdClose').onclick=()=>{panel.hidden=true;};
    $('vdExpand').onclick=()=>{$('vdExpand').textContent=panel.classList.toggle('large')?'Réduire':'Agrandir';};$('vdSound').onclick=enableSound;$('vdMute').onclick=()=>{muted=!muted;savePreferences();paintReceiver();};
    $('vdVolume').value=String(volume*100);$('vdVolume').oninput=e=>{volume=Number(e.target.value)/100;savePreferences();};window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)panel.hidden=true;});paintReceiver();
  }
  function paintReceiver(){
    if(isGM||!$('vdReceiver'))return;for(const [slot,id] of [['image','vdViewImage'],['document','vdViewDocument']])$(id).hidden=!(active(controls[slot])&&targetsMe(controls[slot]));
    const entries=Object.values(controls).filter(c=>active(c)&&targetsMe(c));$('vdReceiverStatus').textContent=entries.length?entries.map(c=>`${SLOTS[c.slot]} : ${c.media.title} · ${WORDS[playerStates[c.slot]]||'En attente'}`).join(' / '):(retryAt?'Partage indisponible pour le moment.':'Aucun support diffusé pour le moment.');
    const blocked=entries.some(c=>playerStates[c.slot]==='blocked'),failed=entries.some(c=>['ambience','effect'].includes(c.slot)&&playerStates[c.slot]==='error');$('vdSound').textContent=failed?'Réessayer le son':blocked?'Écouter maintenant':permission?'Son activé':'Activer le son';$('vdSound').classList.toggle('primary',blocked||failed);$('vdMute').textContent=muted?'Rétablir mon son':'Couper mon son';
  }
  function paintGallery(){
    if(!$('vdGallery'))return;$('vdGallery').innerHTML=catalog.map(x=>`<button class="vd-tile ${selected===x.id?'selected':''}" data-vd-item="${esc(x.id)}">${x.kind==='image'?`<img src="${esc(x.url)}" alt="" loading="lazy">`:'<span class="vd-audio-art" aria-hidden="true">♫</span>'}<b>${esc(x.title)}</b><small>${x.local?'Aperçu local · non publié':'En ligne · prêt à diffuser'}</small></button>`).join('');
    $('vdGallery').querySelectorAll('[data-vd-item]').forEach(b=>b.onclick=()=>{if(uploadBusy)return;selected=b.dataset.vdItem;paintGallery();paintSelection();});
  }
  function paintSelection(){
    if(!$('vdPreview'))return;const item=catalog.find(x=>x.id===selected),preserve=$('vdPreview').dataset.selected===selected;
    const draft=preserve?{title:$('vdTitle')?.value,mode:$('vdMode')?.value,everyone:$('vdEveryone')?.checked,loop:$('vdLoop')?.checked,targets:Array.from(document.querySelectorAll('[data-vd-target]')).filter(x=>x.checked).map(x=>x.value)}:null;
    $('vdPreview').dataset.selected=selected||'';$('vdPreview').querySelector('audio')?.pause();
    if(!item){$('vdPreview').innerHTML='<p class="vd-muted">Choisis une illustration ou un son.</p>';return;}
    $('vdPreview').innerHTML=`<h3>${esc(item.title)}</h3>${item.kind==='image'?`<img src="${esc(item.url)}" alt="${esc(item.title)}">`:`<audio controls preload="metadata" src="${esc(item.url)}"></audio>`}<p class="vd-muted">Aperçu réservé au MJ. ${(item.bytes/1048576).toFixed(1)} Mo · aucun envoi aux joueurs.</p>${item.local?'<label>Titre à afficher aux joueurs<input id="vdTitle" maxlength="160"></label><div class="vd-notice">Importer place ce fichier dans le stockage en ligne. Il sera accessible à qui possède son URL, mais pas affiché aux joueurs avant diffusion.</div><button id="vdUpload" class="primary">Importer ce support en ligne</button>':`<div class="vd-people"><label><input type="checkbox" id="vdEveryone" checked> Tout le monde</label>${Object.entries(PEOPLE).map(([id,name])=>`<label><input type="checkbox" data-vd-target value="${id}"> ${esc(name)}</label>`).join('')}</div>${item.kind==='audio'?'<label>Utilisation<select id="vdMode"><option value="document">Document · chacun écoute à son rythme</option><option value="ambience">Ambiance · pilotée par le MJ</option><option value="effect">Effet sonore · une seule fois</option></select></label><label id="vdLoopLabel" hidden><input type="checkbox" id="vdLoop"> En boucle</label>':''}<div id="vdCommands" class="vd-actions"></div>`}`;
    if(item.local){$('vdTitle').value=draft?.title??item.title;$('vdUpload').onclick=upload;paintUploadState();return;}
    $('vdEveryone').onchange=()=>{if($('vdEveryone').checked)document.querySelectorAll('[data-vd-target]').forEach(x=>x.checked=false);};document.querySelectorAll('[data-vd-target]').forEach(x=>x.onchange=()=>{if(x.checked)$('vdEveryone').checked=false;});
    function commands(){const slot=selectedSlot();if($('vdLoopLabel'))$('vdLoopLabel').hidden=slot!=='ambience';$('vdCommands').innerHTML=slot==='image'||slot==='document'?`<button class="primary" data-vd-command="show">${slot==='image'?'Montrer':'Transmettre à écouter'}</button>`:'<button data-vd-command="prepare">Précharger sans jouer</button><button class="primary" data-vd-command="play">Lancer</button>';$('vdCommands').querySelectorAll('[data-vd-command]').forEach(b=>b.onclick=()=>publish(b.dataset.vdCommand));}
    if(draft){if(draft.everyone!==undefined)$('vdEveryone').checked=draft.everyone;if($('vdMode')&&draft.mode)$('vdMode').value=draft.mode;if($('vdLoop'))$('vdLoop').checked=!!draft.loop;document.querySelectorAll('[data-vd-target]').forEach(x=>x.checked=draft.targets.includes(x.value));}
    if($('vdMode'))$('vdMode').onchange=commands;commands();
  }
  function paintCurrent(){
    if(!$('vdCurrent'))return;if($('vdBackend'))$('vdBackend').textContent=backendMessage;const present=new Set((Sync.status().presence||[]).map(x=>x.playerId));
    $('vdCurrent').innerHTML=Object.values(controls).filter(active).map(c=>{
      const ids=c.targets.includes('all')?Object.keys(PEOPLE):c.targets;
      return `<article class="vd-state"><header><b>${SLOTS[c.slot]} · ${esc(c.media.title)}</b><button data-vd-stop="${c.slot}">${c.slot==='image'?'Retirer':'Arrêter'}</button></header><p>${{show:'Diffusé',prepare:'Préchargement silencieux',play:'Lecture demandée',pause:'En pause'}[c.action]||''}${c.loop?' · en boucle':''}</p>${['ambience','effect'].includes(c.slot)?`<div class="vd-actions">${c.action==='play'?`<button data-vd-pause="${c.slot}">Pause</button>`:`<button data-vd-play="${c.slot}">${c.action==='pause'?'Reprendre':'Lancer'}</button>`}</div>`:''}<div class="vd-receipts">${ids.map(id=>{const r=receipts[c.slot]?.[id];return `<span class="${r&&['ready','playing'].includes(r.status)?'ready':'warn'}">${esc(PEOPLE[id]||id)} · ${!present.has(id)?'hors ligne':WORDS[r?.status]||'en attente'}</span>`;}).join('')}</div></article>`;
    }).join('')||'<p class="vd-muted">Aucune diffusion en cours.</p>';
    for(const [attr,action] of [['stop','stop'],['pause','pause'],['play','play']])$('vdCurrent').querySelectorAll(`[data-vd-${attr}]`).forEach(b=>b.onclick=()=>publish(action,b.getAttribute('data-vd-'+attr),true));
  }
  async function open(){
    window.openDrawer('Diffuser — Images et sons','<section class="vd"><p>Préparer un support, choisir les destinataires, puis montrer ou lancer.</p><p id="vdBackend" class="vd-muted"></p><div id="vdCurrent"></div><p class="vd-muted">« Chargé » confirme le chargement sur l’appareil, pas la lecture par la personne. Une ambiance et un effet peuvent jouer ensemble.</p><details id="vdSetup" class="vd-setup"></details><label class="vd-drop" id="vdDrop">Préparer un fichier depuis mon ordinateur<input id="vdFile" type="file" accept="image/png,image/jpeg,image/webp,audio/mpeg,audio/wav,audio/ogg,audio/mp4,.mp3,.m4a,.wav,.ogg"><span class="vd-muted">Images : 10 Mo · sons : 20 Mo. Tu peux aussi déposer un fichier ici.</span></label><div id="vdGallery" class="vd-grid"></div><div id="vdPreview" class="vd-preview"></div><p id="vdStatus" class="vd-status" role="status"></p></section>');
    paintSetup();paintGallery();paintSelection();paintCurrent();const stage=async f=>{try{await stageFile(f);}catch(e){message(problem(e));}};
    $('vdFile').onchange=e=>stage(e.target.files?.[0]);$('vdDrop').ondragover=e=>{e.preventDefault();$('vdDrop').classList.add('dragging');};$('vdDrop').ondragleave=()=>$('vdDrop')?.classList.remove('dragging');$('vdDrop').ondrop=e=>{e.preventDefault();$('vdDrop').classList.remove('dragging');if(!uploadBusy)stage(e.dataTransfer.files?.[0]);};
    await Promise.all([examples().catch(e=>message(problem(e))),checkEditor().then(library).catch(e=>message(problem(e))),refresh(true)]);paintGallery();paintSelection();paintSetup();
  }
  function roomChanged(){
    const next=Sync.status().room;if(next===room)return;room=next;epoch++;retryAt=0;refreshing=null;controls={};receipts={};playerStates={};
    for(const slot of Object.keys(audioSlots)){stopAudio(slot);audioSlots[slot].audio.removeAttribute('src');audioSlots[slot].audio.load();}
    if(!isGM){$('vdPlayerPanel').hidden=true;$('vdPlayerImage').removeAttribute('src');$('vdPlayerImage').onload=null;$('vdPlayerImage').onerror=null;paintReceiver();}else paintCurrent();refresh(true);
  }
  window.addEventListener('vorkana-room-changed',roomChanged);
  window.addEventListener('earthdawn-sync-status',()=>{roomChanged();if(Sync.status().status==='online')refresh(true);});
  window.addEventListener('earthdawn-sync-presence',()=>{if(isGM){paintCurrent();Sync.send({type:'vorkana-media-receipts-request',room},{targets:['all']});}});
  window.addEventListener('earthdawn-sync-message',e=>{
    const p=e.detail?.payload,envelope=e.detail?.envelope;if(!p||p.room!==room||envelope?.room!==room)return;
    if(p.type==='vorkana-media-notice')refresh(true);
    if(!isGM&&p.type==='vorkana-media-receipts-request')for(const c of Object.values(controls))if(targetsMe(c)&&playerStates[c.slot])acknowledge(c,playerStates[c.slot]);
    if(isGM&&p.type==='vorkana-media-receipt'&&PEOPLE[p.playerId]&&envelope.sender?.playerId===p.playerId&&current(p.slot,p.version)&&WORDS[p.status]){receipts[p.slot]??={};receipts[p.slot][p.playerId]={status:p.status};paintCurrent();}
  });
  if(isGM){const b=document.createElement('button');b.className='btn small';b.textContent='Diffuser';b.id='vdOpen';b.onclick=open;(document.querySelector('.mj-scene-controls')||document.querySelector('.top-actions'))?.appendChild(b);}else playerUI();
  // Les notifications font relire l'état courant : aucune ancienne commande n'est rejouée.
  setInterval(()=>refresh(),4000);window.addEventListener('online',()=>refresh(true));window.addEventListener('beforeunload',()=>{for(const slot of Object.keys(audioSlots))stopAudio(slot);});
  window.VorkanaDiffusion={open:isGM?open:()=>showPanel('image'),refresh:()=>refresh(true),status:()=>({room,editor,backend:backendMessage,controls:JSON.parse(JSON.stringify(controls)),playerStates:{...playerStates}})};refresh();
})();
