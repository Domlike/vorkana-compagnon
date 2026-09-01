window.EARTHDAWN_PLAYER_DATA={
  "pj_1":{
    playerId:"pj_1",characterId:"kalha",name:"Kalha",player:"Florent",people:"Ork",discipline:"Forgeron",circle:3,
    portrait:"Tokens/pj_1_Kalha.png",birth:"1437 TH",age:"10 ou 11 ans",origin:"Rocheville",location:"Rocnoir — à bord de l’Insoumise",
    identityLine:"Petite sœur de Kal’Zakath • Forge sans Porte • Introvertie et protectrice",
    traits:["Introvertie","Protectrice","Passion Feu"],passions:["Lochost 30","Thystonius 40","Upandal 10"],
    gahad:["Lorsqu’une personne extérieure à ses proches manque de respect à Kal’Zakath.","Lorsqu’on dénigre ses œuvres ou l’art sans formuler une critique de connaisseur."],
    legend:{total:7285,spent:7100,available:185},
    attributes:[
      {name:"Dextérité",value:15,step:6,dice:"D10"},{name:"Force",value:13,step:6,dice:"D10"},{name:"Constitution",value:14,step:6,dice:"D10"},
      {name:"Perception",value:16,step:7,dice:"D12"},{name:"Volonté",value:13,step:6,dice:"D10"},{name:"Charisme",value:7,step:4,dice:"D6"}
    ],
    combat:{initiative:{step:3,dice:"D4",note:"Dextérité 6 − malus d’armure 3"},defenses:{physical:8,magical:9,social:5},armor:{physical:8,mystical:1,label:"Cotte de mailles et targe"},health:{unconscious:42,death:53,woundThreshold:10},recovery:{max:3,step:6,dice:"D10"},movement:{combat:30,run:60},balance:{step:6,dice:"D10"},karma:{current:10,max:40,step:5,dice:"D8"}},
    actions:[
      {id:"kalha_mace",label:"Masse d’armes",kind:"Attaque de mêlée",testStep:9,testDice:"D8+D6",damageStep:14,damageDice:"2D12",karma:"Non",effort:0,note:"Masse reforgée deux fois ; le Cockpit conserve le niveau de dommages total 14."},
      {id:"kalha_shield",label:"Coup de bouclier",kind:"Action simple",testStep:7,testDice:"D12",damageStep:7,damageDice:"D12",karma:"Non",effort:1,note:"Attaque au bouclier ; Effort 1."}
    ],
    reactions:[
      {name:"Parade",rank:4,step:10,dice:"D10+D6",effort:1,limit:"Contact"},
      {name:"Volonté de fer",rank:4,step:10,dice:"D10+D6",effort:1,limit:"Attaques visant la Défense magique",karma:true}
    ],
    talents:[
      {name:"Armes de mêlée",rank:3},{name:"Évaluation",rank:2},{name:"Marchandage",rank:1},{name:"Perfectionnement de lame",rank:4,note:"Spécialisation : Renforcement de flèche"},
      {name:"Rituel de Karma",rank:2},{name:"Volonté de fer",rank:4},{name:"Parade",rank:4},{name:"Endurance",rank:4},{name:"Histoire des armes",rank:4},{name:"Coup de bouclier",rank:1}
    ],
    skills:[
      {name:"Connaissance : Histoire de Barsaive",rank:1},{name:"Connaissance : Légendes et héros",rank:2},{name:"Inscriptions runiques",rank:1},{name:"Don des langues",rank:2},
      {name:"Médecine",rank:1},{name:"Attaque critique",rank:1},{name:"Cuisine",rank:1},{name:"Lecture et écriture",rank:1}
    ],
    halfMagic:"Création et réparation d’armes ou d’armures, avec Perception lorsque la Demi-magie de Forgeron s’applique.",
    equipment:[
      {name:"Masse d’armes reforgée deux fois",location:"En main / ceinture",status:"Disponible",note:"Reforge datée du 30 Strassa 1448 TH dans le fichier maître."},
      {name:"Cotte de mailles",location:"Portée",status:"Équipée",note:"Armure physique 7 ; malus d’initiative 3."},
      {name:"Targe",location:"Bras",status:"Équipée",note:"Armure physique +1 ; permet Coup de bouclier."},
      {name:"Outils de forge et d’inscription",location:"Bagages",status:"À préciser",note:"Contenu détaillé non encore consolidé."}
    ],
    resources:["Aucun objet à trame confirmé.","Monnaie et charge détaillée à consolider avec le joueur."],
    history:[
      "Fille de Doomir Vent de Glace et petite sœur de Kal’Zakath, Kalha transforme la mémoire, les serments et les objets en choses tangibles.",
      "Elle a forgé les médaillons de Vorkana et son expertise est devenue centrale depuis la découverte du Coffre d’Anesidora.",
      "Son passage au troisième Cercle, « Le Cercle qui tient », lui a appris qu’une œuvre peut rester sienne sans lui appartenir seule.",
      "Dans la nuit du 29 au 30 Sollus 1448, elle a défendu l’option d’exfiltration ayant permis de libérer Katsika sans alarme ni combat."
    ],
    relationships:["Kal’Zakath — grand frère","Doomir Vent de Glace — père mort, qu’elle croit disparu ou en fuite","Marda Braise-Sourde — mentor Forgeronne","Barbak et Ogunta — cousins","Le groupe — mémoire artisanale et réparatrice"],
    snapshot:{karma:10,damage:0,wounds:0,recoveriesUsed:0}
  },
  "pj_6":{
    playerId:"pj_6",characterId:"gulrak",name:"Gul’Rak",fullName:"Gullûz Zug-Rak",player:"Olivier",people:"Ork",discipline:"Voleur",circle:3,
    portrait:"Tokens/pj_6_Gul_Rak.png",birth:"1431 TH",age:"16 ou 17 ans",origin:"Routes de Rocheville",location:"Rocnoir — à bord de l’Insoumise",
    identityLine:"L’Ombre de la famille • Débrouillard et solitaire • « Lok Nolosh »",
    traits:["Débrouillard","Solitaire","Besoin caché d’affection et de reconnaissance"],passions:["Chorrolis 10"],
    gahad:["Lorsqu’il estime avoir été trompé, lésé ou volontairement privé de sa juste part lors du partage d’un butin, il confronte le responsable ou cherche à rétablir le partage."],
    legend:{total:7285,spent:6900,available:385},
    attributes:[
      {name:"Dextérité",value:19,step:8,dice:"2D6"},{name:"Force",value:14,step:6,dice:"D10"},{name:"Constitution",value:14,step:6,dice:"D10"},
      {name:"Perception",value:14,step:6,dice:"D10"},{name:"Volonté",value:10,step:5,dice:"D8"},{name:"Charisme",value:10,step:5,dice:"D8"}
    ],
    combat:{initiative:{step:8,dice:"2D6"},defenses:{physical:10,magical:8,social:6},armor:{physical:4,mystical:1,label:"Cuir rembourré"},health:{unconscious:38,death:49,woundThreshold:10},recovery:{max:3,step:6,dice:"D10"},movement:{combat:38,run:76},balance:{step:6,dice:"D10"},karma:{current:6,max:40,step:5,dice:"D8"}},
    actions:[
      {id:"gul_short",label:"Épée courte",kind:"Attaque de mêlée",testStep:12,testDice:"2D10",damageStep:10,damageDice:"D10+D6",karma:"Non",effort:0},
      {id:"gul_short_surprise",label:"Épée courte — Attaque surprise",kind:"Attaque de mêlée",testStep:12,testDice:"2D10",damageStep:13,damageDice:"D12+D10",karma:"Non",effort:0,note:"Seulement si les conditions d’Attaque surprise sont réellement remplies."},
      {id:"gul_dagger",label:"Dague",kind:"Attaque de mêlée",testStep:12,testDice:"2D10",damageStep:8,damageDice:"2D6",karma:"Non",effort:0},
      {id:"gul_second",label:"Deuxième attaque — épée courte",kind:"Action supplémentaire",testStep:9,testDice:"D8+D6",damageStep:10,damageDice:"D10+D6",karma:"Non",effort:2}
    ],
    reactions:[{name:"Esquive",rank:3,step:11,dice:"D10+D8",effort:1,limit:"Résultat Bon requis contre une attaque à distance"}],
    talents:[
      {name:"Arme de mêlée",rank:4},{name:"Crochetage",rank:3},{name:"Déplacement silencieux",rank:4},{name:"Escalade",rank:3},{name:"Rituel de Karma",rank:1},
      {name:"Vol à la tire",rank:4},{name:"Attaque surprise",rank:3},{name:"Endurance",rank:4},{name:"Sens des serrures",rank:3},{name:"Détection des pièges",rank:2},{name:"Esquive",rank:3}
    ],
    skills:[
      {name:"Connaissance : Légendes et héros",rank:1},{name:"Connaissance : Routes commerciales de Barsaive",rank:1},{name:"Art : Danse",rank:1},{name:"Don des langues",rank:2},
      {name:"Connaissance de la rue",rank:2},{name:"Analyse des indices",rank:1},{name:"Deuxième attaque",rank:1},{name:"Lecture et écriture throallique",rank:1}
    ],
    halfMagic:"Mettre en place ou contourner les mesures empêchant une intrusion ; reconnaître les serrures ; repérer pièges et passages secrets lorsque la Demi-magie de Voleur s’applique.",
    equipment:[
      {name:"Épées courtes",quantity:2,location:"Ceinture",status:"Disponibles",note:"Dommages niveau 10 ; niveau 13 avec Attaque surprise si ses conditions sont remplies."},
      {name:"Dague",quantity:1,location:"Ceinture",status:"Disponible",note:"Dommages niveau 8."},
      {name:"Armure de cuir rembourrée",location:"Portée",status:"Équipée",note:"Armure 4 physique / 1 mystique."},
      {name:"Sac à dos",location:"Dos",status:"Porté",note:"Couverture, briquet à silex et sept rations."},
      {name:"Mouchoir noir brodé « Gullûz »",location:"Sac",status:"Disponible",note:"Trois points d’argent au revers ; pas un objet à trame."},
      {name:"Torche, gourde, bottes souples, vêtements et bourse",location:"Porté / sac",status:"Disponibles"}
    ],
    resources:["9 PA et 8 PC.","Transport / levage : 48 / 95 kg.","Aucun objet à trame confirmé."],
    history:[
      "Gul’Rak est la contraction de Gullûz Zug-Rak, interprété comme « Mort rampante » ou « Ombre furtive ».",
      "Il protège discrètement sa famille, parfois sans que les intéressés sachent qu’il est intervenu.",
      "Lors de son passage au troisième Cercle, il a renoncé à voler une agrafe-appât et a plutôt « volé leur destination » en falsifiant plusieurs pistes.",
      "Dans la nuit du 29 au 30 Sollus 1448, il a contourné le camp des Naufrageurs, observé sous la tente violette puis participé à l’exfiltration de Katsika."
    ],
    relationships:["Kal’Zakath, Kalha, Ogunta et Barbak — cousins éloignés","Jaskar — ami et passerelle sociale","Miraq Tresse-Sombre — maître exigeante","Le groupe — famille élargie qu’il protège dans l’ombre"],
    snapshot:{karma:6,damage:0,wounds:0,recoveriesUsed:0}
  }
};
