(function(){
'use strict';
const root=new URL('.',document.currentScript.src);
function fail(){const box=document.createElement('p');box.style.cssText='padding:12px;background:#fff0cf;color:#342410';box.textContent='La référence de séance n’a pas pu être chargée. Rechargez la page ; les valeurs conservées sur cet appareil restent intactes.';document.body.prepend(box);}
const reference=document.createElement('script');reference.src=new URL('vorkana-session-reference.js?load='+Date.now(),root).href;reference.onerror=fail;reference.onload=()=>{const authority=document.createElement('script');authority.src=new URL('vorkana-session-authority.js?v=20261003-1',root).href;authority.onerror=fail;document.body.append(authority);};document.body.append(reference);
})();
