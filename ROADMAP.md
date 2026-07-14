# Roadmap — outerpedia V3

Reconstruction propre, incrémentale, **sans coupure** (la V2 reste en ligne sur
l'ancien serveur jusqu'à la bascule finale).

Principe : on **bâtit l'échafaudage à neuf** (structure, pipeline, build, tests,
CI, docs) et on **porte le code applicatif prouvé** (pages, composants, i18n,
données de jeu) en le nettoyant au passage. Pas de réécriture de la logique métier.

Suivi détaillé : GitHub **Issues + Milestones** (un milestone par phase).

---

## Phase 0 — Fondations projet

> Le repo « comme un vrai projet ».

- [x] Repo privé + git init
- [x] README, ROADMAP, CHANGELOG, CONVENTIONS, CLAUDE.md
- [x] `.nvmrc` (Node 24), `.editorconfig`, `.gitignore`, `.gitattributes`
- [x] Templates issues / PR, Dependabot
- [x] Créer le repo privé GitHub + push
- [ ] Créer les milestones (un par phase)

## Phase 1 — Socle technique

> Une app Next vide qui se déploie de bout en bout (valide l'infra tôt).

- [x] Scaffold Next.js (App Router) + React 19 + TS + Tailwind 4
- [x] Config de base : `output: standalone`, headers de sécurité (portés de V2)
- [x] Config i18n portée (en, fr, jp, kr, zh — 4 officielles + fr communautaire)
- [x] Dockerfile multi-stage + `.dockerignore`
- [x] CI : lint + typecheck + build sur PR
- [x] CD : build → GHCR → **déploiement auto** sur le VPS via SSH (push → en ligne)
- [x] Hooks pre-commit + pre-push (lefthook)
- [x] Socle de tests (Vitest)

## Phase 2 — Architecture données & pipeline

> Le gros gain de simplicité (l'objectif maintenance).

- [x] Atelier `datagen/` : architecture + 3 zones (lib / data committé / .gamedata local)
- [x] **Pull** auto des données du jeu depuis LDPlayer (adb, incrémental, `datagen:pull`)
- [x] **Extract** des `.bytes` via AssetStudioModCLI wrappé (`datagen:extract`)
- [x] **Convert** `.bytes → JSON` en TS (parser testé, remplace python, `datagen:convert`)
- [x] Couche 1 : templates **typés** (types TS + coercition sur le JSON parsé)
- [x] Couche 2 : **primitives partagées** (résolution Text\*, ID↔nom↔slug, normalisation, stats)
- [x] Couche 3 : **générateurs** (18 générateurs TS dans `datagen/generators/`, factorisés)
- [x] Couche 4 : **contrats de sortie** typés · Couche 5 : **orchestration** (`build.ts` + `refresh.ts` + `promote.ts`)
- [x] Données générées **committées** comme artefacts (le build les consomme, **sans python**)

## Phase 3 — Assets (images)

> Alléger le repo définitivement.

- [x] Images hors repo → **Cloudflare R2 + CDN** (collecte `datagen/assets/collect.ts`,
      push `scripts/assets-push.mjs`, `pnpm images`)
- [x] Couche d'accès aux images (`src/lib/images.ts`, URLs CDN via `NEXT_PUBLIC_IMG_BASE`)
- [x] Repo allégé (aucune image committée — `public/images/` vide)

## Phase 4 — Portage de l'application

> Amener le code, domaine par domaine, en nettoyant.

- [x] Personnages / data access layer (`/characters`, curated + generated)
- [x] Équipement (`/equipment` : armes, armures, amulettes, talismans, EE, sets)
- [x] Guides — en cours : moteur porté (`/guides`, catégories, vues dédiées,
      versions de guides), portage du contenu au fil de l'eau
- [x] Panneau admin — **dev-only** (exclu du build prod) : extractor, editor,
      guides, tags, gear-presets, tools
- [ ] Tier-list (+ feature de partage / MySQL)
- [ ] Reste des pages + i18n complet
- [ ] Tests sur les flux critiques (calc de dégâts, etc.)
- [ ] Suppression du code mort au passage

## Phase 5 — Parité & bascule

> V3 == V2, puis on switch.

- [ ] Vérification de parité fonctionnelle V3 vs V2
- [ ] MySQL sur le VPS + migration des données
- [ ] Bascule DNS via Cloudflare
- [ ] Archivage du repo V2 (lecture seule)

---

## Décisions d'architecture (résumé)

| Sujet         | Décision                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Hébergement   | VPS OVH (Ubuntu 26.04), Docker, Cloudflare devant                       |
| Déploiement   | CI/CD GitHub Actions → image GHCR → le serveur tire l'image             |
| Build         | **Jamais de python** ; consomme des données déjà générées et committées |
| Images        | Hors repo, sur Cloudflare R2 + CDN                                      |
| Infra serveur | Décrite dans le repo séparé `sevih-tool` (Infrastructure-as-Code)       |
