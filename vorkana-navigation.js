(()=>{'use strict';
const names=['ZraUl','Kalha','KalZakath','Barbak','Ogunta','Jaskar','GulRak'];const file=decodeURIComponent(location.pathname.split('/').pop()||'index.html');const index=names.findIndex(n=>file.startsWith(n+'_Dossier_'));const params=new URLSearchParams(location.search);const role=params.get('role')==='gm'?'gm':'player';if(index>=0)params.set('player','pj_'+index);
function link(target){const u=new URL((/\/Poste_MJ\//i.test(location.pathname)&&target.startsWith('index.html')?'../Site_Joueurs/':'')+target,location.href);const doc=u.searchParams.get('document');u.search=params.toString();u.searchParams.delete('role');u.searchParams.delete('preview');u.searchParams.delete('document');if(doc)u.searchParams.set('document',doc);return u.href;}
const style=document.createElement('style');style.textContent='.vorkana-return{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.vorkana-return a{display:inline-block;padding:9px 12px;border:1px solid #6c846a;border-radius:8px;background:#20362b;color:#f1eadc;font:14px/1.4 Segoe UI,sans-serif;text-decoration:none}.vorkana-return a:hover,.vorkana-return a:focus-visible{background:#356a47;outline:2px solid #d6b56f;outline-offset:2px}';document.head.append(style);
if(index>=0||file==='Vorkana_Cercle.html'){
const nav=document.createElement('nav');nav.className='vorkana-return';nav.setAttribute('aria-label','Navigation entre les espaces');const entries=[['index.html','← Portail']];if(index>=0)entries.push(['Vorkana_Cercle.html#aides','Règles pour jouer'],['Vorkana_Cercle.html#resources','Vie de mon personnage'],['Vorkana_Cercle.html#requests','Mes demandes et retours MJ']);else if(role!=='gm'){const current=params.get('player')||'',m=/^pj_([0-6])$/.exec(current),n=m?Number(m[1]):-1;if(n>=0&&n<names.length)entries.push([names[n]+'_Dossier_Adepte.html','Mon dossier']);}
if(index>=0){
 const reading=typeof vorkanaReadings!=='undefined'&&vorkanaReadings[names[index]];
 if(reading){const a=document.createElement('a');a.href=reading.url;a.textContent=reading.title+' · Nouvelle Aube';a.target='_blank';a.rel='noopener';nav.append(a);}
 if(params.has('activity')&&location.hash==='#notes')window.addEventListener('load',()=>{
  const title=document.getElementById('interludeTitle'),body=document.getElementById('interludeText');
  if(title&&!title.value&&body&&!body.value){title.value=params.get('activity');body.focus();}
 },{once:true});
if(params.get('composer')==='mj')window.addEventListener('load',()=>{
  const input=document.getElementById('zmsgText'),to=document.getElementById('zmsgTo');
  if(input&&to){const dock=input.closest('details');if(dock)dock.open=true;to.value='gm';to.dispatchEvent(new Event('change'));input.focus();input.scrollIntoView({block:'center'});}
 },{once:true});
}
for(const [target,label] of entries){const a=document.createElement('a');a.href=link(target);a.textContent=label;nav.append(a);}const anchor=index>=0?document.querySelector('aside #nav'):document.querySelector('main .top');if(anchor)anchor.before(nav);else document.body.prepend(nav);
}
if(file==='index.html')document.querySelectorAll('a[href]').forEach(a=>{const target=new URL(a.href);if(target.origin!==location.origin||a.getAttribute('href').startsWith('#'))return;const n=names.findIndex(name=>target.pathname.endsWith(name+'_Dossier_Adepte.html'));a.href=link(a.getAttribute('href'));if(n>=0){const u=new URL(a.href);u.searchParams.set('player','pj_'+n);a.href=u.href;}});
})();
