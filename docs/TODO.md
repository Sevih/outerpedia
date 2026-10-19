# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🎮 Suites du patch du 06/10 (entrée DONE du 06/10)

- [ ] **Demiurge Lambda, fiche curée** : pros/cons et synergies (rangs,
      priorité des skills et EE faits le 14/10 ; rôle DPS posé, tag
      `premium` automatique, ligne de `premium-limited` présente).
- [ ] **Sigma, après équilibrage** : curé à revoir (rang, pros/cons) ; et
      décider si le `damage-calculator` modélise [Tower Administrator]
      (+150 % de dégâts en Skyward Tower, les cibles de tour existent).
- [ ] **Revue d'extraction (suite de F14)** : le flag `art` qui apparaît sur
      un costume existant reste un écart — à trancher au premier cas.

## 🔎 Revues d'octobre (tri du 15/10)

Les revues de la logique du site et de la génération de données (09-12/10)
ont été confrontées au code du 15/10 : tout est encore présent. Le détail,
les preuves et les décisions vivent dans le tri consolidé de sevih-tool
(`docs/revue/tri-2026-10-15.md`). Lots proposés, dans l'ordre :

- [ ] **Calculateur (C, build)** : R14 et R16 : enquête faite (F27),
      M1 et M2 mesurées le 18/10 (Sterope : suite sous buff, deux
      cascades, bursts compris ; `docs/specs/damage-clips-joues.md` § 4) :
      lot du correctif à rédiger (§ 5).
- [ ] **Calculateur : infiltration par zone** (retour de Sevih, 18/10) :
      les cibles d'Infiltration Operation sont rangées par « Floor N »,
      alors que chaque infiltration a 3 zones, chacune avec ses combats.
      Ranger infiltration → zone → combat, depuis la donnée du jeu.
- [ ] **Contrat solver, L1 d'abord** : `schema` et `resVersion` dans
      `solver/version.json` avant tout changement de forme (C1, M2, M3,
      vitesse en %, noyau par niveau, `stat-keys.json`). L1 FAIT des deux
      côtés (A56 ; G1, `ba7d2c0`, publié dans gear-solver 1.9.0 du 16/10).
      C1 et O5 FAITS et lus (C20 ; G3, `605b6fb`, 1.9.0). M2 et M3 émis par
      C20 : M2 (`statsByTier`) lu sur le `main` de gear-solver (`de4eb91`,
      18/10), pas encore publié (la dernière release est la 1.10.0 du
      17/10) ; M3 (`ee-passives["2000078"]`) est dans la donnée de la 1.9.0
      et passe par la boucle générique des passifs d'EE
      (`packages/core/src/parse.ts`), mais aucun code ni test ne le cite :
      lecture à vérifier. `combatEffects` FAIT côté outerpedia (B53,
      16/10), affiché sur le `main` de gear-solver (`f5a3d5d`, 18/10), pas
      encore publié. Noyau par niveau et vitesse en % FAITS côté contrat
      (B56, 16/10, `corePassiveByFusion`), lus sur le `main` de gear-solver
      (`76c37f3`, 18/10), pas encore publiés ; restent la fiche du wiki avec
      l'oracle, puis le retrait de `corePassive`. `stat-keys.json` FAIT
      côté outerpedia (C26, 18/10), lecture par gear-solver à faire (G30).
- [ ] **Suites de la rédaction des lots du 15/10** (lots rédigés : C18 à
      C25, B51, B53 à B57, A58 à A60, F27, G2 à G6, OB1, OB2, TW1) :
      adversité du guide des tours et Very Hard étage par étage FAITS (B58,
      18/10) ; `stat-keys.json` (L6) FAIT côté contrat (C26), reste G30 et
      les lecteurs du wiki ;
      fiche du wiki en vitesse en taux avec régénération de l'oracle, une fois que
      gear-solver lit `corePassiveByFusion` (B56) ; nombre de stacks de
      `BT_STACK_STAT` dans le calculateur (plus tard) ; restes de J12, deux
      latents sans effet aujourd'hui : `datagen/lib/burst.ts:15` (« > 1
      coût » contre `Count > 0` du client, équivalent sur les 136 skills) et
      `timegate-resources` qui ignore `ProductGoodsValue` (aucun produit
      courant > 1).

## 🧹 Suites de la rédaction du 18/10 (lots A62 à C26, G8 à G30, F28, OB3, TW2)

