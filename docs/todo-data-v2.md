# TODO — données V2 à porter en V3

Suivi des données V2 (`../outerpedia-v2/data`) pas encore en V3. Basé sur l'audit
de la pipeline V2 (`pipeline/run.ts`, 30 steps) + les JSON data à la main.

---

## ⛔ EN ATTENTE — régénération + promotion de `glossaries.json`

Le build est ROUGE tant que ce fichier n'est pas régénéré et promu. Il apportera
**trois** choses, toutes déjà écrites côté générateur :

- [ ] **clés `_IR`** (variantes INDISSIPABLES des statuts) — dérivées
      génériquement (43 paires normal→indissipable, 173 clés). Sans elles, le
      tag `{D/BT_STAT|ST_CRITICAL_RATE_IR}` du guide `vi-e-11-a` ne résout pas et
      casse le build SSG. Le dialecte `_IR` est LÉGITIME (la V2 l'utilise 175
      fois) : ne rien remapper dans les contenus.
- [ ] **`rankOptions`** — passifs de palier résolus. Sans eux, `BossStats`
      n'affiche simplement aucun passif (dégradation muette assumée : mieux vaut
      ne rien dire qu'inventer).
- [ ] **`bossQuirkMods`** — réductions EFF/RES des quirks de compte.

## 👾 Monstres à extraire (à la demande — `pnpm datagen:extract-entity`)

