# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code (7 passes par zone, chaque finding vérifié, sévérités contre-vérifiées),
> **nettoyé les 18, 19, 20 et 21/07** (à chaque fois le « fait » de la journée
> migré dans DONE.md ; le 20/07, les sections vidées — bugs, code mort,
> duplication, hygiène CLI — ont été retirées : leur bilan vit dans DONE).
> État de référence : **21/07**.
> Re-vérifier chaque item contre le code au moment de le traiter.

---

## 🎯 PRIO (décision Sevih)

- [ ] **Ajouter la bannière Dimensional Supply au guide banner** (banner-mileage) —
      elle donne au max 4 segments jaunes sur un substat (cf. guide gear, onglet
      Bases) ; à documenter côté guide des bannières.

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. Chaque page arrive avec ses clés de locale
> DÉJÀ pré-seedées ×5 (cf. item « pré-seed » de la section Docs).

- [ ] **`/tools` — RESTE 1 sous-outil** (`/<slug>`, 404 tant que non porté) :
      damage-calculator (un worktree d'agent contient déjà du travail — à
      évaluer avant de repartir de zéro) — namespaces `tools.*`.
      ⚠ SURTOUT NE PAS se baser sur la V2 pour cet outil (décision Sevih
      22/07 : le calculateur V2 est foireux) — exception à la règle « V2 =
      oracle », conception V3 native.
      (`event` PORTÉ le 21/07, cf. DONE — reste à POUSSER les visuels
      d'événement sur R2 : `pnpm images` collecte `images/events/**` depuis le
      pool, la bannière `default.webp` en dépend.)
      (`tier-list-maker` et `team-planner` PORTÉS le 21/07 ; tables V2
      `tier_lists` + `teams` MIGRÉES sur le MySQL du VPS le 21/07, cf. DONE —
      les liens courts `?s=` V2 résolvent.)
      (Historique des portés : 19-21/07, cf. DONE — socle `TierListTool`,
      routeur à plat, coupon-codes = renvoi `/coupons`,
      gear-usage-statistics & gear-usage-finder = agrégation gear-reco à la
      lecture, patch-history, pull-simulator, progress-tracker.)

## 🔍 Suite d'audit (26/07) — par rôle

> Backlog des trois audits (extraction + admin + extractor), dédupliqué dans
> [`docs/audit/README.md`](./audit/README.md) (détail : `audit/extraction.md`
> **E1–E8**, `audit/admin.md` **F1–F9**, `audit/extractor.md` **X1–X6**).
> Priorité `P1>P2>P3>dette`. Rôles : **Claude** = `datagen/` (extraction +
> extractor + socle partagé) ; **Worker** = panneau admin (`src/**/admin`).
> ✅ Faits le 26/07 (Claude, migrés dans [DONE.md](./DONE.md)) : **F1** (json
> atomique), **E2** (garde anti-purge), **E3** (helper PNG), **E4** (timeout
> extraction), l'**audit `datagen/extractor/`** (constats X1–X6), **X3**
> (mémoïsation `character`/`monster`, `0396470`), **X2** (lecture committé via
> `readCuratedJson`, anti-wipe, `f3f1cd0`), **X1** (tests des prédicats purs des
> specs — `isInnatePierce` / `isRealCharacterRow` / `extractStats`…, +25 cas) et
> **E1** (tests des cœurs purs d'extraction — parsers `parseMd5` / `parseLsLR`
> extraits de `pull-gamedata`, classifieurs wallpapers exportés, +19 cas) et
> **E6** (parallélisme borné des passes sharp de la dédup wallpapers — helper pur
> `lib/concurrency.mapLimit`, ordre préservé, +7 cas) et **E7** (blocklist
> wallpapers MESURÉE sur le pool réel — load-bearing, rattrape 952 catégorisables
> qui fuiraient ; POURQUOI documenté en tête de liste + comportement porteur gelé
> par test) et **F11** (type `ItemCurated` unifié dans `datagen/curated/items.ts` —
> fin de la « forme miroir » store↔générateur). Reste ci-dessous.
> ✅ Faits le 26/07 (Worker, migrés dans [DONE.md](./DONE.md)) : **F6**
> (confinement des chemins de guides, `c13ba4b`), **F3** (garde de forme des corps
> d'écriture — sévérité révisée à la hausse : un payload mal typé SUPPRIMAIT la
> curée, `7854a6e`), **F4** (hook `useAutoTranslate` + `TranslateButton`), le
> complément de **F1** (temporaire unique, `bd88cc4`), **F8** (tests des 16
> stores qui écrivent — +178 cas, bac à sable `store-fixture`, `daadd8f`),
> **F10** (les 3 divergences de socle : sérialiseur, validation, tri, `79521fd`)
> et **F5** (aperçus au montage — un seul champ éditable à la fois).
> ⚠ **F5 change un GESTE d'édition** (cliquer une note pour l'ouvrir) : à valider
> en dev, c'est le seul item de la série qui se voit à l'écran.
> Puis **F7** (perte d'écriture entre deux onglets — bug MESURÉ puis corrigé par
> `withStoreLock` sur les 9 stores à merge par clé, `3d92d9f` ; le 10ᵉ,
> `item-curated-store`, rattrapé après le F11 de l'agent datagen) et **F9**
> (taille des 4 éditeurs : briques sorties dans `guide/`, `events/`, `shop/`,
> `gear/` — 3464 → 2240 lignes cumulées, +37 cas sur les cœurs purs extraits).

### 👤 Claude — datagen / extraction / socle

> _Backlog d'audit datagen CLOS (+ F11 côté `datagen/`). Traités : E1–E7, X1–X3.
> « Rien à faire » par verdict d'audit : E8 (sécurité shell théorique), X4 (diff
> négligeable), X5 (clés inattendues, choix assumé), X6 (sain). E7 tranché le 26/07 :
> les 12 motifs inertes de la blocklist wallpapers sont GARDÉS (assurance, cf. DONE
> et le commentaire en tête de `EXCLUDE_PATTERNS`). Rien d'ouvert._

