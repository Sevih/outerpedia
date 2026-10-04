# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17). Réécrit le **2026-07-17** après audit complet du
> code, puis nettoyé les 18, 19, 20, 21 et **26/07** : à chaque passe, le « fait »
> migre dans DONE et les sections vidées sont retirées — leur bilan vit là-bas, le
> garder ici en produirait une copie qui finirait par mentir.
> Le **24/08**, l'item PRIO (Dimensional Supply au guide des bannières) est parti
> dans DONE avec la refonte in-game qu'il attendait, et sa section — vide — a
> suivi.
> État de référence : **26/07** — la migration du 24/08 n'était PAS une passe de
> relecture, les items ci-dessous n'ont pas été re-vérifiés contre le code depuis.
> Re-vérifier chaque item contre le code au moment de le traiter (le 26/07, cette
> relecture a corrigé deux chiffres périmés — cf. l'item SEO ; l'autre, le
> CHANGELOG, est tranché depuis : gelé, cf. DONE 03/08).
> Le **07/09**, l'audit transverse ([audit/transverse.md](./audit/transverse.md),
> constats G1–G52) a ajouté sa propre section ci-dessous — ces items-là SONT
> vérifiés contre le code (chaque Haute/Moyenne re-lu de première main ce
> jour-là).
> Le **25/09** et le **03/10**, 38 items assez cadrés pour un agent Opus ont
> été délégués et soldés (table des commits, leçons et préambule réutilisable
> dans [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md)). Ce qui reste
> ci-dessous demande une décision, un test physique ou une relecture d'abord ;
> restent deux lots écrits au même endroit (F6, F7).

---

## 🧹 Dette code

> L'audit du 07/08 est **entièrement traité** — hors volet damage, qui a son
> backlog séparé : [audit/damage-calculator.md](./audit/damage-calculator.md)
> (**D1–D5**). Bilan, y compris les constats tombés à la vérification, dans
> [DONE.md](./DONE.md).

### Lots de fond SEO/perf (mesure du 04/10 sur le site servi — non urgents)

> Mesuré par `scripts/seo-lengths.ts` (lot A27) sur l'hôte anglais : 574 pages
> du sitemap, 179 avec un écart ; aucun titre ni description absent, aucun
> doublon exact. Bornes : titre 30 à 60 caractères, description 70 à 160.
> Rapport, avec les dix pires par type de page :
> `docs/seo&audit/titres-descriptions-outerpedia.com-2026-10-04.md` (dossier
> hors git, se régénère par `pnpm exec tsx scripts/seo-lengths.ts`). Les cinq
> autres langues ont les mêmes gabarits et se mesurent par `--host` — des
> textes plus longs en fr/es, d'autres bornes utiles en jp/kr/zh. Presque tout
> tient à un GABARIT, pas à du volume éditorial. Décision Sevih 04/10 : quand
> un titre déborde, on retire « | Outerpedia » — FAIT le 04/10 (lot A28, cf.
> DONE) : 115 titres au-delà de 60 tombent à 7, les 12 descriptions trop
> longues des fiches d'équipement à 0. Mesuré sur le serveur local ; la mesure
> sur le site servi est à refaire après déploiement.

- [ ] **Titres encore au-delà de 60 SANS le suffixe (7 pages, 61 à 64)** — À
      TRANCHER. Le nom et le gabarit débordent à eux seuls, « | Outerpedia »
      est déjà retiré (lot A28) : `/equipment/the-book-of-folk-and-tall-tales`
      (64), `/equipment/secret-sword-teru-teru-bouzu` et
      `/equipment/the-supreme-witchs-companion` (62),
      `/equipment/knights-special-great-sword` (61),
      `/characters/kitsune-of-eternity-tamamo-no-mae` (63),
      `/characters/summer-knights-dream-ember` (61),
      `/guides/joint-challenge/koh-meteos` (61 — « Joint Challenge » y est deux
      fois, dans le titre du guide et dans le suffixe de catégorie). Ce qu'on
      retire alors (« Outerplane », le type, « Guide ») est un autre choix que
      celui du 04/10 ; ou on accepte, un moteur coupe la fin.
- [ ] **Guides, descriptions courtes** — semi-mécanisable. 21 descriptions
      sous 70 (44 à 69), toutes dans `adventure-license` (21 guides sur 26) :
      une phrase type recopiée dans chaque `meta.json` (« Tips and advice to
      succeed against X »). Une phrase plus riche par famille (promotion,
      conquête hebdo), dans les six langues.
