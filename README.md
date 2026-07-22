# Outerpedia

Wiki communautaire pour le jeu **Outerplane** — le code qui fait tourner
[outerpedia.com](https://outerpedia.com).

Le site est statique et multilingue (en, fr, jp, kr, zh). Ses données de jeu ne
sont pas saisies à la main : elles sont **générées** depuis les tables du client
du jeu par un atelier maison (`datagen/`), puis committées comme artefacts — le
build ne fait que les consommer. Les images vivent hors du repo, sur Cloudflare
R2.

## Stack

- **Next.js** (App Router) · **React 19** · **TypeScript 5** · **Tailwind CSS 4**
- **Node 24** (voir `.nvmrc`) · **pnpm** (le repo n'a pas de `package-lock.json`)
- Déploiement : **Docker** → GHCR → VPS OVH, **Caddy** en frontal
- Données : JSON généré et committé (`data/generated/`), images sur **R2/CDN**,
  **MySQL** pour les rares features dynamiques (partage de tier-list, d'équipe)

## Démarrage (dev)

```bash
nvm use         # Node 24
pnpm install
pnpm dev        # clean:all → refresh des données (datagen) → next dev
```

Le repo se clone et se lance tel quel : les données générées sont committées.
La **régénération** depuis le jeu (`datagen:*`) demande en plus une aire
`.gamedata/` locale, qui n'est pas publiée — c'est un dump du client Android,
pas du code (voir [datagen/README.md](./datagen/README.md)).

- `pnpm test` — la suite Vitest (app + datagen)
- `pnpm commit` — publication guidée : contrôles (format/lint/typecheck/test)
  → bump de version → images R2 → commit + push (`scripts/commit.ts`)
- `pnpm build` — le build prod, **réservé à la CI** (cf. `datagen/README.md`)

## Documentation

- [CONVENTIONS.md](./CONVENTIONS.md) — commits, i18n, style, données
- [CLAUDE.md](./CLAUDE.md) — règles pour le dev assisté par IA
- [datagen/README.md](./datagen/README.md) — l'atelier de données (architecture, flux patch)
- [docs/procedure/](./docs/procedure/) — installation, patch du jeu, ajout de contenu
- [docs/TODO.md](./docs/TODO.md) · [docs/DONE.md](./docs/DONE.md) — le suivi du projet
- [CHANGELOG.md](./CHANGELOG.md) — journal des changements

L'infrastructure du serveur (Docker, Caddy, secrets, sauvegardes) vit dans un
repo d'Infrastructure-as-Code séparé, qui reste privé.

## Licence

Le code est publié sous licence [MIT](./LICENSE).

En revanche, **les données et les images du jeu ne m'appartiennent pas** :
_Outerplane_ et tous les assets qui en sont dérivés restent la propriété de
leur éditeur (Major9) et de leur développeur (VA Games). Ils sont ici à des
fins d'information communautaire ; la licence MIT ne couvre pas leur
réutilisation.

Ce projet n'est ni affilié à, ni approuvé par l'éditeur du jeu.
