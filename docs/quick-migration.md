# Migration de l'admin vers quick

> Décision de Sevih du 08/10/2026 : `pnpm quick` remplace TOUT le panneau admin
> (`/admin`, extractor et outils compris), petit à petit. Trois raisons : quick
> est beaucoup plus rapide, son UI est plus agréable, et tout se fait d'un seul
> endroit. Quand tout est passé, l'admin sort du site.
>
> Ce fichier est l'inventaire et l'ordre. **Chaque section a une ligne
> « Agacements »** : Sevih y note, en vrac, ce qui l'a gêné dans l'écran admin
> et qu'il n'a jamais pris le temps de corriger. Le lot qui porte la section
> lit sa ligne et corrige EN PORTANT — sans ligne, l'agent porte l'écran tel
> quel, défauts compris. Une section portée migre dans `DONE.md` avec son lot.

## Règles de portage (valent pour tous les lots)

- La logique serveur ne bouge pas : quick appelle les actions et les stores de
  l'admin (`src/lib/admin/*`) tels quels, via `scripts/quick/actions.ts` et
  une route dans `server.ts` (`env.ts` rend `IS_DEV` vrai dans le processus
  de quick). Un portage, c'est l'ÉCRAN en vanilla — jamais une réécriture de
  la règle métier. Si l'écran admin porte de la logique dans son composant
  React, elle descend d'abord dans `src/lib/admin/` (testée), puis quick
  l'appelle.
- Une section = `scripts/quick/ui/tabs/<nom>.{html,js,css}` + une entrée de
  `GROUPS` dans `lib.js`, selon `scripts/quick/ui/STYLE.md`. Les briques
  existantes se réutilisent : pickers modaux et tuiles (`tabs/gear.js`,
  `ui/gear-view.mjs`), segments de note (`previewHtml`), traduction
  (« Traduire » de Gear reco), savebar et journal.
- Les deux outils coexistent pendant la transition : ils écrivent par les
  mêmes stores, les données ne divergent pas. **Une section portée
  COMPLÈTEMENT retire son lien du menu de l'admin** (`AdminSidebar`, nourri
  par `src/app/admin/layout.dev.tsx` ; pour l'extractor, `EXTRACTOR_ENTITIES`
  de `admin-inbox.ts`) dans le même lot — la page reste joignable par son
  URL jusqu'au retrait final, mais plus proposée. Un portage partiel garde
  son lien.
- Un lot = une section (A ou B), sauf les guides (F) et l'extractor (plusieurs
  lots). Les lots qui touchent `lib.js`/`index.html` ne tournent pas en
  parallèle ; ceux qui n'ajoutent que leur `tabs/<nom>.*` et leur route, si.
- Le banc : `node scripts/quick/shot.mjs --port … --tabs <nom>`, captures
  avant/après dans le résumé du lot. Tests : la page en happy-dom avec un fetch
  factice (méthode C4), la route dans `actions.test.ts`, et la suite rejouée
  avec `NODE_ENV=development` (leçon du 08/10).

## Déjà dans quick

Publication : Codes promo (= Tools › Promo code), 4-comics, Vidéos, Discord.
Données : Rangs, Gear reco (= l'éditeur des recos de l'admin, l'admin en garde
un exemplaire).

## Ordre et inventaire

### 1. Outils simples (un lot A/B chacun, dans cet ordre)

| #   | Admin                  | Écran                                   | Agacements (Sevih) |
| --- | ---------------------- | --------------------------------------- | ------------------ |
| 1   | Tools › Short names    | liste + fiche `[id]`                    |                    |
| 2   | Tools › Search aliases | liste + fiche `[id]`                    |                    |
| 3   | Tools › Synergy        | liste + fiche `[id]`                    |                    |
| 4   | Tools › Pro / Con      | liste + fiche `[id]`                    |                    |
| 5   | Tools › Banner         | `BannersEditor`                         |                    |
| 6   | Tools › Events         | `EventsEditor` (451 l.)                 |                    |
| 7   | Tools › Changelog      | `ChangelogEditor` (346 l.)              |                    |
| 8   | Tools › Game data      | `GameDataBrowser` + `[table]` (lecture) |                    |

### 2. Éditeurs (curation ; un lot B chacun)

| #   | Admin               | Écran                                                    | Agacements (Sevih) |
| --- | ------------------- | -------------------------------------------------------- | ------------------ |
| 9   | Editor › Character  | `CharacterCuratedEditor` + `CharacterKitEditor`          |                    |
| 10  | Editor › Effect     | `EffectCuratedEditor`, `EffectsCatalog`, `NewEffectForm` |                    |
| 11  | Editor › EE         | `EeCuratedEditor`                                        |                    |
| 12  | Editor › Monster    | `MonsterKitEditor`, `MonsterStatsCard`, `MonsterActions` |                    |
| 13  | Editor › Item       | `ItemCuratedEditor`, `ItemsBrowser`                      |                    |
| 14  | Misc › Gear presets | `GearPresetsEditor` (318 l.)                             |                    |
| 15  | Misc › Tag control  | page `tags`                                              |                    |

### 3. Guides (lot F, en plusieurs écrans si besoin)

| #   | Admin                                        | Écran                                                                                                                                         | Agacements (Sevih) |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 16  | Guide editor › Overview + catégories de boss | `GuideEditor` (989 l.) : joint-challenge, special-request, irregular-extermination, adventure-license ; `InlineTextField`, traduction, vidéos |                    |
| 17  | Guides généraux                              | `PremiumLimitedEditor`, `EditorialEditor`, `FreeHeroesEditor`                                                                                 |                    |

### 4. Extractor (plusieurs lots, en dernier)

| #   | Admin                           | Écran                                                                                                                                                | Agacements (Sevih) |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 18  | Home admin : boîte de réception | compteurs new / diff / removed par entité (`admin-inbox`)                                                                                            |                    |
| 19  | Extractor › revue par entité    | `ExtractorReview`, `EntityDiffPanel`, `DiffHighlight`, `EntitySwitch` — Character, Effect, EE, Weapons, Amulet, Armor, Talisman, Sets, Monster, Item |                    |
| 20  | Extractor › intégration         | `IntegrateCharacterButton`, `IntegrateGearButton`, `IntegrateModeButton`, `AcceptTargetButton`, `ContributionImport`                                 |                    |
| 21  | Patch : lanceur et journal      | `PatchCard` + `patch-runner` (`pnpm datagen…`, `pnpm commit`), journaux longs en direct                                                              |                    |

### 5. Clôture

| #   | Quoi                                                                                                                 | Agacements (Sevih) |
| --- | -------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 22  | Retirer `/admin` du site (routes `.dev`, composants, `api/admin` devenus inutiles) — un lot, quand 1 à 21 sont faits |                    |
