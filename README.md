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
- Données : **MySQL** (features dynamiques, ex. partage de tier-list)

## Démarrage (dev)

> Sera complété en Phase 1 (scaffold de l'app).

```bash
nvm use         # Node 24
npm install
npm run dev
```

## Documentation

- [ROADMAP.md](./ROADMAP.md) — la feuille de route par phases
- [CHANGELOG.md](./CHANGELOG.md) — journal des changements
- [CONVENTIONS.md](./CONVENTIONS.md) — commits, branches, style, process
- [CLAUDE.md](./CLAUDE.md) — règles pour le dev assisté par IA

## Statut

Projet **privé**. Tous droits réservés.
