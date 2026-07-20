# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code (7 passes par zone, chaque finding vérifié, sévérités contre-vérifiées),
> **nettoyé le 18/07 puis le 19/07** (à chaque fois le « fait » de la journée
> migré dans DONE.md ; le 19/07, tous les `[x]` biffés qui traînaient encore ici
> ont été retirés — ils vivent dans DONE).
> État de référence : **19/07**, typecheck et lint OK, v0.1.24.
> Re-vérifier chaque item contre le code au moment de le traiter.

---

## 🎯 PRIO (décision Sevih)

> Le gros chantier admin (matrice Extractor/Editor) a été mené le 18/07 —
> comparaisons V2 retirées, `data/legacy` déposé, intégration par entité
> (perso/équipement/item), extracteur d'items, factorisations
> switches/pickers/sidebars, câblage buff/debuff perso. Détail dans DONE.md.
> Ne restent ci-dessous que les reliquats.

- [ ] **Regen coupons/banner V2 = EXCEPTION assumée** — la source V2 reste la
      référence jusqu'à la bascule prod V2→V3 (liée à la page `/coupons`). Rien
      à faire d'ici là.
- [ ] **Ajouter la bannière Dimensional Supply au guide banner** (banner-mileage) —
      elle donne au max 4 segments jaunes sur un substat (cf. guide gear, onglet
      Bases) ; à documenter côté guide des bannières.

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. Chaque page arrive avec ses clés de locale
> DÉJÀ pré-seedées ×5 (cf. item « pré-seed » de la section Docs).

