# Changelog

Tous les changements notables de ce projet sont documentés ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et le projet suit le [versionnage sémantique](https://semver.org/lang/fr/).

## [Non publié]

> Le dépôt n'a pas encore de tag git : tout l'historique (~130 commits) vit ici,
> résumé par thème. Un découpage par version sera fait au premier tag.

### Ajouté

**Fondations & socle**

- Fondations du projet V3 : README, ROADMAP, conventions, hygiène de dépôt
  (templates, Dependabot, editorconfig, nvmrc).
- Socle technique : app Next.js 16 (App Router) + React 19 + TS + Tailwind 4,
  config (output standalone, headers de sécurité), ESLint + Prettier, pnpm.
- Hooks Git (lefthook), socle de tests (Vitest), i18n 5 langues (en/fr/jp/kr/zh).

**Datagen (atelier de données, tout-TS)**

- Pull incrémental depuis LDPlayer (adb, détection md5/hash), extraction
  AssetStudioModCLI, parser `.bytes → JSON` en TS (remplace les scripts python).
- Les 5 couches : templates typés, primitives partagées (`datagen/lib/`),
  18 générateurs (`datagen/generators/` : characters, skills, effects, items,
  equipment, enhance, monsters/bosses, monster-skills, encounters, towers,
  singularity, content-schedule, unlock-content, progression, sources, goods,
  item-catalog, game-version), contrats typés (`datagen/contracts/`),
  orchestration `build.ts` + `refresh.ts` + `promote.ts`.
- Extracteur **déclaratif** (`datagen/extractor/` : specs character/monster,
  intégration ciblée, oracle de cohérence `datagen:coherence`, contrôle V2).
- Promotion avec **rétention d'entités** (un monstre/skill validé n'est jamais
  supprimé par un patch) + versionnage de boss (`datagen:version-boss`).
- Données de contenu : geas du guild raid (glossaire + réfs par donjon),
  rotations Dimensional Singularity, tours (8), content-schedule (fenêtres
  WB / guild raid / joint challenge via la chaîne spawn), Special Request
  (group + difficulty sur 130 donjons), donjons auto-portants pour les guides
  (monstres, difficulté, butin, tours), tables de récompenses résolues,
  vague d'engagement sur les monstres de rencontre.
- Couche curée (`data/curated/` + seed depuis l'oracle V2) : personnages
  (videos, pros/cons, tags), effets, équipement, gear-reco, singularity.
- `pnpm getNews` : scrape des patch notes (images WebP content-addressed → R2).

**Site**

- Design system clair/sombre (tokens + thème + garde-fou), palette bleu-ardoise.
- Pages **characters** (fiches complètes : skills, transcend, core fusion,
  costumes, profils) et **equipment** (armes, armures, amulettes, talismans,
  EE, sets).
- Moteur de **guides** : catégories avec vues dédiées (TieredList, BannerGrid,
  SingularityRotation, SpecialRequestSplit, IrregularChaseMap, ModeColumns),
  versions de guides, jointure guide ↔ saison par le monstre combattu,
  landing `/guides` au visuel V2, stats de monstres dans les guides, SEO
  (JSON-LD, og:image).
- Tags de personnages dérivés de la donnée de jeu.

**Admin (dev-only, exclu du build prod)**

- Extractor : characters, monsters (fiche, extraction ciblée, versionnage),
  équipement (armes/armures/amulettes/talismans/EE/sets), effets.
- Editor : contenu curé (personnages, monstres, effets, items, équipement),
  éditeur de câblage des chips monstres, gestion guides / tags / gear-presets.
- Tools · Données du jeu : lecteur des 257 tables brutes de `.gamedata/parsed`
  (recherche et pagination au serveur, colonnes vides masquées, clés de texte
  résolues en anglais, liens vers les tables référencées, JSON brut d'une ligne).

**Assets & images**

- Pipeline R2 : collecte data-driven (`datagen/assets/collect.ts`), push
  (`scripts/assets-push.mjs`), `pnpm images` ; couche d'accès
  `src/lib/images.ts` (CDN via `NEXT_PUBLIC_IMG_BASE`), CORS bucket.
- Face icons : layout extrait des prefabs Unity (unique outil python, local).

**Infra & outillage**

- Dockerfile multi-stage (pnpm, standalone, non-root) + `.dockerignore`.
- CI/CD GitHub Actions : checks (lint/typecheck/build), build & push GHCR,
  déploiement auto sur le VPS via SSH (stack clonée depuis `sevih-tool`).
- Flux dev à 3 verbes : `pnpm dev` (clean + refresh données + next dev),
  `pnpm commit` (contrôles → bump version → images R2 → commit/push),
  `pnpm build` (CI seulement).

### Modifié

- Guild raid / world boss : seules les échelles et rotations de la dernière
  saison font foi (anciennes purgées à la régénération).
- L'ordre des catégories de guides à saisons suit le jeu, pas l'éditeur.
- Reformatage global via prettier-plugin-tailwindcss 0.8 ; bumps de
  dépendances (Next 16.2.10, actions CI, prettier).

### Corrigé

- Effets : glossaire `_IR` (variantes indissipables), immunités des boss
  (parapluie DoT au glossaire), dédup des chips par nature (buff/debuff
  homonymes coexistent), fusion `rage_finish` sans câblage mort.
- Boss : la barre d'un palier à score n'est pas les PV du boss.
- Assets : icônes de catégorie (pool V2, noms réutilisés par le jeu), fonds
  CSS via base R2, dédup des téléchargements de getNews, icône FI.
- Docker/CI : `NEXT_PUBLIC_IMG_BASE` baké dans l'image, resync stack/.env,
  `set -e` dans le déploiement SSH.

[Non publié]: https://github.com/Sevih/outerpedia/commits/main
