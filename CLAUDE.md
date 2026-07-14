# Claude Code — Instructions (outerpedia V3)

Jeu : **Outerplane**. Wiki communautaire. Reconstruction propre de la V2.

## Règles critiques

- Répondre en **français** ; identifiants de code en **anglais**, **commentaires en français** (pratique constatée de tout le codebase, règle alignée le 2026-07-14).
- Ne pas créer de fichiers sans nécessité — préférer éditer l'existant.
- Penser **responsive desktop + mobile** dès le départ.
- Respecter [CONVENTIONS.md](./CONVENTIONS.md) (commits, i18n, style, données).

## Contexte projet

- Reconstruction depuis l'ancien repo `outerpediaV2` (archivé, dispo en lecture
  pour le `git blame` historique). On **porte** le code prouvé en le nettoyant,
  on ne réécrit pas la logique métier.
- Voir [ROADMAP.md](./ROADMAP.md) pour la phase en cours.

## Shell

- **PowerShell** sous Windows (Bash disponible en secondaire) — pas de syntaxe
  CMD (`>nul`, `chcp`).
- Python = `python` (une seule utilisation, cf. ci-dessous).

## Les 3 verbes

- `pnpm dev` — clean:all → refresh des données (`scripts/dev-refresh.ts`) →
  `next dev`.
- `pnpm commit` — publication guidée : contrôles (format/lint/typecheck/test) →
  bump de version → images R2 → commit + push (`scripts/commit.ts`).
- `pnpm build` — le build prod, **réservé à la CI** (un build local casse les
  types du dev, cf. datagen/README).

## Build & données

- Le **build ne doit jamais dépendre de python** : il consomme des données déjà
  générées et committées. La génération est du **TypeScript** (`datagen/`,
  locale, séparée du build) — voir [datagen/README.md](./datagen/README.md).
  Unique exception python : `datagen/assets/extract-face-layout.py` (local,
  hors build).
- Ne jamais éditer `data/generated/` à la main.

## Architecture

- Routing : pas de `middleware.ts` (voir la stratégie de proxy du projet).
- Mettre à jour la navigation centrale quand on ajoute des pages.
