# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🎮 Suites du patch du 06/10 (entrée DONE du 06/10)

- [ ] **Demiurge Lambda, sur retour des joueurs** : rangs (quick, onglet
      « Rangs » — PvE, PvP, EE base et +10), fiche curée (pros/cons,
      synergies ; rôle DPS déjà posé, tag `premium` automatique), ligne de
      `premium-limited`.
- [ ] **Sigma, après équilibrage** : curé à revoir (rang, pros/cons) ; et
      décider si le `damage-calculator` modélise [Tower Administrator]
      (+150 % de dégâts en Skyward Tower, les cibles de tour existent).
- [ ] **Revue d'extraction (suite de F14)** : le flag `art` qui apparaît sur
      un costume existant reste un écart — à trancher au premier cas.
- [ ] **R2** : `images/ui/shop/al.webp` (onglet de l'Adventure License)
      encore dans le bucket, plus référencé — à retirer (Sevih).

## 🎒 Gear reco — données (signalé par le lot C4)

- [ ] **Bloody Edge (`631`)** : deux builds de `data/curated/gear-reco.json`
      lui donnent ATK% en stat principale, son pool ne propose que HP% — à
      corriger dans quick (Fiche perso › Gear reco) ou l'admin (Sevih).
- [ ] **Presets en double** (`$mrs` = `$elemcritAP`, `a2p2` = `p2a2` dans
      `gear-presets.json`) : `collapseBuild` rend le premier trouvé, l'admin
      change donc le slug au save (quick, lui, garde celui du disque). À
      fusionner ou à distinguer à la main dans le fichier (ou par
      `/admin/gear-presets`, sortie du menu le 09/10 mais joignable par son
      URL).

## 🧰 Outil quick

- [ ] **Migration de l'admin vers quick** (décision du 08/10) : inventaire,
      ordre et règles dans `docs/quick-migration.md`. FAIT : Short names et
      Search aliases (onglet « Noms », lot B34), Banner (onglet
      « Bannières », lot B35), la boîte de réception de la home (onglet
      « Tableau de bord », lot B36), la chaîne des données (onglet
      « Patch », lot C10), Changelog (onglet « Journal du site », lot B37),
      Game data (onglet « Tables du jeu », lot B38), Effect (onglet
      « Effets », lot B41), Synergy et Pro / Con (sous-onglets « Synergies »
      et « Pros / Cons » de la « Fiche perso », lot B42), Character (section
      « Fiche perso », lots C11, B42, B39 et B40 — la coquille, le picker de
      héros partagé, les sous-onglets Fiche, Pros / Cons, Synergies, Skills et
      Gear reco, qui a quitté les Données), EE (sous-onglet « EE » de la
      « Fiche perso », lot B43), Monster (onglet « Monstres », lot C12 — le
      câblage des chips ; ses stats, son intégration et ses versions sont de
      l'extractor, étapes 19-20), Item (onglet « Items », lot B44 — le
      dernier des Éditeurs). Clos sans portage (lot A34) : Gear presets
      (non porté, le fichier s'édite à la main) et Tag control (le contrôle
      est le test, bloquant dans `pnpm commit`).
      À faire par Sevih : remplir
      la colonne « Agacements » (en vrac) ; puis un lot par section.
- [ ] **« Monstres » — contrôles à l'écran (lot C12)** : le banc ne clique
      pas, et aucun enregistrement réel n'a été joué. Relancer quick d'abord
      (Ctrl-C puis `pnpm quick` : trois routes nouvelles — sans ça l'onglet
      dit « quick lancé avant ce code »). (1) Éditeurs › Monstres : le picker
      s'ouvre de lui-même sur les monstres des GUIDES (« 543 des guides ·
      2451 avec le site ») ; chercher le boss d'un guide récent par son nom
      (« anni » → Annihilator, ses variantes distinguées par le stage) ou par
      son id (`4318062`) ; « Site » élargit, les pastilles de type filtrent.
      (2) Sa fiche : ses guides en liens (ils ouvrent le site de dev), ses
      cartes de skills. ✕ sur une chip : pointillés, « rétablir ».
      « ＋ effet » : le picker d'effets, la chip arrive « ajoutée ». Le menu
      « sur la carte… » d'une chip : elle passe sur la carte choisie,
      « déplacée » ; « par défaut » la rend. (3) « Enregistrer » — attendu :
      UN commit `chore(monsters): <nom> (<id>)` qui ne porte que
      `data/curated/monster-skills.json`, et dans le diff les seules clés
      touchées. (4) Le badge « partagé par N monstres » sur un skill commun
      (Sphinx Guardian `4044008` : ses cartes sont partagées par quatre
      monstres) — y masquer une chip puis ouvrir un de ses jumeaux : le même
      masquage. (5) L'admin par son URL (`/admin/editor/monsters/4044008`) :
      le même état ; son lien « Monster » a quitté le menu Editor. (6) Après
      « Pousser » et le déploiement : la page du guide, la chip masquée
      absente. À juger : le `select` dans la chip (une chip devient large),
      le picker sur « Site » (2 451 lignes redessinées à chaque frappe), les
      liens de guide vers le site de DEV du poste plutôt que la prod, les
      adds liés par le kit qui héritent de plusieurs guides (Ragnakeus
      `4086001` : huit), et l'ordre du picker — par nom, pas les boss
      d'abord.