- [ ] **Talismans à +5 : 5 emplacements de gemme pour tous** — FAIT côté
      outerpedia (B62) : le client donne 5 emplacements à +5 à TOUS les
      talismans et EE (tous `IG_UNIQUE`, l'étoile n'entre pas dans la règle),
      `gemSlotsOf` est juste ; le contrat émet `enhance.json` › `gemSlots` et
      `reforge` (`maxTicksPerSub`, `countByStar`, `ascendedBonus`),
      `progression.json` › `evoUnlockLevel`, et `combatOnly` de `buffs.json`
      par `isStatSheetBuff`. Reste, après la série G, le lot gear-solver qui
      lit ces clés : `gemSlotsOf` (`apps/renderer/src/lib/solver/gems.ts`
      l.182-186), `REFORGE_PER_SUB_CAP` (l.845), `REFORGE_PLANS` (l.72-75) et
      `maxReforgesOf` (l.854-857) d'`apps/renderer/src/lib/solver/engine.ts`,
      `EVO_UNLOCK_LEVEL` (`packages/core/src/compose-stats.ts` l.224-229), le
      « 5 : 4 » de `buildAdvice.ts` (l.152), et `progression.json` ajouté à
      `apps/desktop/src/solver-files.json`.
- [ ] **Suites de L6 (après C26 et G30)** : les lecteurs du wiki
      (`BLOCK_KEY`, `BONUS_KEY` de `char-progression.ts`, `STAT_KEY` de
      `reco-api.ts`) et `RAW_FLAT` / `statScales` de `monster-stats.ts` lisent
      la table de clés — FAIT côté wiki (B61) ; reste, côté gear-solver, les
      mains d'EE `ST_AVOID` sortent du panneau au lieu d'y être « combat-only ».
- [ ] **Suites de G8** : fiche du wiki en vitesse en taux avec régénération
      de l'oracle (`char-progression.ts`), puis retrait de `corePassive`
      (`schema` 2), seulement après la release de gear-solver qui porte G8.
- [ ] **outerbot** : liens d'index nus `/characters` et `/guides`
      (`src/commands/char.ts`, `guide.ts`) : FAIT (OB4, laissés nus,
      documentés et gardés par le contrat) ; review déposée entre le
      démarrage et le premier forum-sync : FAIT (OB4, gardée par slug,
      remplie au forum-sync suivant) ; Dependabot `npm` (et `docker` pour
      l'image de base) : PLUS TARD (décision de Sevih du 18/10, chaque PR
      redéploie le bot ; OB3 ne couvre que les actions GitHub).
- [ ] **Pulverization T4, 4 pièces** : correction de la table du jeu FAITE
      (A67, le 4P T4 lit `BID_ITEM_UO_SET_17_1` à 500, tenue dans
      `datagen/lib/buff.ts`). Reste à Sevih : la mesure en jeu (4 pièces T4
      contre une cible en Break, +120 % attendus) ; Fortification (−30 % de
      vitesse, normal) à vérifier en jeu aussi ; le `data:sync` de gear-solver.
- [ ] **gear-solver, petits suivis de G9 et G10** : le pré-tri du mode Score
      (`priorityScoreOf`, `magnitudeScoreOf`) compte le −30 % de vitesse de
      Phantasm (écrit dans sa description, pas caché) comme −30 SPD plats ; dans l'onglet Builds, l'infobulle de la pastille
      « combat » ne se survole pas (`RichTooltip` en `pointer-events-none`,
      `BuildsScreen.tsx`) ; notes publiques `docs/release-notes.md`
      [Unreleased] à remplir avant la release (G8, G9, G10).
- [ ] **gear-solver, petits suivis de G12** : `wiki/Engine-Reference.md` dit
      encore « a list of known local paths » pour `data/sync.mjs` (c'est
      `.env.local` puis `../outerpedia`) ; `docs/roadmap.md` (M8) et
      `docs/STATUS.md` donnent encore le packaging « à vérifier », à
      requalifier comme `docs/todo.md` ; l'item « data-sync » de
      `docs/todo.md` (« octets non JSON écrits tels quels ») ne vaut plus
      qu'en mode REPO ; le script de rejeu des EE ne compte pas l'`IOT_STAT`
      (1 écart faux, 2000078 à +10).
