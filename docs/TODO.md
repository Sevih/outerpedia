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

- [ ] **Couleurs vives hors garde-fou dans les vues guides** : la règle eslint
      RAW_COLOR ne bannit que les gris (+white/black) en `.tsx` → passent :
      `monad/MonadGateMap.tsx` (yellow/green/red/emerald), `MonadRouteClient/
Reward`, `TurnOrder.tsx:61`, `TowerCombatRoster.tsx:141` (rouge dur alors
      qu'un token danger existe), `BossPanel.tsx:233`, `guides/page.tsx:76`,
      `hover:ring-yellow-400/50` (SkywardTowerView/MonadGateGallery). Et les
      palettes en `.ts` échappent totalement (`guide-accents.ts`,
      `nodeStyles.ts:49` = `text-white`, `ELEMENT_RING` d'images.ts).
      → décision : tokeniser vs étendre l'exemption « port pixel-perfect V2 »
      (+ étendre la règle aux `.ts`).
- [ ] Resserrer l'exemption couleurs d'`eslint.config.mjs:34-42` :
      parse-text/inline/ShareButtons n'ont plus AUCUNE couleur brute — seule
      `characters/**` en a encore besoin.
- [ ] Hex/rgb en dur à trier : `GeasUnlockList.tsx:57,186,212` (`#4cc2ff` =
      doublon de `.bg-buff-tint`), `TowerCombatRoster.tsx:215,224`,
      `MonadGateMap.tsx:352,376` (certains justifiés par commentaire).
- [ ] Quasi-clones : `RecommendedCharacters.tsx:48-88` (serveur) vs bloc roster
      de `TowerCombatRoster.tsx:168-253` (client) → partager le rendu
      « groupe de persos + raison ».
- [ ] `TowerGuide.tsx:134-154` et `TeamSlots.tsx:65-70` réimplémentent
      « nom éditorial → perso » alors que `resolveGuideCharacter`
      (lib/data/characters.ts:108) existe.
- [ ] Carte-art de landing dupliquée : `SkywardTowerView.tsx:90-145` vs
      `MonadGateGallery.tsx:34-100`.
- [ ] Deux systèmes d'onglets concurrents : `ui/Tabs` (?param, useUrlSlice) vs
      `guides/SegmentedTabs` (#hash, url-hash) — SR et guild-raid choisissent
      différemment pour la même notion d'équipe.
- [ ] 4 lectures ad-hoc de `data/curated/effects.json` (lib/effects.ts:539,
      equipment.ts:520, manifest.ts:267, v2-control.ts:417) → loader partagé
      dans datagen/curated/effects.ts.
- [ ] Texte en dur non localisé (public) : `MonadGateMap.tsx:693` (`"or"`),
      `MonadGateGuide.tsx:82` (`'Gold'` — `SYS_ASSET_GOLD` localisé existe).
- [ ] Code mort : `getTowerCombat` (towers.ts:121), `getMonadRoute` (monad.ts:25),
      `monadRouteVariants`+`monadRouteRefs` (monad.ts:50-60),
      `Object.assign(meta, {})` (stamp-guides.ts:149).
- [ ] Boucle « collecter les skills d'une entité » encore répétée dans
      `integrate.ts` (atténuée par le refactor testable du 14/07).

## ⚙️ Config / infra

- [ ] `scripts/*.ts` hors de tout typecheck (tsconfig = src, datagen = datagen ;
      tsx = transpile-only) → les inclure.
- [ ] `.dockerignore` : ajouter `data/extracted/`.
- [ ] `.git` : 4647 objets loose / 0 packé → `git gc`.
- [ ] Branche `backup/site-rebuild` à trancher (dernière restante).
- [ ] Hygiène commits : « import MG », « guild raid & tower », « push apres
      reffacto + clean » (simple bump de version) — messages non conventionnels
      qui creusent le trou du CHANGELOG.

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

- [ ] **`area_name`** ← `AreaTemplet` (167 zones, NameID + ShortName). Ne bloque
      plus la catégorie `adventure` (portée sans), mais reste utile pour nommer
      les zones.
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
