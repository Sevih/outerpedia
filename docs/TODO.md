# TODO

> Fichier unique de suivi (fusion des ex `todo-data-v2.md`, `todo-audit-2026-07-13.md`
> et `todo-audit-2026-07-16.md` — l'historique et les bilans détaillés vivent dans git).
> État de référence au 2026-07-16 : commit `d57ad3a`, **278/278 tests verts**, v0.1.21.
> Re-vérifier chaque item contre le code au moment de le traiter.

---

## 🎯 PRIO (décision Sevih)

- [ ] **Retirer les comparaisons V2 des extracteurs** — l'oracle a joué son rôle.
      Périmètre : `datagen/extractor/v2-control.ts` + contrôle de cohérence,
      `equipmentV2Control`/`EquipmentReport` (Extractor gear), l'Extractor Effect
      (pur contrôle de régression V2), les statuts « diff » de la sidebar,
      `core/diff`, les lectures `../outerpedia-v2`. **EXCEPTION : le regen
      coupons/banner se GARDE jusqu'à la bascule prod V2→V3** (la V2 reste la
      source vivante de ces données éditoriales). Une fois fait : `data/legacy/`
      (248 fichiers) devient supprimable.
- [ ] **Retravailler le rôle des Extractors/Editors du panneau admin** (corollaire
      du point précédent — demande Sevih 2026-07-16) : certaines pages Extractor
      n'existent AUJOURD'HUI que pour la comparaison V2 (Extractor Effect = pur
      contrôle de régression ; Extractor gear = `EquipmentReport`/diff par nom ;
      badges/statuts « à traiter » de la sidebar alimentés par le contrôle V2).
      Quand la comp V2 saute, ces écrans perdent leur raison d'être → redéfinir
      la matrice fonction × entité : que devient un « Extractor » sans oracle
      (revue committé↔frais ? intégration ciblée ? rien ?), quelles lignes
      fusionnent avec l'Editor, lesquelles disparaissent. À trancher AVANT de
      retirer les contrôles, pour ne pas laisser des pages mortes.

## 🐛 Bugs (audit du 16/07)

**TRAITÉ le 2026-07-16** (commits `7d858d8`…, un par fix — détail dans git) :
collecte tours VH (waves + encounters), `pnpm test` en CI, MonadRouteClient
sur `useUrlSlice`, caches d'effects salés du mtime des curés (`fileStamp`
TTLisé), butin monad instrumenté (ligne agrégée) + label via `resolveOrNull`,
nom stable `monad/theme.json` (rename committé), warning `isoUtc`, heuristique
goods contournée pour les clés adossées à une ligne item. Enums d'éveil
VÉRIFIÉS contre les `NodeNameID` des tables : aucun off-by-one (méthode gravée
en commentaire dans progression.ts). Sortie monad prouvée identique octet à
octet avant/après.

## 🧪 Tests à écrire

**TRAITÉ le 2026-07-16** (suite à 319 tests) : restrictions/compositions de
tours (`towers.test.ts`, invariants sur la donnée committée), geas guild-raid
(`geas.test.ts`), hash-params (`url-hash.test.ts`, window stubbé), vote-croisé
c9ce852 (`resolveKeyWinners` extrait PUR de buildEffectGlossary — glossaire
prouvé identique — + 5 tests synthétiques).

- [ ] `src/lib/admin/gamedata-store.ts` (dev-only, priorité moindre).
- [ ] Les 19 générateurs `datagen/generators/*` + `build.ts`/`refresh.ts`
      (gros chantier — prioriser encounters/singularity/content-schedule).
      CONTRAINTE actée : la suite tourne SANS `.gamedata` (CI) → deux
      patterns seulement : extraire les cœurs PURS et les tester en
      synthétique (cf. `resolveKeyWinners`, prouver l'iso-sortie à
      l'extraction), ou ancrer des invariants sur `data/generated/` committé
      (cf. `towers.test.ts`).

## 🧹 Dette code

**TRAITÉ le 2026-07-16** (un commit par chantier — détail dans git) : code
mort (accès monad/towers, no-op stamp-guides), loader partagé du curé
effects.json (les 4 lectures ad-hoc), « or »/« Gold » de Monad Gate
localisés, `#4cc2ff` tokenisé (`--buff-tint`/`--debuff-tint`, une source),
TowerGuide + TeamSlots sur `resolveGuideCharacter`, `pickSkills`
(integrate.ts, 5 boucles → 1), `GuideCardArt` (carte-art de landing
partagée), `RosterGroupCard` (carte « groupe de persos + raison » partagée,
habillage very hard via `decorate`), équipe de StagedBossGuide sur
SegmentedTabs `#team=` — **règle actée : état interne d'un guide = hash
(SegmentedTabs) ; ui/Tabs (?param) = hors guides**, gravée dans les deux
docstrings. Règle eslint RAW_COLOR **étendue aux `.ts`** + exemption
resserrée à `characters/**` seul (token `--on-vivid` pour le `text-white`
légitime de nodeStyles).

- [ ] **Tokeniser les couleurs vives des vues guides** (décision Sevih
      2026-07-16 — la moitié eslint est faite, reste la PASSE DE FOND).
      Inventaire (grep vives sur guides) : ~40 classes distinctes — top :
      `text-sky-400` ×16, `text-amber-400` ×14, `bg-blue-600` ×8,
      famille yellow-400 (~20 : sélection active/or), green/emerald (~15 :
      gains/chemins), red (~10 : danger/bans, dont les SVG
      `rgb(239 68 68)` de TowerCombatRoster et `#facc15`/`#fde047` de
      MonadGateMap), violet/rose/pink épars. Palettes `.ts` :
      `guide-accents.ts`, `nodeStyles.ts` (textColor), `ELEMENT_RING`
      (images.ts). MÉTHODE actée : tokens sémantiques PAR RÔLE aux valeurs
      EXACTES actuelles (zéro dérive visuelle — modèle `--buff-tint`), puis
      étendre RAW_COLOR aux couleurs vives pour verrouiller.
- [ ] (à la charge du chantier guides éditoriaux) `BannerTabs` (?banner=) et
      le `?tab=` de free-heroes-start-banner sont des états internes de
      guide → SegmentedTabs/#hash quand ces guides atterrissent (cf. règle
      ci-dessus).