- [ ] **« Items » — contrôles à l'écran (lot B44)** : le banc ne tape ni ne
      clique, et aucun enregistrement réel n'a été joué. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : quatre routes nouvelles — sans ça
      l'onglet dit « quick lancé avant ce code »). (1) Éditeurs › Items : le
      compte « 1149 items + 59 monnaies · 102 sans description · 496 sprites
      à intégrer · 23 curés ». Chercher `Hero` — attendu : « Hero Piece »
      parmi les tickets, trouvé par son NOM (« nom en »), son id
      `Hero%20Piece` intact sous son nom et dans l'adresse
      (`#items/Hero%2520Piece`) ; `ero` → « Aucun item ne correspond. ».
      (2) Les filtres : le type (goods → 59), « sans description » → 102,
      « curés seulement » → 23. (3) Un item sans description : sur sa
      fiche, « Description », taper une clé du jeu (`SYS_STAMINA` pour
      l'essai) puis « clé… » — attendu : les six langues posées,
      « 1 item modifié ». « Enregistrer » — attendu : UN commit
      `chore(items): <nom>` qui porte les DEUX fichiers,
      `data/curated/items.json` et `data/generated/items.json`, et dans le
      second la seule entrée de cet item. (4) Cocher « sprites à intégrer »,
      cliquer un `TI_…` : la fiche vierge de la création, son icône déjà
      dans le champ ; un nom anglais, « Enregistrer » — l'item arrive au
      catalogue (type custom), le sprite quitte la liste. (5) « Vider » sur
      un item curé puis « Enregistrer » : son entrée disparaît de
      `data/curated/items.json`, le catalogue retrouve les valeurs du jeu.
      ATTENTION aux créations (type custom : `Hero%20Piece`, `Gems`…) :
      elles n'existent que par leur entrée, les vider les RETIRE du
      catalogue — la fiche le dit, l'admin faisait de même. (6) L'admin par
      son URL (`/admin/editor/items`) : le même état ; le groupe « Editor »
      a quitté son menu. (7) Après « Pousser » et le déploiement : le nom ou
      la description corrigés là où le site montre l'item (récompenses d'un
      code promo, tooltips). À juger : la rangée des filtres, qui se replie
      sur deux lignes à 1440 px (huit types + cinq cases) ; « sprites à
      intégrer », qui REMPLACE le catalogue et éteint les autres filtres ;
      les 496 sprites, dont beaucoup ne sont pas des items (`TI_Class_*`) ;
      et l'état d'un mégaoctet relu à chaque venue sur l'onglet.
