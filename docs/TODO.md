# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🔎 Revues d'octobre (tri du 15/10)

Les revues de la logique du site et de la génération de données (09-12/10)
ont été confrontées au code du 15/10 : tout est encore présent. Le détail,
les preuves et les décisions vivent dans le tri consolidé de sevih-tool
(`docs/revue/tri-2026-10-15.md`). Lots proposés, dans l'ordre :

- [ ] **Contrat solver — ce qui reste après la 1.11.0/1.11.1 de gear-solver
      (19-20/10)** : tout ce que le tri du 15/10 listait est publié (L1,
      C1, O5, M2 `statsByTier`, `combatEffects`, `corePassiveByFusion`,
      `stat-keys.json` lu par G30). Reste : (a) M3 — `ee-passives["2000078"]`
      est dans la donnée et passe par la boucle générique des passifs d'EE
      de gear-solver (`packages/core/src/parse.ts`), mais aucun test ne le
      cite : un test qui le lit (lot G, une heure) ; (b) nombre de stacks de
      `BT_STACK_STAT` dans le calculateur (plus tard) ; (c) deux latents de
      J12 sans effet aujourd'hui : `datagen/lib/burst.ts:15` (« > 1 coût »
      contre `Count > 0` du client, équivalent sur les 136 skills) et
      `timegate-resources` qui ignore `ProductGoodsValue` (aucun produit
      courant > 1).

## 🧹 Restes de la relecture du 20/10 (A74, F30, F31, G34)

- [ ] **Espace des slugs de buff (suite d'A74)** : `statSlug()`
      (`datagen/lib/effects.ts`) garde ses slugs mécaniques (`dmg_boost`,
      `dmg_reduce_rate`, `critical_dmg_rate`, `e_cri_dmg_reduce`,
      `enter_ap`/`hit_ap`/`kill_ap`, `accuracy`/`avoid`…) sur ~1 460 effets
      (skills, monster-skills, passives, pools, sets, progression, solver) et
      ses lecteurs (`PERCENT_STAT_SLUGS`, `STAT_ABBR`,
      `src/lib/damage/scenario.ts`, `equipment-detail.ts`, gear-solver). Les
      unifier sur `STAT_TYPE_SLUGS` est un lot C avec contrat solver à bumper.
      Les trois archives `monster-archive/4548161@1`, `4548171@1`, `4548181@1`
      gardent l'ancien slug (figées).
- [ ] **14 skills à repli fantôme (suite de F30)** : 1205, 1206, 1209, 2201,
      4021, 6501, 6503, 6505, 7601, 8505, 8506, 9419-9421 — cellule juste,
      une ligne de tooltip en trop. Un lot A.
- [ ] **`bestSkill` d'Astei et de Gnosis Dahlia (F30)** : leurs bursts passent
      à 1 300 ‰ et 1 200 ‰ ; au prochain `pnpm datagen:build` + promote
      `solver/`, vérifier si `bestSkill` change (puis `data-sync.yml` le
      propose à gear-solver).
- [ ] **Fiche perso › Skills, restes de F31** : la classe `c-read` des deux
      cartes de lecture n'a pas de règle CSS (marqueur inerte) ; `kitExtras`
      recharge `extractedBundle` (~180 ms) une seconde fois par lecture de la
      fiche. À l'écran par Sevih : Tamamo-no-Mae › Skills (badges « via
      burst 3 » sur Extra Turn et Cooldown Reduction, cartes Bursts et
      Transcendance sans bouton).

## 🧹 Suites de la rédaction du 18/10 (lots A62 à C26, G8 à G30, F28, OB3, TW2)

- [ ] **Suites de G8** : fiche du wiki en vitesse en taux avec régénération
      de l'oracle (`char-progression.ts`), puis retrait de `corePassive`
      (`schema` 2), seulement après la release de gear-solver qui porte G8.

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

## 🧪 À jouer au prochain patch

- [ ] **Rapport des effets de portrait (lot F12)** : au premier patch qui
      apporte un effet, contrôler la dernière ligne du refresh (« ◆ Portraits
      animés — à lire ») — l'effet y est nommé avec ses porteurs, « servi tel
      quel » ou « en attente : … » ; puis `/dev/AnimatedPortrait`, où il a
      sa section générée, et le confronter au jeu. Les trois cas et quoi
      faire : entrée DONE du lot F12 (05/10).
