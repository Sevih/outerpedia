# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code (7 passes par zone, chaque finding vérifié, sévérités contre-vérifiées),
> **nettoyé les 18, 19 et 20/07** (à chaque fois le « fait » de la journée migré
> dans DONE.md ; le 20/07, les sections vidées — bugs, code mort, duplication,
> hygiène CLI — ont été retirées : leur bilan vit dans DONE).
> État de référence : **20/07**.
> Re-vérifier chaque item contre le code au moment de le traiter.

---

## 🎯 PRIO (décision Sevih)

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

- [ ] **`/tools` — RESTENT 7 sous-outils** (`/<slug>`, 404 tant que non portés) :
      damage-calculator, pull-simulator, progress-tracker,
      team-planner, tier-list-maker, patch-history, event — namespaces
      `tools.*`/`progress.*`.
      (Historique des portés : 19-20/07, cf. DONE — socle `TierListTool`,
      routeur à plat, coupon-codes = renvoi `/coupons`,
      gear-usage-statistics & gear-usage-finder = agrégation gear-reco à la
      lecture.)
- [ ] **`/characters/[slug]` — RELIQUAT** : la fiche détail est portée, il ne
      MANQUE que les **Discord reviews** (section review communautaire de la V2).
      **Bloqué sur la migration du bot Discord → VPS** — cf. l'entrée dédiée
      « Reviews Discord » dans ⚙️ Config / infra (infra + CSP + code V3).

## 🧪 Tests à écrire

- [ ] Les générateurs `datagen/generators/*` + `build.ts`/`refresh.ts` —
      le TRIO PRIORITAIRE (encounters/singularity/content-schedule) est
      COUVERT le 20/07 (28 tests, cf. DONE : cœurs purs en synthétique +
      invariants sur data/generated). RESTENT les autres générateurs
      (equipment, skills, towers-datagen, monad, goods, recruit, sources…) + build.ts/refresh.ts, même méthode. CONTRAINTE actée : la suite
      tourne SANS `.gamedata` (CI).
- [ ] `src/lib/admin/gamedata-store.ts` (dev-only, priorité moindre).

## 🧹 Dette code

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
- [ ] **Reviews Discord (`/characters/[slug]`) — CHANTIER BOT + CODE** (acté
      Sevih 20/07). La section « Reviews » de la V2 n'est PAS de la donnée du
      repo : c'est un `fetch` runtime `GET ${BOT_API_URL}/reviews/${slug}` vers un
      **bot Discord externe** qui agrège les avis du Discord EvaMains (V2 :
      `src/lib/data/reviews.ts`, `revalidate` 60 s ; renvoie `[]` si l'URL n'est
      pas jointe → dégradation propre). `.env.example` réserve déjà `BOT_API_URL`
      (« runtime, optionnel »).
      **① INFRA (bloqueur) — le bot migre lui aussi sur le VPS** : le déployer/
      rendre joignable depuis le réseau Docker interne (comme le cron de purge),
      poser `BOT_API_URL` en secret runtime. Tant que ce n'est pas fait, la
      section reste vide en prod.
      **② CSP** : `img-src` doit autoriser `cdn.discordapp.com` (avatars +
      emojis custom) — à intégrer à la passe CSP ci-dessus.
      **③ CODE V3 (dégradable proprement sans le bot)** : porter
      `lib/data/reviews.ts` (+ type `Review`) ; réécrire `ReviewsSection` sur les
      primitives V3 (V2 en `zinc/indigo/emerald`, `useI18n`, `.card`,
      `elementAccent` → tokens sémantiques, labels résolus serveur→props, hex
      élément via `detail/theme`, `<img>` + eslint-disable ; agrégats moyenne/
      distribution/pagination conservés) ; clés i18n `page.character.reviews.*`
      (cta, no_reviews, count, load_more, via_discord) ×4 langues ; câbler la
      section dans la slug page + entrée QuickToc.

## 📚 Docs à resynchroniser

- [ ] **CHANGELOG.md** (dev, racine — PAS `/changelog` du site, livré le 20/07) :
      le retard a grossi — 216 commits au 17/07, davantage depuis. Resync ou
      assouplir la règle PR qui l'exige.
- [ ] **`data/editorial/` non documenté nulle part** → CONVENTIONS.md
      « Données » + tableau des zones de datagen/README.
- [ ] **Locales : documenter le pré-seed** — une grosse part des clés (les
      namespaces des pages V2 pas encore portées, ×5 langues) n'a aucun
      consommateur ; chaque page est TRACÉE dans « Pages manquantes ». Soit
      l'assumer en tête de fichier, soit parquer les namespaces non portés dans
      un fichier d'attente pour que « clé inutilisée » redevienne un signal.
      (Cohérence structurelle inter-langues : parfaite — clés identiques ×5.)
      NB : le pool se résorbe avec les portages (tools/tierlist/changelog
      consomment désormais leurs clés).
- [ ] Doc ↔ code (reste 2 sites datagen) : doc de `slugTeam`
      (datagen/generators/skills.ts:113 — dit « undefined si CSV », le code
      prend le 1er token) ; exception `stageLabel` non documentée
      (datagen/generators/unlock-content.ts contredit son en-tête « jamais
      parser l'ID »). (face-icon.ts corrigé le 20/07 avec la purge du code
      mort ; `geas.ts` le 18/07 — cf. DONE.)

## 📦 Données V2 restant à porter (ex todo-data-v2)

Règle permanente : chaque `meta.bossId` d'un guide porté doit exister dans
`monsters.json` (le rendu JETTE sinon) — extraction à la demande
(`pnpm datagen:extract-entity`).

- [ ] Patch-notes : quand la PAGE sera portée, préfixer `NEXT_PUBLIC_IMG_BASE`
      sur les `src` relatifs stockés (`/images/patch-notes/…webp`).
- [ ] **Perso `lambda` (2000118) en attente dans l'extraction** (constat 20/07 :
      `datagen:promote` propose `characters.json +1` et `characters-slug-to-id
+1`) — promotion = décision de contenu (nouveau perso du jeu ?).

## 🤔 Décisions en attente (Sevih)

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
- [ ] `comics.json` : validé sans équivalent extrait (signalé par chaque
      `datagen:promote`) — à trancher (source runtime R2, cf. manifeste).

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