- [ ] **« Fiche perso » › EE — contrôles à l'écran (lot B43)** : le banc ne
      clique pas, et aucun enregistrement réel n'a été joué. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : l'état de la fiche sert maintenant
      l'EE — sans ça la fiche dit « quick lancé avant ce code »). (1) Un
      perso, le sous-onglet « EE », entre Skills et Gear reco : la tuile de
      son EE, ses deux rangs, ses passifs, ses chips. (2) Le rang « À +10 »
      changé ICI, « Enregistrer », puis l'onglet Rangs : la colonne « EE +10 »
      de ce perso porte la nouvelle valeur (et l'inverse : un rang posé dans
      Rangs se lit dans la fiche). (3) Une chip masquée (✕ → pointillés,
      « rétablir »), un effet ajouté par « ＋ effet », « Enregistrer » —
      attendu : UN commit `chore(characters): <perso>` qui porte
      `data/curated/equipment.json`, et dans le diff la seule entrée de ce
      perso. (4) Un perso core-fusion `27…` (Core Fusion Snow, `2700003`) :
      son EE à lui, Frost Nova ; sur Snow (`2000003`), Glacial Bow dit « porté
      aussi par Core Fusion Snow ». (5) Demiurge Lambda (`2000124`), seul EE
      sans entrée curée : la fiche vide, un rang posé crée l'entrée. (6)
      L'admin : le lien « EE » a quitté le menu Editor (la page répond
      toujours par son URL). À juger : l'onglet « EE » éteint n'est visible
      sur aucun perso aujourd'hui (les 129 ont un EE) ; le catalogue des
      effets servi deux fois dans l'état (Skills, et EE avec les
      descriptions).
- [ ] **« Fiche perso » › Gear reco — contrôles à l'écran (lot B40)** : le
      banc ne clique pas, et aucun enregistrement réel n'a été joué. Pas de
      relance de quick à faire (aucune route n'a bougé), un rechargement de
      la page suffit. (1) Éditeurs › Fiche perso, un perso, le sous-onglet
      « Gear reco » : ses builds comme avant — savebar de builds, onglets de
      builds, carte, aperçu —, sans l'en-tête ni « Changer de perso » (ceux
      de la fiche servent). (2) Un build retouché : le point vient sur son
      onglet ET sur le sous-onglet « Gear reco » ; la barre de la fiche,
      au-dessus, reste à « aucune modification ». (3) « Enregistrer » de la
      barre des builds — attendu : UN commit `chore(gear-reco): <perso>`, et
      rien de la fiche dedans. (4) Un rang ET un build en attente : chaque
      « Enregistrer » ne part qu'avec le sien ; changer de perso ou quitter
      l'onglet demande confirmation en comptant les deux. (5) Les anciens
      liens : `#gear/<id>` et `#gear/<id>/build/2` ouvrent la fiche du perso
      sur Gear reco (l'adresse devient `#character/<id>/gear`). (6) L'admin :
      le lien « Character » a quitté le menu (la page répond toujours par son
      URL) ; le groupe Données de quick n'a plus que Rangs et Tables du jeu.
      À juger : les deux barres collantes — en défilant, celle des builds
      recouvre celle de la fiche — et la ligne d'explication au-dessus de la
      barre des builds.
- [ ] **« Fiche perso » › Skills — contrôles à l'écran (lot B39)** : le banc
      ne clique pas, et aucun enregistrement réel n'a été joué. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : l'état de la fiche sert maintenant
      le kit — sans ça la fiche dit « quick lancé avant ce code »). (1) Un
      perso, sous-onglet Skills : ses cartes (mains, passifs, chaîne, duo),
      descriptions et chips comme sur sa fiche du site. (2) ✕ sur une chip :
      elle passe barrée, « rétablir » la rend ; la savebar compte, le point
      vient sur l'onglet. (3) « ＋ effet » : le picker — chercher un nom,
      [Buffs | Debuffs], choisir ; la chip arrive avec « ajoutée », son ✕ la
      retire. (4) « Enregistrer » — attendu : UN commit
      `chore(characters): <perso>` qui porte
      `data/curated/character-skills.json`, et seulement lui si rien d'autre
      n'a bougé ; le diff : les seules cartes touchées. (5) Rouvrir la fiche
      dans l'admin (onglet Skills) : le même état. (6) Après « Pousser » et le
      déploiement : la fiche du perso sur le site, la chip masquée absente, la
      chip ajoutée là. À juger : les tuiles du picker en lignes sur trois
      colonnes (210 effets) ; la chip neutre de la charte plutôt que la pill
      bleue ou rouge du site ; faut-il que les cartes viennent du committé
      quand le poste n'a pas les tables du jeu (aujourd'hui : « Kit
      illisible ») ?
