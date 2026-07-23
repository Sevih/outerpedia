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

## 🧪 Tests à écrire

- [ ] Les générateurs `datagen/generators/*` — le TRIO (encounters/
      singularity/content-schedule, 20/07), le LOT NOMMÉ (skills, recruit, goods,
      monad, towers, equipment, sources + `refresh` + `gamedata-store`, 23/07) et
      les SECONDAIRES nommés (characters-list, progression, hero-growth, quirks,
      item-catalog, costumes, bosses, enhance, monster-skills, ether-rankings,
      shop-priorities, timegate-resources, 23/07 — cf. DONE) sont COUVERTS.
      `build.ts` l'est indirectement (invariants inter-fichiers) ; `items` via
      item-catalog (fondu dans `items.json`). RESTENT seulement les générateurs
      MINCES/fs non nommés (`unlock-content`, `effects`, `game-version`,
      `bgm-mapping`, `comics`, `wallpapers`) — surtout des invariants légers, à
      faire si le besoin se présente. CONTRAINTE actée : la suite tourne SANS
      `.gamedata` (CI). Suite datagen : 346 tests.

## 🧹 Dette code

### Panneau admin

> Décision d'IA figée le 07/07 (matrice fonction × entité). Deux des trois items
> d'origine sont LIVRÉS (diff « TYPO » + quick-fix, auto-détection des tags
> perso) — cf. DONE 2026-07-23. Reste le doublon Home/Extractor.

- [ ] **Home `/admin` = doublon d'Extractor** — refonte possible en « inbox
      priorisée » (ce qui demande une action, trié par urgence).

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
- [ ] CSP durcissement — PASSE 1 livrée le 19/07 (cf. DONE) : politique stricte
      nonce + strict-dynamic servie en **Report-Only** via `proxy.ts`, collecteur
      `/api/csp-report`. Ne bloque rien encore. **RESTE** : (a) déployer en prod,
      (b) laisser les rapports s'accumuler quelques jours, `grep [csp-report]`
      dans les logs du conteneur, (c) traiter les vraies violations (CF Insights
      non-noncé attendu), (d) **PASSE 3** : basculer la politique réelle de
      `next.config.ts` sur le nonce et retirer `'unsafe-inline'` des scripts.
      (`style-src` garde `'unsafe-inline'` : styles inline React, non prioritaire.)

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
