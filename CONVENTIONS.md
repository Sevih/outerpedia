# Conventions

## Langue

- **Documentation** (README, roadmap, issues...) : français.
- **Code** (identifiants, noms de fichiers) : anglais. **Commentaires** : français — c'est la pratique de tout le codebase ; la règle « commentaires en anglais » ne l'a jamais été (alignée le 2026-07-14).
- **Ni « V2 » ni « V3 » dans les commentaires** (purgés le 2026-08-15, ~500
  occurrences). Ces numéros ne désignent plus rien de consultable : le dépôt
  `outerpediaV2` est archivé. Écrire ce que la chose EST — « l'ancien site »,
  « format hérité », « inchangé », « auparavant », « nos tokens » — et garder la
  raison intrinsèque plutôt que la comparaison : « max-w-6xl : les vues
  dimensionnent leurs cartes en % du conteneur », pas « même largeur que la V2 ».
  Le nom `outerpediaV2` reste écrit quand il désigne le dépôt lui-même.

## Commits — Conventional Commits

Format : `type(scope): description courte à l'impératif`

Types : `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`,
`chore`, `style`, `revert` (celui que `scripts/commit.ts` accepte — la liste et
l'outil disent la même chose).

Exemples :

```
feat(tierlist): add share-by-link feature
fix(i18n): correct broken key in jp locale
chore(deps): bump next to 16.2.0
```

Un commit = un changement cohérent. Les messages sont, avec
[docs/DONE.md](./docs/DONE.md), le journal du projet — le `CHANGELOG.md` racine
est GELÉ (cf. son en-tête) ; s'il reprend un jour du service, il se
reconstruira de ce log, d'où le format verrouillé.

**Stager par chemins explicites** — jamais `git add -A` ni `git add <dossier>` :
un dossier entier embarque le travail en cours d'à côté. Et jamais de fichier à
moitié stagé : combiné à prettier au pre-commit, lefthook peut échouer à
restaurer son stash et perdre les modifications non stagées.

**Un commit de travail embarque la mise à jour de [docs/DONE.md](./docs/DONE.md)**
(et le retrait de l'item dans [docs/TODO.md](./docs/TODO.md)) : le suivi part
avec le changement qu'il décrit, pas dans un commit de docs séparé. Corollaire :
l'entrée DONE ne cite pas le hash du commit, inconnu au moment de l'écrire.

## Branches & PR

- `main` = toujours déployable, et le mainteneur y committe directement.
- Pour une contribution extérieure ou un gros chantier : une branche
  `type/sujet` (ex. `feat/admin-auth`), une PR par sujet, la CI verte
  (lint + typecheck + tests + build) avant merge.
- Mettre à jour `docs/DONE.md` dans le commit (cf. § Commits) — pas le
  `CHANGELOG.md` racine, gelé.

## Style de code

- **Tailwind : classes canoniques** — jamais `h-[72px]` si `h-18` existe.
  Vérifier l'échelle Tailwind v4 avant d'utiliser une valeur arbitraire `[Xpx]`.
- **Images** : `.webp` dans les composants ; `.jpg`/`.png` pour les métadonnées
  (OG/Twitter) — certains crawlers ne gèrent pas le webp.
- **`<img>` brut, pas `next/image`** — `next.config.ts` pose
  `images.unoptimized: true` (assets servis par R2, déjà en `.webp`
  pré-dimensionné) : `<Image />` n'y émettrait qu'un `<img>` nu. La règle
  `@next/next/no-img-element` est éteinte une fois dans `eslint.config.mjs` —
  **ne pas remettre de `eslint-disable-next-line`** au-dessus des `<img>`.
  Poser en revanche `width`/`height` quand la taille est connue (CLS).
- **`alt` : décoratif = `alt="" aria-hidden`** — une icône DOUBLÉE par son nom en
  texte adjacent (portrait + nom, icône de nav + libellé, drapeau + abréviation)
  est décorative : lui donner un `alt` ferait annoncer le nom DEUX FOIS par un
  lecteur d'écran. L'`alt` descriptif est pour l'image qui porte seule
  l'information (cf. `CharacterPortrait`, où le portrait est la seule identité
  du perso quand `showName` est coupé). Un audit externe compte l'`alt` vide
  comme « manquant » (Sitebulb, 2026-07-22 : 27 267 instances, 476 images
  distinctes, **aucun défaut réel** — zéro `<img>` sans attribut `alt` dans le
  repo) : ne pas « corriger » ce faux positif.
- **Slugs** en kebab-case, identifiants primaires — ne jamais filtrer/grouper
  sur des champs localisés.

## i18n

- Langues : `en`, `jp`, `kr`, `zh`, `fr`, `es` — définies dans **une seule
  source** de vérité (`LANGUAGES`, `src/lib/i18n/config.ts`). Ne jamais coder en
  dur la liste des langues ailleurs. Côté données, `GAME_LANGS`
  (`datagen/lib/lang.ts`) en est le sous-ensemble officiel, aligné par le type ;
  un dict vide ou uniforme se construit avec `emptyDict()` / `uniformDict()`,
  jamais en littéral.
- Distinction **officiel vs communautaire** (`isOfficial`) :
  - **officielle** : le jeu fournit les données → contenu de jeu traduit (noms,
    skills, items). Les six langues le sont depuis le 2026-09-23 (le client a
    livré le français et l'espagnol).
  - **communautaire** : UI traduite, mais **pas** de données de jeu → fallback
    sur EN pour le contenu de jeu. Plus aucune aujourd'hui (le `fr` l'a été
    jusqu'au 2026-09-23) ; le mécanisme reste pour la prochaine.
- L'**éditorial** (curés, `labels.ts` des guides, `meta.json`, JSON des guides)
  est typé `LocalizedText`, PARTIEL avec repli EN : une langue peut y manquer
  sans rien casser. Il est traduit dans les six langues depuis le 2026-09-23
  (passe Sonnet 5 sur ~4 700 textes, balises inline masquées et vérifiées) ;
  un nouveau texte s'écrit en anglais puis se traduit par l'outil admin
  (DeepL/Haiku, `es` compris) — ne pas laisser une langue en repli par habitude.
  Conventions de traduction : le jargon commun reste en anglais dans toutes les
  langues (DPS, AoE, buff/debuff, gear, build, tier, clear, ATK/DEF/HP/SPD…,
  S1/S2/S3, FAQ) ; en français les CLASSES restent en anglais (Striker,
  Defender…) et les éléments en français ; en espagnol on suit le vocabulaire
  officiel du jeu (Atacante, Defensor, Mago, Sanador ; Fuego, Agua…).
- Fichiers de locale : **mêmes clés, même ordre, mêmes commentaires** dans
  toutes les langues — c'est `locales/keys.test.ts` qui le garantit (clés
  identiques, chaque clé consommée). L'ancien « alignement par numéro de ligne »
  n'est plus tenable : prettier replie les chaînes longues différemment selon la
  langue.
- Pas de clés i18n dupliquées — vérifier avant d'en créer.
- Les balises inline (`{B/...}`, `{D/...}`, etc.) restent **identiques** dans
  toutes les langues.

## Données

- Données de jeu dans `data/` (pas dans `src/`).
- `data/generated/` = produit par le pipeline, et **committé** : le build le
  consomme tel quel, sans python ni accès aux données du jeu.
- `data/editorial/` = les assets que le wiki produit lui-même (absents du jeu),
  versionnés ici parce qu'ils sont des SOURCES ; la collecte les pousse sur R2.
- Passer par la **data access layer** (`src/lib/data/`) — ne jamais importer le
  JSON directement pour les données de jeu.

### Documenter un curé (`data/curated/`)

Un curé porte une décision HUMAINE : il doit dire pourquoi, dans le fichier
lui-même (le JSON n'accepte pas de commentaire). Deux niveaux, à ne pas
confondre — convention uniformisée le 2026-07-21 :

- **`_doc` à la racine** = à quoi sert le fichier et la règle de curation. Une
  section non évidente prend son propre `_docXxx` juste avant elle
  (`_docDifficulties`, `_docIgnore`, `_docChipAdd`…). Le préfixe `_` signe la
  MÉTA : les loaders ne lisent que les clés qu'ils connaissent, donc ces clés
  traversent le pipeline sans effet — vérifier quand même le loader avant d'en
  ajouter une à un curé validé par schéma.
- **`note` DANS une entrée** = justification de CETTE entrée (pourquoi cet item
  est masqué, pourquoi ce pont type→statut). Ex. `effects.json`, `items.json`.
  À ne pas renommer : c'est de la donnée par entrée, pas de la doc de fichier.

Un curé dont la forme parle d'elle-même (`tags.json`, `characters.json`…) peut
se passer de `_doc` ; dès qu'une clé encode un arbitrage, elle se documente.
