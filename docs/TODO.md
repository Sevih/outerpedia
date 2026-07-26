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
> (mémoïsation `character`/`monster`, `0396470`) et **X2** (lecture committé via
> `readCuratedJson`, anti-wipe, `f3f1cd0`). Reste ci-dessous.
> ✅ Faits le 26/07 (Worker, migrés dans [DONE.md](./DONE.md)) : **F6**
> (confinement des chemins de guides, `c13ba4b`), **F3** (garde de forme des corps
> d'écriture — sévérité révisée à la hausse : un payload mal typé SUPPRIMAIT la
> curée, `7854a6e`), **F4** (hook `useAutoTranslate` + `TranslateButton`) et le
> complément de **F1** (temporaire unique, `bd88cc4`).

### 👤 Claude — datagen / extraction / socle

- [ ] **E1** _(P3)_ — tests des cœurs purs d'extraction, **parsers `ls -lR`/`md5sum`
      en tête** (fragiles + conséquence E2), puis classifieurs wallpapers.
- [ ] **X1** _(P3)_ — tester les prédicats des specs (`isInnatePierce`, exclusion
      NPC de `select`, tags) — le siège du bug NPC de la session.
- [ ] **E6** _(P3)_ — parallélisme borné (p-limit ≈ cpus) de la dédup wallpapers.
- [ ] **E7** _(dette)_ — élagage de la blocklist wallpapers (~50 regex V2), après
      mesure du recouvrement avec la catégorisation.

### 🤖 Worker — panneau admin (`src/**/admin`)

- [ ] **F8** _(P3)_ — tests des **16 stores qui écrivent** en priorité (pas les
      composants) : une régression y corrompt la donnée éditoriale en silence.
- [ ] **F5** _(dette)_ — aperçu au montage : garde « un seul éditeur actif »
      (`GuideEditor`, `FreeHeroesEditor`), idiome `EditorialFields`/`CharacterGroups`.
- [ ] **F7** _(dette)_ — concurrence read-merge-write des stores (2 onglets admin).
- [ ] **F9** _(dette)_ — taille des composants (750–1000 l.) ; F4 en retire une part.

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
