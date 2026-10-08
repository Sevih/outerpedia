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
      corriger dans quick (onglet Gear reco) ou l'admin (Sevih).
- [ ] **Presets en double** (`$mrs` = `$elemcritAP`, `a2p2` = `p2a2` dans
      `gear-presets.json`) : `collapseBuild` rend le premier trouvé, l'admin
      change donc le slug au save (quick, lui, garde celui du disque). À
      fusionner ou à distinguer dans l'admin des presets.

## 🧰 Outil quick

- [ ] **Migration de l'admin vers quick** (décision du 08/10) : inventaire,
      ordre et règles dans `docs/quick-migration.md`. FAIT : Short names et
      Search aliases (onglet « Noms », lot B34), Banner (onglet
      « Bannières », lot B35), la boîte de réception de la home (onglet
      « Tableau de bord », lot B36), la chaîne des données (onglet
      « Patch », lot C10), Changelog (onglet « Journal du site », lot B37).
      À faire par Sevih : remplir
      la colonne « Agacements » (en vrac) ; puis un lot par section — Synergy
      et Pro / Con iront dans l'éditeur de perso.
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
      « Accueil » relit (deux à trois secondes, bouton « Actualiser »
      occupé) ; « Pousser » depuis le tableau le relit aussi. À juger : (b) la lecture
      prend 2 à 3 s (le moteur de revue de l'admin, relancé par entité hors
      Next : lot A pour le mémoïser dans `admin-inbox.ts`).
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
- [ ] **« Pousser », restes de B33** : (1) le compte de l'en-tête ne se relit
      qu'au chargement, après un enregistrement et, depuis B36, à chaque
      lecture du tableau de bord (y revenir, ou « Actualiser ») — après un
      `git pull --rebase` ou un commit au terminal, passer par l'accueil
      (relire `/api/git` au retour de focus serait un lot A) ; (2)
      `commitPaths` committe TOUT l'index, comme avant lui : un fichier
      indexé au terminal partirait avec l'enregistrement — la carte
      « Dépôt » du tableau de bord compte les fichiers modifiés (B36), mais
      rien ne l'empêche : ne rien laisser dans l'index pendant que quick
      tourne, ou lot A pour n'indexer que ses chemins
      (`git commit -- <chemins>` sur un index propre). À jouer par Sevih : le
      premier clic réel sur « Pousser » (des commits non JSON attendent : le
      journal annonce le typecheck, puis « poussé »).
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
      résultats de Récompense avec icônes, hash `#gear/<id>`, fenêtre sous
      1060 px ; Rangs : cellule modifiée, refus réel, dépliage, clavier dans
      les menus de rang ; Discord AVEC le jeton : serveurs, salons,
      emojis de serveur, un envoi d'essai sur le serveur perso, embed,
      reprise d'envoi, presse-papiers (listes détaillées dans les entrées
      DONE des lots F16, B28, B29, C6).
- [ ] **Gear reco, à trancher** (laissé par B29) : donner `element`, `rarity`
      et la sous-classe au roster de `gearRecoState` (`actions.ts`) pour que
      l'en-tête n'ait plus à lire `/api/ranks` ; garder `#gear/<id>` dans
      l'adresse après un choix (recharger reviendrait sur le perso) — ça
      passe par `lib.js`, qui réécrit le hash à chaque bascule.

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
