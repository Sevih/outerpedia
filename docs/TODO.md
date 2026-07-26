# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code, puis nettoyé les 18, 19, 20, 21 et **26/07** : à chaque passe, le « fait »
> migre dans DONE et les sections vidées sont retirées — leur bilan vit là-bas, le
> garder ici en produirait une copie qui finirait par mentir.
> État de référence : **26/07**.
> Re-vérifier chaque item contre le code au moment de le traiter (le 26/07, cette
> relecture a corrigé deux chiffres périmés — cf. les items SEO et CHANGELOG).

---

## 🎯 PRIO (décision Sevih)

- [ ] **Ajouter la bannière Dimensional Supply au guide banner** (banner-mileage) —
      elle donne au max 4 segments jaunes sur un substat (cf. guide gear, onglet
      Bases) ; à documenter côté guide des bannières.
      VÉRIFIÉ le 26/07 : « Dimensional Supply » n'apparaît que dans
      `general-guides/gear/labels.ts` (la source de l'info), nulle part dans le
      guide des bannières. Toujours à faire.

## 📄 Pages manquantes (inventaire layout du 2026-07-17)

> Cibles du header/footer posés le 17/07 (contrat `src/lib/nav.ts`) — 404
> ASSUMÉES le temps du portage. Chaque page arrive avec ses clés de locale DÉJÀ
> pré-seedées ×5 (cf. item « pré-seed » de la section Docs). L'historique des
> portages (19-21/07) vit dans DONE.

- [ ] **`/tools` — RESTE 1 sous-outil : damage-calculator** — namespaces `tools.*`.
      CHANTIER EN COURS au 26/07, pas un terrain vierge : du travail non committé
      existe dans l'arbre (`tools/_contents/damage-calculator/`, plus
      `tools/registry.ts` et `data/curated/tools/_index.json` modifiés) et un
      worktree d'agent en contient aussi. À ÉVALUER avant de repartir de zéro.
      ⚠ SURTOUT NE PAS se baser sur la V2 pour cet outil (décision Sevih 22/07 :
      le calculateur V2 est foireux) — exception à la règle « V2 = oracle »,
      conception V3 native.

## 🧹 Dette code

### Bugs non urgents

- [ ] Sharp Adventurer's Talisman et Powerful Adventurer's Talisman ont des desc
      buggés (« Recovers [Value] Action Points when using an ultimate ») et je
      crois qu'ils n'ont pas d'effets +10 (à vérifier). _(note Sevih)_

### Lots de fond SEO/perf (audit Sitebulb 20/07 — non urgents)

> Le gros de l'audit est traité (cf. DONE 20-22/07). Ce qui suit est du VOLUME
> éditorial, pas du bug — ce n'est pas mécanisable. Détail : `docs/seo&audit/`.

- [ ] **Titles / meta descriptions courts** (572 / 135 pages au 20/07) — surtout
      les pages générées ; à arbitrer. Les 147 titres de GUIDES portent leur
      catégorie depuis le 22/07 (uniques et plus longs) ; restent les fiches
      perso, l'équipement et les pages d'outils.
- [ ] **Meta descriptions de guides GÉNÉRIQUES / dupliquées** — les familles à
      contenu templaté partagent une description identique, dans
      `_contents/<famille>/<slug>/meta.json`.
      RE-MESURÉ le 26/07 sur special-request, et c'est PIRE que ce que disait cet
      item : non pas une description partagée par 8 guides sur 10, mais DEUX
      (4× « Strategy guide for Special Request: Identification mission », 5×
      « … Ecology Study mission ») — seul `beatles` a une description propre à son
      boss, `chimera` non. Soit 9 génériques sur 10.
      Même motif probable ailleurs (adventure-license, irregular-extermination,
      dimensional-singularity…). Éditorial, famille par famille : une phrase par
      boss. NB : le nom du boss est fiable (résolu depuis `TextCharacter` du jeu),
      donc utilisable comme graine.

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
      le retard a encore grossi — **612 commits** au 26/07, contre 216 relevés le
      17/07, et le fichier en est toujours à `## [Non publié]`. Resync, ou
      assouplir la règle PR qui l'exige (la seconde option se défend : le journal
      de suivi interne vit dans DONE.md, qui est à jour).
- [ ] **Locales : documenter le pré-seed** — une grosse part des clés (les
      namespaces des pages V2 pas encore portées, ×5 langues) n'a aucun
      consommateur ; chaque page est TRACÉE dans « Pages manquantes ». Soit
      l'assumer en tête de fichier, soit parquer les namespaces non portés dans un
      fichier d'attente pour que « clé inutilisée » redevienne un signal.
      (Cohérence structurelle inter-langues : parfaite — clés identiques ×5.)
      NB : le pool se résorbe avec les portages.

## 🤔 Décisions en attente (Sevih)

- [ ] `TODO(guides)` de `datagen/extractor/version-monster.ts:16` : « Versionner »
      doit RÉ-ÉPINGLER les guides `<id>` → `<id>@<n>` — le domaine guides existe,
      c'est actionnable. (Vérifié présent dans le code le 26/07, également noté
      dans `datagen/README.md:215`.)

---

## 📌 Notes de référence (à ne pas perdre)

- **Assets d'événement : rien à pousser à la main.** La collecte
  (`datagen/assets/manifest.ts`, PAS `collect.ts` qui n'indexe que les sprites du
  jeu) est DATA-DRIVEN sur le curé : ajouter un événement en admin suffit, il n'y a
  aucune liste d'assets à tenir. `pnpm images` enchaîne collect + audio +
  wallpapers + comics + push — ce n'est pas une commande « événements », elle
  pousse TOUT ce qui est en attente.
- **Guide porté → son boss doit exister** : chaque `meta.bossId` d'un guide doit
  être dans `monsters.json`, sinon le rendu JETTE. Extraction à la demande
  (`pnpm datagen:extract-entity`).
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
- **Frontière `admin/`** : le chemin ne garantit rien, 6 modules shippent en prod
  (liste blanche BLOQUANTE `ADMIN_SHIPS_TO_PROD` dans `eslint.config.mjs`, audit
  F2). Les dossiers de briques `components/admin/editorial/` et
  `premium-limited/` ne peuvent pas importer de secret : c'est vérifié par eslint,
  pas par convention.