- [ ] **Guides, descriptions longues** — VOLUME ÉDITORIAL. 29 descriptions
      au-delà de 160 (jusqu'à 218). 24 sont longues dans le `meta.json`
      lui-même : `dimensional-singularity` 15 sur 15, `special-request` 4,
      `general-guides` 2, `other` 2, `adventure` 1. Les 5 autres sont des
      `special-request` (151 à 160 à la source) qui ne débordent que par le
      préfixe « {boss} — » de `generateMetadata`. À réécrire à la main, ou à
      accepter : un moteur coupe une description trop longue, la page n'y
      perd que la fin de la phrase.
- [ ] **Catégories de guides (`/guides/*`, 11 pages)** — MÉCANISABLE. 8 titres
      sous 30 (22 à 28) : le titre est le seul libellé de la catégorie
      (« Adventure | Outerpedia »). Un gabarit du genre « {catégorie} Guides —
      Outerplane » les sort tous ; descriptions bonnes (96 à 150). Pas dans
      le lot A28 : sa règle retire un suffixe, elle n'allonge rien.
- [ ] **Pages à un segment (`/*`, 28 pages)** — petit volume éditorial. 8
      descriptions sous 70 (40 à 68) : sept outils (`/ost`, `/team-planner`,
      `/4-comics`, `/tierlistpvp`, `/wallpapers`, `/hero-tracker`,
      `/patch-history`) et `/event`, une clé `tools.<slug>.meta_description`
      chacun, six langues. 1 titre sous 30 : `/changelog` (« Changelog |
      Outerpedia », 22), clé `changelog.title`, qui sert aussi de `<h1>`.
- [ ] **Événements (`/event/*`, 1 page)** — éditorial, une ligne :
      `/event/20260324-video` reprend le `summary` de l'événement (211
      caractères) comme description. Soit un résumé plus court, soit une coupe
      dans `generateMetadata` pour les suivants.

## 🔎 Audit transverse du 07/09 (constats G1–G52)

> Source : [audit/transverse.md](./audit/transverse.md) — le rapport porte les
> lignes exactes, les vérifications et les correctifs détaillés ; ici, le « à
> faire » en clair, par lot. Le calculateur de dégâts (D1–D5) et la découpe des
> gros composants ne sont PAS ici : ils ont déjà leur item ou leur backlog.
> **S1** (limitation de débit) est TRAITÉ le 03/10 côté code, cf. DONE ; reste à
> recréer le conteneur Caddy sur le VPS.

### Lot 2 — métier, données, outillage

- [ ] Chips à lien au toucher (G4) : CORRIGÉ le 03/10 (cf. DONE), à revoir
      sur téléphone une fois poussé — premier appui la bulle, second la fiche.

### Audit des portraits animés (03/10, P1–P10 — les quatre Moyenne)

Rapport : [`docs/audit/portrait-fx.md`](./audit/portrait-fx.md). Aucun Haute.
P1, P3, P4 et P5 sont corrigés et validés à l'écran (04/10, cf. DONE). Les
Basse (P6–P10) et la dette se traitent en passant sur les fichiers.

- [ ] 18 Mo de textures GPU par carte `_Demi` (P2, lot F9) : plafond à 512
      prêt, rendu validé par Sevih le 04/10 sur la page de contrôle. Reste à
      lancer : `pnpm datagen:portrait-fx`, puis `pnpm images`. Le correctif de
      fond — un contexte partagé pour toutes les cartes — reste un chantier,
      il emporterait P6.

---

## 📌 Notes de référence (à ne pas perdre)

- **Damage calculator : SURTOUT NE PAS se baser sur la V2** (décision Sevih
  22/07 : le calculateur V2 est foireux) — exception à la règle « V2 =
  oracle », conception V3 native. Vaut pour toute évolution future du moteur
  (l'outil est PUBLIC depuis le 25/08, item de portage soldé — cf. DONE).

- **Warnings Turbopack au build (« overly broad patterns » sur guides.ts,
  « unexpected file in NFT list ») : BÉNINS, mesurés le 26/07.** Le scan FS des
  guides fait tracer tout le projet → ~16 Mo embarqués à tort dans l'image
  (src 11 Mo + datagen 3 Mo + docs 1,4 Mo), négligeable vs les 1,6 Go du
  `.next` légitime (1584 pages SSG). Le runtime, lui, est garanti par
  `outputFileTracingIncludes`. Si le temps de build ou l'image dérivent un
  jour : annotations `/*turbopackIgnore: true*/` sur les `resolve()` de
  guides.ts (sans risque, l'inclusion étant déclarée à la main).

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
