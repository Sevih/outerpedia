# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code (7 passes par zone, chaque finding vérifié, sévérités contre-vérifiées).
> État de référence : commit `7d30203`, **319/319 tests verts**, typecheck et
> lint OK, v0.1.21.
> Re-vérifier chaque item contre le code au moment de le traiter.

---

## 🎯 PRIO (décision Sevih)

- [ ] **Retirer les comparaisons V2 des extracteurs** — l'oracle a joué son rôle.
      Périmètre : `datagen/extractor/v2-control.ts` + contrôle de cohérence,
      `equipmentV2Control`/`EquipmentReport` (Extractor gear), l'Extractor Effect
      (pur contrôle de régression V2), les statuts « diff » de la sidebar,
      `core/diff`, les lectures `../outerpedia-v2`. **EXCEPTION : le regen
      coupons/banner se GARDE jusqu'à la bascule prod V2→V3.**
      ⚠️ CONSTAT AUDIT 17/07 (précisé par Sevih) : le chemin `../outerpedia-v2`
      en dur est **dépendant de la machine** — valable sur le PC fixe, mais sur
      le portable le repo V2 s'appelle `../outerpedia` → ENOENT sur
      regenCoupons/BannersFromV2 (`src/lib/admin/promo-banner-store.ts:30-31`).
      Correction : UNE variable d'env pour la racine du repo V2 (ex. `V2_DIR`,
      défaut `../outerpedia-v2`), consommée par promo-banner-store ET par
      `datagen/assets/stage.ts:36` / `manifest.ts:655` (qui ont déjà
      `V2_IMAGES_DIR`, défini deux fois — le dériver de `V2_DIR`) ; l'ajouter
      commentée dans `.env.example`. Une fois la dépose faite : `data/legacy/`
      (248 fichiers) devient supprimable.
- [ ] **Retravailler le rôle des Extractors/Editors du panneau admin** (corollaire
      du point précédent — demande Sevih 2026-07-16) : certaines pages Extractor
      n'existent que pour la comparaison V2. Quand la comp V2 saute, redéfinir la
      matrice fonction × entité AVANT de retirer les contrôles, pour ne pas
      laisser des pages mortes. À intégrer à ce chantier (audit 17/07) :
      `CharactersSidebar` vs `ExtractorSidebar` sont quasi identiques (fusionner
      sur ExtractorSidebar, 9 usages), `CharacterSwitch`/`MonsterSwitch`
      identiques au chemin près, `CharacterPicker`/`ItemPicker` à factoriser.

## 🐛 Bugs — sévérité haute (audit 17/07, tous vérifiés)

- [ ] **Liens 404 publics** : `beginner-faq` pointe 3× vers
      `/guides/general-guides/premium-limited` qui n'existe pas (index.tsx:107 +
      content.ts:88-92 et 110-114) → 404 dans les 5 langues. Le garde-fou build
      ne couvre que `RelatedGuides` : `parse-text.tsx:440-441` valide `ok: true`
      inconditionnellement pour les tags `{L}`. Deux actions : neutraliser ces
      liens en attendant le portage du guide premium, ET faire valider les
      cibles internes `/guides/...` des tags `{L}` dans `checkTag`.

## 🐛 Bugs — sévérité moyenne

### Pipeline & scripts

- [ ] `scripts/commit.ts:143-145` : bump de version écrit AVANT message/stamp/
      images/commit — tout abandon laisse package.json bumpé non committé, une
      relance re-bumpe (versions sautées). Différer l'écriture juste avant
      `git add -A` (le commentaire l.151 « abandon = rien de publié » est faux).
- [ ] `scripts/init.ps1:191` : `& $adb devices 2>$null` sous PS 5.1 avec
      `$ErrorActionPreference='Stop'` — le stderr bénin d'adb (« daemon
      starting ») devient une exception → émulateur détecté absent à tort,
      pipeline data sauté. Passer par `cmd /c` ou EAP local `Continue`.