- [ ] **gear-solver, CI** : ni `dependabot.yml`, ni actions épinglées par SHA
      (`actions/checkout@v4`…), comme outerbot avant le 15/10.

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
      dernier des Éditeurs), Guide editor › catégories de boss (section
      « Guides », lot F18 — les sept catégories de `GUIDE_SPECS`, sans les
      catégories mortes), Guide editor › General guides et Overview (la même
      section, lot F19 — les trois guides généraux à fragment éditable sous
      une même forme, et l'import de contribution ; le groupe « Guide
      editor » quitte le menu de l'admin), Extractor › revue par cible et
      acceptation (section « Extraction » des Données, lot F20 — les dix
      cibles, leurs entités et un diff lisible, « Confirmer l'extraction »,
      les retouches mineures, « Intégrer » / « Retirer » un item ; les liens
      Effect, Armor et Item quittent le menu de l'admin), Extractor › fiches
      et intégration (la même section, lot F21 — la fiche d'un perso, d'un
      monstre, d'une famille d'équipement, « Intégrer », « Intégrer un
      mode », les sprites du jeu ; les six liens quittent le menu de l'admin),
      Extractor › versionnage (la même section, lot F22 — « Figer et
      ré-épingler » sur la fiche monstre, le plan des guides avant de figer ;
      le groupe « Extractor » quitte le menu de l'admin), Events (onglet
      « Événements », lot F23 — la liste, l'éditeur à six langues en trois
      sous-onglets, « Enregistrer » publie sur R2 et committe ; le groupe
      « Tools » quitte le menu de l'admin), le retrait de `/admin` (22,
      lots C14 et C15 — pages, routes et composants supprimés le 13/10 :
      quick est le seul outil).
      Clos sans portage (lot A34) : Gear presets
      (non porté, le fichier s'édite à la main) et Tag control (le contrôle
      est le test, bloquant dans `pnpm commit`).
      À faire par Sevih : remplir
      la colonne « Agacements » (en vrac) ; puis un lot par section.
- [ ] **« Extraction » — contrôles à l'écran (lot F20)** : le banc ne
      clique pas, aucun geste réel n'a été joué (le dépôt du jour n'a qu'un
      perso nouveau sans nom, `2400015`, et aucun écart). Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : quatre routes nouvelles). Au
      prochain patch — Steam à jour, Patch › « Rafraîchir depuis le jeu »
      d'abord, pour que `.gamedata` porte les tables neuves — : (1) la vue
      d'ensemble contre l'inbox du Tableau de bord, mêmes comptes par cible
      (les monstres au périmètre du site) ; « Ouvrir » d'un item
      `extract:<cible>` du tableau arrive sur SA cible. (2) Une cible avec un
      diff : une entité dépliée — les groupes par racine, un texte en mots
      surlignés, un arbre pour un costume ajouté, un skill nommé ; le texte
      doit se lire sans avoir à décoder du JSON. (3) « Appliquer les
      retouches mineures (n) » → le journal dit « n retouches mineures et m
      coquilles appliquées », puis « committé », `git log -1` =
      `chore(extractor): <cible> — n retouches mineures` sur le seul fichier
      de la cible ; la cible relue n'a plus que ses vrais écarts ; le bilan
      d'images dans sa carte, puis Patch › « Committer » pousse le staging
      (l'ancien item « B27 retouches mineures » renvoie ici). (4) « Confirmer
      l'extraction » : le plan dit les comptes et le fichier AVANT, « Écrire
      et committer » écrit le fichier entier, UN commit. (5) Un item
      « Intégrer » → `chore(extractor): item <nom> (<clé>)`. (6) Rejouer un
      geste sur une cible lue avant un refresh → « Rien n'est écrit — … ont
      changé depuis la lecture », la cible relue. (7) Sur un poste sans
      `.gamedata` : le badge ambre, des zéros, une cible vide avec la raison,
      aucun bouton de geste. (8) `#extractor/<cible>/<clé>` (ou « Ouvrir »
      d'un item du tableau de bord puis la clé) arrive sur l'entité
      DÉPLIÉE — le banc l'a vue repliée sur le seul perso nouveau du 12/10,
      qui n'a aucun champ (relecture F20).
- [ ] **« Extraction » › versionnage — contrôles à l'écran (lot F22)** : le
      banc ne clique pas, et RIEN n'a été figé (`POST /api/extractor/freeze`
      n'est pas dans `READ_ONLY_POSTS`) ; ses refus sont testés. Relancer
      quick d'abord (Ctrl-C puis `pnpm quick` : deux routes nouvelles). Au
      prochain boss de Joint Challenge ou de World Boss qui CHANGE dans le
      jeu, AVANT de créer la version nouvelle de son guide : (1) sa fiche
      (Données › Extraction › Monstres › « Fiche ») montre l'ordre « 1. Figer
      l'état actuel », « 2. Intégrer l'extraction » à la place de
      « Ré-intégrer » ; le bloc « Versions » dit combien de guides le
      désignent encore en live. (2) « 1. Figer » : le PLAN se lit — la clé
      `<id>@<n>`, le commit de HEAD et sa date, les versions du guide qui
      seront épinglées (TOUTES celles encore en live, la plus récente
      comprise : c'est pour ça qu'on fige avant « ＋ version »), et sous
      « Laissés en live » le `bossId` du guide versionné, « jamais épinglé ».
      (3) Une note, « Figer » → UN commit
      `chore(monsters): <nom> (<id>) fige en v<n>, <k> guides re-epingles`
      qui porte l'archive `data/generated/monster-archive/<id>@<n>.json`, le
      `config.json` épinglé de chaque version et le `meta.json` re-daté (à
      lire avec git show --stat HEAD) ; le rapport reste sous le plan,
      l'archive apparaît dans la liste avec « épinglée par … ». (4) Dans
      Guides › le guide › Combat : le badge « épinglé · v1 » et
      « dépingler » (le contrôle 4 du lot F18, enfin jouable). (5) Retour à
      la fiche : l'ordre a disparu, « Ré-intégrer » est revenu → l'intégrer.
      (6) Après « Pousser » et le déploiement : l'ancienne version du guide
      montre le boss de l'archive, la nouvelle le live. Aussi : (7) la fiche
      de Prototype EX-78 (`#extractor/monster/4548161`) dit son archive du
      11/08 « orpheline » ; (8) le menu de l'admin n'a plus de groupe
      « Extractor ». (9) Lot A35 — après « Promouvoir » dans Patch, AVANT
      de committer la promotion : la fiche du boss changé montre « 1. Figer
      l'état actuel », « 2. Committer la promotion (Patch) » ; le plan porte
      la ligne ambre « Le disque diffère de HEAD pour ce monstre (…) —
      l'archive figera l'état committé, <sha> du <date> », « Figer » est
      actif, le journal redit la ligne avant l'archive, et
      git show --stat HEAD ne porte que l'archive et les guides (la
      promotion reste à committer, dans Patch).
- [ ] **« Extraction » › fiches et intégration — contrôles à l'écran (lot
      F21)** : le banc ne clique pas, aucun POST d'intégration n'a été joué
      (ils ne sont pas dans `READ_ONLY_POSTS`) ; leurs refus sont testés.
      Relancer quick d'abord (Ctrl-C puis `pnpm quick` : cinq routes
      nouvelles). Au prochain patch, un perso NOUVEAU : (1) sa fiche
      (`#extractor/character/<id>`, ou « Fiche » sur sa ligne) — le portrait
      et les icônes de skills viennent du jeu (`/api/sprite/…`), pas du
      site ; d'abord SANS date de sortie dans
      `data/curated/character-release.json` : le cadre rouge nomme l'id,
      « Intégrer » est éteint ; puis la date posée à la main, la fiche
      relue, « Intégrer » → le plan (characters.json, skills.json, slugs,
      dates, damage/solver, images), « Écrire et committer » → UN commit
      `chore(extractor): character <nom> (<id>) integre` qui porte
      `skills.json` ET `data/generated/damage/*`, `solver/*` (à lire avec
      git show --stat HEAD), le bilan d'images dans sa carte, Patch ›
      « Committer » pousse le staging. (2) Un monstre : « Intégrer » (ou « Ré-intégrer »)
      → `chore(extractor): monster <nom> (<id>) integre` avec
      monsters.json, monster-skills.json, encounters.json s'il spawne, et
      damage/solver ; le `select` des rencontres change la grille. (3) Un
      mode sur la cible Monstres : « Planifier » montre les ids AVANT, puis
      `chore(extractor): mode <mode> — n monstres integres`. (4) Une famille
      d'armes depuis l'id d'un membre : UN commit à l'id de la FAMILLE, avec
      `families.json` et les pools/passifs. (5) Les liens croisés : « fiche
      perso » / « câbler les chips » depuis la fiche, « extraction » depuis
      la Fiche perso et depuis Monstres. (6) Un geste sur une fiche lue
      avant un refresh → « Rien n'est écrit — … ont changé », la fiche relue.
