# Claude Code — Instructions (outerpedia V3)

Jeu : **Outerplane**. Wiki communautaire. Reconstruction propre de la V2.

## Règles critiques

- Répondre en **français** ; **code et commentaires en anglais**.
- Ne pas créer de fichiers sans nécessité — préférer éditer l'existant.
- Penser **responsive desktop + mobile** dès le départ.
- Respecter [CONVENTIONS.md](./CONVENTIONS.md) (commits, i18n, style, données).

## Contexte projet

- Reconstruction depuis l'ancien repo `outerpediaV2` (archivé, dispo en lecture
  pour le `git blame` historique). On **porte** le code prouvé en le nettoyant,
  on ne réécrit pas la logique métier.
- Voir [ROADMAP.md](./ROADMAP.md) pour la phase en cours.

## Shell

- **Git Bash** sous Windows — pas de syntaxe CMD (`>nul`, `chcp`).
- Python = `python`.

## Build & données

- Le **build ne doit jamais dépendre de python** : il consomme des données déjà
  générées et committées. La génération (python + datamine) est une étape
  **locale et manuelle**, séparée du build.
- Ne jamais éditer `data/generated/` à la main.

## Architecture

- Routing : pas de `middleware.ts` (voir la stratégie de proxy du projet).
- Mettre à jour la navigation centrale quand on ajoute des pages.