- [ ] **`/tierlist` — RELIQUAT** (hub fait le 19/07, cf. DONE). RESTE : l'aperçu
      « top S-tier » par carte (données de RANG par perso absentes en V3 — elles
      vivent dans l'outil tierlist, non porté) ; et les helpers seo.ts encore
      inutilisés (`buildVideoObjectJsonLd`, `buildFaqJsonLd`) pour la vraie page
      d'outil tierlist.
- [ ] **`/tools` — RELIQUAT** (landing faite le 19/07, cf. DONE). Routeur À PLAT
      `[lang]/[slug]` posé le 19/07 (parité URL prod V2, registre de slugs portés).
      **ost**, **wallpapers**, **4-comics** portés (cf. DONE — les 3 médias faits,
      ordre Sevih respecté). **RESTENT 15 sous-outils** (`/<slug>`, 404 tant que
      non portés) : most-used-units, tierlistpve, tierlistpvp, ee-priority-base,
      ee-priority-plus10, gear-usage-statistics, gear-usage-finder,
      damage-calculator, pull-simulator, progress-tracker, team-planner,
      tier-list-maker, patch-history, coupon-codes, event — namespaces
      `tools.*`/`progress.*`.
- [ ] **`/characters/[slug]` — RELIQUAT** : la fiche détail est portée, il ne
      MANQUE que les **Discord reviews** (section review communautaire de la V2).
      Le reste (skills/burst/chain/gear/stats/transcend…) est là.
- [ ] **`/changelog`** — clés `changelog.*` ; lié au resync CHANGELOG.md
      (item 📚). Débloque aussi la section **Recent Updates** de la Home (différée :
      elle lit `getChangelog`/`@/lib/changelog`, non porté — à rebrancher quand le
      changelog atterrit).

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

### Datagen — divers

- [ ] `datagen/extractor/specs/character.ts:492` : `ShowMainPage === 'true'`
      en casse exacte (le dump mélange `'True'`/`'true'` selon les colonnes) —
      une normalisation côté jeu viderait le roster en silence. Généraliser
      `bool()` de `lib/tables` à tous les booléens de table (3 idiomes
      coexistent : `bool()`, `boolCol()`, comparaisons exactes).

## 🧪 Tests à écrire

- [ ] Les générateurs `datagen/generators/*` + `build.ts`/`refresh.ts`
      (gros chantier — prioriser encounters/singularity/content-schedule).
      CONTRAINTE actée : la suite tourne SANS `.gamedata` (CI) → extraire les
      cœurs PURS et tester en synthétique (cf. `resolveKeyWinners`), ou ancrer
      des invariants sur `data/generated/` committé (cf. `towers.test.ts`).
- [ ] `src/lib/admin/gamedata-store.ts` (dev-only, priorité moindre).

## 🧹 Dette code

### Code mort (vérifié par grep repo entier, audit 17/07)

- [ ] Datagen : `hasFaceIconLayout` (face-icon.ts:38), `r2Push` (lib/r2.ts:89 —
      doublonne assets-push.mjs en plus), `getMaxLevel`/`resolvePlaceholders`
      (buff.ts, testés mais jamais appelés en prod), export `isPermilleRow`,
      `validateTagDef` (curated/tags.ts:57 — son commentaire prétend qu'il est
      branché, c'est faux : le brancher ou le supprimer).

### Duplication (les 2 gros d'abord)

- [ ] **Helpers adb** dupliqués entre `datagen/extract/dump.ts` et
      `pull-gamedata.ts` (ADB, PKG, capture, stream, pickDevice, bloc root) —
      extraire `extract/adb.ts`.
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

- [ ] (chantier guides éditoriaux) `BannerTabs` (?banner=) et le `?tab=` de
      free-heroes-start-banner → SegmentedTabs/#hash quand ces guides
      atterrissent. **Règle actée : état interne d'un guide = hash
      (SegmentedTabs) ; ui/Tabs (?param) = hors guides.**

### Édition des general-guides bespoke (campagne en cours)

> Pattern : registre `general-guide-store.ts` (slug → fragment), donnée sortie
> en JSON local (rendu inchangé), éditeur dédié câblé sur `/admin/guides`.
> `free-heroes-start-banner` (onglet Free Heroes) et `premium-limited` (reviews +
> recommended choices + contribution publique Shiraen) LIVRÉS le 19/07 (cf.
> DONE). Modèle de contribution acté : outil PUBLIC exporte 1 perso →
> IMPORT côté admin (pas d'écriture serveur publique, pas d'auth).

- [ ] `core-fusion` : reviews (avec `changes` par skill + `recommendedLevels`) +
      recommended choices (`op` sur les picks, pas de bucket `transcend`) —
      répliquer le patron premium-limited (contribution publique aussi).
- [ ] `shop-purchase-priorities` : modifier les priorités S/A/B/C des items —
      LES DEUX (choix Sevih) : tables éditoriales (`editorial.ts`, EVENT/RESOURCE)
      **et** overlay curé des shops dérivés (fusionné au build datagen → éditer
      l'overlay puis régénérer `shop-priorities.json`).

## ⚙️ Config / infra

- [ ] CSP durcissement — PASSE 1 livrée le 19/07 (cf. DONE) : politique stricte
      nonce + strict-dynamic servie en **Report-Only** via `proxy.ts`, collecteur
      `/api/csp-report`. Ne bloque rien encore. **RESTE** : (a) déployer en prod,
      (b) laisser les rapports s'accumuler quelques jours, `grep [csp-report]`
      dans les logs du conteneur, (c) traiter les vraies violations (CF Insights
      non-noncé attendu), (d) **PASSE 3** : basculer la politique réelle de
      `next.config.ts` sur le nonce et retirer `'unsafe-inline'` des scripts.
      (`style-src` garde `'unsafe-inline'` : styles inline React, non prioritaire.)
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
- [ ] Doc ↔ code (RESTE datagen → worker) : commentaires périmés de
      `face-icon.ts:5-7,37` (« à re-porter » — c'est automatisé depuis le 14/07),
      doc de `slugTeam` (datagen/generators/skills.ts:113 — dit « undefined si
      CSV », le code prend le 1er token), exception `stageLabel` non documentée
      (datagen/generators/unlock-content.ts contredit son en-tête « jamais parser
      l'ID »). (SRC FAIT : en-tête `geas.ts` corrigé — classement sur signe de
      `points`, pas `positive` — le 18/07.)

## 📦 Données V2 restant à porter (ex todo-data-v2)

Règle permanente : chaque `meta.bossId` d'un guide porté doit exister dans
`monsters.json` (le rendu JETTE sinon) — extraction à la demande
(`pnpm datagen:extract-entity`).

- [ ] **`name-aliases.json`** (curé) — alias de recherche par perso.
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
