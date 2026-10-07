(function(){
  'use strict';
  const Sync=window.EarthdawnSync;if(!Sync)return;
  const names={pj_0:'Zra’Ul',pj_1:'Kalha',pj_2:'Kal’Zakath',pj_3:'Barbak',pj_4:'Ogunta',pj_5:'Jaskar',pj_6:'Gul’Rak'};
  const catalog=[
  {
    "id": "rations",
    "name": "Vivres et rations",
    "category": "Voyage",
    "status": "available",
    "stock": null,
    "price": "À négocier",
    "note": "Viande et produits des exploitations locales ; conditionnement pour la route à convenir."
  },
  {
    "id": "waterskins",
    "name": "Outres",
    "category": "Voyage",
    "status": "available",
    "stock": null,
    "price": "À négocier",
    "note": "Vues chez un marchand à l’entrée ; contenance et état à choisir."
  },
  {
    "id": "torches",
    "name": "Torches et huile",
    "category": "Voyage",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "À demander aux échoppes ; assortiment et quantité à vérifier."
  },
  {
    "id": "rope",
    "name": "Cordes et matériel de bât",
    "category": "Voyage",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Présence de bêtes de bât et de caravanes ; pièces adaptées à rechercher."
  },
  {
    "id": "arrows",
    "name": "Flèches et traits",
    "category": "Projectiles",
    "status": "available",
    "stock": null,
    "price": "À négocier",
    "note": "Marchand aperçu à l’arrivée. Type de projectile et quantité à préciser."
  },
  {
    "id": "bows",
    "name": "Arcs",
    "category": "Armement",
    "status": "available",
    "stock": null,
    "price": "À négocier",
    "note": "Marchand aperçu à l’entrée. Modèle, puissance et état à examiner."
  },
  {
    "id": "weapons",
    "name": "Autres armes courantes",
    "category": "Armement",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Forgerons et voyageurs armés présents ; offre exacte à vérifier."
  },
  {
    "id": "armor",
    "name": "Armures et protections",
    "category": "Armement",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Occasion, ajustement ou commande à discuter ; aucune pièce précise garantie."
  },
  {
    "id": "repairs",
    "name": "Réparation et entretien à la forge",
    "category": "Service",
    "status": "available",
    "stock": null,
    "price": "À négocier",
    "note": "Forgeron au travail sous un auvent. Devis et délai selon la pièce."
  },
  {
    "id": "lodging",
    "name": "Repas et couchage",
    "category": "Service",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Grande tente près de l’entrée et odeurs de cuisine. Places pour les survivants à négocier avec Dan."
  },
  {
    "id": "healing",
    "name": "Fournitures de soigneur",
    "category": "Soins",
    "status": "unknown",
    "stock": null,
    "price": "À établir",
    "note": "Chercher un vendeur ; le matériel disponible n’a pas été établi."
  },
  {
    "id": "silvermoss",
    "name": "Mousse d’argent",
    "category": "Soins",
    "status": "unknown",
    "stock": null,
    "price": "À établir",
    "note": "Aucun vendeur identifié ; disponibilité à enquêter, pas de stock annoncé."
  },
  {
    "id": "mounts",
    "name": "Montures et bêtes de bât",
    "category": "Transport",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Chevaux et troupeaux visibles. Vente ou location, prix et garanties à négocier."
  },
  {
    "id": "escort",
    "name": "Escorte vers Jerris",
    "category": "Service",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Des cavaliers expérimentés sont présents près des enclos. Dan peut négocier ; aucun engagement conclu."
  },
  {
    "id": "caravan",
    "name": "Place dans une caravane vers Jerris",
    "category": "Transport",
    "status": "unknown",
    "stock": null,
    "price": "À établir",
    "note": "Lieu de passage propice aux contacts ; destination, départ et places restent à trouver."
  },
  {
    "id": "resale",
    "name": "Revente et troc",
    "category": "Commerce",
    "status": "limited",
    "stock": null,
    "price": "À négocier",
    "note": "Présenter les biens et leur état aux marchands ; aucun prix de reprise garanti."
  }
];
  // Référentiel de campagne : valeurs stables, séparées des disponibilités locales.
  const equipmentReference=[
    {id:"dagger",name:"Dague",price:"8 pc",weight:"500 g",status:"Correction de cohérence",note:"Poids unique retenu pour la même arme en mêlée et au jet."},
    {id:"throwing-dagger",name:"Dague de jet",price:"2 PA",weight:"350 g",status:"Correction éditoriale",note:"Le 3,5 kg imprimé est traité comme une coquille."},
    {id:"windling-net",name:"Filet sylphelin",price:"15 PA",weight:"350 g",status:"Correction éditoriale",note:"Le 3,5 kg imprimé est traité comme une coquille."},
    {id:"spear",name:"Lance",price:"9 PA",weight:"1,5 kg",status:"Correction de cohérence",note:"Poids unique retenu pour la même lance en mêlée et au jet."},
    {id:"windling-spear",name:"Lance sylpheline",price:"25 PA",weight:"200 g",status:"Correction éditoriale",note:"La valeur 2 kg imprimée est traitée comme une coquille."},
    {id:"large-shield",name:"Écu",price:"40 PA",weight:"5 kg",status:"Décision maison",note:"Phys +5 • Myst 0 • Init −2 • SD 21 • Peu fréquent."}
  ];
  const carryingReference=[
    [1,3,5,""],
    [2,5,10,""],
    [3,8,15,""],
    [4,10,20,""],
    [5,13,25,""],
    [6,15,30,""],
    [7,20,40,""],
    [8,25,50,""],
    [9,30,60,""],
    [10,35,70,""],
    [11,40,80,""],
    [12,48,95,""],
    [13,55,110,""],
    [14,63,125,""],
    [15,70,140,""],
    [16,80,160,""],
    [17,90,180,""],
    [18,100,200,""],
    [19,115,230,""],
    [20,130,260,""],
    [21,145,290,""],
    [22,165,330,""],
    [23,185,370,""],
    [24,205,410,""],
    [25,230,460,""],
    [26,255,510,""],
    [27,280,560,""],
    [28,310,620,""],
    [29,340,680,""],
    [30,370,740,""],
    [31,410,810,"coquille source corrigée"],
    [32,440,880,""],
    [33,480,960,""],
    [34,520,1040,""],
    [35,550,1110,""],
    [36,600,1200,""],
    [37,650,1300,""],
    [38,690,1380,""],
    [39,730,1460,""],
    [40,780,1560,"coquille source corrigée"],
    [41,830,1660,""],
    [42,880,1760,""],
    [43,940,1880,""],
    [44,1000,2000,""],
    [45,1050,2100,""],
    [46,1110,2220,""],
    [47,1200,2400,""],
    [48,1250,2500,""],
    [49,1300,2600,""],
    [50,1400,2800,""]
  ].map(([strength,carry,lift,note])=>({strength,carry,lift,note}));
  const rulesReference={
    carryingLabel:'Capacité de transport sans malus',
    liftingLabel:'Capacité à soulever',
    encumbrance:'Au-delà de la capacité sans malus, trouver la plus faible FOR dont la capacité couvre la charge. La différence avec la FOR réelle réduit d’autant la valeur de DEX tant que la charge est portée.',
    lifting:'La capacité à soulever est le poids maximal pouvant être soulevé du sol ; on ne peut pas se déplacer en soulevant ce maximum.',
    windlingFlight:'En vol, un sylphelin divise sa capacité de transport par deux.'
  };
  function reference(){
    return JSON.parse(JSON.stringify({equipment:equipmentReference,carrying:carryingReference,rules:rulesReference}));
  }

  const MARKET_REVISION="crete-griffe-arrivee-20260918";
  const WORKFLOW=1;
  const fresh=()=>({revision:MARKET_REVISION,revisionNumber:0,workflowVersion:WORKFLOW,context:{date:'Dernier marché renseigné : séjour du 7 au 21 Riag 1448 TH',location:'Crête-Griffe — ancien marché',archived:true,note:'Le groupe a quitté Crête-Griffe le 22 Riag. Reprise le 28 Riag à l’aube sur la route de Keltanap ; arrivée prévue à midi. Les offres ci-dessous sont celles du précédent séjour, pas des disponibilités confirmées à Keltanap.'},catalog:JSON.parse(JSON.stringify(catalog)),proposals:[],commands:[],updatedAt:''});
  function migrate(saved){
    let next;
    if(saved?.revision===MARKET_REVISION&&Array.isArray(saved.catalog))next=JSON.parse(JSON.stringify(saved));
    else {next=fresh();if(saved){next.marketArchives=[...(saved.marketArchives||[]),{revision:saved.revision,context:saved.context,catalog:saved.catalog,updatedAt:saved.updatedAt}];next.proposals=(saved.proposals||[]).map(p=>({...p,marketRevision:p.marketRevision||saved.revision||'ancien-marche',status:['accepted','rejected'].includes(p.status)?p.status:'needs_review'}));}}
    next.proposals ||= [];next.commands ||= [];next.revisionNumber ||= 0;
    if(saved?.workflowVersion!==WORKFLOW){
      next.proposals=next.proposals.map(p=>p.status==='accepted'?{...p,integrationStatus:p.integrationStatus||'legacy_review'}:p);
      if(/cr[eê]te.griffe/i.test(next.context?.location||''))next.context={...next.context,...fresh().context};
    }
    next.workflowVersion=WORKFLOW;return next;
  }
  const key=()=>`vorkana_circle_${Sync.status().room}_v033`;
  let data,authority=false,started=false;
  function load(){try{data=migrate(JSON.parse(localStorage.getItem(key())||'null'));}catch(_){data=fresh();}}
  function emit(){window.dispatchEvent(new CustomEvent('vorkana-campaign-changed',{detail:{state:data}}));}
  function save(){try{localStorage.setItem(key(),JSON.stringify(data));}catch(_){window.dispatchEvent(new CustomEvent('vorkana-storage-error'));throw Error('Sauvegarde impossible : décision non enregistrée.');}emit();}
  function publicState(){return {revision:data.revision,revisionNumber:data.revisionNumber,context:data.context,catalog:data.catalog,updatedAt:data.updatedAt};}
  function broadcast(){Sync.send({type:'vorkana-hub-state',state:publicState()},{targets:['all']});Sync.send({type:'vorkana-gm-hub-state',state:data},{targets:['gm']});}
  function receipt(p){return {type:'vorkana-market-decision',proposalId:p.id,status:p.status,decidedAt:p.decidedAt,proposal:{...p},proposalVersion:p.proposalVersion||0};}
  function notify(p){Sync.send(receipt(p),{targets:[p.playerId,'gm']});}
  // Persist before announcing a decision. Nothing here modifies an Adept dossier.
  function transaction(change){const before=JSON.parse(JSON.stringify(data));try{change();data.revisionNumber++;data.updatedAt=new Date().toISOString();save();}catch(e){data=before;throw e;}broadcast();}
  function decision(id,status){
    const p=data.proposals.find(p=>p.id===id);if(!p)throw Error('Cette demande n’est plus disponible.');
    if(['accepted','rejected'].includes(p.status)){notify(p);return;}
    if(status==='accepted'&&p.marketRevision!==MARKET_REVISION)throw Error('Demande d’un ancien marché : la reformuler avant acceptation.');
    if(!['accepted','rejected'].includes(status))throw Error('Décision invalide.');
    if(status==='accepted'&&data.context.archived)throw Error('Ce marché est archivé. Confirmez les offres et ouvrez le marché dans Disponibilités MJ.');
    transaction(()=>{
      if(status==='accepted'&&p.kind==='Achat'){
        const item=data.catalog.find(x=>x.id===p.itemId);
        if(item&&(item.status==='unavailable'||item.status==='unknown'))throw Error('Confirmez d’abord la disponibilité de cet objet.');
        if(item&&item.stock!==null){if(Number(item.stock)<p.quantity)throw Error('Le stock disponible est insuffisant.');item.stock-=p.quantity;if(item.stock===0)item.status='unavailable';}
      }
      p.status=status;p.decidedAt=new Date().toISOString();p.proposalVersion=(p.proposalVersion||0)+1;
      if(status==='accepted'){p.integrationStatus='pending_publication';p.integrationNote='Argent et inventaire à intégrer dans le dossier maître, puis à publier par le MJ.';}
    });notify(p);
  }
  function markPublished(id,reference){
    const p=data.proposals.find(p=>p.id===id);if(!p||p.status!=='accepted')throw Error('Seul un accord peut être rapproché du dossier publié.');
    if(p.integrationStatus==='published'){notify(p);return;}
    const ref=String(reference||'').trim();if(ref.length<4||ref.length>500)throw Error('Indiquez la version ou la date du dossier déjà modifié et transféré (4 à 500 caractères).');
    transaction(()=>{p.integrationStatus='published';p.publicationReference=ref;p.publishedAt=new Date().toISOString();p.proposalVersion=(p.proposalVersion||0)+1;});notify(p);
  }
  function command(action,values){const p={type:'vorkana-market-command',marketRevision:MARKET_REVISION,id:'market-command-'+Date.now()+'-'+Math.random().toString(36).slice(2),action,...values};if(authority)return applyCommand(p);Sync.send(p,{targets:['gm']});return 'pending';}
  function applyCommand(p){
    if(p.marketRevision!==MARKET_REVISION)throw Error('Marché ancien : recharger le cockpit et l’espace joueurs.');
    if(data.commands.includes(p.id))return;
    if(p.action==='decision')decision(p.proposalId,p.status);
    else if(p.action==='published')markPublished(p.proposalId,p.reference);
    else if(p.action==='publish'){
      if(Number(p.expectedRevision)!==Number(data.revisionNumber))throw Error('Les disponibilités ont changé. Rechargez les valeurs avant de publier.');
      if(!p.context||!Array.isArray(p.catalog)||p.catalog.length>200)throw Error('Catalogue invalide.');
      if(p.catalog.some(x=>!x.id||!['available','limited','unavailable','unknown'].includes(x.status)||(x.stock!==null&&(!Number.isInteger(x.stock)||x.stock<0))))throw Error('Stock ou disponibilité invalide.');
      transaction(()=>{data.context=p.context;data.catalog=p.catalog;});
    }else return;
    data.commands.push(p.id);save();
  }
  function receive(e){
    if(!started)return;const p=e.detail?.payload||{};
    if(['vorkana-gm-hub-state','vorkana-hub-state'].includes(p.type)&&p.state?.revision!==MARKET_REVISION)return;
    // Only the cockpit is authoritative; a delayed peer snapshot cannot overwrite it.
    if(p.type==='vorkana-gm-hub-state'&&p.state&&!authority&&Number(p.state.revisionNumber)>=Number(data.revisionNumber)){data=migrate(p.state);save();return;}
    if(p.type==='vorkana-hub-state'&&!authority&&p.state&&Number(p.state.revisionNumber)>Number(data.revisionNumber)){Object.assign(data,p.state);save();return;}
    if(!authority)return;
    if(p.type==='vorkana-hub-request'){
      if(p.asGM)Sync.send({type:'vorkana-gm-hub-state',state:data},{targets:['gm']});
      else if(names[p.playerId]){Sync.send({type:'vorkana-hub-state',state:publicState()},{targets:[p.playerId]});data.proposals.filter(x=>x.playerId===p.playerId).forEach(x=>Sync.send(receipt(x),{targets:[p.playerId]}));}
    }else if(p.type==='vorkana-market-proposal'&&p.proposal){
      const x=p.proposal;if(x.marketRevision!==MARKET_REVISION||!names[x.playerId]||!x.id||!['Achat','Vente'].includes(x.kind)||!Number.isInteger(x.quantity)||x.quantity<1||x.quantity>10000)return;
      let known=data.proposals.find(v=>v.id===x.id);
      if(known&&known.playerId!==x.playerId)return;
      if(!known){
        known={id:String(x.id),marketRevision:x.marketRevision,playerId:x.playerId,playerName:names[x.playerId],kind:x.kind,itemId:String(x.itemId||''),itemName:String(x.itemName||'Offre libre').slice(0,250),quantity:x.quantity,price:String(x.price||'').slice(0,250),note:String(x.note||'').slice(0,6000),sentAt:x.sentAt,status:'received',proposalVersion:1};
        transaction(()=>data.proposals.push(known));
      }notify(known);
    }else if(p.type==='vorkana-market-command'){
      try{applyCommand(p);}catch(error){const detail={message:error.message,commandId:p.id};window.dispatchEvent(new CustomEvent('vorkana-campaign-error',{detail}));Sync.send({type:'vorkana-market-error',...detail},{targets:['gm']});}
    }
  }
  window.addEventListener('earthdawn-sync-message',receive);
  window.addEventListener('earthdawn-sync-message',e=>{const p=e.detail?.payload;if(started&&!authority&&p?.type==='vorkana-market-error')window.dispatchEvent(new CustomEvent('vorkana-campaign-error',{detail:p}));});
  window.addEventListener('vorkana-room-changed',()=>{if(started){load();emit();}});
  function pendingIntegration(){return (data||{proposals:[]}).proposals.filter(p=>p.status==='accepted'&&p.integrationStatus!=='published');}
  window.VorkanaCampaign={start(isAuthority){authority=!!isAuthority;started=true;load();if(!authority)Sync.sendToGM({type:'vorkana-hub-request',asGM:true});return this;},state(){if(!data)load();return data;},reference,fresh,migrate,decide:(id,status)=>command('decision',{proposalId:id,status}),markPublished:(id,reference)=>command('published',{proposalId:id,reference}),pendingIntegration,integrationExport:()=>({type:'vorkana-market-integration-review',version:1,room:Sync.status().room,exportedAt:new Date().toISOString(),notice:'Liste de contrôle uniquement. Aucun argent ni inventaire modifié automatiquement.',proposals:JSON.parse(JSON.stringify(pendingIntegration()))}),publish:(context,catalog,expectedRevision)=>command('publish',{context,catalog,expectedRevision}),broadcast};
})();
