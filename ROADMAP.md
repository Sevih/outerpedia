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
- [ ] Config i18n portée (en, fr, jp, kr, zh — 4 officielles + fr communautaire)
- [ ] Dockerfile multi-stage + `.dockerignore`
- [ ] CI : lint + typecheck + build sur PR
- [ ] CD : build → GHCR → déploiement VPS (un « hello world » en ligne)
- [ ] Hooks pre-commit (lint-staged)

## Phase 2 — Architecture données & pipeline

> Le gros gain de simplicité (l'objectif maintenance).

- [ ] **Séparer** « génération de données » (local, python + datamine, manuel)
      du « build site » (CI, déterministe, **sans python**)
- [ ] Données générées **committées** comme artefacts (le build les consomme)
- [ ] Pipeline réorganisé, documenté, étapes claires
- [ ] Tests des transforms de données

## Phase 3 — Assets (images)

> Alléger le repo définitivement.

- [ ] Sortir les ~20k images du repo → **Cloudflare R2 + CDN**
- [ ] Couche d'accès aux images (URLs CDN)
- [ ] Repo allégé (de ~4 Go à quasi rien)

## Phase 4 — Portage de l'application

> Amener le code, domaine par domaine, en nettoyant.

- [ ] Personnages / data access layer
- [ ] Guides
- [ ] Tier-list (+ feature de partage / MySQL)
- [ ] Panneau admin
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
