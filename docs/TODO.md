# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code (7 passes par zone, chaque finding vérifié, sévérités contre-vérifiées),
> **nettoyé le 18/07** (le « fait » de la journée migré dans DONE.md).
> État de référence : **18/07**, **351 tests verts**, typecheck et lint OK,
> v0.1.23.
> Re-vérifier chaque item contre le code au moment de le traiter.

---

## 🎯 PRIO (décision Sevih)

> Le gros chantier admin (matrice Extractor/Editor) a été mené le 18/07 —
> comparaisons V2 retirées, `data/legacy` déposé, intégration par entité
> (perso/équipement/item), extracteur d'items, factorisations
> switches/pickers/sidebars, câblage buff/debuff perso. Détail dans DONE.md.
> Ne restent ci-dessous que les reliquats.

- [ ] **Éditeurs admin manquants** — reliquat du chantier matrice ci-dessus :
      éditeur **gear**, et des éditeurs pour mettre à jour les **guides**.
- [ ] **Regen coupons/banner V2 = EXCEPTION assumée** — la source V2 reste la
      référence jusqu'à la bascule prod V2→V3 (liée à la page `/coupons`). Rien
      à faire d'ici là.

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. Chaque page arrive avec ses clés de locale
> DÉJÀ pré-seedées ×5 (cf. item « pré-seed » de la section Docs).

- [ ] **`/tierlist`** — clés `tierlist.*` ; consommera les helpers seo.ts
      gardés (`getMonthYear` → `serverNow`, `buildVideoObjectJsonLd`,
      `buildFaqJsonLd`).
- [ ] **`/tools`** (landing par catégories rankings/equipment/simulators/
      info/media) + les **18 outils V2** : most-used-units, tierlistpve,
      tierlistpvp, ee-priority-base, ee-priority-plus10,
      gear-usage-statistics, gear-usage-finder, damage-calculator,
      pull-simulator, progress-tracker, team-planner, tier-list-maker,
      patch-history, coupon-codes, event, wallpapers, 4-comics, ost —
      namespaces `tools.*`/`progress.*`. Le footer met les 6 premiers en
      avant (`/tools#slug`).
- [ ] **`/coupons`** — clés `coupons.*` ; lié à l'EXCEPTION PRIO (le regen
      coupons V2 reste la source jusqu'à la bascule prod).
- [ ] **`/contributors`** — dépend du portage `contributors.json` (item 📦).
- [ ] **`/changelog`** — clés `changelog.*` ; lié au resync CHANGELOG.md
      (item 📚).
- [ ] **`/legal`** — mentions légales (lien de la barre basse du footer).
- [ ] **`/feed`** — flux RSS (route handler ; lié par le footer).
- [ ] **Recherche globale** (SearchModal + trigger + Ctrl+K du header V2) —
      clés `search.*` ; lira `NAV_ITEMS`/`EXTRA_PAGES` de `src/lib/nav.ts` ;
      l'emplacement dans HeaderClient est réservé (commentaire).
- [ ] **Home riche** — sections bannières actives / codes promo / guides
      débutants (clés `home.*`, structure V2).

## 🐛 Bugs — sévérité haute (audit 17/07, tous vérifiés)

- _(vide — le seul item, validation des cibles `{L}`, traité le 18/07 → DONE)_

## 🐛 Bugs — sévérité moyenne

### Caches périmés (process admin long-running)

- [ ] Caches module qui contournent le régime mtime/TTL pourtant établi
      partout ailleurs. RESTE (datagen → worker) : `datagen/extractor/v2-control.ts:408-424`
      (`curatedKeySides`), `datagen/assets/manifest.ts:54-63` (`faceIconIndex`),
      `datagen/generators/equipment.ts:444` (`groupKidsCache` — contraste avec
      `curatedKeyCache` l.522 du même fichier), `datagen/generators/goods.ts:40` + `recruit.ts:155`. Stamper chacun (modèle `fileStamp`/`tablesStamp`) ou
      documenter la limite.
      (SRC FAIT : `gear-reco.ts` `famByMember` + `rewards.ts` `gearIndex` stampés
      sur le mtime du curé équipement, `skill-view` `curatedKeyCache` mutualisé →
      DONE ; `monster-store.ts` traité le 18/07 — cf. DONE.)

### UI publique

