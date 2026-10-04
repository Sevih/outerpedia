# TODO

> Le « à faire » uniquement. Le « fait », son contexte et les notes vont dans
> [DONE.md](./DONE.md) ; une section vidée est retirée.

---

## 🔎 SEO — les cinq autres langues

> L'anglais est dans les bornes (lots A28, A29, B16, cf. DONE). Les autres
> hôtes n'ont jamais été mesurés sur le site servi.

- [ ] **Mesurer `fr`, `es`, `jp`, `kr`, `zh`** une fois A29 et B16 en ligne :
      `pnpm exec tsx scripts/seo-lengths.ts --host https://fr.outerpedia.com`
      (et les quatre autres). Déjà connu, relevé le 04/10 dans les `meta.json`
      des guides que B16 n'a pas touchés (leur anglais était bon) :
      descriptions au-delà de 160 en `es` (43 guides) et `fr` (25), surtout
      `adventure` ; au-delà de 80 en `kr` (25) et `jp` (9) — borne à 80 parce
      que ces caractères sont deux fois plus larges, c'est un choix, pas une
      règle du jeu. Les titres par langue sont inconnus tant que la mesure
      n'est pas faite.

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