### 🤖 Worker — panneau admin (`src/**/admin`)

> _Backlog d'audit admin CLOS (F1–F11). Reste **F2** ci-dessous, qui demande un
> arbitrage. Deux choses à valider EN DEV, elles se voient à l'écran : le geste
> d'édition de F5 (cliquer une note pour l'ouvrir, dans `GuideEditor` et
> `FreeHeroesEditor`) et, par prudence, les 4 éditeurs remaniés par F9 —
> déplacements purs, mais non vérifiés à l'écran._

### 🤝 À arbitrer ensemble

- [ ] **F2** _(décision archi)_ — `admin/` n'est pas une frontière (8 entrées
      publiques importent `lib/admin`). Documenter les modules qui shippent en
      prod, OU extraire `lib/editorial/` + `components/editorial/`.

## 🧹 Dette code

### Bugs non urgents

> L'éditeur assisté `/admin/guides` (picker `{P/}` + doublons buff/debuff) est
> CORRIGÉ le 24/07 (`inline-refs.ts` : picker keyé par `characterDisplayName`,
> effets dédupliqués par apparence) — cf. DONE une fois validé en dev.

### Lots de fond SEO/perf (audit Sitebulb 20/07 — non urgents)

> Le gros de l'audit est traité (cf. DONE 20-21/07 : canonicals, comics, cache).
> Ce qui suit est du volume, pas du bug. Détail : `docs/seo&audit/`.

- [ ] **Titles / meta descriptions courts** (572 / 135 pages) — surtout les
      pages générées ; à arbitrer, ce n'est pas mécanique.
      (`<html lang>`, `alt` manquants et `width`/`height` TRAITÉS le 22/07,
      cf. DONE. Les 147 titres de GUIDES portent leur catégorie depuis le
      22/07 — ça les rend uniques et les allonge ; restent les fiches perso,
      équipement et les pages d'outils.)
- [ ] **Meta descriptions de guides GÉNÉRIQUES / dupliquées** — les familles à
      contenu templaté partagent souvent une description identique. Constaté sur
      special-request : 8 des 10 guides ont la MÊME (« Strategy guide for Special
      Request: Identification mission ») ; seuls beatles/chimera ont une desc
      propre au boss. Les `meta.title`, eux, ont été rendus uniques (nom du boss)
      cette session — cf. DONE. Probablement le même motif ailleurs (adventure-
      license, irregular-extermination, dimensional-singularity…). PAS mécanique
      (une phrase par boss), donc éditorial à passer famille par famille. NB : le
      nom du boss est fiable (résolu depuis `TextCharacter` du jeu) — utilisable
      comme graine.

## ⚙️ Config / infra

- [ ] **Raccourcisseur interne `/s/[id]`** (idée actée 21/07, non prioritaire —
      la barre d'adresse en `?z=` compact couvre le besoin réel de partage) :
      table `short_links` (id = hash du chemin, 12 chars, upsert idempotent),
      `POST /api/shortlink { path }` validé chemin INTERNE seulement (jamais
      d'URL absolue — zéro open redirect), `GET /s/[id]` → 302. Réutilise
      `src/lib/db.ts` ; sans BDD → dégradation lien long. Premier consommateur
      envisagé : bouton « partager » optionnel (Discord) sur les pages à état.

## 📚 Docs à resynchroniser

- [ ] **CHANGELOG.md** (dev, racine — PAS `/changelog` du site, livré le 20/07) :
      le retard a grossi — 216 commits au 17/07, davantage depuis. Resync ou
      assouplir la règle PR qui l'exige.
- [ ] **Locales : documenter le pré-seed** — une grosse part des clés (les
      namespaces des pages V2 pas encore portées, ×5 langues) n'a aucun
      consommateur ; chaque page est TRACÉE dans « Pages manquantes ». Soit
      l'assumer en tête de fichier, soit parquer les namespaces non portés dans
      un fichier d'attente pour que « clé inutilisée » redevienne un signal.
      (Cohérence structurelle inter-langues : parfaite — clés identiques ×5.)
      NB : le pool se résorbe avec les portages (tools/tierlist/changelog
      consomment désormais leurs clés).

## 📦 Données V2 restant à porter (ex todo-data-v2)

Règle permanente : chaque `meta.bossId` d'un guide porté doit exister dans
`monsters.json` (le rendu JETTE sinon) — extraction à la demande
(`pnpm datagen:extract-entity`).

## 🤔 Décisions en attente (Sevih)

- [ ] `TODO(guides)` de `version-monster.ts:16` : « Versionner » doit
      RÉ-ÉPINGLER les guides `<id>` → `<id>@<n>` — le domaine guides existe,
      c'est actionnable.
      (Les 4 items d'audit — ModeColumns, item-blacklist, `[+Turn]`, comics.json —
      sont TRAITÉS le 21/07, cf. DONE.)

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
