# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🔎 SEO — titres et descriptions (non urgent)

> Mesure : `pnpm exec tsx scripts/seo-lengths.ts` (bornes : titre 30 à 60
> caractères, description 70 à 160). Rapport dans `docs/seo&audit/`.

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

> Rapport : [audit/portrait-fx.md](./audit/portrait-fx.md).

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
