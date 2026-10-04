# TODO

> Le « à faire » uniquement — le « fait » migre dans [DONE.md](./DONE.md)
> (décision Sevih 2026-07-17) ; une section vidée est retirée, son bilan vit
> là-bas.
> État de référence : **04/10/2026**. Les constats Haute et Moyenne des audits
> ([audit/](./audit/README.md)) sont soldés, hors ce qui figure ci-dessous ;
> les Basse (G26–G52, P6–P10) se traitent en passant sur les fichiers, les
> rapports font foi. 59 items ont été délégués à des agents entre le 25/09 et
> le 04/10 (table des commits,
> leçons et préambule réutilisable dans
> [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md)). Ce qui reste est du
> SEO non urgent, un chantier portraits et un test à jouer au prochain patch.

---

## 🔎 SEO — titres et descriptions (mesure du 04/10 sur le site servi, non urgent)

> Mesuré par `scripts/seo-lengths.ts` sur l'hôte anglais EN LIGNE, après le
> lot A28 : 574 pages du sitemap, 67 avec un écart (179 avant) ; aucun titre
> ni description absent, aucun doublon exact. Bornes : titre 30 à 60
> caractères, description 70 à 160. Rapport, avec les dix pires par type de
> page : `docs/seo&audit/titres-descriptions-outerpedia.com-2026-10-04.md`
> (dossier hors git, se régénère par `pnpm exec tsx scripts/seo-lengths.ts`).
> Les cinq autres langues ont les mêmes gabarits et se mesurent par `--host`.

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

## 🎴 Portraits animés

> Audit du 03/10 ([audit/portrait-fx.md](./audit/portrait-fx.md)) : P1 à P5
> corrigés, validés à l'écran et en ligne le 04/10.

- [ ] **Un contexte WebGL partagé par toutes les cartes** — le chantier de
      fond que l'audit désigne : chaque carte monte aujourd'hui son contexte
      et sa copie des textures (3 Mo par carte `_Demi` depuis le plafond à
      512, 18 avant). Il emporterait P6. Les constats Basse (P6–P10) se
      traitent en passant sur les fichiers.

## 🧪 À jouer au prochain patch

- [ ] **Dry-run du flux patch (lot F7, G12)** : le correctif n'a pas pu être
      joué sans tirer les données du jeu. Test manuel décrit dans l'entrée
      DONE du lot F7 (03/10) — un run à blanc ne doit plus laisser
      d'artefact damage bâti sur le `skills.json` d'avant le patch.

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
