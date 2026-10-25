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
      `stat-keys.json` lu par G30). Reste (M3, le passif d'EE
      de Fatal, est lu et testé par gear-solver depuis G35) : (b) nombre de stacks de
      `BT_STACK_STAT` dans le calculateur (plus tard) ; (c) deux latents de
      J12 sans effet aujourd'hui : `datagen/lib/burst.ts:15` (« > 1 coût »
      contre `Count > 0` du client, équivalent sur les 136 skills) et
      `timegate-resources` qui ignore `ProductGoodsValue` (aucun produit
      courant > 1).

## 🧹 Restes de la relecture du 21/10 (B66, A76, A77, C27, G35)

- [ ] **Guides « en cours de mise à jour », deux restes de B66** : le badge
      « Updating » n'apparaît que sur les vues à cartes (`GuideCard` :
      grille par défaut, Dimensional Singularity), pas sur les vues à
      bannière des world boss, raids de guilde et joint challenge — à
      décider s'il y faut un marqueur ; « ＋ version » duplique
      `version.json` tel quel, donc une copie d'une version cachée naît
      cachée (décocher après). À l'écran par Sevih : quick › Guides ›
      Drakhan, la case « En cours de mise à jour » (Méta) et la case
      « Cachée » sous la rangée des versions ; sur le site, le bandeau en
      tête du guide et le sélecteur sans la version cachée.
- [ ] **Deux restes d'A76 (calculateur)** : le clip de Valentine 1206 joue
      `2000012_Skill_5_1`, rattaché par la jointure à 1205/1209 et absent de
      ses lignes de détail (total juste) ; `2000065_Skill_1_5_B` (1 100 ‰)
      sorti du S1 d'Ame faute de clip qui le joue — possible variante sous
      B, à prouver dans le client avant de la remettre.

## 🧹 Vu au `pnpm dev` du 24/10

- [ ] **Suppressions récursives de `.gamedata` sans nouvel essai sous
      Windows** : `datagen/extract/extract.ts:129` a planté en EPERM en
      vidant `extracted/images` avant réextraction (Node 24.13.1). L'erreur
      cite la racine `images`, mais l'échec est au premier dossier traité
      (`assets/art/ui/dungeon/ig_button_burst_02`) : son fichier est parti,
      puis le `rmdir` du dossier vide a été refusé. Aucun fichier en lecture
      seule, aucun nom interdit, chemin max à 201 caractères, rien de
      verrouillé après coup : c'est un handle tenu un instant par un autre
      processus (indexeur, Defender, Syncthing qui synchronise `.gamedata`,
      ou Explorer), sans qu'on sache lequel. Sans gravité : l'empreinte
      n'étant écrite qu'après succès, la passe suivante rejoue. Correction :
      `maxRetries` et `retryDelay` (Node réessaie alors sur EPERM, EBUSY et
      ENOTEMPTY), qu'aucun `rmSync` du repo n'utilise, sur les trois grosses
      suppressions : `extract.ts:129`, `extract-wallpapers.ts:330`,
      `extract-audio.ts:197`. Mieux vaut un petit utilitaire commun dans
      `datagen/lib/` qu'une option recopiée trois fois. Si le plantage
      revient au même endroit à chaque relance, il ne s'agit plus d'un
      blocage passager : trouver le processus avant de corriger.

## 🧰 Outil quick

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

## 🔧 gear-solver

- [ ] **Presets du jeu — restes** : le pool de gemmes d'EE des presets ignore
      les réservations de la Worklist (relevé par G41) ; priorités par héros
      en session (le Builder repart propre), l'onglet Presets replie sur la
      build sauvegardée — à passer en localStorage si Sevih le demande ;
      « Optimize preset → » = lot G47 (effets requis + sous-stats
      prioritaires) ; restent en piste : exclure les pièces des autres
      presets, figer celles du preset, les sets.
- [ ] **Suivi en direct — restes (vus par G44)** : la Worklist garde
      `toName` / `toMain` figés à la mise en file (la main d'un talisman ne
      suit pas l'enchant) ; une pièce en file ou dans un preset mangée en jeu
      ressort « absente », et le `PresetList` du snapshot garde son uid
      jusqu'au lobby. `item/sell` et `item/lock` non suivis (la réponse ne
      porte pas l'item). Si une dissolution ne retire pas la pièce sur le
      fixe : journaliser la requête, le client n'applique pas le `ItemList`
      de la réponse.

## 🧪 À jouer au prochain patch

- [ ] **Rapport des effets de portrait (lot F12)** : au premier patch qui
      apporte un effet, contrôler la dernière ligne du refresh (« ◆ Portraits
      animés — à lire ») — l'effet y est nommé avec ses porteurs, « servi tel
      quel » ou « en attente : … » ; puis `/dev/AnimatedPortrait`, où il a
      sa section générée, et le confronter au jeu. Les trois cas et quoi
      faire : entrée DONE du lot F12 (05/10).
