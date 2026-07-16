# Outerpedia

Wiki communautaire pour le jeu **Outerplane** — refonte « V3 ».

> 🚧 **En construction.** Ce dépôt est la reconstruction propre d'outerpedia (ex
> `outerpediaV2`). Objectif : un projet maintenable, automatisé et déployé en
> Docker derrière Cloudflare. Voir [ROADMAP.md](./ROADMAP.md).

## Stack

- **Next.js** (App Router) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4**
- **Node 24** (voir `.nvmrc`)
- Déploiement : **Docker** → GHCR → VPS, **Cloudflare** en frontal
- Données : JSON généré et committé (`data/generated/`), images sur **R2/CDN**.
  MySQL prévu en **Phase 5** pour les features dynamiques (ex. partage de
  tier-list) — rien en base aujourd'hui.

## Démarrage (dev)

```bash
nvm use         # Node 24
pnpm install
pnpm dev        # clean:all → refresh des données (datagen) → next dev
```

- `pnpm test` — la suite Vitest (app + datagen).
- `pnpm commit` — publication guidée : contrôles (format/lint/typecheck/test)
  → bump de version → images R2 → commit + push. Voir `scripts/commit.ts`.

## Documentation

- [ROADMAP.md](./ROADMAP.md) — la feuille de route par phases
- [CHANGELOG.md](./CHANGELOG.md) — journal des changements
- [CONVENTIONS.md](./CONVENTIONS.md) — commits, branches, style, process
- [CLAUDE.md](./CLAUDE.md) — règles pour le dev assisté par IA
- [datagen/README.md](./datagen/README.md) — l'atelier de données (architecture, flux patch)
- [docs/procedure/newPatch.md](./docs/procedure/newPatch.md) — la procédure « patch du jeu »
- [docs/TODO.md](./docs/TODO.md) — le suivi unique (bugs, dette, data à porter, décisions)

## Statut

Projet **privé**. Tous droits réservés.