- [ ] **Après le retrait de `/admin` (relecture du 13/10) — contrôles à
      l'écran ; les points 1 à 7 sont faits (A51), le point 8 aussi (B49)** :
      À l'écran, par Sevih : un vrai ajout Twitch ou Bilibili sur une fiche
      (A48), les pastilles qui ne bougent plus au dry-run ni au push (A50),
      « Autres » dans l'en-tête d'un monstre d'event (A49), le dépliant d'une
      entité nouvelle, sur une vraie entité ajoutée au prochain patch (B49).
- [ ] **« Événements » — contrôles à l'écran (lot F23)** : le banc ne
      clique pas, aucun enregistrement réel n'a été joué, `/api/translate`
      jamais appelé avec des clés, `POST /api/events` jamais appelé (les
      clés `R2_*` sont réelles sur ce poste). Relancer quick d'abord (Ctrl-C
      puis `pnpm quick` : trois routes nouvelles — sans ça l'onglet dit
      « quick lancé avant ce code »). (1) Publication › Événements : la liste
      dans l'ordre du fichier, `20260324-video` « terminé », `_no-peaking`
      « terminé · brouillon », les dates en UTC, la cover, « ouvrir sur le
      site ». (2) Ouvrir `20260324-video` : Méta (l'heure de Paris à côté de
      l'UTC), retoucher un texte EN (le titre), « à retraduire » apparaît,
      « Traduire » (le seul texte périmé part, ses cinq langues réécrites ;
      les « Traductions » se déplient), puis « Enregistrer » → le journal :
      « 2 événements écrits dans data/curated/events.json », la ligne R2
      « publié sur R2 + edge purgé » (ou « R2 NON PUBLIÉ … sautée » sans
      clés), UN commit `chore(events): 20260324-video` (`git show --stat` :
      le seul `events.json`), la savebar revient à « aucune modification ».
      (3) Dix minutes plus tard au plus, la page `/event/20260324-video` du
      site SANS déploiement porte le titre retouché (la copie R2). (4) Blocs :
      « ＋ Liste à puces » → le bloc a son champ Titre, éditable ; une puce,
      ↑ ↓ ✕ ; « Enregistrer » → le titre est dans le fichier. (5) Supprimer
      un événement (✕ de la liste ou « Supprimer » de l'en-tête) : la boîte
      de confirmation, « Annuler » le garde, confirmer le retire, la savebar
      compte « 1 événement modifié » ; « Annuler » de la savebar le ramène.
      (6) Le menu de l'admin : plus de groupe « Tools » ;
      `/admin/tools/events` répond encore par son URL. (7) Une saisie fautive
      (un bloc sans texte EN) : « Enregistrer » refuse, le message sous le
      bloc, le point rouge sur « Blocs », « refusé » dans l'en-tête, rien
      d'écrit ni committé. Notes de relecture (Fable, 12/10), pour la revue
      de quick : le message de commit « chore(events): 2 événements » porte
      des accents, alors que les autres messages de quick n'en ont pas
      (« re-epingles ») ; un titre de bloc vide affiche « Traductions (5)
      0 / 5 », un compte qui ne veut rien dire pour un texte facultatif
      laissé vide.
- [ ] **« Guides » › guides généraux et import — contrôles à l'écran (lot
      F19)** : le banc ne clique pas, aucun enregistrement réel n'a été
      joué, `/api/translate` jamais appelé avec des clés. Relancer quick
      d'abord (Ctrl-C puis `pnpm quick` : trois routes nouvelles). (1)
      Guides › Guides : dans General Guides, Premium & Limited, Free Heroes,
      Shop priorities et Core Fusion (C13) ont un bouton, les dix autres
      « contenu en code ».
      (2) Premium & Limited › Premium : une review retouchée en anglais,
      « Traduire » (les cinq langues posées, « Traductions » dépliées),
      « Enregistrer » → UN commit `chore(guides): general-guides/premium-limited`
      qui porte `premium-reviews.json`, `premium-priorities.json` ET le
      `meta.json` re-daté (`git show --stat`) ; la savebar revient à
      « aucune modification ». Puis, depuis F25 (12/10) : Premium ›
      Priorités, GLISSER une vignette d'un palier à un autre (le trait
      d'insertion, la rangée cerclée), « Enregistrer » → `premium-priorities.json`
      porte le déplacement ; « ＋ » d'un palier (le picker en multi : cochés =
      le palier, « Valider » remplace), ↑ ↓, ✕. Premium › Reviews : une
      ligne cliquée déplie sa review, une cible en ÉTOILES (3-6, « Any »,
      une note) et une case d'impact en étoiles → `premium-reviews.json`
      porte les chaînes du site (« 4 to 5 », « Any », « 3 ») ; « Traduire »
      traduit aussi les reviews repliées. (3) Un
      fichier de review de Shiraen importé depuis la vue d'ensemble (glissé
      ou choisi) : le journal dit « … › premium › <perso>: edited/added »,
      un commit `chore(guides): import premium-limited-review` avec le
      `meta.json` — un fichier qui n'est pas du JSON est refusé sans appel ;
      un fichier de contribute/premium-reviews (le site n'a pas changé, F25)
      toujours accepté.
      (4) Free Heroes : une source ajoutée (« ＋ source », « ＋ entrée »,
      « ＋ héros » en multi, le type de choix), « Enregistrer » → le commit
      porte `free-heroes-sources.json` et le `meta.json`. (5) Shop › Guild :
      une priorité changée (re-cliquer efface), « ＋ note » sur un produit,
      « Enregistrer » → TROIS fichiers dans le commit : `shop-editorial.json`,
      `data/curated/shop-priorities.json`, `data/generated/shop-priorities.json`,
      plus le `meta.json` — ce premier enregistrement réordonne aussi les
      clés de `shop-editorial.json` (`priority` avant `name`, `joint` avant
      `event`) : un diff plus large UNE fois, les valeurs égales (relecture
      F19). (6) Le menu de l'admin : plus de groupe « Guide
      editor » ; `/admin/guides` répond encore par son URL. (7) Après
      « Pousser » et le déploiement : les pages des trois guides, leur date
      « Updated ».
- [ ] **« Guides » › Core Fusion — contrôles à l'écran (lot C13)** : aucun
      enregistrement réel n'a été joué (le banc ne clique pas, un POST de
      quick committe). Relancer quick d'abord (Ctrl-C puis `pnpm quick`).
      (1) Le site : `/guides/general-guides/core-fusion` identique à avant
      dans les six langues (les six cartes, les deux paliers, les « > »
      entre les portraits) — comparé en dev par `curl`, à revoir après le
      build de la CI ; seule la date « Updated » bouge (12/10 : le hook
      `stamp-guides` a re-daté le guide au commit du lot). (2) Guides › General Guides › Core Fusion ›
      Priorités : GLISSER une vignette du 1er au 2e palier, « Enregistrer »
      → UN commit `chore(guides): general-guides/core-fusion` qui porte
      `priorities.json` et le `meta.json` re-daté (`git show --stat`), le
      déplacement dans le fichier, `op` et `stars` partis avec la vignette ;
      changer une relation (« > », « ≥ », « — » → `null` dans le fichier).
      (3) Reviews : une ligne dépliée, un niveau recommandé coché puis
      décoché, « Ce qui change à la fusion » déplié, un texte retouché,
      « Traduire », « Enregistrer » → `reviews.json` porte la retouche et
      RIEN d'autre (pas de clé réordonnée ni de langue perdue dans les cinq
      autres reviews : `git diff` court) ; un changement vidé disparaît du
      fichier. (4) Un enregistrement SANS retouche dit « Rien à enregistrer :
      le disque porte déjà ces valeurs » et ne committe rien.