- [ ] **« Fiche perso » › Pros / Cons et Synergies — contrôles à l'écran
      (lot B42)** : le banc ne clique pas, aucun enregistrement réel n'a été
      joué et « Traduire » n'a jamais été appelé avec des clés. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : une route nouvelle, et l'état de la
      fiche sert les langues — sans ça la fiche dit « quick lancé avant ce
      code »). (1) Un perso, sous-onglet Pros / Cons : « ＋ pro », taper un
      texte avec un tag `{B/…}` — l'aperçu arrive sous la ligne après la
      frappe, icône et nom de l'effet ; changer la langue « Aperçu » de la
      savebar. (2) Un tag faux (`{B/Foo}`) : rouge dans l'aperçu ;
      « Enregistrer » — attendu : refus sur la ligne, carte cerclée, rien
      d'écrit ; le corriger, enregistrer. (3) « Traduire » avec les clés : les
      cinq langues se posent (elles ÉCRASENT celles en place), « Traductions »
      se déplie, à relire ; « à retraduire » après une retouche de l'anglais.
      (4) Synergies : « ＋ groupe », « ＋ héros » (deux héros dans le picker,
      « Valider »), une raison, « Enregistrer » → UN commit
      `chore(characters): <perso>` ; un groupe sans héros est refusé. (5) Le
      diff du commit : seules les lignes touchées bougent dans
      `data/curated/characters.json`. (6) Après « Pousser » et le déploiement :
      la fiche du perso sur le site, sections Pros / Cons et Synergies. À
      juger : « Traduire » de Pros / Cons posé sous les deux cartes ; les
      textarea de deux lignes ; faut-il une saisie assistée des tags (les
      `refs` sont servis, la page ne les lit pas encore) ?
- [ ] **« Fiche perso » — contrôles à l'écran (lot C11)** : le banc ne
      clique pas, et aucun enregistrement réel n'a été joué. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : trois routes nouvelles). (1) Groupe
      « Éditeurs » : il s'ouvre maintenant sur « Fiche perso », le picker de
      héros ouvert d'office — chercher, filtrer par élément et par classe,
      choisir un perso réel. À juger : le picker qui se rouvre à chaque
      retour sur l'onglet tant qu'aucun perso n'est choisi. (2) L'en-tête
      (sous-classe, « chaîne join ») et la rangée des sous-onglets : quatre
      sont éteints, leur lot en `title`. (3) Changer un rang ici, « Enregistrer »
      — attendu : UN commit `chore(characters): <perso>`, « Pousser » qui
      compte un commit de plus ; puis l'onglet Rangs : le même rang y est.
      Dans l'autre sens : changer le rôle dans Rangs, revenir sur la fiche —
      elle est relue, le rôle y est. (4) « ＋ palier » : le premier palier
      libre s'ajoute ; changer son palier par son menu (le rang suit), lui
      donner un rang, enregistrer ; ✕ le retire. (5) Une priorité de skills :
      taper 7 → champ rouge, « entre 1 et 3, ou vide », rien ne part ; 2 →
      enregistré. Trois persos portent des priorités à 0 sur le disque : elles
      restent tant qu'on n'y touche pas — à trancher, 0 est-il une valeur ?
      (6) Cocher « free », enregistrer ; « ajouter dans Vidéos » ouvre
      l'onglet Vidéos sur ce perso. (7) Caduc depuis B40 : Gear reco n'a plus
      de picker de perso à lui, il prend celui de la fiche. À juger aussi : les
      deux cartes côte à côte (une seule sous 1000 px) — assez aérées ?
