(function () {
  "use strict";

  const data = window.EARTHDAWN_PLAYER_DATA || (window.EARTHDAWN_PLAYER_DATA = {});
  Object.assign(data, {
    pj_3: {
      playerId: "pj_3", characterId: "barbak", name: "Barbak", player: "Fred", people: "Ork", discipline: "Guerrier", circle: 3,
      portrait: "assets/portraits/barbak.png", birth: "1437 TH", age: "10 ou 11 ans", origin: "Rocheville", location: "Rocnoir — à bord de l’Insoumise",
      identityLine: "Le Mur de la famille • Guerrier immense, crédule et profondément loyal",
      traits: ["Crédule", "Sympathique", "Courageux", "Violence protectrice à maîtriser"], passions: ["Thystonius 25", "Garlen 10"],
      gahad: [
        "Lorsqu’il voit Ogunta humiliée, sauf si elle lui demande de ne pas intervenir ou lui fait clairement comprendre qu’elle accepte la situation.",
        "Lorsqu’on le traite de menteur, sauf si l’accusation vient d’une personne qu’il aime et qu’elle est fondée."
      ],
      legend: { total: 7285, spent: 6900, available: 385 },
      attributes: [
        { name: "Dextérité", value: 16, step: 7, dice: "D12" }, { name: "Force", value: 19, step: 8, dice: "2D6" }, { name: "Constitution", value: 14, step: 6, dice: "D10" },
        { name: "Perception", value: 10, step: 5, dice: "D8" }, { name: "Volonté", value: 11, step: 5, dice: "D8" }, { name: "Charisme", value: 10, step: 5, dice: "D8" }
      ],
      combat: {
        initiative: { step: 4, dice: "D6", note: "En cotte de mailles", options: [{ label: "Normale en armure", step: 4, dice: "D6" }, { label: "Avec Danse des airs", step: 8, dice: "2D6", effort: 1 }] },
        defenses: { physical: 9, magical: 6, social: 6 }, armor: { physical: 7, mystical: 1, label: "Cotte de mailles ; protection mystique naturelle" },
        health: { unconscious: 54, death: 69, woundThreshold: 10 }, recovery: { max: 3, step: 6, dice: "D10" }, movement: { combat: 32, run: 64 }, balance: { step: 10, dice: "D10+D6" }, karma: { current: 9, max: 40, step: 5, dice: "D8" }
      },
      actions: [
        { id: "barbak_axe", label: "Hache à deux mains", kind: "Attaque de mêlée", testStep: 11, testDice: "D10+D8", damageStep: 17, damageDice: "D20+D10", karma: "Non", effort: 0, note: "Hache reforgée une fois." },
        { id: "barbak_unarmed", label: "Combat à mains nues", kind: "Attaque de mêlée", testStep: 11, testDice: "D10+D8", damageStep: 8, damageDice: "2D6", karma: "Non", effort: 0 },
        { id: "barbak_fast_kick", label: "Coup de pied rapide", kind: "Action supplémentaire", testStep: 8, testDice: "2D6", damageStep: 8, damageDice: "2D6", karma: "Non", effort: 1 }
      ],
      reactions: [
        { name: "Esquive", rank: 4, step: 11, dice: "D10+D8", effort: 1, limit: "Résultat Bon requis contre une attaque à distance" },
        { name: "Manœuvre", rank: 1, step: 8, dice: "2D6", effort: 0, limit: "Selon la position et la cible" }
      ],
      talents: [
        { name: "Armes de mêlée", rank: 4, step: 11, dice: "D10+D8" }, { name: "Combat à mains nues", rank: 4, step: 11, dice: "D10+D8" }, { name: "Esquive", rank: 4, step: 11, dice: "D10+D8" },
        { name: "Peau de bois", rank: 4, step: 9, dice: "D8+D6" }, { name: "Rituel de Karma", rank: 1, rollable: false, note: "Rituel sans test d’action standard." },
        { name: "Danse des airs", rank: 4, step: 8, dice: "2D6", note: "Initiative en armure ; option également disponible dans Combat." }, { name: "Anticipation", rank: 2, step: 7, dice: "D12" },
        { name: "Endurance", rank: 4, rollable: false, note: "Effet passif." }, { name: "Coup de pied rapide", rank: 1, step: 8, dice: "2D6" }, { name: "Stabilité", rank: 2, step: 10, dice: "D10+D6" }, { name: "Manœuvre", rank: 1, step: 8, dice: "2D6" }
      ],
      skills: [
        { name: "Art : Jonglerie", rank: 1, step: 6, dice: "D10" }, { name: "Connaissance : Armes anciennes", rank: 1, step: 6, dice: "D10" }, { name: "Connaissance : Légendes et héros", rank: 1, step: 6, dice: "D10" },
        { name: "Don des langues", rank: 2, step: 7, dice: "D12" }, { name: "Lecture et écriture", rank: 1, step: 6, dice: "D10" }, { name: "Deuxième attaque", rank: 1, step: 8, dice: "2D6" }, { name: "Charge dévastatrice", rank: 1, step: 9, dice: "D8+D6" }
      ],
      halfMagic: "Entretien et réparation d’armes et d’armures ; connaissances tactiques et stratégiques militaires ; événements marquants de l’histoire militaire de Barsaive.",
      equipment: [
        { name: "Hache à deux mains reforgée", location: "En main / dos", status: "Disponible", note: "Dommages niveau 17 ; reforgée le 8/4/48." },
        { name: "Cotte de mailles", location: "Portée", status: "Équipée", note: "Armure physique 7 ; malus d’initiative 3." },
        { name: "Tente de Zra’Ul", location: "Bagages", status: "Portée", note: "Confiée à Barbak." },
        { name: "Corde", quantity: 1, location: "Bagages", status: "Disponible", note: "15 m ; poids ancien à vérifier." },
        { name: "Kit d’aventurier", location: "Bagages", status: "Disponible", note: "Charge totale enregistrée : 71,5 kg." },
        { name: "Vieille boucle du baudrier de Kash", location: "Sur lui", status: "Disponible", note: "Remise par Koldar lors du passage au troisième Cercle." }
      ],
      resources: ["64 PO, 54 PA et 1 PC — somme portée par Ogunta.", "Transport / levage : 115 / 230 kg.", "Magie du sang : 1 point permanent.", "Aucun objet à trame confirmé."],
      companion: { name: "Brise-Tibia, dit Tib", state: "2 dommages • 2 blessures graves • recommence à se déplacer", note: "Deux pattes ont été brisées. Une fois stable et sans dommages, prévoir encore deux nuits de récupération réussie.", initiative: 5, defenses: "7 / 5 / 5", health: "21 / 30", attack: "Morsure 8 • dommages 11", movement: "32 / 64" },
      history: [
        "Fils de Kash’Ragan et de Rasha Main-Ouverte, Barbak ne garde aucun souvenir conscient de ses parents et connaît leur passé surtout par Ogunta.",
        "Koldar l’a formé depuis son premier Cercle pour qu’il ne devienne pas une simple copie de Kash.",
        "Son courage et sa sympathie le rendent attachant ; sa violence peut devenir dangereuse lorsqu’il protège les siens.",
        "Il a vaincu Nargal, dit le Taureau, par KO pendant les épreuves des Écorcheurs.",
        "Le 29 Sollus, il a protégé Ogunta sous les tirs avec une planche arrachée à la cabane de Katsika."
      ],
      relationships: ["Ogunta — sœur et lien protecteur majeur", "Kash’Ragan et Rasha Main-Ouverte — parents morts en 1437", "Kalha et Kal’Zakath — cousins", "Koldar — maître depuis le premier Cercle", "Brise-Tibia — chien de guerre harmonisé"],
      snapshot: { karma: 9, damage: 0, wounds: 0, recoveriesUsed: 0 }
    },

    pj_4: {
      playerId: "pj_4", characterId: "ogunta", name: "Ogunta", player: "Erik", people: "Ork", discipline: "Nécromant", circle: 3,
      portrait: "assets/portraits/ogunta.png", birth: "1435 TH", age: "12 ou 13 ans", origin: "Rocheville", location: "Rocnoir — à bord de l’Insoumise",
      identityLine: "La Mémoire des morts • Nécromancienne sarcastique, réaliste et protectrice",
      traits: ["Sarcastique", "Cynique", "Protectrice", "Réaliste"], passions: ["Mynbruje 25", "Thystonius 15"],
      gahad: ["Lorsqu’une personne extérieure à sa famille ou à son cercle d’amis proches traite Barbak de demeuré, ou laisse clairement entendre qu’il l’est, Ogunta doit défendre son frère et répondre à l’offense."],
      legend: { total: 7285, spent: 6200, available: 1085 },
      attributes: [
        { name: "Dextérité", value: 13, step: 6, dice: "D10" }, { name: "Force", value: 13, step: 6, dice: "D10" }, { name: "Constitution", value: 13, step: 6, dice: "D10" },
        { name: "Perception", value: 16, step: 7, dice: "D12" }, { name: "Volonté", value: 13, step: 6, dice: "D10" }, { name: "Charisme", value: 11, step: 5, dice: "D8" }
      ],
      combat: { initiative: { step: 5, dice: "D8" }, defenses: { physical: 7, magical: 9, social: 7 }, armor: { physical: 5, mystical: 1, label: "Cuir bouilli" }, health: { unconscious: 30, death: 39, woundThreshold: 9 }, recovery: { max: 2, step: 6, dice: "D10" }, movement: { combat: 26, run: 52 }, balance: { step: 6, dice: "D10" }, karma: { current: 8, max: 40, step: 5, dice: "D8" } },
      actions: [
        { id: "ogunta_mace", label: "Masse d’armes", kind: "Attaque de mêlée", testStep: 8, testDice: "2D6", damageStep: 12, damageDice: "2D10", karma: "Non", effort: 0 },
        { id: "ogunta_circle", label: "Incantation — Cercle de vie", kind: "Sort en matrice", testStep: 11, testDice: "D10+D8", karma: "Selon règle", effort: 0, note: "Effet du sort à appliquer selon la situation." },
        { id: "ogunta_birds", label: "Incantation — Voix des oiseaux de nuit", kind: "Sort en matrice", testStep: 11, testDice: "D10+D8", karma: "Selon règle", effort: 0, note: "Effet du sort à appliquer selon la situation." },
        { id: "ogunta_pain", label: "Incantation — Douleur", kind: "Sort en matrice", testStep: 11, testDice: "D10+D8", karma: "Selon règle", effort: 0, note: "Effet du sort à appliquer selon la situation." },
        { id: "ogunta_spear", label: "Incantation — Lance astrale", kind: "Sort en matrice", testStep: 11, testDice: "D10+D8", karma: "Selon règle", effort: 0, note: "Effet et dommages du sort restent déterminés par sa description." }
      ],
      reactions: [{ name: "Esquive", rank: 1, step: 7, dice: "D12", effort: 1, limit: "Résultat Bon requis contre une attaque à distance" }],
      talents: [
        { name: "Incantation", rank: 4, step: 11, dice: "D10+D8" }, { name: "Lecture et écriture magique", rank: 4, step: 11, dice: "D10+D8" }, { name: "Matrice de sort de Discipline", rank: 3, rollable: false, note: "Contient Cercle de vie." },
        { name: "Rituel de Karma", rank: 1, rollable: false, note: "Rituel sans test d’action standard." }, { name: "Tissage de filament — Nécromancie", rank: 4, step: 11, dice: "D10+D8" }, { name: "Vision astrale", rank: 1, step: 8, dice: "2D6" },
        { name: "Matrice de sort", rank: 3, rollable: false, note: "Contient Voix des oiseaux de nuit." }, { name: "Endurance", rank: 1, rollable: false, note: "Effet passif." }, { name: "Regard terrifiant", rank: 2, step: 7, dice: "D12" },
        { name: "Matrice de sort", rank: 3, rollable: false, note: "Contient Douleur." }, { name: "Langue des esprits", rank: 3, step: 9, dice: "D8+D6" }, { name: "Matrice de sort", rank: 1, rollable: false, note: "Contient Lance astrale." }
      ],
      skills: [
        { name: "Alchimie", rank: 2, step: 9, dice: "D8+D6" }, { name: "Botanique", rank: 1, step: 8, dice: "2D6" }, { name: "Artisanat : peinture corporelle et tatouages simples", rank: 1, step: 8, dice: "2D6" },
        { name: "Don des langues", rank: 2, step: 9, dice: "D8+D6" }, { name: "Médecine", rank: 1, step: 8, dice: "2D6" }, { name: "Connaissance : Sciences des Horreurs", rank: 1, step: 8, dice: "2D6" },
        { name: "Armes de mêlée", rank: 2, step: 8, dice: "2D6" }, { name: "Déplacement silencieux", rank: 1, step: 7, dice: "D12" }, { name: "Analyse des indices", rank: 1, step: 8, dice: "2D6" }, { name: "Lecture et écriture", rank: 1, step: 8, dice: "2D6" }, { name: "Esquive", rank: 1, step: 7, dice: "D12" }
      ],
      halfMagic: "Reconnaître les usages de la nécromancie, les types d’esprits et de morts-vivants, les rituels magiques, les rituels de magie du sang et les effets des charmes de sang.",
      spells: ["Expérience de la mort", "Lance astrale", "Voix des oiseaux de nuit", "Cercle de vie", "Bouclier de brume", "Douleur"],
      matrices: [{ rank: 3, type: "Normale", spell: "Cercle de vie" }, { rank: 3, type: "Normale", spell: "Voix des oiseaux de nuit" }, { rank: 3, type: "Normale", spell: "Douleur" }, { rank: 1, type: "Normale", spell: "Lance astrale" }],
      equipment: [
        { name: "Masse d’armes", location: "En main / ceinture", status: "Disponible", note: "Seule arme mécanique actuellement portée." }, { name: "Armure de cuir bouilli", location: "Portée", status: "Équipée", note: "Armure 5 physique / 1 mystique." },
        { name: "Kit de soigneur", quantity: 6, location: "Sac", status: "Disponible", note: "Six applications." }, { name: "Bâton de Nécromancie", location: "En main / bagages", status: "Décoratif", note: "Symbole visuel seulement : aucun effet magique, mécanique ou narratif particulier." }
      ],
      resources: ["64 PO, 56 PA et 1 PC personnels.", "64 PO, 54 PA et 1 PC de Barbak également transportés.", "Total physiquement transporté : 128 PO, 110 PA et 2 PC.", "Aucun objet à trame confirmé."],
      history: [
        "Fille de Kash’Ragan et de Rasha Main-Ouverte, Ogunta garde de la nuit de 1437 des fragments incertains : un foyer, la terre humide, des vêtements mouillés, du sang et une main chaude contre sa joue.",
        "Elle sait ses parents morts, mais ne connaît pas encore toutes les circonstances de leur disparition.",
        "Doomir Vent de Glace, son oncle et tuteur, a reconnu son affinité avec la Nécromancie et est devenu son maître.",
        "Pendant l’épreuve des Écorcheurs, elle a résolu l’épreuve d’esprit autour des runes de vie, mort et renaissance.",
        "Le 29 Sollus, elle a porté une attaque magique particulièrement violente lors de l’affrontement de la plage des Coques."
      ],
      relationships: ["Barbak — frère et lien protecteur majeur", "Kash’Ragan et Rasha Main-Ouverte — parents morts en 1437", "Doomir Vent de Glace — oncle, tuteur et maître qu’elle croit disparu", "Kalha et Kal’Zakath — cousins", "Elroën Vélaris — questeur de Mynbruje attentif à ses choix"],
      snapshot: { karma: 8, damage: 0, wounds: 0, recoveriesUsed: 0 }
    },

    pj_5: {
      playerId: "pj_5", characterId: "jaskar", name: "Jaskar", player: "Stéphane", people: "Ork", discipline: "Troubadour", circle: 3,
      portrait: "assets/portraits/jaskar.png", birth: "1434 TH", age: "13 ou 14 ans", origin: "Routes de Rocheville", location: "Rocnoir — à bord de l’Insoumise",
      identityLine: "La Voix du groupe • Conteur de route, cartographe et passeur d’histoires",
      traits: ["Curieux", "Sociable", "Intolérant à l’injustice"], passions: ["Floranuus 10"],
      gahad: ["Lorsqu’il assiste à une domination ou à un écrasement physique ou psychique qu’il juge illégitime, Jaskar doit s’y opposer ouvertement."],
      legend: { total: 7285, spent: 6300, available: 985 },
      attributes: [
        { name: "Dextérité", value: 13, step: 6, dice: "D10" }, { name: "Force", value: 13, step: 6, dice: "D10" }, { name: "Constitution", value: 12, step: 5, dice: "D8" },
        { name: "Perception", value: 16, step: 7, dice: "D12" }, { name: "Volonté", value: 8, step: 4, dice: "D6" }, { name: "Charisme", value: 16, step: 7, dice: "D12" }
      ],
      combat: { initiative: { step: 6, dice: "D10" }, defenses: { physical: 8, magical: 7, social: 9 }, armor: { physical: 4, mystical: 1, label: "Armure de cuir et targe" }, health: { unconscious: 45, death: 59, woundThreshold: 9 }, recovery: { max: 2, step: 6, dice: "D10" }, movement: { combat: 26, run: 52 }, balance: { step: 6, dice: "D10" }, karma: { current: 9, max: 40, step: 5, dice: "D8" } },
      actions: [{ id: "jaskar_sword", label: "Épée large", kind: "Attaque de mêlée", testStep: 9, testDice: "D8+D6", damageStep: 11, damageDice: "D10+D8", karma: "Non", effort: 0 }],
      reactions: [{ name: "Esquive", rank: 1, step: 7, dice: "D12", effort: 1, limit: "Résultat Bon requis contre une attaque à distance" }],
      talents: [
        { name: "Rituel de Karma", rank: 1, rollable: false, note: "Rituel sans test d’action standard." }, { name: "Chant émouvant", rank: 4, step: 11, dice: "D10+D8" }, { name: "Don des langues", rank: 4, step: 11, dice: "D10+D8" },
        { name: "Imitation de voix", rank: 2, step: 9, dice: "D8+D6" }, { name: "Première impression", rank: 4, step: 11, dice: "D10+D8" }, { name: "Arme de mêlée", rank: 3, step: 9, dice: "D8+D6" },
        { name: "Déguisement magique", rank: 3, step: 10, dice: "D10+D6" }, { name: "Endurance", rank: 4, rollable: false, note: "Effet passif." }, { name: "Histoire des objets", rank: 4, step: 11, dice: "D10+D8" },
        { name: "Sens empathique", rank: 4, step: 11, dice: "D10+D8" }, { name: "Marchandage", rank: 1, step: 8, dice: "2D6" }
      ],
      skills: [
        { name: "Lecture et écriture", rank: 1, step: 8, dice: "2D6" }, { name: "Art : Cartographie", rank: 1, step: 8, dice: "2D6" }, { name: "Connaissance du Bois des Wyrms", rank: 1, step: 8, dice: "2D6" },
        { name: "Recherche", rank: 1, step: 8, dice: "2D6" }, { name: "Survie", rank: 1, step: 8, dice: "2D6" }, { name: "Éloquence", rank: 1, step: 8, dice: "2D6" }, { name: "Esquive", rank: 1, step: 7, dice: "D12" },
        { name: "Sciences des races", rank: 1, step: 8, dice: "2D6" }, { name: "Connaissance : Routes commerciales de Barsaive", rank: 1, step: 8, dice: "2D6" }
      ],
      halfMagic: "Représentation devant un public ; connaissances des légendes, mythes et folklores de son peuple ou de sa terre d’origine ; cartographie et rédaction lorsque cela correspond à sa spécialité.",
      equipment: [
        { name: "Épée large et fourreau", location: "Ceinture", status: "Disponible", note: "Dommages niveau 11." }, { name: "Armure de cuir", location: "Portée", status: "Équipée", note: "Avec targe : armure 4 physique / 1 mystique." }, { name: "Targe", location: "Bras", status: "Équipée" },
        { name: "Kit d’aventurier et rations", location: "Bagages", status: "Disponible", note: "Une semaine de rations." }, { name: "Kit d’écriture et matériel de cartographie", location: "Bagages", status: "Disponible" }, { name: "Tambour", location: "Bagages", status: "Disponible" }, { name: "Mandoline", location: "Bagages", status: "Disponible", note: "Ou instrument médiéval équivalent." }, { name: "Vêtements de riche voyageur", location: "Porté / bagages", status: "Disponible" }
      ],
      resources: ["5 PA et 5 PC.", "Charge : 47 kg ; capacité libre : 8 kg.", "Aucun objet à trame confirmé."],
      history: [
        "Jaskar est un Troubadour ork déjà croisé dans le passé du groupe ; il sert de voix, de mémoire et de cartographe de récits.",
        "Il transforme les retrouvailles, le chaos, les serments et le feu en matière de légende.",
        "À Throal, sa parole devient centrale pour présenter les récits du groupe et négocier leur valeur auprès des érudits.",
        "Entre Grand-Foire et Rocnoir, il a mémorisé avec Zra’Ul Le Fleuve garde les Noms.",
        "Le 29 Sollus, il a obtenu un accès accéléré à la Capitainerie."
      ],
      relationships: ["Le groupe — allié et voix collective", "Koldar — source de récits et de maximes", "Throal et la Grande Bibliothèque — destinations naturelles pour ses récits", "Famille ork — objet d’une enquête progressive"],
      snapshot: { karma: 9, damage: 0, wounds: 0, recoveriesUsed: 0 }
    },

    pj_2: {
      playerId: "pj_2", characterId: "kalzakath", name: "Kal’Zakath", player: "Loïc", people: "Ork", discipline: "Éclaireur", circle: 3,
      portrait: "assets/portraits/kalzakath.png", birth: "1434 TH", age: "13 ou 14 ans", origin: "Rocheville", location: "Rocnoir — à bord de l’Insoumise",
      identityLine: "Le Regard des routes • Éclaireur attentif, inventif et protecteur de Kalha",
      traits: ["Inventif", "Créatif", "Logique", "Attentif", "Patient", "Sarcastique", "Destin supérieur discret"], passions: ["Upandal 25", "Lochost 50"],
      gahad: ["Lorsqu’il estime qu’une situation met Kalha en danger, y compris par ses propres choix, sauf s’il juge ce danger inévitable ; également lorsque le Gahad de Kalha s’éveille, sauf mauvaise intention absente."],
      legend: { total: 7285, spent: 7100, available: 185 },
      attributes: [
        { name: "Dextérité", value: 16, step: 7, dice: "D12" }, { name: "Force", value: 13, step: 6, dice: "D10" }, { name: "Constitution", value: 14, step: 6, dice: "D10" },
        { name: "Perception", value: 16, step: 7, dice: "D12" }, { name: "Volonté", value: 8, step: 4, dice: "D6" }, { name: "Charisme", value: 11, step: 5, dice: "D8" }
      ],
      combat: { initiative: { step: 7, dice: "D12" }, defenses: { physical: 9, magical: 9, social: 7 }, armor: { physical: 5, mystical: 0, label: "Cuir rembourré et targe" }, health: { unconscious: 40, death: 51, woundThreshold: 10 }, recovery: { max: 3, step: 6, dice: "D10" }, movement: { combat: 32, run: 64 }, balance: { step: 6, dice: "D10" }, karma: { current: 9, max: 40, step: 5, dice: "D8" } },
      actions: [
        { id: "kalzakath_warbow", label: "Souffle de Dragon — arc de guerre", kind: "Attaque à distance", testStep: 11, testDice: "D10+D8", damageStep: 11, damageDice: "D10+D8", karma: "Non", effort: 0, note: "Sans l’Œil de Dragon." },
        { id: "kalzakath_warbow_eye", label: "Souffle de Dragon — avec Œil de Dragon", kind: "Attaque à distance", testStep: 13, testDice: "D12+D10", damageStep: 12, damageDice: "2D10", karma: "Non", effort: 0, note: "+2 au test d’attaque à distance et +1 aux dommages." },
        { id: "kalzakath_second_shot", label: "Deuxième tir — arc de guerre", kind: "Action supplémentaire", testStep: 8, testDice: "2D6", damageStep: 11, damageDice: "D10+D8", karma: "Non", effort: 2 },
        { id: "kalzakath_throw", label: "Griffes de Dragon — dague de jet", kind: "Attaque à distance", testStep: 8, testDice: "2D6", damageStep: 8, damageDice: "2D6", karma: "Non", effort: 0 },
        { id: "kalzakath_sword", label: "Queue de Dragon — épée large", kind: "Attaque de mêlée", testStep: 8, testDice: "2D6", damageStep: 13, damageDice: "D12+D10", karma: "Non", effort: 0 }
      ],
      reactions: [{ name: "Esquive", rank: 3, step: 10, dice: "D10+D6", effort: 1, limit: "Résultat Bon requis contre une attaque à distance" }],
      talents: [
        { name: "Arme de tir", rank: 4, step: 11, dice: "D10+D8" }, { name: "Déplacement silencieux", rank: 3, step: 10, dice: "D10+D6" }, { name: "Escalade", rank: 1, step: 8, dice: "2D6" },
        { name: "Pistage", rank: 3, step: 10, dice: "D10+D6" }, { name: "Esquive", rank: 3, step: 10, dice: "D10+D6" }, { name: "Rituel de Karma", rank: 2, rollable: false, note: "Rituel sans test d’action standard." },
        { name: "Endurance", rank: 4, rollable: false, note: "Effet passif." }, { name: "Don des langues", rank: 4, step: 11, dice: "D10+D8" }, { name: "Armes de mêlée", rank: 1, step: 8, dice: "2D6" }, { name: "Sprint", rank: 1, step: 8, dice: "2D6" }, { name: "Vision astrale", rank: 3, step: 10, dice: "D10+D6" }
      ],
      skills: [
        { name: "Connaissance : Sciences des créatures", rank: 1, step: 8, dice: "2D6" }, { name: "Éloquence", rank: 1, step: 6, dice: "D10" }, { name: "Connaissance : Substances naturelles", rank: 1, step: 8, dice: "2D6" }, { name: "Artisanat : Fabrication de pièges", rank: 1, step: 8, dice: "2D6" },
        { name: "Attaque critique", rank: 3, rollable: false, note: "Bonus conditionnel aux dommages, sans jet autonome." }, { name: "Lecture et écriture", rank: 1, step: 8, dice: "2D6" }, { name: "Deuxième tir", rank: 1, step: 8, dice: "2D6" }, { name: "Deuxième attaque", rank: 1, step: 8, dice: "2D6" },
        { name: "Arme de jet", rank: 1, step: 8, dice: "2D6" }, { name: "Analyse de créature", rank: 1, step: 8, dice: "2D6" }, { name: "Saut de géant", rank: 1, step: 8, dice: "2D6" }, { name: "Analyse des indices", rank: 1, step: 8, dice: "2D6" }, { name: "Recherche", rank: 1, step: 8, dice: "2D6" },
        { name: "Connaissance : Dragons", rank: 1, step: 8, dice: "2D6" }, { name: "Sang-froid", rank: 1, step: 5, dice: "D8" }, { name: "Apprivoisement", rank: 1, step: 6, dice: "D10" }, { name: "Dressage", rank: 1, step: 6, dice: "D10" }, { name: "Lecture sur les lèvres", rank: 1, step: 6, dice: "D10" },
        { name: "Connaissance : Disciplines", rank: 1, step: 8, dice: "2D6" }, { name: "Connaissance : Itinéraire marchand", rank: 1, step: 8, dice: "2D6" }
      ],
      halfMagic: "Reconnaître traces et pistes dans la nature ou en milieu urbain ; repérer pièges et portes secrètes ; remplacer certains tests de Survie, Orientation ou Cartographie par la demi-magie.",
      equipment: [
        { name: "Arc de guerre elfique « Souffle de Dragon »", location: "Dos / en main", status: "Disponible", note: "20 flèches ordinaires et 6 flèches de sœur." }, { name: "Arc long « Souffle de Dragon »", location: "Bagages", status: "Disponible", note: "Arme de rechange." },
        { name: "Dagues de jet « Griffes de Dragon »", quantity: 10, location: "Ceinture", status: "Disponibles" }, { name: "Épée large « Queue de Dragon »", location: "Ceinture / dos", status: "Disponible", note: "Reforgée deux fois par Kalha." }, { name: "Épée courte « Langue de Dragon »", location: "Ceinture", status: "Disponible" }, { name: "Hachette « Corne de Dragon »", location: "Ceinture", status: "Disponible" },
        { name: "Targe « Écaille de Dragon »", location: "Bras", status: "Équipée", note: "Seuil de destruction 17." }, { name: "Armure de cuir rembourré", location: "Portée", status: "Équipée" }, { name: "Œil de Dragon", location: "Lié au sang", status: "Actif", note: "+2 au test d’attaque à distance et +1 aux dommages." },
        { name: "Kit de soins", quantity: 3, location: "Sac", status: "Disponible" }, { name: "Mousse d’argent", quantity: 2, location: "Sac", status: "Intacte" }, { name: "Matériel de pièges, allume-feu et fioles", location: "Sac", status: "Disponible", note: "Huile, colle et poison à détailler avant consommation." }
      ],
      resources: ["36 PO, 27 PA et 57 PC.", "Transport / levage : 110 / 220 kg.", "Magie du sang : 3 points permanents.", "Aucun objet à trame confirmé."],
      companion: { name: "Mâche-Fer", state: "Indemne • lien harmonisé", note: "Chien de guerre sensible au danger et aux ordres contradictoires ; l’harmonisation ne le transforme pas en automate.", initiative: 5, defenses: "7 / 5 / 5", health: "21 / 30", attack: "Morsure 8 • dommages 11", movement: "32 / 64" },
      history: [
        "Fils de Doomir Vent de Glace et grand frère de Kalha, Kal’Zakath est l’éclaireur du groupe et lit les traces, les pièges et les routes.",
        "Son intuition de destin supérieur reste un signe discret plutôt qu’une promesse spectaculaire.",
        "Pendant son passage au troisième Cercle, il a appris à suivre les conséquences et la place qu’il occupe dans le monde plutôt que le seul mouvement.",
        "À Kelpoya, il a manipulé une rune du coffre et déclenché un nuage vert empoisonné.",
        "Dans la nuit du 29 au 30 Sollus, il a participé à l’exfiltration de Katsika et revendiqué le sauvetage au nom de Vorkana."
      ],
      relationships: ["Kalha — petite sœur", "Doomir Vent de Glace — père mort qu’il croit disparu", "Barbak et Ogunta — cousins", "Mâche-Fer — chien de guerre harmonisé", "Le groupe — éclaireur et lecteur des dangers"],
      snapshot: { karma: 9, damage: 0, wounds: 0, recoveriesUsed: 0 }
    }
  });
})();