- [ ] `datagen/extract/dump.ts:147-152` : si `IL2CPP_SO` custom existe mais que
      `global-metadata.dat` manque, l'extraction **écrase le `.so` fourni** par
      celui de l'émulateur. Ne rediriger vers `SO` que si `IL2CPP_SO` absent.

### Erreurs avalées sur les curés (JSON cassé = données vides silencieuses)

- [ ] Même classe de bug à 4 endroits : `datagen/curated/equipment.ts:91-102`,
      `datagen/curated/effects.ts:91-93`, `datagen/lib/effects.ts:179-181`
      (overrides familles), `datagen/generators/item-catalog.ts:63-72`.
      Un `data/curated/*.json` syntaxiquement cassé → build « réussi » sans
      curation, et `pnpm dev` auto-applique le promote. Distinguer ENOENT
      (OK, vide) d'une erreur de parse (throw/warn bruyant). À l'inverse,
      `generators/encounters.ts:614` et `singularity.ts:103` parsent sans
      catch ni message contextualisé — wrapper de parse commun nommant le
      fichier fautif.

### Caches périmés (process admin long-running)

- [ ] Caches module qui contournent le régime mtime/TTL pourtant établi
      partout ailleurs : `datagen/extractor/v2-control.ts:408-424`
      (`curatedKeySides`), `datagen/assets/manifest.ts:54-63` (`faceIconIndex`),
      `datagen/generators/equipment.ts:444` (`groupKidsCache` — contraste avec
      `curatedKeyCache` l.522 du même fichier), `datagen/generators/goods.ts:40` + `recruit.ts:155`, `src/lib/data/gear-reco.ts:142-157` (`famByMember`,
      contredit l'en-tête du fichier), `src/lib/data/rewards.ts:83`,
      `src/lib/admin/monster-store.ts:60,176`. Stamper chacun (modèle
      `fileStamp`/`tablesStamp`) ou documenter la limite.
- [ ] `datagen/templates/convert.ts` : rien ne purge `.gamedata/parsed/` — une
      table retirée du jeu reste servie à vie par `loadTable` (tables
      fantômes). Supprimer en début de convert les .json sans .bytes.
- [ ] `datagen/generators/encounters.ts:667` + `extractor/specs/monster.ts:315` :
      la spec monstre aliasse `enc.spawns` du cache mémoïsé partagé — une
      mutation d'entité corromprait le cache pour tous les consommateurs.
      Copier à l'embarquement.

### UI publique

- [ ] `src/components/character/ResponsiveCharacterCard.tsx:8-11` : SSR rend
      toujours `sm` (useMediaQuery false côté serveur) → layout shift sm→lg à
      l'hydratation sur `/characters` (page la plus visitée), images `priority`
      peintes en 66px d'abord, et 2 abonnements matchMedia × ~200 cartes.
      Passer en CSS responsive (variantes masquées) ou remonter le breakpoint.
      En passant : `src/hooks/useMediaQuery.ts:8-12` — mémoïser `subscribe`
      (`useCallback`), sinon désabo/réabo à chaque rendu.
- [ ] `src/components/layout/LanguageSwitcher.tsx:16-19` : le changement de
      langue perd query string ET hash — or l'état des guides vit dans le hash
      (`#version=`, `#phase=`, `#team=`). Concaténer search + hash.
- [ ] `src/components/guides/BuildRequirements.tsx:214-219` : comparateur SPD
      non transitif (renvoie 0 dès qu'une entrée n'a pas de SPD) → ordre
      indéfini, casse la promesse « ordre DOM = ordre de jeu ». Partitionner
      puis trier.
- [ ] `src/components/character/EffectChips.tsx:269` : clé de dédup
      `category === 'debuff'` vs affichage `category !== 'buff'` (or `neutral`
      ×715 et `cc` ×389 existent en données) — deux chips de natures opposées
      peuvent se dédoublonner. Helper unique `isDebuffOf` aux 3 endroits
      (aussi `skill-view.ts:58`).

### Admin (dev-only mais irritant)

- [ ] 13 composants admin sans try/catch autour des `fetch` (AcceptTargetButton,
      IntegrateCharacterButton, IntegrateModeButton, EffectHiddenToggle,
      MonsterKitEditor, BannersEditor, CharacterCuratedEditor,
      EffectCuratedEditor, GearPresetsEditor, GearRecoEditor, ItemCuratedEditor,
      PromoCodesEditor, RegenFromV2Button) : une erreur réseau bloque les
      boutons en « busy » définitif. Généraliser le pattern de
      `MonsterActions.tsx:58-79` via un helper `postJson()` partagé.
- [ ] Listes éditables keyées par index avec enfants à état (BannersEditor:77,
      PromoCodesEditor:97,132, EditorialEditor, GearPresetsEditor, GearRecoEditor,
      CharacterCuratedEditor:71) : supprimer la ligne _i_ transfère la recherche/
      dropdown à la suivante. Keyer par id stable (`crypto.randomUUID()` à l'ajout).
- [ ] `src/lib/admin/equipment-control.ts:199` : `eeReport` O(n²) — ~90 EE ×
      re-matérialisation complète de toutes les familles (chacune relisant le
      curé au FS). Construire un index slug→modèle une fois.

### Datagen — divers

- [ ] `datagen/extractor/specs/character.ts:492` : `ShowMainPage === 'true'`
      en casse exacte (le dump mélange `'True'`/`'true'` selon les colonnes) —
      une normalisation côté jeu viderait le roster en silence. Généraliser
      `bool()` de `lib/tables` à tous les booléens de table (3 idiomes
      coexistent : `bool()`, `boolCol()`, comparaisons exactes).
- [ ] `datagen/generators/content-schedule.ts:196` : le main boss guild raid
      dépend de la colonne sans en-tête `_unknown_0` — si elle disparaît,
      `splitCsv(undefined)` → boss absent SANS warn. Vérifier la colonne et
      signaler.
- [ ] `datagen/assets/extract-face-layout.py:193-195` : le mode sans argument
      (joué par `refresh.ts`) écrase le cache au lieu de fusionner — un prefab
      retiré du bundle perd son entrée committée (perte de rétention, à rebours
      du reste du pipeline). `cache.update(fresh)`.

## 🌍 i18n / SEO / a11y (audit 17/07)

- [ ] **Texte en dur qui fuit dans les 5 langues** :
      `src/app/[lang]/page.tsx:47` (« {count} personnages » en FRANÇAIS sur la
      home), `characters/[slug]/page.tsx:108` (meta description FR pour toutes
      les langues), `src/components/layout/Footer.tsx:8` (FR),
      `ShareButtons.tsx:133-168` (« Share on X », « Copied! » EN),
      `EquipmentBrowser.tsx:85-89,246-257` (slugs bruts `fire`/`striker` dans
      les selects, alors que CharactersBrowser reçoit des options localisées), + aria-labels EN épars (FullArtCarousel, CharacterCard:155,
      ImageLightbox:46,77, MultiVideoEmbed:42, StatsRankingSection:121,
      EquipmentDetail:662,830, breadcrumb JSON-LD et srSuffix de la fiche perso).
- [ ] **Équipement citoyen de seconde zone SEO** : `/equipment` et les fiches
      absents de `sitemap.ts` ET `llms.txt` ; pas de `generateStaticParams` ;
      meta description identique sur tout le catalogue ; title
      `« X – Outerplane » | Outerpedia` incohérent. `allEquipmentSlugs()`
      (`equipment-detail.ts:630`) existe précisément pour ça et est mort —
      le câbler règle sitemap + SSG d'un coup.
- [ ] **A11y tablists** : 4 implémentations `role="tablist"` sans navigation
      clavier ←/→ ni `aria-controls`/`id` (ui/Tabs, SegmentedTabs,
      EncounterSelection, MonsterLineup) — mutualiser un helper accessible
      (roving tabindex). Aussi : LicenseTabs:127-139 (bouton face verrouillée
      sans nom accessible, focusable une fois retourné), TowerFloorMenu:62
      (input recherche sans label), EeTranscendSection:163,192
      (`aria-label="-"/"+"`), GearRecoSection:424 (onglets sans aria-pressed).

## 🧪 Tests à écrire

- [ ] **`src/lib/skill-view.ts` en priorité 1** (741 lignes, zéro test) : le
      module aux règles les plus fines du repo (réattribution caller/curation,
      fusion enrage, variantes techniques, immunités), chaque règle justifiée
      par un cas réel en commentaire (Prototype EX-78, Irregular Queen,
      rage_finish orphelins) mais aucune verrouillée.
- [ ] **`src/lib/combat-power.ts`** : formule reverse-engineered « validée
      0-diff par le gear-solver » — committer un oracle (5 persos suffisent).
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

- [ ] Exports src sans consommateur : module `game-version.ts` entier,
      `elementName`/`className`
      (game-tokens.ts:44), `getMonthYear`/`buildVideoObjectJsonLd`/
      `buildFaqJsonLd` (seo.ts — si gardés pour le portage tools/tierlist,
      passer getMonthYear par `serverNow`), `tagDesc` (tags.ts:48),
      `SuffixLang`/`getLangConfig`/`GameLang`/`GAME_LANGS`/`isGameLang`
      (i18n/config.ts), repli inopérant de `guide-sections.ts:69-72`,
      exports superflus `gearIssueCounts`/`resolveRewardEntry`/
      `EffectTooltipBody`/`ELEMENT_HEX`.
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

- [ ] **`RankSlider` vs `EncounterSlider`** (BossStats.tsx:293-475 vs
      EncounterSelection.tsx:149-309) : ~120 lignes quasi identiques (géométrie,
      gestes, clavier) — extraire une primitive `HeatSlider`.
- [ ] **Helpers adb** dupliqués entre `datagen/extract/dump.ts` et
      `pull-gamedata.ts` (ADB, PKG, capture, stream, pickDevice, bloc root) —
      extraire `extract/adb.ts`.
- [ ] `shopLabel` ×3 DIVERGENTS (equipment/page.tsx:44, equipment/[slug]/
      page.tsx:40, variante inline characters/[slug]/page.tsx:452) : un nouveau
      slug de boutique s'affichera différemment selon la page — factoriser dans
      src/lib avec repli assumé.
- [ ] Boilerplate `lang` (18 occurrences du bloc await params + isValidLang) →
      helper `normalizeLangParam` dans src/lib/i18n.
- [ ] Logique « URL source de vérité » copiée entre ui/Tabs:35-54 et
      BannerTabs:23-41 → hook `useUrlTab` (fusionner avec la migration
      BannerTabs → hash, cf. règle actée ci-dessous).
- [ ] `rankOptionLabels` homonymes divergents (data/monsters.ts:97 vs
      admin/monster-store.ts:154) ; `GRADE_RANK`/`GRADE_ORDER` ×3 +
      `PIECE_ORDER` ×2 ; `gearById` homonymes piégeux (rewards.ts:84 vs
      equipment.ts:95 — renommer `gearFamilyById`) ; `BOSS_TYPES` homonymes
      (monster-icon.ts:32 vs towers.ts:92) ; `resolveEffectKey` scan linéaire
      vs index `curatedKeyCache` de skill-view (mutualiser l'index).
- [ ] Datagen : helper « monstres spawnés d'un donjon » ×3 (singularity,
      content-schedule, sources), expansion BuffGroup Child1..10 ×3 (dont 2 dans
      equipment.ts vs lib/buff), résolution RewardTemplet ×2 (encounters vs
      monad, `span()` copié-collé), walk récursif ×4, `nameKey`/`isPresent`/
      `sc`/regex VA dupliqués, `norm()` divergents des deux import-*.
- [ ] Wrappers guides 8 lignes ×~98 : uniformiser sur le re-export 1 ligne
      (`export { default } from '…'`) prouvé par les 25 monad-gate.
- [ ] `StatInline` local d'EquipmentDetail.tsx:167 redondant avec
      `inline/StatInline` ; hex éléments de `detail/theme.ts` dupliquant les
      tokens de globals.css (2 sources de vérité).

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
- [ ] `scripts/stamp-guides.ts` : (1) le stamp réécrit meta.json APRÈS
      `format:check` et le commit passe en `--no-verify` → JSON non-prettier
      committé, diff parasite au commit suivant — prettier-iser les meta
      stampés ; (2) `--all` sans DATE dégrade silencieusement en mode normal —
      refuser.
- [ ] CSP (`next.config.ts:19`) : retirer au moins `unsafe-eval` de script-src
      en prod ; viser nonce/strict-dynamic à terme.
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
- [ ] **« 18 générateurs » périmé partout** : ROADMAP.md:48, datagen/README.md:277,
      CHANGELOG.md:28 — il y a 20 fichiers dans `datagen/generators/`
      (recompter selon la règle « characters/monsters n'en sont plus » et
      graver le décompte à UN seul endroit).
- [ ] **`data/editorial/` non documenté nulle part** → CONVENTIONS.md
      « Données » + tableau des zones de datagen/README.
- [ ] **Locales : documenter le pré-seed** — ~818 des 1098 clés (tools._,
      progress._, coupons._, tierlist._, home._, changelog._, footer._,
      search._…) n'ont aucun consommateur : ce sont les pages V2 pas encore
      portées, en 5 langues (~75 % du poids des fichiers). Soit l'assumer en
      tête de fichier, soit parquer les namespaces non portés dans un fichier
      d'attente pour que « clé inutilisée » redevienne un signal. (Cohérence
      structurelle inter-langues : parfaite — 1098 clés identiques ×5, zéro
      manquante.)
- [ ] Doc ↔ code : en-tête de `geas.ts:14` (dit l'inverse du code sur
      `positive`), commentaires périmés de `face-icon.ts:5-7,37` (« à
      re-porter » — c'est automatisé depuis le 14/07), docstring de
      `extract-face-layout.py:184` (mauvais nom de fichier), doc de `slugTeam`
      (skills.ts:113 — dit « undefined si CSV », le code prend le 1er token),
      exception `stageLabel` non documentée (unlock-content.ts:112 contredit
      son propre en-tête « jamais parser l'ID »).

## 📦 Données V2 restant à porter (ex todo-data-v2)

Règle permanente : chaque `meta.bossId` d'un guide porté doit exister dans
`monsters.json` (le rendu JETTE sinon) — extraction à la demande
(`pnpm datagen:extract-entity`).

- [ ] **Premium** (curé, de paire) — `premium_limited_data.json` (reviews) +
      `premium-priorities.json` (ordre de pull). ⚠️ Remonté en visibilité :
      `beginner-faq` publie DÉJÀ 3 liens vers ce futur guide (= les 404 de la
      section Bugs haute) — ce portage les résorbe.
- [ ] **`bgm-mapping`** ← `LobbyCustomResourceTemplet` + TextSystem (fichier /
      nom localisé / durée).
- [ ] **`cf-skill-names`** — renommage skills Core Fusion. À VÉRIFIER : sans
      doute déjà couvert (chaque CF = id perso à part, skills extraits).
- [ ] **`name-aliases.json`** (curé) — alias de recherche par perso.
- [ ] **Core Fusion** (curé, de paire) — `core_fusion_data.json` +
      `core-fusion-priorities.json`.
- [ ] **`contributors.json`** (curé) — contributeurs du site.
- [ ] Patch-notes : quand la PAGE sera portée, préfixer `NEXT_PUBLIC_IMG_BASE`
      sur les `src` relatifs stockés (`/images/patch-notes/…webp`).
- [ ] (Contenu, pas data) Les 3 Promotion Challenge « boostés » (Supreme 4-6,
      donjons 70600106/107/108) n'ont aucun guide — la V2 n'en avait pas non
      plus.

## 🤔 Décisions en attente (Sevih)

- [ ] Icône `bosses.ts` (`MT_` baké) vs spec monstre (id brut) — unifier impose
      une régénération de `bosses.json` + revue des consommateurs.
- [ ] `LOCK_SCREEN_OVERRIDES` (unlock-content.ts) : trier vrai-override vs motif
      dérivable.
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