`data/generated/monsters.json` ne contient que les monstres réellement portés
(3 aujourd'hui). Ce qui bloque une vue de guide :

- [x] **Boss de Dimensional Singularity** — 13 ids : `60000001` à `60000015`,
      SAUF `60000004` et `60000007` (absents de la rotation). Extraits ; les 13
      vignettes `MT_*` sont collectées sous le namespace boss EXISTANT (aucun
      doublon — 4 étaient déjà tirées par les sources d'équipement).
- [ ] **Boss des guides à porter** — au fil du portage, chaque `meta.bossId`
      doit exister dans `monsters.json` (le rendu JETTE sinon).

## À générer — extraction du jeu (datagen déclaratif)

- [ ] **`area_name`** ← `AreaTemplet` (167 zones). `NameID` (`SYS_AREA_NAME_*`) +
      `ShortName` via TextSystem. Bloque la catégorie de guides `adventure`.
- [ ] **`geas`** ← `GuildRaidGeisTemplet` (107). NameID/DescID/icon/value/grade.
- [x] **`unlock-content`** ← `datagen/generators/unlock-content.ts` →
      `data/generated/unlock-content.json`.
- [x] **`singularity-rotation`** ← `datagen/generators/singularity.ts` →
      `data/generated/singularity.json` (groupes + cadence depuis
      `SingularityTemplet`/`SingularityDungeonGroupTemplet`, boss = entités
      `600000xx` via la chaîne spawn). L'ancre calendaire — irréductible, non
      dérivable des tables — vit dans `data/curated/singularity.json`
      (constatée en jeu ; le calcul « groupe actif » = app → `src/lib/data/singularity.ts`).
- [x] **`towers`** ← `datagen/generators/towers.ts` → `data/generated/towers.json` :
      compositions par étage (niveaux réels, puissance/niveau reco) des 8 tours
      (normale 100 / hard 40 / very hard 20 / 5 élémentaires 100), jours
      d'ouverture + debuff des élémentaires (`TowerElementalConfigTemplet`).
      Deux régimes par étage : `waves` (formations SUCCESSIVES) vs `encounters`
      (formations ALTERNATIVES tirées au hasard — very hard uniquement),
      discriminés par la forme des groupes de spawn (1 ligne/groupe vs un seul
      groupe multi-lignes).
- [x] **`content-schedule`** ← `datagen/generators/content-schedule.ts` →
      `data/generated/content-schedule.json` : fenêtres de dates FACTUELLES des
      world boss / guild raid / joint challenge (tables `WorldBossTemplet`,
      `GuildRaidTemplet`, `EventBossDungeonTemplet`), donjons + monstres réels
      via la chaîne spawn, persos bonus JC. « Actif maintenant » = calcul app ;
      seules les saisons livrées avec le patch courant existent. Phases FIGÉES
      par recoupement avec les patch notes officielles (Sevih 2026-07-11) :
      combat (`start → battleEnd`) puis décompte/règlement puis récompenses —
      ne JAMAIS réduire « jouable » à `start ≤ now < end`. Dates en ISO UTC
      (bornes 00:00 UTC confirmées ; le début réel = fin de maintenance).
      Reste inconnu : `phaseEnd` du guild raid (start+2 j, absent des notes).
- [ ] **`bgm-mapping`** ← `LobbyCustomResourceTemplet` + TextSystem — métadonnées
      des BGM (fichier / nom localisé / durée). (V2 step `bgm-extract`, ~90)
- [ ] **`cf-skill-names`** ← renommage skills Core Fusion (old→new, localisé).
      À VÉRIFIER : probablement déjà couvert par l'extraction directe des skills
      des variants CF (chaque CF = id perso à part). (V2 step `cf-skill-names`)
- [x] **`game-version`** ← `resVersion` (256 derniers octets de `manifest.dat`).
      Générateur `datagen/generators/game-version.ts`, baked dans le build →
      `data/generated/game-version.json`. Reader `src/lib/data/game-version.ts`.
- [ ] **`special-request`** ← butin par boss du mode Special Request. En V2 le
      composant `SpecialRequestList` hardcode DEUX ordres d'éléments différents
      et des codes de set bruts (« 15 », « 22 » → alt d'image illisible) ; le
      `special_request.json` V2 a un champ `slug` mort et faux (`calamari` au
      lieu de `grand-calamari`) → tout regénérer depuis les tables (table
      source à identifier ; ne PAS copier le layout V2).
- [ ] **`irregular-extermination`** ← `IrregularChaseTemplet` (12 lignes :
      DungeonID/BossID/BossHP/tickets…). Le BUTIN est dérivable de l'équipement
      (chaque pièce porte déjà son boss — ne jamais recopier des noms EN à la
      main comme la table `LOOT` de V2, lookups par nom qui rendent null en
      silence). Les COORDONNÉES DES PINS de la carte n'ont jamais été une
      donnée : à créer en curé (`data/curated/`), pas en dur dans un composant.

## 🧭 Vues de catégorie de guides — état

Une catégorie sans vue dédiée retombe sur `DefaultGrid` (grille de cartes) :
une catégorie n'est JAMAIS vide « par oubli d'enregistrement » comme en V2.
Dispatch unique : `src/components/guides/category-views/index.tsx`.

Vues faites :

- [x] **`general-guides`** → `TieredList` (parcours en paliers). Le palier est un
      champ de meta (`tier`) EXIGÉ au scan — la V2 tenait une map `TIER_BY_SLUG`
      dans le composant et un guide absent de la map disparaissait EN SILENCE.
- [x] **`guild-raid` · `world-boss` · `joint-challenge`** → `BannerGrid`. UNE vue
      pour les trois : en V2 c'étaient trois fichiers strictement identiques.
- [x] **`other`** → `DefaultGrid` (rien de spécifique à faire).
- [x] **`dimensional-singularity`** → `SingularityRotation` : le boss du JOUR,
      puis la bibliothèque des boss. Rotation calculée par une fonction PURE
      (`src/lib/data/singularity.ts`, `now` injecté) depuis `singularity.json` +
      l'ancre curée. Deux CORRECTIONS contre la V2, pas des reprises : **un boss
      par jour** (mer→sam, colonne `order`) et non « trois du mer au ven + un le
      samedi » — la V2 figeait la semaine en dur (`slice(0,3)`, `dayInfo[3]`)
      alors que ses propres textes disaient l'inverse (« the target boss changes
      daily ») ; et la section **ne disparaît plus du dimanche au mardi** (en
      phase de récompense elle bascule sur la rotation à venir). Les clés i18n
      `weekend.*`, `day.weekly`, `day.sat_only` encodaient le faux modèle →
      supprimées des 5 locales.
      À SAVOIR : le 4e boss de chaque semaine est toujours une des trois Nornes,
      en variante **lumière ou ténèbres** — même nom et même sprite, mais élément
      et donjon distincts (`60000010` Urd lumière vs `60000013` Urd ténèbres). Ce
      ne sont donc PAS des doublons ; la bibliothèque les garde séparés.
      Les **13 guides** de la catégorie sont portés, et le bloc « comment marche
      ce mode » est devenu une DONNÉE de catégorie (`GUIDE_CATEGORIES[…].info`,
      rendu par `<ModeInfo>`) : tout mode qui veut le sien remplit un champ. En
      V2, c'était une fonction non exportée enterrée dans le fichier de liste du
      seul mode qui en avait un.

Vues encore à faire — ce qui manque pour chacune :

- [ ] **`skyward-tower`** — 0 guide porté (8 en V2). `towers.json` est là mais
      les monstres des étages ne le sont pas. La vue V2 ne fait que grouper les
      guides (Difficulté / Élémentaires) → il faudra 2 champs de meta
      (`tower`, `element`), à trancher en portant les guides. La V2 déduisait
      l'élément par regex sur le slug (`fire-tower`).
- [ ] **`monad-gate`** — 0 guide porté (31 en V2). Meta à définir : `depth`,
      `route`, variante. La V2 les décodait par regex sur le slug
      (`depth3-route2`) et affichait « Depth N » et « Variant A/B » NON TRADUITS
      alors que la clé i18n existe.
- [ ] **`adventure-license`** — 0 guide porté (26 en V2). Meta à définir :
      `promotion` (booléen). La V2 le déduisait de `slug.startsWith('promote-')`,
      INVENTAIT le nom de l'asset déverrouillé par `icon.replace(/_Lock$/,'_Open')`
      (404 silencieux) et triait toujours sur le titre anglais.
- [ ] **`adventure`** — bloqué par `area_name`. Meta à définir : `season`,
      `episode`, `stage` — la V2 les décodait par regex sur le slug (`S2-13-40`).
      Son drapeau `spoilerFree` est INVERSÉ et elle rend les noms « surname name »
      (ordre faux en JP/KR/ZH).
- [ ] **`special-request`** — bloqué par `special-request` (cf. plus haut). La V2
      déduisait **l'élément du boss du nom de fichier de son icône**
      (`icon.split('_').pop()`).
- [ ] **`irregular-extermination`** — bloqué par `irregular-extermination` +
      les coordonnées des pins (cf. plus haut).

**Jointure guide ↔ saison (`content-schedule.json`) — RÉSOLUE, aucun mapping
manuel.** Un guide se relie à ses saisons par le **monstre réellement combattu**
(`meta.bossId` ↔ `season.monsters`), jamais par la colonne `boss` de la saison,
qui est un id **canonique d'affichage** : la saison 27 porte `boss: 4034005`
mais fait combattre `4134045/55/65` — pas même la famille d'ids. Chaque
difficulté spawn sa variante (`4548161` normal / `4548171` hard / `4548181` very
hard). Implémenté dans `src/lib/data/content-schedule.ts` (les 3 modes
normalisés) ; la règle est gravée dans `content-schedule.test.ts`, y compris le
garde-fou « l'id canonique ne joint rien ».

⚠️ `battleEnd` ≠ `end` : un boss peut être « en saison » sans être combattable.
Le joint challenge ne découpe pas ses phases (`end` clôt les deux) ; le guild
raid n'a pas de `end` (c'est `rankingEnd`).

⚠️ Le statut « en cours » est calculé **côté client** (`SeasonBadge`), pas au
build : les pages sont statiques en ISR 24 h, un « en cours » figé au build
mentirait jusqu'à une journée entière.

Un champ de meta explicite avait été envisagé, puis ÉCARTÉ : c'aurait été un
mapping guide→saison tenu à la main, soit précisément ce qu'on fuit. La donnée
suffit — il manquait juste les monstres spawnés du joint challenge, désormais
résolus par la chaîne spawn comme pour le WB et le GR.

## À générer — script (news)

- [x] **`patch-notes`** — `pnpm getNews` (`scripts/get-news.ts`, dep `cheerio`) :
      scrape le WP OuterPlane → `data/patch-notes/posts.json` + `buff-events.json`.
      Images converties **WebP** + stockées **content-addressed** (hash des
      OCTETS webp → 2 URLs = même visuel dédupliqué) dans
      `.assets-staging/images/patch-notes/` → poussées sur **R2** par `pnpm images`.
      Incrémental (`modified_after` par langue). `--limit=N` / `--force-since=`.
  - ⚠️ Reste à faire quand la PAGE patch-notes sera portée : le `src` stocké est
    relatif (`/images/patch-notes/…webp`). En prod (images sur R2), le composant
    de rendu devra préfixer `NEXT_PUBLIC_IMG_BASE` sur ces chemins (comme `img.*`).

## À faire à la main (curé / éditorial, non extractible)

- [ ] **`name-aliases.json`** — alias de recherche par perso (EN/JP/KR/ZH).
- [ ] **`tags.json`** — glossaire libellés + desc des tags (la classif par perso
      est déjà en `data/curated/characters.json` → `tags`).
- [ ] **Premium** — `premium_limited_data.json` (reviews) **+**
      `premium-priorities.json` (ordre de pull `PREMIUM_ORDER_*`). De paire.
- [ ] **Core Fusion** — `core_fusion_data.json` (reviews CF) **+**
      `core-fusion-priorities.json` (ordre de pull CF). De paire.
- [ ] **`contributors.json`** — contributeurs du site.

---

## ✅ Déjà auto en V3 (couvert par le datagen)

extraction assets · face-icons · characters(-index/-stats) · skins→**costumes** ·
effects(-index/-group-map) · item-names · item-stats-detail ·
**singularity-ascension** (`equipment/enhance.json`) · ascension-view · damage-calc
(à confirmer) · items unifiés · equipment complet · transcend · progression.

## ✅ Résolu — rien à porter

- **`partners.json`** = synergie → déjà couvert (Tools › Synergy).
- **`name-splits.json`** = préfixes/titres = champ `nickname` du jeu (extrait,
  localisé) + `glossaries.fusionTitle` pour « Core Fusion ». Aucune maintenance.

## ⛔ Exclu — contenu PvE monstre / mode

boss-index · guide-boss-map · most-used-units (tower reco) · boss/.
(`tower-data`, `guild-raid` et `monad` sont finalement couverts par
`towers.json`, `content-schedule.json` et `singularity.json` — cf. plus haut,
générés SANS reprendre la méthode V2.)

## 📝 Éditorial / assets / analytics (pas de la « data » extraction)

comics · wallpapers · event-registry · video-meta (script meta YouTube, dev) ·
gear-usage-stats · gear-finder-index · changelog · guides · tools (tier-lists).
validate-reco = étape de validation, pas une donnée.