- [ ] **« Guides » — contrôles à l'écran (lot F18)** : le banc ne clique
      pas, et aucun enregistrement réel n'a été joué ; `/api/translate` n'a
      jamais été appelé avec des clés. Relancer quick d'abord (Ctrl-C puis
      `pnpm quick` : cinq routes nouvelles — sans ça l'onglet dit « quick
      lancé avant ce code »). (1) Guides › Guides : la vue d'ensemble liste
      les catégories vivantes dans l'ordre du site ; « cachés » fait
      apparaître Adventure License (26) et Monad Gate (31) avec leur badge ;
      la recherche par début de mot (titre, slug). (2) Un guide PLAT
      (Special Request) : Tips, un conseil ajouté en anglais en fin de bloc,
      « Traduire » (les cinq langues posées, « Traductions » dépliées),
      « Enregistrer » → UN commit `chore(guides): special-request/<slug>`
      qui porte les JSON touchés ET le `meta.json` re-daté (contrôle : git show --stat) ; la savebar revient à « aucune modification ». (3) Un guide
      VERSIONNÉ (Joint Challenge) : « ＋ version » avec une clé du mois
      (dupliquée de la récente : elle s'ouvre, « pas encore committée »), la
      proposition du Journal du site prérempli (gabarit « Mise à jour »,
      guide · mode · mois · slug), puis dans Combat « Changer… » le combat
      → toutes les versions qui en portent un suivent (vérifier les
      `config.json`), « Enregistrer » → le dossier de la version nouvelle
      part dans le commit. (4) Combat d'un versionné : un monstre épinglé
      (aucun au 11/10 : en poser un par l'extractor d'abord) se lit avec
      l'étiquette de son archive et se dépingle. (5) Le menu de l'admin :
      plus de groupe « Guide editor » du tout depuis F19 (ni Adventure
      License, ni les catégories de boss, ni Overview). (6) Caduc depuis B48 : le menu
      Vidéos de quick a disparu avec sa section. (7) Après « Pousser » et le
      déploiement : la page du guide retouché, sa date « Updated » sur le
      site. Hors périmètre vu en portant : le gabarit « Mise à jour » du
      Journal ne connaît que Joint Challenge, Guild Raid et World Boss (pas
      de mode pour un Special Request re-versionné — ils sont plats, c'est
      normal) ; `tagSourceSheet` situe un tag mort dans un guide : FAIT
      (B60).
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
      code »). (1) Un perso, sous-onglet Pros / Cons (la forme F24 : une carte
      par colonne, le rendu du site en tête, UN texte anglais une ligne = un
      pro, les traductions ligne à ligne) : saisir trois pros, un avec un tag
      `{B/…}` — le rendu suit la frappe, l'aperçu arrive après 400 ms, icône
      et nom de l'effet ; changer la langue « Aperçu » de la savebar ;
      réordonner deux pros dans le texte, en effacer un au milieu (A47 : les
      traductions suivent leur ligne, dans les textarea des langues aussi ;
      sous l'anglais, en ambre, « 1 traduction orpheline retranchée ») ;
      « Enregistrer », vérifier le fichier : l'ordre du texte, chaque ligne
      avec SES traductions, celles de la ligne effacée parties. Une
      traduction de trop (une ligne de
      plus que l'anglais dans une langue) : ambre sous la textarea, « 1
      erreur » dans la savebar, rien ne part. (2) Un tag faux (`{B/Foo}`) :
      rouge dans le rendu ; « Enregistrer » — attendu : refus sur le rang
      (rouge dans le rendu, « Pro 3 : … » sous le texte), carte cerclée, rien
      d'écrit ; le corriger, enregistrer. (3) « Traduire » avec les clés : les
      lignes périmées ou pas encore traduites se posent dans les cinq langues
      (elles ÉCRASENT les leurs ; une ligne traduite partout et à jour ne
      repart pas), « Traductions » se déplie, à relire ; « à retraduire »
      après une retouche de l'anglais.
      (4) Synergies : « ＋ groupe », « ＋ héros » (deux héros dans le picker,
      « Valider »), une raison, « Enregistrer » → UN commit
      `chore(characters): <perso>` ; un groupe sans héros est refusé. (5) Le
      diff du commit : seules les lignes touchées bougent dans
      `data/curated/characters.json`. (6) Après « Pousser » et le déploiement :
      la fiche du perso sur le site, sections Pros / Cons et Synergies. À
      juger : « Traduire » de Pros / Cons posé sous les deux cartes ; le
      rendu du site AU-DESSUS du texte (F24 : Sevih a dit « au-dessus ou en
      dessous ») ; les
      textarea de deux lignes des Synergies ; faut-il une saisie assistée des
      tags (les `refs` sont servis, la page ne les lit pas encore) ?
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
      (6) Cocher « free », enregistrer (« ajouter dans Vidéos » : caduc
      depuis B48, la carte Vidéos s'édite sur place — cf. ses contrôles
      plus bas). (7) Caduc depuis B40 : Gear reco n'a plus
      de picker de perso à lui, il prend celui de la fiche. À juger aussi : les
      deux cartes côte à côte (une seule sous 1000 px) — assez aérées ?
- [ ] **Vidéos dans la fiche et dans le guide — contrôles à l'écran (lot
      B48)** : le banc ne clique pas, et ni YouTube ni un enregistrement réel
      n'ont été joués (clé vidée au banc, quota). Relancer quick AVEC la clé
      (`.env.local`), puis : (1) le groupe Publication n'a plus « Vidéos »,
      la pastille YouTube de l'en-tête est verte. (2) Fiche perso › Fiche
      d'un perso sans vidéo : « Chercher sur la chaîne officielle » sur son
      nom → CINQ candidats au plus, avec leur miniature ; « choisir » pose
      l'id, « ＋ vidéo » l'ajoute en fin de liste (filet accent, « 1
      changement ») — rien n'est committé à ce stade. (3) La même par URL
      collée (`https://youtu.be/…`) sur un autre perso ; une URL déjà dans la
      liste → « déjà dans la liste », sous le formulaire. « Enregistrer » →
      UN commit `chore(characters): <perso>` dont `git show --stat` porte
      `data/curated/characters.json` ET `data/generated/video-meta.json` (la
      date de la vidéo y est entrée). (4) ✕ sur une vidéo, « Enregistrer » :
      la clé `videos` suit, et l'id quitte `video-meta.json` s'il n'est plus
      cité nulle part. (5) Guides › un joint challenge › une version
      ANCIENNE › Vidéos : ajouter par URL avec un « Libellé d'onglet »,
      « Enregistrer » → UN commit `chore(guides): <cat>/<slug>` qui porte le
      `versions/<clé>/config.json` de CETTE version et `video-meta.json` ;
      la version récente n'a pas bougé. (6) Après « Pousser » et le
      déploiement : la vidéo sur la page du perso et sur celle du guide
      (l'onglet du libellé). À juger aussi : la carte Vidéos en pleine
      largeur avec ses miniatures de 120 px — pas trop haute sur un perso à
      quatre ou cinq vidéos ?
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
      (d) les liens FAUX de la déduction par le nom : FAIT (B60).
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
      astérisques. À juger : (a) les guides proposés sous le champ Guide de
      « Mise à jour » et (c) le flux RSS par `bulletSegments` : FAITS (B60) ;
      le gabarit Guide ne connaît toujours que la Singularité
      dimensionnelle.
- [ ] **« Tableau de bord » — contrôles à l'écran (lot B36)** : le banc ne
      clique pas. (1) La version du client : « site 1.11.404 · client
      1.11.404 » en vert aujourd'hui ; après une mise à jour Steam du jeu,
      attendu en ambre avec « un patch attend : onglet Patch », et sur un
      poste sans le jeu, atténué (« pas de client Steam sur ce poste »). (2) « Ouvrir
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
- [ ] **« Pousser », restes de B33** (premier clic réel fait par Sevih,
      confirmé le 18/10) : la relecture de `/api/git` au retour sur la page
      (focus, onglet du navigateur redevenu visible) est FAITE (B60). À jouer par
      Sevih, depuis A33 : un fichier indexé au terminal (`git add`) puis un
      enregistrement dans quick — `git show --stat` ne le cite pas,
      `git status` le montre toujours indexé.
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

- [ ] **`game-client.json` a suivi le dump (lot A60)** : après le
      `datagen:dump` du patch, le journal dit « data/curated/game-client.json :
      client 1.4.18 → 1.4.x, build … → … — à committer avec le patch » (ou
      « inchangé » si version et build n'ont pas bougé) ; son `git diff` ne
      touche que le bloc `client` (version, `buildId`, `dumpedAt`), et le
      fichier part dans le commit du patch — gear-solver et
      outerplane-tweaks le recopient de `main`. « Version applicative
      inconnue » au journal = UnityPy absent : rien d'écrit, poser le bloc à
      la main d'après `.dump-stamp.json`.
- [ ] **quick, section « Patch » — « Arrêter », à essayer une fois (lot
      C10)** : le cycle complet (Lancer, Dry-run, Promouvoir, Committer,
      Pousser) a été joué au patch du 14/10. Reste : « Arrêter » pendant le
      rafraîchissement (rien ne doit continuer derrière : `pgrep -f datagen`
      vide ; « Lancer » reprend ensuite au checkpoint). À NE PAS arrêter :
      « Committer » une fois les images parties sur R2 (la prod les servirait
      sans commit).
- [ ] **Rapport des effets de portrait (lot F12)** : au premier patch qui
      apporte un effet, contrôler la dernière ligne du refresh (« ◆ Portraits
      animés — à lire ») — l'effet y est nommé avec ses porteurs, « servi tel
      quel » ou « en attente : … » ; puis `/dev/AnimatedPortrait`, où il a
      sa section générée, et le confronter au jeu. Les trois cas et quoi
      faire : entrée DONE du lot F12 (05/10).
