(()=>{'use strict';
const aids=document.getElementById('view-aides');
if(aids&&!document.getElementById('calendarAid')){const card=document.createElement('article');card.id='calendarAid';card.className='card';card.style.marginBottom='18px';card.innerHTML='<span class="tag">Temps et mémoire de campagne</span><h2>Le calendrier de Vorkana</h2><p>Douze mois, les repères des aventures et les jours de fête. Retrouvez le 7 Riag 1448 et consultez les dates prévues séparément.</p><a class="btn" href="Calendrier_Vorkana.html" target="_blank" rel="noopener">Ouvrir le calendrier annuel</a>';aids.prepend(card);}
const host=document.getElementById('console-preparation');if(host&&!document.getElementById('annualCalendarBtn')){const b=document.createElement('a');b.id='annualCalendarBtn';b.className='btn';b.href='Calendrier_Vorkana.html';b.target='_blank';b.rel='noopener';b.textContent='Calendrier annuel';host.append(b);}
})();
