# Claude Code — Instructions (outerpedia)

Jeu : **Outerplane**. Wiki communautaire — le code de [outerpedia.com](https://outerpedia.com).

## Règles critiques

- Répondre en **français** ; identifiants de code en **anglais**, **commentaires en français** (pratique constatée de tout le codebase, règle alignée le 2026-07-14).
- Ne pas créer de fichiers sans nécessité — préférer éditer l'existant.
- Penser **responsive desktop + mobile** dès le départ.
- Respecter [CONVENTIONS.md](./CONVENTIONS.md) (commits, i18n, style, données).
- **Ne jamais lancer `pnpm dev`** : c'est Sevih qui tient le serveur de dev, et
  la commande déclenche un refresh complet des données du jeu.

## Contexte projet

- Le site est en production ; le suivi vit dans [docs/TODO.md](./docs/TODO.md)
  (le « à faire ») et [docs/DONE.md](./docs/DONE.md) (le journal du fait). Un
  item traité migre de l'un à l'autre **dans le commit qui le traite**.
- Le repo est **autonome** : l'ancien dépôt `outerpediaV2`, dont ce projet a
  repris le contenu, est archivé et n'est plus ni source ni référence
  (migration close le 2026-07-22).

## Shell

- **PowerShell** sous Windows (Bash disponible en secondaire) — pas de syntaxe
  CMD (`>nul`, `chcp`).
- Python = `python` (une seule utilisation, cf. ci-dessous).
- **pnpm uniquement** — pas de `package-lock.json` dans ce repo, `npm install`
  y échoue.

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
- Ne jamais éditer `data/generated/` à la main : c'est une sortie de pipeline.
  Les décisions humaines vont dans `data/curated/`.

## Architecture

- Routing : pas de `middleware.ts` (voir la stratégie de proxy du projet).
- Le panneau admin est **dev-only** : fichiers `.dev.tsx`/`.dev.ts` absents du
  build de prod, doublés d'un garde `IS_DEV`. Ne pas retirer l'un des deux.
- Mettre à jour la navigation centrale quand on ajoute des pages.
