# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🔎 SEO — les cinq autres langues

> Mesuré le 04/10 sur les cinq hôtes servis (574 pages chacun, rapports dans
> `docs/seo&audit/`). La mesure se fait en LARGEUR depuis le lot B17 (un
> caractère large compte 2) ; reste B18, les textes.

- [ ] **Textes hors bornes (lot B18)** : `fr` 22 titres au-delà de 60 et 46
      descriptions au-delà de 160 ; `es` 12 titres et 65 descriptions. En
      largeur, estimé par B17 depuis les rapports (détail dans son entrée
      DONE du 04/10) : `jp` 5 à 7 pages, `kr` une dizaine, `zh` 140 à 175
      dont une centaine par le seul gabarit de description des fiches de
      personnage. Guides (`meta.json`), pages à un segment et catégories
      (locales), gabarits des fiches. À remesurer sur les hôtes une fois B17
      en ligne : les titres trop larges ne se lisent pas dans les rapports
      du 04/10.

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