## ⚙️ Config / infra

**TRAITÉ le 2026-07-16** (un commit par item — détail dans git) :
`scripts/*.ts` sous typecheck (3ᵉ projet tsc `scripts/tsconfig.json`, zéro
erreur au premier passage), `data/extracted/` exclu du contexte Docker
(~30 Mo jamais lus par `next build`), `git gc` (5017 objets loose → tout
packé), branche `backup/site-rebuild` SUPPRIMÉE (décision Sevih — esquisse
Phases A→D du 30/06 au matin, resservie en mieux par main le jour même).
Hygiène commits : les 3 messages hors format sont POUSSÉS donc irréparables
(le resync CHANGELOG ci-dessous comblera le trou) ; pour l'avenir,
`pnpm commit` refuse désormais tout message non conventionnel (re-prompt,
`--msg` invalide = refus sec).

## 📚 Docs à resynchroniser

- [ ] **CHANGELOG.md** : ~34 commits post-14/07 absents (guides tours/GR/MG,
      CI perf, pnpm 11, dependabot, editorial) ; « ~130 commits » → 174 ;
      « 18 générateurs » → 19 (characters/monsters n'en sont plus, costumes/
      monad manquent) ; vues manquantes (AdventureSeasons, AdventureLicense,
      SkywardTowerView, MonadGateView). Ou assouplir la règle PR qui l'exige.
- [ ] **`data/editorial/` non documenté nulle part** (assets produits par le
      wiki, consultés avant le pool V2, versionnés) → CONVENTIONS.md « Données » + tableau des zones de datagen/README.
- [ ] « 18 générateurs » → 19 aussi dans ROADMAP.md:48 et datagen/README.md:278
      (+ mentionner monad.ts et les restrictions de tours).

## 📦 Données V2 restant à porter (ex todo-data-v2)

Règle permanente : chaque `meta.bossId` d'un guide porté doit exister dans
`monsters.json` (le rendu JETTE sinon) — extraction à la demande
(`pnpm datagen:extract-entity`).

- [x] **`area_name`** — DÉJÀ COUVERT (constat Sevih 2026-07-16) : `AreaTemplet`
      est consommé par `encounters.ts` (champ `area` localisé par donjon +
      saison/épisode story) et `unlock-content.ts` — pas de fichier dédié à
      porter.
- [ ] **`bgm-mapping`** ← `LobbyCustomResourceTemplet` + TextSystem (fichier /
      nom localisé / durée).
- [ ] **`cf-skill-names`** — renommage skills Core Fusion. À VÉRIFIER : sans
      doute déjà couvert (chaque CF = id perso à part, skills extraits).
- [ ] **`name-aliases.json`** (curé) — alias de recherche par perso.
- [ ] **Premium** (curé, de paire) — `premium_limited_data.json` (reviews) +
      `premium-priorities.json` (ordre de pull).
- [ ] **Core Fusion** (curé, de paire) — `core_fusion_data.json` +
      `core-fusion-priorities.json`.
- [ ] **`contributors.json`** (curé) — contributeurs du site.
- [ ] Patch-notes : quand la PAGE sera portée, préfixer `NEXT_PUBLIC_IMG_BASE`
      sur les `src` relatifs stockés (`/images/patch-notes/…webp`).
- [ ] (Contenu, pas data) Les 3 Promotion Challenge « boostés » (Supreme 4-6,
      donjons 70600106/107/108) n'ont aucun guide — combats à part, la V2 n'en
      avait pas non plus.

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

---

## 📌 Notes de référence (à ne pas perdre)

- **Jointure guide↔saison** : par le monstre réellement combattu
  (`meta.bossId` ↔ `season.monsters`), JAMAIS par la colonne `boss` (id
  canonique d'affichage). Gravée dans `content-schedule.test.ts`.
- `battleEnd` ≠ `end` : un boss peut être « en saison » sans être combattable.
- Le statut « en cours » se calcule CÔTÉ CLIENT (`SeasonBadge`) — pages ISR 24 h.
- Tours : `waves` = formations successives ; `encounters` = pools alternatifs
  (very hard) — ne jamais confondre.
