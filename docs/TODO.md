# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🔎 SEO — les cinq autres langues

> Mesuré le 04/10 sur les cinq hôtes servis (574 pages chacun, rapports dans
> `docs/seo&audit/`). La mesure se fait en LARGEUR depuis le lot B17 (un
> caractère large compte 2) ; les textes sont passés par le lot B18 (détail
> et listes dans son entrée DONE du 04/10).

- [ ] **Remesurer les cinq hôtes une fois B17 et B18 en ligne**
      (`pnpm exec tsx scripts/seo-lengths.ts --host https://<langue>.outerpedia.com`).
      Attendu, d'après l'inventaire à la source : aucune description au-delà
      de 160 ; pages avec écart dans les bornes titre 60 / description 70 à
      160 : `fr` 22, `es` 10, `jp` 9, `kr` 8, `zh` 28.
- [ ] **Restes de B18, à trancher** : (1) titres français des Équipements
      exclusifs, onze au-delà de 60 dont quatre de 67 à 77 par la longueur du
      nom du jeu — « EE Outerplane » les ferait rentrer mais sort « Équipement
      exclusif » des 128 titres ; (2) descriptions sous 70 laissées parce que
      l'anglais ne dit rien de plus : `zh` 28, `kr` 7, `jp` 4 — les enrichir,
      c'est écrire plus que l'anglais ; (3) titres sous 30, hors bornes du
      lot : `zh` 6, `kr` 1, `jp` 1. Les autres titres au-delà de 60 (`fr` 11,
      `es` 10, `jp` 5, `kr` 1) débordent de 1 à 14 par le nom seul, acceptés
      comme les six anglais.

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