- [ ] `src/components/character/ResponsiveCharacterCard.tsx:8-11` : SSR rend
      toujours `sm` (useMediaQuery false côté serveur) → layout shift sm→lg à
      l'hydratation sur `/characters` (page la plus visitée), images `priority`
      peintes en 66px d'abord, et 2 abonnements matchMedia × ~200 cartes.
      Passer en CSS responsive (variantes masquées) ou remonter le breakpoint.
      En passant : `src/hooks/useMediaQuery.ts:8-12` — mémoïser `subscribe`
      (`useCallback`), sinon désabo/réabo à chaque rendu.

### Datagen — divers

- [ ] `datagen/extractor/specs/character.ts:492` : `ShowMainPage === 'true'`
      en casse exacte (le dump mélange `'True'`/`'true'` selon les colonnes) —
      une normalisation côté jeu viderait le roster en silence. Généraliser
      `bool()` de `lib/tables` à tous les booléens de table (3 idiomes
      coexistent : `bool()`, `boolCol()`, comparaisons exactes).

## 🧪 Tests à écrire

- [ ] **`src/lib/skill-view.ts` en priorité 1** (741 lignes, zéro test) : le
      module aux règles les plus fines du repo (réattribution caller/curation,
      fusion enrage, variantes techniques, immunités), chaque règle justifiée
      par un cas réel en commentaire (Prototype EX-78, Irregular Queen,
      rage_finish orphelins) mais aucune verrouillée.
- [ ] Ensuite : `stats.ts` (STAT_ABBR/statOptionView), `guide-sections.ts`,
      `tower-restrictions.ts`, `game-tokens.ts` (frontières latin/CJK),
      `seo.ts` (`buildUrl` dev/prod/sous-domaines, hreflang), `i18n/index.ts`
      (`makeT`/plurals).
- [ ] Les générateurs `datagen/generators/*` + `build.ts`/`refresh.ts`
      (gros chantier — prioriser encounters/singularity/content-schedule).
      CONTRAINTE actée : la suite tourne SANS `.gamedata` (CI) → extraire les
      cœurs PURS et tester en synthétique (cf. `resolveKeyWinners`), ou ancrer
      des invariants sur `data/generated/` committé (cf. `towers.test.ts`).
- [ ] `src/lib/admin/gamedata-store.ts` (dev-only, priorité moindre).

## 🧹 Dette code

### Code mort (vérifié par grep repo entier, audit 17/07)

- [x] Exports src sans consommateur (18/07 → DONE). RETIRÉS : `elementName`/
      `className` (game-tokens), `tagDesc` (tags), `SuffixLang`/`getLangConfig`/
      `GameLang`/`GAME_LANGS`/`isGameLang` (i18n/config — copie site
      self-référentielle, la vraie vit en datagen), repli inopérant de
      `guide-sections.ts:69-72` (`resolveEffectKey` teste déjà les 2 côtés).
      DÉ-EXPORTÉS : `resolveRewardEntry`, `EffectTooltipBody`, `ELEMENT_HEX`
      (usage interne). `gearIssueCounts` déjà absent. GARDÉS volontairement :
      `getMonthYear`/`buildVideoObjectJsonLd`/`buildFaqJsonLd` (seo.ts —
      /tierlist et /tools à venir ; `getMonthYear`→`serverNow` au portage).
