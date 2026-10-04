# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🔎 SEO — titres et descriptions (non urgent)

> Mesure : `pnpm exec tsx scripts/seo-lengths.ts` (bornes : titre 30 à 60
> caractères, description 70 à 160). Rapport dans `docs/seo&audit/`.
> Le lot A29 (code et locales) est fait ; reste le lot B16 (`meta.json` des
> guides), écrit dans [lots-opus-2026-09-25.md](./lots-opus-2026-09-25.md).
> Les six titres de fiches de 61 à 64 caractères sont acceptés tels quels.

- [ ] **Guides, descriptions courtes** — semi-mécanisable. 21 descriptions
      sous 70 (44 à 69), toutes dans `adventure-license` (21 guides sur 26) :
      une phrase type recopiée dans chaque `meta.json` (« Tips and advice to
      succeed against X »). Une phrase plus riche par famille (promotion,
      conquête hebdo), dans les six langues.
- [ ] **Guides, descriptions longues** — VOLUME ÉDITORIAL. 24 descriptions
      au-delà de 160 (jusqu'à 218), longues dans le `meta.json` lui-même :
      `dimensional-singularity` 15 sur 15, `special-request` 4,
      `general-guides` 2, `other` 2, `adventure` 1. À réécrire à la main, ou à
      accepter : un moteur coupe une description trop longue, la page n'y
      perd que la fin de la phrase. (Les 5 `special-request` qui ne
      débordaient que par le préfixe « {boss} — » : FAIT, lot A29.)

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
