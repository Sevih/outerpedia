# Changelog

Tous les changements notables de ce projet sont documentés ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Fondations du projet V3 : README, ROADMAP, conventions, hygiène de dépôt
  (templates, Dependabot, editorconfig, nvmrc).
- Socle technique : app Next.js 16 (App Router) + React 19 + TS + Tailwind 4,
  config (output standalone, headers de sécurité), ESLint + Prettier, pnpm.
- Dockerfile multi-stage (pnpm, standalone, non-root) + `.dockerignore`.
- CI/CD GitHub Actions : checks (lint/typecheck/build) + build & push image GHCR.

[Non publié]: https://github.com/Sevih/outerpedia/commits/main