- [ ] Datagen : `hasFaceIconLayout` (face-icon.ts:38), `r2Push` (lib/r2.ts:89 —
      doublonne assets-push.mjs en plus), `getMaxLevel`/`resolvePlaceholders`
      (buff.ts, testés mais jamais appelés en prod), export `isPermilleRow`,
      `validateTagDef` (curated/tags.ts:57 — son commentaire prétend qu'il est
      branché, c'est faux : le brancher ou le supprimer).
- [ ] Props/branches mortes : `CharacterCard` (showName/showIcons/showElement/
      showClass/showStars/showBadge/children jamais passés ; branche `120` de
      maxWidth l.265 inatteignable), `title` de MonadRouteClient/MonadGateMap,
      `defaultIndex` de SegmentedTabs/BossEncounters, champs `textSoft`/`dot`/
      `stripe`/`border` de `guide-accents.ts` (44 chaînes Tailwind mortes).
- [ ] `.env.example:4-13` : `DB_*`/`BOT_API_URL` lus par aucun code — retirer
      ou annoter « V2, pas encore porté ».

### Duplication (les 2 gros d'abord)

- [ ] **Helpers adb** dupliqués entre `datagen/extract/dump.ts` et
      `pull-gamedata.ts` (ADB, PKG, capture, stream, pickDevice, bloc root) —
      extraire `extract/adb.ts`.
- [ ] Logique « URL source de vérité » copiée entre ui/Tabs:35-54 et
      BannerTabs:23-41 → hook `useUrlTab` (fusionner avec la migration
      BannerTabs → hash, cf. règle actée ci-dessous).
- [ ] `rankOptionLabels` homonymes divergents (data/monsters.ts:97 vs
      admin/monster-store.ts:154) ; `BOSS_TYPES` homonymes DIVERGENTS
      (monster-icon.ts:32 vs towers.ts:92 — sets volontairement différents :
      renommer plutôt que mutualiser). [ces deux-là touchent l'admin → worker]
      (`resolveEffectKey` index mutualisé + `GRADE_RANK`/`PIECE_ORDER` centralisés + `gearById`→`gearFamilyById` faits le 18/07 → DONE.)
- [ ] Datagen : helper « monstres spawnés d'un donjon » ×3 (singularity,
      content-schedule, sources), expansion BuffGroup Child1..10 ×3 (dont 2 dans
      equipment.ts vs lib/buff), résolution RewardTemplet ×2 (encounters vs
      monad, `span()` copié-collé), walk récursif ×4, `nameKey`/`isPresent`/
      `sc`/regex VA dupliqués, `norm()` divergents des deux import-*.

### Chantiers actés (16/07, inchangés)

- [ ] **Tokeniser les couleurs vives des vues guides** (décision Sevih
      2026-07-16 — la moitié eslint est faite, reste la PASSE DE FOND).
      Inventaire : ~40 classes distinctes — top : `text-sky-400` ×16,
      `text-amber-400` ×14, `bg-blue-600` ×8, famille yellow-400 (~20),
      green/emerald (~15), red (~10, dont SVG TowerCombatRoster et
      MonadGateMap). Palettes `.ts` : `guide-accents.ts`, `nodeStyles.ts`,
      `ELEMENT_RING`. MÉTHODE actée : tokens sémantiques PAR RÔLE aux valeurs
      EXACTES actuelles, puis étendre RAW_COLOR pour verrouiller.
      (S'y rattache : `TurnOrder.tsx:61` amber vs tokens neutres de
      BuildRequirements pour la même donnée SPD.)
- [ ] (chantier guides éditoriaux) `BannerTabs` (?banner=) et le `?tab=` de
      free-heroes-start-banner → SegmentedTabs/#hash quand ces guides
      atterrissent. **Règle actée : état interne d'un guide = hash
      (SegmentedTabs) ; ui/Tabs (?param) = hors guides.**

## ⚙️ Config / infra

- [ ] **Trous de typecheck** : `next.config.ts` et `vitest.config.ts` couverts
      par aucun des 3 tsc (include racine = src only) ; `assets-push.mjs` et
      `r2-cors.mjs` (maillon R2 du commit) jamais typecheckés — les convertir
      en `.ts` ou activer allowJs+checkJs.
- [ ] CSP (`next.config.ts`) : `unsafe-eval` RETIRÉ de script-src en prod le
      18/07 (gardé en dev pour le HMR — cf. DONE). RESTE : viser nonce +
      strict-dynamic pour retirer aussi `unsafe-inline` (script ET style).
- [ ] Datagen, hygiène CLI : garde `isMain` manquante sur extract.ts,
      templates/convert.ts, coherence.ts, extractor/run.ts, import-gear-reco ;
      `main()` sans `.catch` dans assets/collect.ts ; parsing des flags
      (`version-boss.ts` `--ref --label x`, `promote.ts` `--only` qui absorbe
      après un flag) ; parse `.env.local` maison de lib/r2.ts (quotes non
      gérées) ; message explicite si dossier adb distant absent
      (pull-gamedata.ts:67).

## 📚 Docs à resynchroniser

- [ ] **CHANGELOG.md** : le retard a grossi — 216 commits au 17/07 (~174 au
      16/07, « ~130 » écrit). Resync ou assouplir la règle PR qui l'exige.
- [ ] **`data/editorial/` non documenté nulle part** → CONVENTIONS.md
      « Données » + tableau des zones de datagen/README.
- [ ] **Locales : documenter le pré-seed** — ~818 des 1098 clés (tools._,
      progress._, coupons._, tierlist._, home._, changelog._, search._…)
      n'ont aucun consommateur : ce sont les pages V2 pas encore portées,
      en 5 langues (~75 % du poids des fichiers) — chacune est maintenant
      TRACÉE dans « Pages manquantes » (le layout du 17/07 consomme déjà
      footer._ et nav._). Soit l'assumer en tête de fichier, soit parquer
      les namespaces non portés dans un fichier d'attente pour que « clé
      inutilisée » redevienne un signal. (Cohérence structurelle
      inter-langues : parfaite — clés identiques ×5, zéro manquante.)
- [ ] Doc ↔ code : en-tête de `geas.ts:14` (dit l'inverse du code sur
      `positive`), commentaires périmés de `face-icon.ts:5-7,37` (« à
      re-porter » — c'est automatisé depuis le 14/07), doc de `slugTeam`
      (skills.ts:113 — dit « undefined si CSV », le code prend le 1er token),
      exception `stageLabel` non documentée (unlock-content.ts:112 contredit
      son propre en-tête « jamais parser l'ID »).

## 📦 Données V2 restant à porter (ex todo-data-v2)

Règle permanente : chaque `meta.bossId` d'un guide porté doit exister dans
`monsters.json` (le rendu JETTE sinon) — extraction à la demande
(`pnpm datagen:extract-entity`).

- [ ] **`bgm-mapping`** ← `LobbyCustomResourceTemplet` + TextSystem (fichier /
      nom localisé / durée).
- [ ] **`name-aliases.json`** (curé) — alias de recherche par perso.
- [ ] **`contributors.json`** (curé) — contributeurs du site.
- [ ] Patch-notes : quand la PAGE sera portée, préfixer `NEXT_PUBLIC_IMG_BASE`
      sur les `src` relatifs stockés (`/images/patch-notes/…webp`).
- [ ] (Contenu, pas data) Les 3 Promotion Challenge « boostés » (Supreme 4-6,
      donjons 70600106/107/108) n'ont aucun guide — la V2 n'en avait pas non
      plus.

## 🤔 Décisions en attente (Sevih)

- [ ] Icône `bosses.ts` (`MT_` baké) vs spec monstre (id brut) — unifier impose
      une régénération de `bosses.json` + revue des consommateurs.
- [ ] `CHASE_TITLE_KEY` (sources.ts:37) reste en dur : le résolveur donnerait
      `SYS_IRR_CHASE_NAME_01` ≠ choix éditorial `SYS_IRREGULAR_EXTERMINATION`
      → assumer en curation mode-titles, ou garder tel quel.
- [ ] Convention `_doc` des curés non uniforme (`note` vs `_notes` vs `_doc` vs
      rien) — vérifier d'abord que chaque lecteur tolère la clé.
- [ ] `TODO(guides)` de `version-monster.ts:16` : « Versionner » doit
      RÉ-ÉPINGLER les guides `<id>` → `<id>@<n>` — le domaine guides existe,
      c'est actionnable.
- [ ] (audit 17/07) `ModeColumns.tsx:39-49` : le contenu serveur de toutes les
      colonnes est rendu 2× dans le DOM (bloc mobile + bloc desktop) — payload
      doublé sur des colonnes lourdes. Accepter et documenter, ou refondre en
      une instance + bascule CSS.
- [ ] (audit 17/07) `item-catalog.ts:23` importe
      `src/lib/data/item-blacklist` — dépendance datagen → src à rebours de la
      doctrine des contrats. Déplacer la source unique côté datagen/curated ?
- [ ] (audit 17/07) `lib/buff.ts:150` : `[+Turn]` rend « 2 » sans le signe `+`
      (asymétrie avec `[+Value*]`/`[-Turn]`) — vérifier le comportement V2
      avant de trancher.

---

## 📌 Notes de référence (à ne pas perdre)

- **Jointure guide↔saison** : par le monstre réellement combattu
  (`meta.bossId` ↔ `season.monsters`), JAMAIS par la colonne `boss` (id
  canonique d'affichage). Gravée dans `content-schedule.test.ts`.
- `battleEnd` ≠ `end` : un boss peut être « en saison » sans être combattable.
- Le statut « en cours » se calcule CÔTÉ CLIENT (`SeasonBadge`) — pages ISR 24 h.
- Tours : `waves` = formations successives ; `encounters` = pools alternatifs
  (very hard) — ne jamais confondre.
- Sécurité vérifiée saine à l'audit 17/07 (ne pas re-auditer sans raison) :
  routes admin doublement gardées (`.dev.*` hors build prod + `IS_DEV`),
  `/api/revalidate` en Bearer temps constant sans dégradation, anti-path-
  traversal correct sur `images/[...path]`, `.env.local` ignoré et non tracké,
  aucun secret committé/loggé, `.dockerignore` exclut `.env*`.