- [ ] **Onglet « Effets » — contrôles à l'écran (lot B41)** : le banc ne
      tape pas, et aucun enregistrement réel n'a été joué. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : quatre routes nouvelles). (1) La
      recherche : taper `tes` — attendu : « Aucun effet ne correspond. »,
      Increased Speed ne sort plus ; `spe` → les quatre effets de vitesse,
      chacun « nom en » ; `BT_SP` → les mêmes, « clé BT_STAT|ST_SPEED » (et
      `…_IR` pour les irremovable) ; `スピ` → « nom jp · スピードUP » ; `15` →
      « id 15 ». À juger : la raison sous chaque ligne (utile, ou du bruit
      quand c'est le nom anglais ?), et l'espagnol, qui n'est pas cherché.
      (2) Les filtres : « Nature » sur Debuffs → une seule colonne ; « sans
      description » → 8 effets ; « curés seulement » → 42 ; « masqués » → 2.
      (3) Un effet curé : ouvrir « Priority Increase » (61) — son icône
      curée dans le champ, celle du jeu en gris ; changer sa famille, puis la
      nature : la liste des familles suit le côté, l'ancienne reste proposée
      « (autre côté) ». (4) Un créé : `fixed test` dans « Nouvel effet »,
      « ＋ effet » → la fiche vierge `FIXED_TEST` en tête du catalogue ;
      « Enregistrer » sans nom anglais → refusé, la saisie reste, point
      rouge ; avec un nom → créé. Puis « Annuler » sur une autre création :
      elle disparaît. (5) « Enregistrer » deux effets modifiés — attendu :
      UN commit `chore(effects): 2 effets` (un seul effet : son nom anglais
      à la place), « Pousser » qui compte un commit de plus, le catalogue relu ;
      retirer ensuite l'effet d'essai à la main dans
      `data/curated/effects.json` (une création ne se vide pas d'ici). À
      juger aussi : la hauteur du catalogue, qui défile dans sa carte, et la
      fiche à droite (560 px).
- [ ] **« Tables du jeu » — contrôles à l'écran (lot B38)** : le banc ne
      clique pas ; l'onglet ne fait que lire. (1) Le sélecteur : cliquer dans
      « Table… » — attendu : les tables lues d'abord (TextSystem, ItemTemplet,
      BuffTemplet…), chacune avec « utilisée · N », puis les « jamais lue » ;
      taper `Recruit`, Entrée → `RecruitGroupTemplet` s'ouvre, ses trois
      lecteurs en chips (le chemin complet au survol) et leurs trois lignes de
      note. (2) Un lien croisé : ouvrir `CostumeTemplet`, cliquer un
      `CharacterID` → `CharacterTemplet` filtrée sur `ID` = cette valeur,
      « exact » coché, UNE ligne ; « Précédent » du navigateur revient à
      `CostumeTemplet`. Le `PickupID` de `RecruitGroupTemplet` est un lien
      lui aussi, vers `CharacterTemplet` (alias, lot A32). (3) « résoudre les
      textes », sur `CostumeTemplet` : décocher → les lignes en italique
      sous les clés (`2010019_Name` → « Shutendouji Rin ») disparaissent,
      recocher → elles reviennent. (4) La ligne brute : cliquer une ligne de `TextSystem` →
      à droite toutes ses langues (le tableau ne montre que l'anglais),
      « Copier » → le JSON de la ligne dans le presse-papiers ; fenêtre
      réduite sous 1000 px → le panneau passe sous le tableau. (5) « colonnes
      vides » sur `RecruitGroupTemplet` : 3 colonnes de plus (32 → 35). À
      juger : (a) la passe d'usage ne lit que `datagen/`, `src/lib/data/` et
      `scripts/quick/` : `src/lib/admin/monster-store.ts` lit
      `BuffToolTipTemplet` et n'apparaît pas parmi ses lecteurs ; (b) quatre
      lectures passent par un nom en variable (`damage/targets.ts`,
      `lib/effects.ts`, `generators/solver.ts` — son `textMap` —,
      `lib/text.ts`) : leurs tables ne leur sont pas attribuées ; (c) l'item
      « Assets » du tableau de bord renvoie toujours à
      `/admin/tools/gamedata`, dont le lien de menu est retiré — le rapport
      d'assets n'est pas porté, et cette page ne le montre pas non plus ;
      (d) la déduction par le NOM pose aussi des liens FAUX, relevés par A32 :
      les 21 colonnes `*BuffID` visent `BuffTemplet` mais portent un nom de
      buff (0 % retrouvés), `RewardVoiceID` de `TrustRewardTemplet` →
      `VoiceTemplet` (0/5577), `ArtifactID` de `MonadGateArtifactGroupTemplet`
      → `ArtifactTemplet` (0/164), `ClearMissionID` de `DungeonTemplet` →
      `MissionTemplet` (2/33), et une cellule `0` reste un lien vers `ID = 0`
      — lot A : une liste d'exclusions dans `gamedata-store.ts` (ou un alias
      par `Table.Colonne`), et pas de lien sur `0`.
- [ ] **« Journal du site » — contrôles à l'écran (lot B37)** : le banc ne
      clique pas, et rien n'a été enregistré. (1) Un gabarit Perso sur un
      perso réel : « ＋ Perso », deux lettres, Entrée — attendu : l'entrée en
      tête, dépliée, le titre dans les six langues (les noms du jeu), la puce
      anglaise (« …, stats and exclusive equipment. » si le jeu lui connaît
      un EE), le slug en lien, le portrait dans l'aperçu. (2) « Traduire »
      avec les vraies clés : les cinq langues posées, titre et puces, une
      puce par ligne dans chacune ; retoucher l'anglais → « à retraduire » ;
      recliquer → tout est réécrit. (3) L'aperçu contre `/changelog` du
      site : ouvrir la même entrée des deux côtés (`en`, puis `fr`) —
      vignette, badge, date, titre, puces, appel du lien ; le gras `**…**`
      n'apparaîtra sur le site qu'après le déploiement de ce lot (cf. (5)).
      (4) « Enregistrer » → le journal dit « N entrées écrites… » puis
      « committé », `git log -1` = `chore(changelog): <titre>` sur le seul
      `data/curated/changelog.json`, `git show --stat` sans autre ligne que
      celles de l'entrée ; un gabarit « Mise à jour » au slug laissé vide →
      refusé (« champ de gabarit non rempli — {slug} »), rien d'écrit. (5)
      Le site, une fois poussé : `/changelog` et la home rendent le gras
      des puces (15 entrées, dont « Universal Tower » en home) au lieu des
      astérisques. À juger : (a) le gabarit Guide ne connaît que la
      Singularité dimensionnelle, et « Mise à jour » demande le slug à la
      main — un lot A servirait la liste des guides (`listGuides()`) en
      suggestions, nom, mode et chemin déduits ; (b) 7 entrées portent un
      lien markdown `[texte](url)` que la carte affiche brut (elle est déjà
      un lien entier) ; (c) le flux RSS garde sa propre copie du motif du
      gras (`src/app/feed/changelog/route.ts`) au lieu de `bulletSegments`.
- [ ] **« Tableau de bord » — contrôles à l'écran (lot B36)** : le banc ne
      clique pas. (1) L'inbox contre la home admin : ouvrir `/admin` à côté,
      mêmes items, même ordre, mêmes chiffres (le 08/10 : « Character ·
      1 new »). (2) Le lien « dans l'admin ↗ » : il ouvre
      `https://outerpedia.local/admin/extractor/characters` dans un nouvel
      onglet — il faut `pnpm dev` lancé sur un des deux postes ; sans Caddy,
      poser `ADMIN_BASE=http://localhost:3000` dans `.env.local`. (3) La
      version du client : « site 1.11.404 · client 1.11.404 » en vert
      aujourd'hui ; après une mise à jour Steam du jeu, attendu en ambre avec
      « un patch attend : onglet Patch », et sur un poste sans le jeu,
      atténué (« pas de client Steam sur ce poste »). (4) « Ouvrir
      Bannières » et « Ouvrir Codes promo » mènent à l'onglet, revenir sur
      « Accueil » relit (un quart de seconde depuis A31, bouton « Actualiser »
      occupé le temps de la lecture) ; « Pousser » depuis le tableau le relit
      aussi.
- [ ] **Onglet « Noms » — contrôles à l'écran (lot B34)** : le banc ne tape
      pas. Passer l'état à « Tous », ouvrir un perso sans nom court dont un
      nom complet « déborde », taper un nom court et voir son badge passer
      de « … » à « tient » (ou « déborde ») et les langues vides afficher
      « = en : … » ; ajouter un alias (Entrée, virgule, Retour arrière, ✕,
      un doublon en ambre) ; « Enregistrer » — attendu : le commit
      `chore(names): <perso>`, « Pousser » qui compte un commit de plus, la
      liste et les badges relus. Le premier alias crée
      `data/curated/search-aliases.json`. À juger : la vue par défaut « À
      traiter » est vide tant que le disque n'a rien à traiter (0 sur 129
      aujourd'hui).
- [ ] **Onglet « Bannières » — contrôles à l'écran (lot B35)** : le banc ne
      clique pas, et aucun enregistrement réel n'a été joué. Dans « Dans le
      jeu » : « Aligner sur le jeu » sur Titia (fin `2026-10-05` → `2026-10-06`)
      et sur Lambda (`2026-09-07` → `2026-09-08`) — attendu : les deux lignes,
      expirées, apparaissent dans la liste avec « modifiée », la savebar dit
      « 2 changements », la carte « Les bannières du jeu sont toutes dans la
      liste. » ; aucune bannière à insérer aujourd'hui (au prochain patch :
      « Insérer », nom du roster et dates de la table). « Enregistrer » —
      attendu : une ligne verte « committé — N commits à pousser » et, le
      journal déplié d'un clic, « 52 bannières écrites », « publié sur R2 +
      edge purgé », `chore(banner): Titia, Lambda` ; « Pousser » compte un
      commit de plus, et la carte ne propose plus rien. La home du site ne
      bouge pas ce jour-là (deux bannières expirées) : à contrôler pour de
      bon à la prochaine bannière insérée, qui doit s'y montrer dans les
      10 min. À
      essayer aussi : « ＋ bannière », deux lettres dans la recherche, un
      perso choisi, « Enregistrer » sans dates → refus situé (« refusée »,
      rien d'écrit). À juger : (1) un échec de R2 rend l'enregistrement en
      ÉCHEC dans le journal (déplié, rouge) alors que le fichier est écrit et
      committé — comme l'admin l'affichait en rouge ; (2) le message de
      commit nomme aussi une bannière RETIRÉE ; (3) une fenêtre du jeu sans
      date lisible (les SEASONAL_SELECTION n'ont pas de fin en table, les
      DEMIURGE aucune date) n'est ni proposée ni comparée.
- [ ] **Gear reco, « Traduire » après un enregistrement** (même limite que
      l'admin, corrigée le 07/10 par « Retranslate all ») : `noteAt` est l'EN
      au chargement, donc une note corrigée en anglais puis ENREGISTRÉE ne
      repart plus au traducteur (seules les langues manquantes). Ajouter le
      geste forcé (tout retraduire) dans `tabs/gear.js` (lot A, fichier libre).
- [ ] **« Pousser », restes de B33** : le compte de l'en-tête ne se relit
      qu'au chargement, après un enregistrement et, depuis B36, à chaque
      lecture du tableau de bord (y revenir, ou « Actualiser ») — après un
      `git pull --rebase` ou un commit au terminal, passer par l'accueil
      (relire `/api/git` au retour de focus serait un lot A). À jouer par
      Sevih : le premier clic réel sur « Pousser » (des commits non JSON
      attendent : le journal annonce le typecheck, puis « poussé ») ; et,
      depuis A33, un fichier indexé au terminal (`git add`) puis un
      enregistrement dans quick — `git show --stat` ne le cite pas,
      `git status` le montre toujours indexé.
- [ ] **4-comics, premier envoi réel multi-langues (lot B30)** : glisser d'un
      coup les trois fichiers d'une nouvelle BD (`…_EN`, `…_JP`, `…_KR`),
      vérifier la ligne à trois cases, publier — attendu : trois « déposé »,
      UNE conversion, UN push R2, UN commit `chore(assets): 4-comics comicNN (EN, JP, KR)`
      local, que « Pousser » envoie (B33). Si une connexion coupe, le bouton reste grisé
      (`post()` de `lib.js`, signalé par l'agent : à reprendre un jour, hors
      série UI).
- [ ] **Refonte de l'UI — contrôles à l'écran** (la série est close le 07/10,
      le banc ne joue pas ces états) : survol des ✕ et des boutons fantômes,
      anneau de focus, journal en haut pendant un vrai enregistrement (lot
      A30 : une ligne verte quand ça passe ; sur un refus réel tout le
      journal, « Copier » et son collage ; la page qui remonte depuis le bas
      de Gear reco, savebar comprise),
      résultats de Récompense avec icônes, hash `#gear/<id>` (redirigé vers
      la fiche depuis B40), fenêtre sous
      1060 px ; Rangs : cellule modifiée, refus réel, dépliage, clavier dans
      les menus de rang ; Discord AVEC le jeton : serveurs, salons,
      emojis de serveur, un envoi d'essai sur le serveur perso, embed,
      reprise d'envoi, presse-papiers (listes détaillées dans les entrées
      DONE des lots F16, B28, B29, C6).

## 🧪 À jouer au prochain patch

- [ ] **quick, section « Patch » — le vrai cycle, à l'écran (lot C10)** :
      l'agent a câblé les gestes sans en jouer aucun. Au prochain patch,
      depuis quick (Accueil › Patch) au lieu de `pnpm dev` et de la
      `PatchCard` : (1) « Lancer » (Steam, images et notes cochées) — la
      console défile au fil du pull, reste collée au bas tant qu'on ne
      remonte pas, le journal de l'en-tête ne montre que la ligne en cours ;
      à la fin l'état passe à « client X · site Y ». (2) « Dry-run » — la
      revue reste dans sa carte ; « Promouvoir » s'allume. (3) « Promouvoir
      (--apply) » sans confirmation — vérifier qu'un perso non intégré ne
      part pas. (4) « Committer » (message prérempli, bump) — dix minutes de
      contrôles dans la console, puis « N commits à pousser » et le bouton
      « Pousser » allumé. (5) « Pousser ». À essayer une fois : « Arrêter »
      pendant le rafraîchissement (rien ne doit continuer derrière :
      `pgrep -f datagen` vide ; « Lancer » reprend ensuite au checkpoint), recharger
      la page pendant un travail (« un travail tourne : … », boutons éteints,
      puis rallumés seuls à sa fin), « Pousser » pendant un travail (refusé :
      « Un travail tourne déjà : … »). À NE PAS arrêter : « Committer » une
      fois les images parties sur R2 (la prod les servirait sans commit).
- [ ] **Admin : retirer le lien « Patch » (suite de C10)** : la `PatchCard`
      de la home admin fait doublon avec la section de quick. À retirer —
      la carte de `src/app/admin/page.dev.tsx` et ses routes
      `api/admin/patch/*` — quand le cycle ci-dessus aura été joué une fois
      dans quick ; `patch-runner.ts` et `patch-commands.ts` restent (quick
      les importe).
- [ ] **Retouches mineures des monstres et de l'équipement (lot B27)** : au
      premier patch qui en apporte, `/admin/extractor/monsters` — cases Diff
      et Minor, « Apply minor changes (n) », badge `minor` discret dans la
      sidebar — puis le bouton, sur les monstres ou une page d'équipement :
      le message doit finir par le bilan d'images
      (`images: … produced, … already there`). Idem à
      `pnpm datagen:promote --apply` : une ligne
      `images : monsters.json — n entité(s) validée(s) modifiée(s) — …` par
      fichier touché. Page jamais vue à l'écran par l'agent (pas de serveur
      de dev) : entrée DONE du lot B27 (06/10).
- [ ] **Rapport des effets de portrait (lot F12)** : au premier patch qui
      apporte un effet, contrôler la dernière ligne du refresh (« ◆ Portraits
      animés — à lire ») — l'effet y est nommé avec ses porteurs, « servi tel
      quel » ou « en attente : … » ; puis `/dev/AnimatedPortrait`, où il a
      sa section générée, et le confronter au jeu. Les trois cas et quoi
      faire : entrée DONE du lot F12 (05/10).
