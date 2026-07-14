# TODO — Audit du 2026-07-13 (à traiter APRÈS la fin du travail des 3 workers)

> Audit complet du repo au commit `6f5a633` (main, arbre propre, 207/207 tests verts).
> 4 passes : code `src/`, couche data `datagen/`+`scripts/`, documentation, transverse (tests/config/curations/git).
> **Ne pas attaquer tant que les workers en parallèle n'ont pas fini** — certains points (couleurs en dur, primitives guides) sont peut-être déjà dans leur périmètre. Re-vérifier chaque item contre le code au moment de le traiter.
>
> **RE-VÉRIFIÉ le 2026-07-14** (HEAD `13641ff`, 12 commits après l'audit) : quasi tous les items restent ouverts tels quels — seuls changements notés en annotation `↻` sur les items concernés. Tests passés à **233/233** verts. Nouveaux points relevés au passage : section « Nouveaux (re-vérif 14/07) » en fin de P1.

---

## ✅ BILAN DU TRAITEMENT — 2026-07-14 (après-midi)

Passe de fix massive (4 chantiers parallèles). **Fait** — les items ci-dessous sont soldés, la liste détaillée plus bas est conservée pour l'historique :

- **P1** : tests `promote.test.ts` (11 — rétention/idempotence/--only/orphelins/archive) et `integrate.test.ts` (7) avec refactor à chemins injectables ; `convert.ts` sort en code 1 si une table échoue (refresh s'arrête avant build, stamp auto-réparateur) ; invalidation par mtime dans `loadTable` (admin long-running) ; `enhance.ts` throw explicite si le motif couleur disparaît ; `resolveReward` logge les lacunes (38 groupes réels révélés) ; `stamp-guides.ts` parsing des renames corrigé ; gardes `isMain(import.meta.url)` généralisés (13 fichiers, helper `datagen/lib/is-main.ts`).
- **P2** : cœur commun `assembleSkill` skills/monster-skills (sorties vérifiées octet à octet identiques) ; `spawnUnits` exporté d'encounters + `sources.ts` corrigé (ID0..3 + CSV — zéro impact données actuelles, fix de robustesse) ; extraction costumes unifiée (`costumeCore`, fallback icône aligné, vérifié iso) ; `hasText`/`langDict` canoniques (2 entrées goods se normaliseront à la prochaine régen — voulu) ; `type Row` importé.
- **P3** : `CharactersBrowser` localisé (labels serveur + clés dans les 5 locales, options via sys.element/class/roles) ; couleurs → tokens dans parse-text/inline/ShareButtons/pages ; les 4 `eslint-disable react-hooks` supprimés (useSyncExternalStore sur hash/query) ; `MODE_TITLE_KEY` dérivé via `modeTitleKey()` (vérifié iso) ; `CLASS_ENUM` dérivé de resolveClass ; StatScale unifié ; `CostumeEntry` renommé ; memo `effects.ts` (une seule lecture FS) ; taille réelle logguée au build.
- **P4** : `adm.html` supprimé ; `.dockerignore` complété (data/legacy, .gamedata, .assets-staging) ; `listCharacterIds` et `clearTableCache` supprimés ; commentaire equipment corrigé.
- **P5** : les 7 documents remis à niveau (README, ROADMAP recochée, CHANGELOG reconstruit, CLAUDE.md, datagen/README, newPatch, todo-data-v2 purgé).

**Reste ouvert (décisions ou chantiers à part)** :

- [ ] Tests des 18 générateurs + build/refresh (gros chantier, prioriser encounters/singularity/content-schedule).
- [ ] `progression.ts` enums d'éveil 0-based vs 1-based — à vérifier contre les tables avant de toucher.
- [ ] `goods.ts:123` heuristique de discrimination des monnaies — fiabiliser ou documenter.
- [ ] Icône `bosses.ts` (`MT_` baké) vs spec monstre (id brut) — impose une régénération de `bosses.json` + revue des consommateurs → décision Sevih.
- [ ] `LOCK_SCREEN_OVERRIDES` (unlock-content) : trier vrai-override vs motif dérivable → décision Sevih.
- [ ] `CHASE_TITLE_KEY` (sources.ts) reste en dur : le résolveur donnerait `SYS_IRR_CHASE_NAME_01` ≠ choix éditorial actuel `SYS_IRREGULAR_EXTERMINATION` → soit assumer en curation mode-titles, soit garder.
- [ ] Convention `_doc` des curés : vérifier d'abord que chaque lecteur tolère la clé.
- [x] `effect-families.json` — seedé le 14/07 : les 8 résidents assumés de `special` actés (le warning du build ne signale plus que les vrais nouveaux types).
- [ ] `loadColumns`/`getMaxLevel`/`resolvePlaceholders` : API de lib gardées volontairement (documentées, testées) malgré zéro appelant prod.
- [ ] Boucle « collecter les skills d'une entité » encore répétée dans integrate.ts (atténuée par le refactor testable).
- [x] Caches dérivés (glossaryCache/mechanicLabelCache/titleCtx/encounters/curated effects) — réglé le 14/07 soir : empreinte mtime (`tablesStamp`/`fileStamp`, sentinelle TextSystem + mode-titles.json, TTL 2 s en boucle chaude) ; `loadTable` sert la copie en cache si le fichier disparaît pendant un refresh concurrent.
- [ ] 4 branches locales à trancher (backup/site-rebuild, feat/character-tags, feat/datagen-equipment, feat/site-foundations).
- [ ] Resserrer l'exemption eslint couleurs (inline/parse-text/ShareButtons sont désormais 100 % tokens).

---

## P1 — Risques réels (à faire en premier)

### Tests manquants sur la logique destructive

- [ ] **`datagen/promote.ts` : zéro test** sur la rétention (`RETAIN_ENTITIES` = monsters/monster-skills/encounters, réinjection des clés purgées, `--apply` auto en dev, `--only`). C'est la seule logique du repo qui peut **perdre des données validées** silencieusement. Tests à écrire : clé retenue jamais supprimée, stabilité au re-run, `--only` ne touche pas le reste, orphelins signalés.
- [ ] **`datagen/extractor/integrate.ts` (~220 l.) : zéro test** sur `integrateCharacter` / `integrateMonster` / `integrateMonsterMode` (écriture ciblée dans `data/generated/`). Il existe des fixtures git pour version-monster — même approche possible.
- [ ] `datagen/build.ts` et `datagen/refresh.ts` non testés (pipeline central). Moins urgent que promote/integrate mais même famille.
- [ ] Les 18 générateurs `datagen/generators/*` n'ont aucun test unitaire (seuls lib/, templates/, contracts, extractor/core sont couverts). Prioriser : encounters, singularity, content-schedule (logique date/rotation).

### Erreurs avalées

- [ ] **`datagen/templates/convert.ts:31-39`** : les erreurs de parsing `.bytes` sont collectées/affichées mais le process sort en **code 0**. Si un JSON parsé antérieur existe, `build` consomme une table périmée sans le dire. → sortir en code ≠ 0 (ou faire échouer `refresh`) quand au moins une table échoue.

### Caches long-running

- [ ] **Caches module jamais invalidés** : `datagen/lib/effects.ts:305` (`glossaryCache`), `:617` (`mechanicLabelCache`), `datagen/generators/encounters.ts:487`, `tableCache` de `lib/tables.ts`. OK en build one-shot, mais l'**admin** (process Next long-running, `monster-store.ts` importe `buildMonsters`) garde des données périmées après un refresh. `clearTableCache` existe (`lib/tables.ts:47`) mais n'est **appelé nulle part**. → câbler une invalidation (au minimum après refresh), ou documenter « redémarrer le dev server après refresh ».

### Parsing fragile

- [ ] **`datagen/generators/enhance.ts:134`** : valeur du bonus +15 extraite en parsant la couleur `#0D99DA` **en dur** dans la desc HTML localisée ; si le jeu change la couleur → chaîne vide silencieuse. → au minimum : émettre une erreur si le match échoue.
- [ ] **`datagen/generators/progression.ts:97-99`** : indexation asymétrique des enums d'éveil (`AWAKENING_ELEMENTS` 0-based, `AWAKENING_CLASSES`/`AWAKENING_SUBCLASSES` 1-based avec index 0 = `''`). À **vérifier contre les tables** — risque d'off-by-one silencieux sur les quirks.
- [ ] `datagen/generators/goods.ts:123` : heuristique `en.length > 40 || en.endsWith('.')` pour discriminer les monnaies — constantes magiques, documenter ou fiabiliser. ↻ 14/07 : un `includes('\n')` a été ajouté, l'heuristique par forme du texte reste.
- [ ] `scripts/stamp-guides.ts:50-52` : parsing de `git status --porcelain -z` — pour un rename (`R  new\0old\0`), le second enregistrement reçoit aussi `slice(3)` → chemin tronqué. Marginal mais faux.

### Gardes d'exécution directe fragiles

- [ ] `datagen/generators/skills.ts:382` : `process.argv[1].endsWith('skills.ts')` est aussi vrai pour `monster-skills.ts` (qui importe skills.ts) → `tsx monster-skills.ts` exécuterait le main de skills. Même piège sur `effects.ts:74` (collision avec `lib/effects.ts`, `curated/effects.ts`). → comparer sur le chemin complet ou utiliser un vrai point d'entrée. ↻ 14/07 : **AGGRAVÉ** — le motif s'est répandu à ~11 générateurs (costumes, item-catalog, game-version, unlock-content, content-schedule, towers, singularity, items, equipment…) ; le garde ROBUSTE existe déjà dans `refresh.ts:135` et `pull-gamedata.ts:200` (`resolve(process.argv[1]) === fileURLToPath(import.meta.url)`) → le généraliser.

### Nouveaux (re-vérif 14/07, commits e412606/e37591a…)

- [ ] `encounters.ts:652-684` (`resolveReward`, rewards e412606) : renvoie `undefined` en silence si `rewardById.get(id)` échoue, saute les groupes sans `TypeID` sans signalement — même classe d'échec silencieux que convert/enhance. Et `rewardTables` vit dans le `cache` mémoïsé de `buildEncounters` → même problème d'invalidation que les autres caches.
- [ ] `encounters.ts:700-721` (vague d'engagement e37591a) : `hpLines`/`wave` + dédup `${mid}|${level}` dans la fonction mémoïsée, non testés.
- [ ] `costumes.ts` (nouveau générateur) cumule à lui seul deux dettes déjà listées : 2ᵉ extraction des costumes (P2) + `hasText` réimplémenté (P2).

---

## P2 — Duplications (datagen surtout)

- [ ] **HAUTE — `monster-skills.ts:40-131` ≈ clone de `skills.ts:153-289`** : même boucle niveaux→vars, même union d'effets par `expandBuffIds`, même filtre « BT_NONE enfant de groupe non listé » (mot pour mot : monster-skills.ts:119 ↔ skills.ts:229). → factoriser en une fonction commune paramétrée par la table source. ↻ 14/07 : partiellement mutualisé (monster-skills importe désormais `slugTeam`/`subTypeOf`/types de skills.ts) mais la boucle d'assemblage reste un clone ; `buildLevel` de skills.ts:292 n'est pas réutilisé.
- [ ] **Traversée « monstres spawnés d'un donjon » réimplémentée 4×** : `singularity.ts:125-137` (`monstersOf`), `content-schedule.ts:138-149` (`monstersOf`), `towers.ts:116-124` (`formationOf`), `sources.ts:66-79` (`bossesOfDungeon`). **Bonus bug** : la variante de `sources.ts:60` ne lit que `ID0` (les autres lisent `ID0..3`). → exporter un helper `spawnUnits`/`monstersOf` depuis `encounters.ts` (qui n'exporte que `spawnGroupIds`) et l'utiliser partout. ↻ 14/07 : **partiellement corrigé** — `spawnGroupIds` est adopté par singularity/content-schedule/towers ; reste `sources.ts` qui réimplémente la traversée ET ne lit toujours que `ID0` (sources.ts:60).
- [ ] **Costumes extraits 2×** : `specs/character.ts:581-599` vs `generators/costumes.ts:31-58`, avec fallback d'icône différent (spec : `SpriteCostumeIcon` seul ; costumes.ts:43 : `?? RewardCostumeIcon`) → `characters.json` et le catalogue items peuvent diverger sur l'icône d'un même costume. → une seule extraction, ou au minimum aligner le fallback.
- [ ] `hasText`/`langDict` réimplémentés localement dans `items.ts:32`, `goods.ts:32-34`, `costumes.ts:29` au lieu de `lib/text.ts` — celui de `goods.ts` **saute la normalisation `clean()`** (apostrophes courbes) → monnaies non normalisées, contrairement au reste.
- [ ] `type Row` redéclaré dans `equipment.ts:42` et `goods.ts:31` (importer celui de `lib/tables.ts`).
- [ ] Boucle « collecter les skills d'une entité » répétée 5× dans `integrate.ts` (68-70, 87-89, 122-124, 151-153, 206) + `version-monster.ts:119`.
- [ ] Côté `src/` : RAS — le patron « calcul partagé dans `src/lib` » est respecté. Micro : alias trivial `findCharacter = findCharacterByName` (`parse-text.tsx:61`).

---

## P3 — Incohérences

### Visible utilisateur (le plus important de cette section)

- [ ] **`src/components/character/CharactersBrowser.tsx:65,69,77,85,108`** — composant **PUBLIC** avec UI de filtres en français en dur (« Rechercher… », « Élément », « Classe », « Rôle », « {n} persos ») et options de select en **slugs bruts** (« fire ») au lieu de `t('sys.element.*')`. Un visiteur EN/JP/KR/ZH voit du français et des slugs. → passer par `t()` comme le reste de la page.

### Règle tokens (couleurs en dur hors exemption `components/character/`)

- [ ] `src/lib/parse-text.tsx:85,87,119,120,226,232` (`text-white`, `text-neutral-200/300`)
- [ ] `src/components/inline/StatInline.tsx:37,38` ; `ItemInline.tsx:74,76` ; `InlineTooltip.tsx:13,52,66` ; `InlineIcon.tsx:14`
- [ ] `src/components/ui/ShareButtons.tsx:132,145,166` (`bg-zinc-800`, `text-zinc-400`, `bg-zinc-700`, `text-white`)
- [ ] `src/app/[lang]/characters/[slug]/page.tsx:236` (`text-zinc-200`)
- [ ] ↻ 14/07 nouveau : `src/app/admin/extractor/characters/[id]/page.dev.tsx:108` (`text-zinc-200` — fichier admin/dev, moins grave)
- ⚠ Vérifier d'abord si les workers ne sont pas déjà dessus (primitives guides/inline en cours).

### Politique eslint contredite

- [ ] 4 `eslint-disable react-hooks/*` inline (`GuideVersions.tsx:46,48`, `Tabs.tsx:37,39`) alors que `eslint.config.mjs:14-15` affirme « on NE désactive PAS react-hooks/set-state-in-effect ». → corriger les 2 cas (pattern useSyncExternalStore déjà utilisé ailleurs) ou documenter l'exception.

### Mappings en dur pourtant dérivables (règle projet)

- [ ] `datagen/generators/sources.ts:35` — `MODE_TITLE_KEY = { DM_RAID_1: 'SYS_RAID_1_TITLE', … }` en dur alors que `encounters.ts:364` a `resolveModeTitle` (heuristique sans mapping) : **deux systèmes concurrents** pour la même notion. → brancher sources.ts sur le résolveur (+ curation mode-titles.json si besoin).
- [ ] `datagen/assets/manifest.ts:199` — `CLASS_ENUM = { striker: 'Attacker', healer: 'Priest' }` = inverse en dur de ce que `lib/class.ts` (`resolveClass`) dérive de TextSystem. Casserait à l'ajout d'une classe.
- [ ] `datagen/generators/unlock-content.ts:57` (`LOCK_SCREEN_OVERRIDES`) : certaines entrées suivent un motif dérivable — à trier (vrai override = donnée, motif = dériver).

### Conventions divergentes

- [ ] Icône de portrait monstre : `bosses.ts:42` bake `MT_${FaceIconID}` alors que `specs/monster.ts:278` stocke l'id **brut** (le front ajoute `MT_`). → une seule convention.
- [ ] `StatScale` défini 2× (`specs/character.ts:24` et `contracts/index.ts:155`) au lieu d'un re-export ; le nom `Costume` désigne deux types différents (spec vs generators, contracts exporte `CostumeItem`).
- [ ] `costumes.ts:44` utilise `slugEnum(r.ItemGrade)` là où la spec perso utilise `slugAfter(r.ItemGrade, 'IG_')` — même résultat, helpers divergents.
- [ ] Convention `_doc`/`_notes` non uniforme dans `data/curated/` : `monster-skills.json` = `_doc`+`_notes`, `mode-titles.json` = `_doc`+`_docDifficulties`+…, `singularity.json` = `note`, les 10 autres = rien. → normaliser (`_doc` partout).

### Perf (mineur)

- [ ] `src/lib/data/effects.ts:118-125` (`resolveEffectKey`) : `getMergedEffect()` → `loadCuratedEffects()` → `readFileSync` **à chaque appel**, puis reboucle sur `loadCuratedEffects()` une 2e fois ; appelé par tag `{B/…}` et en boucle dans `skill-view.ts`. Amorti par SSG/ISR mais dizaines de lectures FS par rendu. → mémoïser au niveau module.
- [ ] `datagen/build.ts:70` : le log « Ko » mesure `JSON.stringify(data).length` (compact) alors que le fichier écrit est prettifié → taille affichée trompeuse.

---

## P4 — Code mort / artefacts

- [ ] **`adm.html` (196 Ko) à la racine** : dump HTML de l'admin en mode dev (chunks `_next/static`, HMR client), committé, reformaté par prettier, référencé nulle part. → **supprimer du dépôt**.
- [ ] `.dockerignore` n'exclut ni `adm.html` ni `data/legacy/` du contexte de build (pas dans l'image finale, mais gonfle le contexte).
- [ ] `data/curated/effect-families.json` = `{}` (3 octets) : à peupler ou supprimer (vérifier qui le lit).
- [ ] Exports orphelins : `listCharacterIds` (`src/lib/data/characters.ts:89`), `clearTableCache` + `loadColumns` (`datagen/lib/tables.ts:47,42`), `getMaxLevel` + `resolvePlaceholders` (`datagen/lib/buff.ts:32,157` — utilisés seulement par buff.test.ts).
- [ ] Commentaire obsolète `src/lib/data/equipment.ts:136` (a bougé de la l.108) : renvoie à « parse-text/renderColored » qui n'existe pas (le réel = `renderGameColors` dans `GameText.tsx`).
- [ ] 3 branches locales jamais poussées : `backup/site-rebuild` (803f50d), `feat/character-tags` (a7d6024, mergée fast-forward → supprimable), `feat/datagen-equipment` (6933400, historiquement mergée via site-foundations → vérifier puis élaguer). ↻ 14/07 : toujours là, + `feat/site-foundations` locale (suit origin).
- ✅ Vérifié sain : `generators/characters.ts` et `monsters.ts` bien supprimés (remplacés par les specs), aucun import résiduel ; tous les scripts `package.json` pointent vers des fichiers existants ; 0 `@ts-ignore` dans tout le repo.

---

## P5 — Documentation (le plus gros écart constaté)

- [ ] **ROADMAP.md** — le doc le plus trompeur : Phase 2 entièrement `[ ]` alors que TOUT existe (templates, primitives, 18 générateurs, contrats, build/refresh, data committée) ; Phase 1 `[ ] i18n` fait ; Phase 3 (assets/R2) fait en grande partie (`collect.ts`, `assets-push.mjs`, `pnpm images`, `src/lib/images.ts`) ; Phase 4 en cours (admin, guides, data layer). → tout recocher / refléter l'état réel.
- [ ] **CHANGELOG.md** — ~110 commits non reflétés (s'arrête à « conversion .bytes → JSON ») ; aucune section versionnée alors que package.json = 0.1.16 et 0 tag git ; la checklist PR **exige** sa mise à jour (jamais respectée). → réécrire depuis `git log` + trancher : tenir le fichier ou assouplir la règle.
- [ ] **README.md** — bloc « Démarrage (dev) » faux : `nvm use / npm install / npm run dev` + « sera complété en Phase 1 » alors que le repo est **pnpm** et que `pnpm dev` = clean + refresh + next dev. Liste « Documentation » incomplète (manquent datagen/README, docs/procedure/newPatch, docs/todo-data-v2). « Données : MySQL » au présent = futur Phase 5.
- [ ] **CLAUDE.md** — dit « Git Bash » (réel : PowerShell primaire) et « génération python + datamine » (réel : tout-TS, une exception py `extract-face-layout.py`) → contradiction directe avec datagen/README. Ne mentionne ni pnpm, ni `pnpm dev`/`pnpm commit`, ni `datagen:*`.
- [ ] **datagen/README.md** — section « État » périmée (« structure posée, prochaines étapes… » alors que tout est fait) ; documente `run.ts` couche 5 **qui n'existe pas** (réel : `build.ts` + `refresh.ts`) ; ne documente ni `datagen/extractor/` (specs déclaratives, coherence, integrate, v2-control), ni `datagen/curated/` (seed), ni `import-equipment.ts`/`import-gear-reco.ts`.
- [ ] **docs/procedure/newPatch.md** — copie tronquée du datagen/README (double maintenance) + `git commit && git push` sans `-m` (ouvrirait un éditeur). → enrichir en vraie procédure ou pointer vers datagen/README.
- [ ] **docs/todo-data-v2.md** — à purger : le bloc « ⛔ EN ATTENTE glossaries.json / build ROUGE » est **résolu** (178 clés `_IR` + rankOptions + bossQuirkMods promus, test tag-control vert) ; `geas` **fait** ; ↻ 14/07 : `special-request` **FAIT** (échelles promues 9d7a225 + guide « end of SR » 37cc3d9, `SpecialRequestSplit`/`ModeColumns`) et `irregular-extermination` **FAIT** (f92c2f1, `IrregularChaseMap` + `_contents/irregular-extermination`) → cocher les deux. Encore ouverts (re-confirmés absents le 14/07) : area_name (bloque la catégorie adventure), bgm-mapping, cf-skill-names, name-aliases.json, tags.json (glossaire libellés), premium, core-fusion, contributors.json, vues guides skyward-tower / monad-gate / adventure-license / adventure (0 guide porté).
- [ ] **TODO(guides) `datagen/extractor/version-monster.ts:16`** (dupliqué dans datagen/README:190) : « Versionner » doit ré-épingler automatiquement les guides `<id>` → `<id>@<n>`. Le domaine guides **existe maintenant** → probablement actionnable. (Seul vrai TODO du code — src/ et scripts/ en ont 0.)

---

## P6 — Demandes UI (hors audit, notées au fil de l'eau)

- [x] **Carrousel : blur les cartes non actives** (demande Sevih 2026-07-13) — fait dans `TeamSlotCarousel.tsx` (blur-[3px] + grayscale-75 sur un div intérieur, jamais sur le wrapper 3D ; transition 300 ms alignée sur la rotation).

---

## État de référence au moment de l'audit (pour comparaison future)

- Tests : **207/207 verts** (20 fichiers, ~4,5 s) — le rouge « tag-control » n'existe plus. ↻ 14/07 : **233/233 verts** (21 fichiers).
- Admin : bien exclu du build prod (pageExtensions `.dev.tsx` + `assertDevOnly` sur 18/18 routes API + layout force-dynamic). Dockerfile sans python, image finale sans admin.
- Aucun import server-only fuité côté client ; alias tsconfig ↔ vitest alignés ; aucun script package.json cassé.
- Arbre de travail propre, main = origin/main.
- eslint-disable : 108× `no-img-element` (assumé), 1× `no-explicit-any` (specs/index.ts:12), 4× react-hooks (cf. P3).
