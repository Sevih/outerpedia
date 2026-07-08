# TODO — données V2 à porter en V3

Suivi des données V2 (`../outerpedia-v2/data`) pas encore en V3. Basé sur l'audit
de la pipeline V2 (`pipeline/run.ts`, 30 steps) + les JSON data à la main.

---

## À générer — extraction du jeu (datagen déclaratif)

- [ ] **`area_name`** ← `AreaTemplet` (167 zones). `NameID` (`SYS_AREA_NAME_*`) +
      `ShortName` via TextSystem.
- [ ] **`geas`** ← `GuildRaidGeisTemplet` (107). NameID/DescID/icon/value/grade.
- [ ] **`unlock-content`** ← conditions de déblocage de contenu
      (`ADVENTURE_LICENSE`, `DUNGEON_CLEAR`…) + textes. (V2 step `unlock-content`)
- [ ] **`singularity-rotation`** ← calendrier de rotation des singularités
      (cycleLengthWeeks / activeDays / groups). (V2 step `singularity-rotation`)
- [ ] **`bgm-mapping`** ← `LobbyCustomResourceTemplet` + TextSystem — métadonnées
      des BGM (fichier / nom localisé / durée). (V2 step `bgm-extract`, ~90)
- [ ] **`cf-skill-names`** ← renommage skills Core Fusion (old→new, localisé).
      À VÉRIFIER : probablement déjà couvert par l'extraction directe des skills
      des variants CF (chaque CF = id perso à part). (V2 step `cf-skill-names`)
- [x] **`game-version`** ← `resVersion` (256 derniers octets de `manifest.dat`).
      Générateur `datagen/generators/game-version.ts`, baked dans le build →
      `data/generated/game-version.json`. Reader `src/lib/data/game-version.ts`.

## À générer — script (news)

- [x] **`patch-notes`** — `pnpm getNews` (`scripts/get-news.ts`, dep `cheerio`) :
      scrape le WP OuterPlane → `data/patch-notes/posts.json` + `buff-events.json`.
      Images converties **WebP** + stockées **content-addressed** (hash des
      OCTETS webp → 2 URLs = même visuel dédupliqué) dans
      `.assets-staging/images/patch-notes/` → poussées sur **R2** par `pnpm images`.
      Incrémental (`modified_after` par langue). `--limit=N` / `--force-since=`.
  - ⚠️ Reste à faire quand la PAGE patch-notes sera portée : le `src` stocké est
    relatif (`/images/patch-notes/…webp`). En prod (images sur R2), le composant
    de rendu devra préfixer `NEXT_PUBLIC_IMG_BASE` sur ces chemins (comme `img.*`).

## À faire à la main (curé / éditorial, non extractible)

- [ ] **`name-aliases.json`** — alias de recherche par perso (EN/JP/KR/ZH).
- [ ] **`tags.json`** — glossaire libellés + desc des tags (la classif par perso
      est déjà en `data/curated/characters.json` → `tags`).
- [ ] **Premium** — `premium_limited_data.json` (reviews) **+**
      `premium-priorities.json` (ordre de pull `PREMIUM_ORDER_*`). De paire.
- [ ] **Core Fusion** — `core_fusion_data.json` (reviews CF) **+**
      `core-fusion-priorities.json` (ordre de pull CF). De paire.
- [ ] **`contributors.json`** — contributeurs du site.

---

## ✅ Déjà auto en V3 (couvert par le datagen)

extraction assets · face-icons · characters(-index/-stats) · skins→**costumes** ·
effects(-index/-group-map) · item-names · item-stats-detail ·
**singularity-ascension** (`equipment/enhance.json`) · ascension-view · damage-calc
(à confirmer) · items unifiés · equipment complet · transcend · progression.

## ✅ Résolu — rien à porter

- **`partners.json`** = synergie → déjà couvert (Tools › Synergy).
- **`name-splits.json`** = préfixes/titres = champ `nickname` du jeu (extrait,
  localisé) + `glossaries.fusionTitle` pour « Core Fusion ». Aucune maintenance.

## ⛔ Exclu — contenu PvE monstre / mode

boss-index · guide-boss-map · tower-data · most-used-units (tower reco) ·
guild-raid · monad · boss/.

## 📝 Éditorial / assets / analytics (pas de la « data » extraction)

comics · wallpapers · event-registry · video-meta (script meta YouTube, dev) ·
gear-usage-stats · gear-finder-index · changelog · guides · tools (tier-lists).
validate-reco = étape de validation, pas une donnée.
