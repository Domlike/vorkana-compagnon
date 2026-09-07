(function(){
  'use strict';
  if(typeof P==='undefined'||typeof L==='undefined'||typeof STORE==='undefined')return;
  const sync=window.EarthdawnSync;
  let failed=false;
  function status(text,error=false){failed=error;const el=document.getElementById('vorkanaBackupStatus');if(el){el.textContent=text;el.style.color=error?'#a52d27':'';}}
  const originalSave=save;
  save=function(){
    try{const result=originalSave();if(result===false||localStorage.getItem(STORE)!==JSON.stringify(L))throw Error('Stockage indisponible');status('Dossier conservé sur cet appareil.');return true;}
    catch(error){status('Sauvegarde locale impossible : téléchargez votre dossier.',true);window.dispatchEvent(new CustomEvent('vorkana-storage-error'));return false;}
  };
  function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function snapshot(){return {type:'vorkana-player-backup',version:1,createdAt:new Date().toISOString(),playerId:P.playerId,characterId:P.characterId,characterName:P.name,room:sync?.status().room,local:JSON.parse(JSON.stringify(L)),mail:sync?.mailSnapshot?.()||null};}
  function exportBackup(){download(snapshot(),`${P.characterId||P.playerId}_sauvegarde_${new Date().toISOString().slice(0,10)}.json`);}
  async function restore(file){
    if(!file)return;
    try{
      const b=JSON.parse(await file.text());
      if(b.type!=='vorkana-player-backup'||b.version!==1||b.playerId!==P.playerId||!b.local||typeof b.local!=='object'||Array.isArray(b.local)||!Array.isArray(b.local.proposals)||!b.local.draft||!b.local.notes)throw Error('Ce fichier n’est pas une sauvegarde valide de ce personnage.');
      if(b.room!==sync?.status().room)throw Error('Ouvrez la salle « '+String(b.room||'inconnue')+' » avant de reprendre cette sauvegarde.');
      if(b.mail&&(b.mail.room!==b.room||b.mail.identity!==P.playerId))throw Error('La file d’envoi ne correspond pas à cette sauvegarde.');
      if(!confirm('Reprendre cette sauvegarde de '+P.name+' ? Une copie de votre dossier actuel sera téléchargée avant son remplacement. Les données de référence du personnage restent celles de la fiche.'))return;
      exportBackup();
      // Keep an additional browser rollback copy before any replacement.
      localStorage.setItem(STORE+'_avant_reprise',JSON.stringify(L));
      localStorage.setItem(STORE,JSON.stringify(b.local));
      if(b.mail)sync.restoreMail(b.mail);
      location.reload();
    }catch(error){status(error.message,true);alert(error.message);}
  }
  function mount(){
    if(document.getElementById('vorkanaBackup'))return;
    const host=document.getElementById('page-notes')||document.querySelector('main')||document.body;
    const box=document.createElement('section');box.id='vorkanaBackup';box.className='notes-card';box.style.cssText='margin:16px 0;padding:16px;border:1px solid #aa946c;border-radius:8px';
    box.innerHTML='<h3>Sauvegarde de mon dossier</h3><p>Conserve les notes personnelles, messages, propositions et états enregistrés sur cet appareil. À garder pour changer de navigateur ou reprendre votre dossier.</p><button type="button" id="vorkanaExport">Télécharger ma sauvegarde</button> <button type="button" id="vorkanaImport">Reprendre une sauvegarde</button><input hidden type="file" id="vorkanaImportFile" accept=".json,application/json"><p id="vorkanaBackupStatus" role="status">Dossier conservé sur cet appareil.</p>';
    host.appendChild(box);document.getElementById('vorkanaExport').onclick=exportBackup;document.getElementById('vorkanaImport').onclick=()=>document.getElementById('vorkanaImportFile').click();document.getElementById('vorkanaImportFile').onchange=e=>restore(e.target.files[0]);
    // Detect a full or blocked storage before advertising autosave.
    if(save()===false)status('Sauvegarde locale impossible : téléchargez votre dossier.',true);
  }
  window.addEventListener('vorkana-storage-error',()=>status('Sauvegarde locale impossible : téléchargez votre dossier.',true));
  window.VorkanaPlayerBackup={snapshot,exportBackup};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
