# Conventions

## Langue

- **Documentation** (README, roadmap, issues...) : français.
- **Code et commentaires** : anglais.

## Commits — Conventional Commits

Format : `type(scope): description courte à l'impératif`

Types : `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`,
`chore`, `style`.

Exemples :
```
feat(tierlist): add share-by-link feature
fix(i18n): correct broken key in jp locale
chore(deps): bump next to 16.2.0
```

Un commit = un changement cohérent. Les messages alimentent le CHANGELOG.

## Branches & PR

- `main` = toujours déployable.
- Travail sur des branches `type/sujet` (ex. `feat/admin-auth`).
- Une PR par sujet ; la CI doit être verte (lint + typecheck + tests + build)
  avant merge.
- Mettre à jour le `CHANGELOG.md` (section « Non publié ») dans la PR.

## Style de code

- **Tailwind : classes canoniques** — jamais `h-[72px]` si `h-18` existe.
  Vérifier l'échelle Tailwind v4 avant d'utiliser une valeur arbitraire `[Xpx]`.
- **Images** : `.webp` dans les composants ; `.jpg`/`.png` pour les métadonnées
  (OG/Twitter) — certains crawlers ne gèrent pas le webp.
- **Slugs** en kebab-case, identifiants primaires — ne jamais filtrer/grouper
  sur des champs localisés.

## i18n

- Langues : `en`, `jp`, `kr`, `zh` — définies dans **une seule source** de vérité.
  Ne jamais coder en dur la liste des langues ailleurs.
- Fichiers de locale : **alignement par ligne** (mêmes clés/commentaires aux
  mêmes numéros de ligne dans les 4 langues).
- Pas de clés i18n dupliquées — vérifier avant d'en créer.
- Les balises inline (`{B/...}`, `{D/...}`, etc.) restent **identiques** dans
  toutes les langues.

## Données

- Données de jeu dans `data/` (pas dans `src/`).
- `data/generated/` = produit par le pipeline. Politique de commit décidée en
  Phase 2 (les artefacts générés seront committés pour un build sans python).
- Passer par la **data access layer** (`src/lib/data/`) — ne jamais importer le
  JSON directement pour les données de jeu.
