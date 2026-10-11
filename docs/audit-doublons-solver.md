# Audit des doublons outerpedia ↔ gear-solver (règles du jeu)

> Fait le **2026-10-09**, en lecture seule, sur `outerpedia` `main` (1d55c84),
> `gear-solver` `main` (4b91162, v1.8.1) et `outerpedia-gamedata` (72157cc,
> tables 1.11.404). Consigne de Sevih : inventorier chaque règle du jeu
> implémentée des deux côtés, dire laquelle fait foi, **prouver** par un
> calcul rejoué sur les vraies données si les deux versions donnent le même
> résultat, et chiffrer ce que coûterait n'en garder qu'une.
>
> **Méthode** : lecture croisée des deux bases, puis deux scripts de rejeu
> (`tsx`, hors repo) qui importent **tel quel** le code des deux côtés
> (`packages/core/src/compose-stats.ts`, `lib/composeBuild.ts`, `lib/solver/cp.ts`,
> `lib/subValue.ts` côté gear-solver ; `char-progression.ts`, `stat-compose.ts`,
> `damage/formula.ts`, `damage/item.ts`, `combat-power.ts`, `substat-verdict.ts`
> côté outerpedia) et les font tourner sur les **129 personnages communs**
> (`data/generated/solver/*.json` + `data/generated/characters/*.json` ;
> 2400015, sans nom, exclu). Le build datagen a été rejoué
> (`GAMEDATA_ROOT=../outerpedia-gamedata pnpm datagen:build`, exit 0) pour
> comparer `data/extracted/solver/` aux artefacts committés. Rien n'a été
> lancé qui publie ou appelle un service ; aucun fichier du repo n'est modifié
> hormis celui-ci.

## Conclusion

**Le contrat de données est sain, les formules arithmétiques sont identiques,
mais la fiche « Base Stats » du wiki diverge déjà du gear-solver pour 9
personnages sur 129** — et le gear-solver a raison (ses valeurs sont validées
en jeu, `data/stat-locks.json`).

1. **Déjà divergent (à corriger côté wiki)** :
   - Les **6 Core Fusion** (Snow 2700003, Lisha 2700005, Veronica 2700037,
     Eternal 2700043, Notia 2700056, Epsilon 2700070) : le wiki n'affiche
     **aucun bonus d'évolution** (il indexe `CharacterEvolutionStatTemplet` par
     l'ID propre du perso, qui n'y a pas de ligne, alors que le solver suit
     `CharacterFusionTemplet` vers le perso d'origine), et ne prend qu'**un
     seul** buff `BT_STAT_PREMIUM` du passif de classe là où le solver applique
     le bloc entier (classe + noyau). Snow lv100 : HP wiki 5202 vs 7171 en
     jeu, EFF 60 vs 170 ; Notia EFF 90 vs 255 (lock in-game). Détail § 2.2 et
     § 2.4.
   - **3 persos à passif S2 permanent** (Claire 2000017, Ame 2000065, Bell
     Cranel 2000095) : couche que la fiche wiki ne connaît pas (ATK Claire
     1002 vs 1096 ; CHC Ame 21 vs 46). Détail § 2.5.
   - **Arrondi de la main stat de gear** : double + `floor(x+1e-9)` côté
     solver, chaîne float32 + `trunc` côté wiki → **21 cas sur 27 720**
     diffèrent de 1 point (ex. base 60, +0, palier 1 : 63 vs 62). Détail
     § 2.7.
2. **Peut diverger au prochain patch** : les constantes **codées en dur** qui
   dupliquent des tables lues ailleurs — `0.4 / 0.05 / 10` dans
   `datagen/generators/solver.ts` (alors que `enhance.ts` les lit des
   tables), `EVO_UNLOCK_LEVEL` et `evoCap = 6 + LB` dans `compose-stats.ts`
   (alors que `solver.ts` émet `charLevelMax` depuis la table), la baseline
   SPD pré-cuite pour les `OAT_RATE`, et les deux filtres « passif permanent »
   (strict côté solver, « premier buff » côté wiki). Aujourd'hui égales,
   rien ne le garantit demain.
3. **Sains** (0 écart rejoué) : interpolation de base par niveau (6 966 valeurs),
   `CalcFinalStat` (7 740 + 20 000 tirages aléatoires), **CP** (130 persos,
   ex. Ame 2000110 lv120 = 20 240 des deux côtés), transcendance (946
   paliers), codex (12 niveaux), quirks (2 064 valeurs), kit scaling (129
   persos — règle déjà **partagée** depuis le lot F6), Skill_8 par palier
   (15 136), verdict flat/% (1 548), format hero-tracker.

**Source de vérité, pour remplacer les commentaires morts** : le contrat est
produit par `datagen/generators/solver.ts` + `solver-ingredients.ts` (outerpedia,
committé dans `data/generated/solver/`, byte-identique au build rejoué) ; les
**formules** qui font foi sont celles de `gear-solver/packages/core/src/compose-stats.ts`
et `apps/renderer/src/lib/solver/cp.ts`, parce qu'elles seules sont
confrontées à des captures en jeu (`data/stat-locks.json`, 9 persos ;
`docs/reference.md` § 2). Les formules d'outerpedia se disent « validées
0-diff in-game par le gear-solver » : la preuve est à sens unique, et ce
rapport montre qu'elle ne couvre pas les couches passives.

**Ce qu'il faudrait garder, et où** (chiffré § 4) : une seule composition de
fiche, dans `packages/core` du gear-solver (déjà sans dépendance DOM),
consommée par outerpedia via le contrat JSON qu'il émet lui-même — l'inverse
du flux actuel pour le code, le même pour les données. Coût estimé : un lot
de deux à trois jours, dont la moitié en tests.

## État de référence

| Élément                                    | Valeur                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| outerpedia                                 | `main` 1d55c84 ; `data/generated/solver/version.json` = `{"hash":"907e3a8f77ce","builtAt":"2026-10-06T06:15:05.359Z"}`    |
| gear-solver                                | `main` 4b91162 (v1.8.1) ; `data/derived/version.json` identique                                                           |
| outerpedia-gamedata                        | 72157cc, tables 1.11.404                                                                                                  |
| Build rejoué                               | `pnpm datagen:build` exit 0 — « 130 persos, 1650 skills » ; un seul avertissement : `solver : 1 CT_PC sans nom` (2400015) |
| `data/extracted/solver/` vs `generated`    | 19/19 fichiers **byte-identiques**                                                                                        |
| `generated` vs `gear-solver/data/derived/` | 19/19 **sémantiquement identiques** (`JSON.stringify(JSON.parse(g)) === d`, seule la mise en forme compacte diffère)      |
| Persos rejoués                             | 129 communs (2400015 exclu)                                                                                               |

## 1. Contrat de données

### 1.1 Les trois copies

| Copie                               | Producteur                                                             | État constaté                                         |
| ----------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| `outerpedia/data/extracted/solver/` | `datagen/build.ts` l.328-334 → `buildSolver()`                         | sortie du build rejoué ; **= generated au byte près** |
| `outerpedia/data/generated/solver/` | promotion (`datagen/sync-derived.ts` re-dérive dans les deux dossiers) | committé, source du téléchargement runtime            |
| `gear-solver/data/derived/`         | `data/sync.mjs` (copie locale re-sérialisée compacte)                  | **= generated sémantiquement**, même `version.json`   |

Les 19 noms sont cohérents partout : `SOLVER_FILES` de `data/sync.mjs` l.23 ==
`apps/desktop/src/data-sync.ts` l.32 == noms émis par `solver.ts` == 19
`getJSON('/gamedata/*.json')` de `apps/renderer/src/data.ts`. C'est le « en 4
exemplaires » du `docs/todo.md` l.122 du gear-solver : juste, mais vérifié égal.

### 1.2 Chemins de synchronisation

- **`gear-solver/data/sync.mjs`** (dev) : lit un checkout local d'outerpedia
  (`OUTERPEDIA_PATH` l.32, sinon deux chemins Windows codés en dur), copie les
  19 fichiers, **sort en erreur** si un manque (l.41, l.49). Sain.
- **`apps/desktop/src/data-sync.ts`** (runtime) : deux modes.
  - CHECKOUT (l.125-127) : gardé par le `hash` de `version.json`, mais
    **`continue` silencieux sur fichier manquant** (l.127) — un artefact
    retiré du contrat passerait inaperçu jusqu'au chargeur du renderer.
  - REPO (l.154) : résout le **SHA du dernier commit** de `Sevih/outerpedia`
    `main`, télécharge les 19 via `repo-source.ts` (jsDelivr l.27, repli
    raw.githubusercontent), écrit atomiquement. Gardé sur le SHA du repo, pas
    sur le hash des données : tout commit du site (CSS, guide…) déclenche un
    re-téléchargement complet. Pas un bug, un coût.
- **`apps/renderer/src/game-version.ts` l.11** : URL morte vers
  `Sevih/outerpediaV2` (déjà au `todo.md` l.43 du gear-solver).

### 1.3 Ce qui remplace `build.mjs` / `calc-stats.mjs`

Les deux fichiers n'existent plus dans gear-solver. Les commentaires qui les
citent comme « source de vérité du contrat » :

| Où                                                          | Dit                                                                                                                   | Vérité aujourd'hui                                                                                                                                                                                                   |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `datagen/generators/solver.ts` l.4, 84, 116, 132, 576       | `gear-solver/data/build.mjs`                                                                                          | **`solver.ts` lui-même** est le contrat (DONE l.11842 : port byte-identique sur 12 fichiers, puis 19). Côté consommateur, le schéma est `gear-solver/docs/data-schema.md` + `packages/core/src/gamedata.ts` (types). |
| `datagen/generators/solver-ingredients.ts` l.3              | `gear-solver/data/calc-stats.mjs`                                                                                     | **`solver-ingredients.ts`** produit les ingrédients ; la **formule** qui les consomme et fait foi est `packages/core/src/compose-stats.ts`.                                                                          |
| `gear-solver/packages/core/src/compose-stats.ts` l.3, 7, 29 | « data/calc-stats.mjs output », « outerpedia-v2's /api/admin/.../stats route », `ParserV3/extract_character_stats.py` | Trois références mortes ; le vrai amont est `data/derived/*.json` ← outerpedia `solver.ts`.                                                                                                                          |
| `gear-solver/data/README.md`                                | solver.ts « faithful port of the old local build.mjs + calc-stats.mjs »                                               | exact historiquement, mais le lecteur doit comprendre que l'étalon est **désormais** le port, pas l'original.                                                                                                        |
| `gear-solver/apps/renderer/src/lib/solver/ratings.ts` l.10  | `docs/damage-calc/binary-formulas-1.4.9.md`                                                                           | chemin inexistant dans gear-solver ; la formule vivante est `outerpedia/src/lib/damage/formula.ts` (`calcDamageCore`, `defenseTerm`).                                                                                |

## 2. Inventaire des règles dupliquées

Chaque entrée : où (les deux côtés), qui fait foi et pourquoi, résultat rejoué,
coût de n'en garder qu'une.

### 2.1 Base par niveau et paliers de limit break — **sain**

- gear-solver : `packages/core/src/compose-stats.ts` l.36-47 `baseAtLevel`
  (`min + floor((max−min)(L−1)/99) + (L>100 ? floor((max−min)(L−100)×mod/99000) : 0)`),
  `mod` lu dans `charLevelMax[\`${star}|${step}\`].statModifierAfter100`
(`lib/solver/engine.ts` l.272-273).
- outerpedia : `src/lib/damage/formula.ts` l.65 `calcStatByLevel` + l.77
  `calcBaseStat` (BigInt) ; `src/lib/data/char-progression.ts` l.86
  `limitBreakModifier` + l.96 `whiteStatsAt` (mod 200/400/700 par LB) ;
  `datagen/generators/solver-ingredients.ts` `extractBase`.
- Fait foi : la table `CharacterMaxLevelTemplet` (identique pour toutes les
  étoiles : (100→105, 200), (105→110, 400), (110→120, 700)) ; le solver la
  lit, le wiki la recopie. `whiteStatsAt` est l'oracle du test
  `char-progression.test.ts` l.23, lui-même « validé 0-diff in-game par le
  gear-solver ».
- Rejoué : ATK/DEF/HP/EFF/RES × 9 niveaux (1, 50, 100, 105, 110, 120 selon
  LB) × 129 persos = **6 966 valeurs, 0 écart** ; SPD à part (intrinsèque −
  évo) **1 161 valeurs, 0 écart**. Ex. M.S.Ame 2000110 lv105 (mod 200) : ATK
  783 des deux côtés (min 74, max 744), HP 3419, DEF 292.
- Garder une seule : la règle tient en 5 lignes ; le risque est le `200/400/700`
  recopié dans `char-progression.ts` si la table change. Faire lire
  `charLevelMax` depuis `solver/char-level-max.json` (déjà committé) : **une
  heure**, dans `char-progression.ts`.

### 2.2 Bonus d'évolution (rang) — **déjà divergent**

- gear-solver : `compose-stats.ts` l.175-177 `EVO_UNLOCK_LEVEL`
  `{2:20,3:40,4:60,5:80,6:100,7:105,8:110,9:120}` codé en dur ; l.193-206
  `sumEvoUpTo` (ligne comptée si `ev ≤ min(étoile, 6+LB)` **et** niveau
  atteint) ; ingrédients `evoByLevel` lus de `characters.json`.
- outerpedia : `datagen/generators/solver-ingredients.ts` `extractEvoByLevel`
  avec la règle fusion l.532-533 (`evoCharId = fusionRow?.CharacterID ?? id`) ;
  `datagen/generators/progression.ts` l.134-136 `evoRewards[r.CharacterID]`
  (**sans** la règle fusion) ; `char-progression.ts` `computeStatSteps`
  (gating par niveau identique).
- Fait foi : le solver — `CharacterEvolutionStatTemplet` n'a **aucune ligne**
  pour 2700003/05/37/43/56/70 (vérifié dans `parsed/`), et
  `CharacterFusionTemplet` les renvoie vers 2000003/05/37/43/56/70. Le lock
  in-game « Core Fusion Notia lv100 EFF 255 » du gear-solver n'est atteignable
  qu'avec ces lignes.
- Rejoué : blanc (base + évo, sans geas) **12 771 valeurs, 206 écarts, tous
  sur les 6 Core Fusion**. Snow lv100 : évo Σ solver `{atk 101, def 105,
hp 1173, spd 24, dmgInc 6, eff 130}`, wiki `evoRewards` = `null`. Les 123
  autres : 0 écart.
- Garder une seule : appliquer la même règle fusion dans `progression.ts`
  (3 lignes, l.136) — **une heure**, plus la mise à jour des snapshots de
  fiche. Mieux : faire lire `evoRewards` à la fiche depuis
  `solver/characters.json` (`evoByLevel`), ce qui supprime la seconde
  extraction. `EVO_UNLOCK_LEVEL` codé en dur côté solver est égal à
  `CharacterEvolutionTemplet` (vérifié pour les étoiles 1/2/3) mais devrait
  être émis dans le contrat (voir § 3).

### 2.3 Transcendance, codex, quirks (geas) — **sains**

- Transcendance : solver `compose-stats.ts` (ingrédients `transcendByStar`) ;
  outerpedia `src/lib/transcendence.ts`, `datagen/extractor/transcend.ts`
  (byStar + overrides), `solver-ingredients.ts` `extractTranscendByStar`
  (lignes du perso, sinon `CharacterID="0"` filtrées par étoile de base).
  Rejoué : **946 paliers, 0 écart**.
- Codex : solver `lib/composeBuild.ts` l.51 `codex = trunc(base × codexPct / 100)`,
  `gamedata.ts` `resolveCodexLevel` ; outerpedia `stat-compose.ts`
  `composeStep` (`archiveRate` ‰). Rejoué : **12 niveaux identiques**, et le
  terme codex est couvert par le rejeu de `CalcFinalStat` (§ 2.6).
- Quirks : solver `extractGeasByNode` → `geasByNode` ; outerpedia
  `progression.ts` « quirks au niveau max ». Rejoué : **2 064 valeurs,
  0 écart**.
- Fait foi : les tables, lues des deux côtés par le même extracteur
  (`datagen/`). Pas de code arithmétique dupliqué ici, seulement deux
  projections des mêmes lignes. Coût de consolidation : nul à faire, la seule
  dette est que la fiche n'utilise pas `solver/characters.json`.

### 2.4 Passif de classe et passif de noyau (`BT_STAT_PREMIUM`) — **déjà divergent**

- gear-solver : `compose-stats.ts` l.311-445 `composeCharStats`, seau
  `buffPct` = classPassive + skill8 + geas IOT_BUFF + S1/S2/S3 + core ; EFF/RES
  via `CalcFinalStat` complet, SPD/CHC/CHD additifs plancher.
- outerpedia, côté contrat : `solver-ingredients.ts` l.305-361
  `extractClassPassive` (Skill_22, niveau max, `pickMaxBuff`) et l.556-558
  `corePassive` (`/^2700\d{3}$/`, Skill_23, bloc entier).
- outerpedia, côté fiche : `progression.ts` l.163-199 `premium` =
  `Skill_23 || Skill_22`, **premier** buff `BT_STAT_PREMIUM` du **premier**
  niveau, `break` l.199 ; `stat-compose.ts` l.171 `composeStep` l'applique
  (CHC/CHD : `floor(white × buffPM / 1000)`).
- Fait foi : le solver (locks in-game, § 2.2) ; en plus la fiche prend
  Skill_23 **à la place** de Skill_22 quand les deux existent, donc perd le
  passif de classe des Core Fusion.
- Rejoué [9] : **5/129 divergents**, tous Core Fusion :
  - Snow : wiki `{atk rate 102}` vs solver core
    `{spd 6, atkPct 10.2, defPct 2.7, hpPct 12.5}` → DEF 1257 vs 1429, HP
    5202 vs 7171, SPD 138 vs 160 à lv100.
  - Lisha : wiki `{atk rate 102}` vs classe `{atkPct 10}` + core
    `{spd 5, atkPct 10.2, defPct 2.7, hpPct 12.5}`.
  - Veronica : wiki `undefined` vs classe `{defPct 15}` ; Eternal : `undefined`
    vs `{atkPct 10}` ; Epsilon : `undefined` vs `{chc 5}` (CHC 15 vs 20).
  - Notia : `{buff_chance rate 500}` vs core `{effRate 50}` — même valeur,
    unités différentes (‰ vs %), mais EFF 90 vs 255 parce que l'évo manque
    (§ 2.2).
- Garder une seule : supprimer `premium` de `progression.ts` et faire lire
  `classPassive` + `corePassive` à `composeStep` depuis `solver/characters.json`
  (déjà au bon format, `StatBlock`) — **une demi-journée**, dont la
  conversion des clés engine → clés d'affichage (`reco-api.ts` l.112
  `STAT_KEY` fait déjà l'inverse). C'est le correctif qui rend les 6 fiches
  Core Fusion justes.

### 2.5 Passifs permanents S1/S2/S3 — **déjà divergent (couche absente du wiki)**

- gear-solver : `solver-ingredients.ts` l.472-474 `s1/s2/s3ByLevel`
  (filtre strict `extractSkillPassiveByLevel` : `BT_STAT_PREMIUM` + cible ME +
  PASSIVE + condition NONE + `TurnDuration −1`), appliqués dans
  `composeCharStats` au niveau de compétence capturé.
- outerpedia : **rien** — la fiche n'a pas cette couche ; `StatsRankingSection`
  suppose skills Lv5 pour le CP mais pas pour les stats.
- Fait foi : le solver (c'est le jeu : Ame 2000065 affiche CHC 46 en jeu avec
  S2 Lv5).
- Rejoué [11] : **3 persos** — Claire `s2 lv5 {atkPct 10}` (ATK lv100 1002
  wiki vs 1096), Ame `{chc 25}` (21 vs 46), Bell Cranel `{atkPct 30}` (2094 vs
  2642).
- Garder une seule : la fiche doit décider si elle affiche « skills max » ;
  si oui, ajouter la couche depuis `solver/characters.json` dans
  `composeStep` — **deux heures**, le même chantier que § 2.4.

### 2.6 `CalcFinalStat` et CP — **sains**

- `CalcFinalStat` : solver `compose-stats.ts` l.227-246 (`Math.trunc`,
  doubles) ; outerpedia `src/lib/damage/formula.ts` l.101 (BigInt, audit D1)
  - adaptateur `stat-compose.ts` l.135. Rejoué [4] : **7 740 évaluations**
    (130 persos × 4 niveaux × 5 axes × 3 jeux de gear) + **20 000 tirages
    aléatoires avec buffs négatifs : 0 écart**. La différence BigInt/double
    n'est pas atteinte aux ordres de grandeur du jeu.
- CP : solver `lib/solver/cp.ts` l.100 `calcBattlePower` (`starBonus =
showUIStar×500 + starPlus×120` l.56, fusion +5000 l.59, eeBp, ooBp) ;
  outerpedia `src/lib/combat-power.ts` l.39 `calcNoGearBattlePower` (même
  formule sans ee/ooparts), consommé par `StatsRankingSection.tsx`. Rejoué
  [5] : **130 persos lv120 étoile max sans gear, 0 écart** — Ame 2000110
  **20 240** (atk 2115 def 1382 hp 6526 spd 162 chc 15 chd 180 eff 190 res
  144), Luna 2000119 **28 011**.
- Fait foi : le solver (`docs/reference.md` § 2.2, 0-diff in-game sur 5
  persos) ; `combat-power.test.ts` l.5 le reconnaît.
- Garder une seule : `combat-power.ts` est un port à l'identique de 60
  lignes, sans dépendance. Le déplacer dans un paquet partagé (§ 4) :
  **une heure**, ou le laisser — c'est le doublon le moins risqué, à
  condition de garder le test aux snapshots (19413, 24059, 24605, 25497).

### 2.7 Main stat de gear (enchant, palier, singularité) — **déjà divergent (arrondi)**

- gear-solver : `packages/core/src/parse.ts` l.73 `mainMult`
  (`(1 + 0.4·lv)(1 + 0.05·tier)` + activation 0.15 + paliers singularité lus
  de `enhance.json`), l.87 `roundMain` = `floor(x + 1e-9)`, l.154
  `enhanceLevel = ascended ? 10 + SingularityLevel`.
- outerpedia : `src/lib/damage/item.ts` l.16 `sumFactorsF32` + l.28
  `itemMainOptionValue` (chaîne **float32** + `trunc`, fidèle au binaire) ;
  `datagen/generators/enhance.ts` l.110 lit `UpgradeFactorforOP` (repli 0.4) ;
  `datagen/generators/solver.ts` l.277-279 **recode** `enhanceFactor = 0.4 ;
tierFactor = 0.05 ; maxEnhanceLevel = 10` tout en lisant les paliers de
  singularité dans `SingularityEquipEnchantTemplet`.
- Fait foi : **outerpedia** `item.ts` — c'est la seule implémentation
  calquée sur l'arithmétique float du binaire (1.4.9) ; le solver vise le même
  résultat par un epsilon.
- Rejoué [13] : 84 bases × 11 niveaux × 5 paliers × 6 singularités =
  **27 720 valeurs, 21 écarts de 1 point**, tous avec `tier=1` ou `lv=4,
tier=0` : `base=60 lv0 tier1 : 63 vs 62`, `base=90 lv4 tier0 : 234 vs 233`,
  `base=120 lv0 tier1 : 126 vs 125`, `base=200 lv2 tier1 : 378 vs 377`. Le
  solver arrondit **au-dessus** du jeu dans ces cas (1.05 n'est pas
  représentable : en float32 60×1.05 = 62.99999…, tronqué à 62).
- Non vérifié en jeu : lequel des deux le jeu affiche réellement sur ces
  21 cas — il faudrait une capture d'une pièce +0 palier 1 de base 60/120/200.
  L'indice float32 est fort (les 9 locks du solver passent, mais ils portent
  sur des stats finales, pas sur une main stat isolée à tier 1).
- Garder une seule : porter `sumFactorsF32` dans `parse.ts` (20 lignes,
  `Math.fround`) et lire `enhanceFactor/tierFactor/maxEnhance` de
  `enhance.json` dans `solver.ts` au lieu des constantes — **deux heures**.

### 2.8 SPD en `OAT_RATE` (baseline pré-cuite) — **peut diverger**

- outerpedia contrat : `solver-ingredients.ts` l.11, l.257-291
  `applyStatBonus` — un `OAT_RATE` sur ST_SPEED devient un flat
  `floor(baseForRate.spd × value / 1000)` avec `baseForRate = base.spd.max +
evoMax.spd` (lv100, évo max).
- outerpedia fiche : `stat-compose.ts` `composeStep` applique le rate sur le
  **blanc du palier** (`white + qStat flat`).
- Portée : une seule ligne dans les tables, `core_passive_2star_ablity_speed`
  (ST_SPEED 43 ‰, Skill_23 de Snow et Lisha) ; aucune en éveil, aucun Skill_22
  à plus d'un buff ou d'un niveau. Le solver donne Snow SPD 160 (lock lv100),
  la fiche 138 — mais la fiche n'applique de toute façon pas le core (§ 2.4).
- Fait foi : le solver, par le lock. Rejoué : couvert par [3c] ; **non
  vérifié** isolément (il faudrait la fiche avec le core appliqué).
- Garder une seule : choisir la baseline du jeu (`CalcFinalStat` applique les
  rates sur `base+evo+awak` du **niveau courant**, pas lv100) ; le pré-cuit
  du contrat est donc faux sous lv100 pour ces deux persos. Émettre le rate
  brut dans `corePassive` (`spdPct`) et laisser `composeCharStats` le cuire :
  **deux heures**, contrat + solver.

### 2.9 Kit scaling, bestSkill, Skill_8 — **sains (déjà partagés)**

- Kit scaling (`BT_SWAP_STAT_ATTACK` / `BT_DMG_OWNER_STAT`) :
  `datagen/lib/kit-scaling.ts` l.72 `kitScaling`, règle **unique** depuis le
  lot F6 (G11), consommée par `solver.ts` (`deriveDmgScaling`) et
  `damage-scaling.ts`. Rejoué [8] : **129 persos, 0 écart** entre
  `dmgStat/dmgSec` du contrat et le wiki.
- bestSkill : `datagen/generators/solver-best-skill.ts` l.76 `bestSkillOf`
  via `stateTotalFactor` de `src/lib/damage/report.ts` — une seule source, le
  solver ne fait que lire `bestSkill`.
- Skill_8 par palier : `extractSkill8ByLevel` vs `progression.ts` (buffMaxRows).
  Rejoué [10] : **15 136 valeurs, 0 écart**.

### 2.10 Verdict flat / % des substats — **sain**

- gear-solver : `lib/subValue.ts` l.26 `flatVsPctTick` ; outerpedia
  `src/lib/substat-verdict.ts` l.80 `judgeSubstat` (`CLOSE_MARGIN 0.05`
  l.73) + `src/lib/data/sub-ticks.ts` (lit `solver/sub-ticks.json`, ligne 6★).
- Rejoué [14] : **1 548 verdicts, 0 écart** hors zone « close » (que le
  solver n'a pas). M.S.Ame ATK lv120 : `sum_flat 1553`, ticks `{flat 40,
pct 4}` → équivalent 62.12, breakeven 1000, « pct » des deux côtés.
- Fait foi : même table `sub-ticks.json`, même arithmétique ; la zone
  « close » est un choix éditorial du wiki, pas une règle du jeu.

### 2.11 Vocabulaires de stats et contrats d'échange — **sains, mais trois dictionnaires**

- Clés engine (`atk, atkPct, critRate, …`) : `packages/core/src/stats.ts`
  l.29-49 `GAME_STAT` (ST_* → clé, `addPercent`).
- Clés d'affichage wiki (`ATK, CHC, CHD, PEN%, DMG UP%…`) et slugs
  (`critical_rate, buff_chance…`) : `src/lib/data/reco-api.ts` l.112
  `STAT_KEY`, `char-progression.ts` `SLUG_TO_KEY`/`BONUS_KEY`,
  `datagen/lib/stats.ts` (`PERCENT_STATS`, `RAW_FLAT_STATS`).
- Hero-tracker (`outerpedia:hero-tracker` v1) : gear-solver
  `lib/heroTracker.ts` l.18-31 (niveau 5..120, transcend ≤ 9, fusion 1..5) ↔
  outerpedia `tools/_contents/hero-tracker/roster-import.ts` l.76-77 (mêmes
  bornes, même règle fusion). Vérifié par lecture : identiques.
- Coût : nul tant que la liste de stats ne bouge pas ; au premier nouveau
  `ST_*`, trois fichiers à toucher. Une table unique dans le contrat
  (`solver/options.json` porte déjà `st`/`ap`) suffirait.

## 3. Constantes recopiées de tables (le « peut diverger »)

| Constante                             | Codée en dur                                    | Lue d'une table ailleurs                                                   | Aujourd'hui |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------- | ----------- |
| `0.4` croissance enchant              | `datagen/generators/solver.ts` l.277            | `enhance.ts` l.110 ← `ItemEnchantTemplet.UpgradeFactorforOP` (0.4 partout) | égal        |
| `0.05` facteur de palier              | `solver.ts` l.278                               | `enhance.ts` ← `ItemBreakLimitTemplet.Factor1..4` (0.05)                   | égal        |
| `10` enchant max                      | `solver.ts` l.279                               | `enhance.ts` (`maxEnhance 10`)                                             | égal        |
| `EVO_UNLOCK_LEVEL` {2:20…9:120}       | `compose-stats.ts` l.175-177                    | `CharacterEvolutionTemplet` (identique pour étoiles 1/2/3)                 | égal        |
| `evoCap = 6 + LB`                     | `compose-stats.ts` l.190, l.326                 | implicite dans `CharacterMaxLevelTemplet` (3 steps)                        | égal        |
| `200/400/700` mod LB                  | `char-progression.ts` l.86 `limitBreakModifier` | `solver/char-level-max.json` (émis par `solver.ts`)                        | égal        |
| `REFORGE_PER_SUB_CAP = 6`             | `lib/solver/engine.ts` l.746                    | aucune table lue ; règle du jeu non datée                                  | non vérifié |
| `TARGET_DEF = 2000`, `DR_FLOOR = 0.3` | `lib/solver/ratings.ts`                         | modèle d'évaluation du solver, pas une règle du jeu                        | n/a         |
| baseline SPD = lv100 + évo max        | `solver-ingredients.ts` l.11                    | le jeu cuit au niveau courant (`CalcFinalStat`)                            | § 2.8       |

Aucune n'est fausse à 1.11.404 ; chacune est un rendez-vous manqué au prochain
patch qui toucherait la table correspondante, sans test pour le signaler
(`packages/core` n'a **aucun test** sur `compose-stats.ts` ; les tests du
renderer couvrent `cp.ts` et `ratings.ts`).

## 4. Ce que coûterait n'en garder qu'une, et où

**Où** : `gear-solver/packages/core` est déjà un paquet pur (pas de DOM, pas
de Node, types dans `gamedata.ts`) et contient la composition validée en jeu.
C'est là que la règle doit vivre. outerpedia produit le contrat JSON ; il peut
consommer le paquet (dépendance npm Git ou publication) sans cycle, puisque le
paquet ne dépend que des JSON.

| Lot                                                                                    | Supprime                                                               | Coût                                     |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| A. Fiche wiki lue depuis `solver/characters.json` (évo fusion, classe+core, S1-S3)     | `progression.ts` `premium`/`evoRewards`, moitié de `composeStep`       | 1 jour + tests (corrige § 2.2, 2.4, 2.5) |
| B. `composeCharStats` + `calcBattlePower` importés dans outerpedia                     | `whiteStatsAt`, `computeStatSteps` (partie compose), `combat-power.ts` | ½ jour + ½ jour de tests oracle          |
| C. Constantes du § 3 sorties des sources (lire `enhance.json`, émettre `evoUnlock`)    | 6 constantes recopiées                                                 | ½ jour                                   |
| D. Arrondi float32 porté dans `parse.ts`                                               | 21 écarts § 2.7                                                        | 2 h (+ capture en jeu pour trancher)     |
| E. Nettoyage des commentaires morts (§ 1.3) et `continue` silencieux de `data-sync.ts` | 6 références, 1 garde                                                  | 1 h                                      |

Total : **deux à trois jours**, lots indépendants, A d'abord (c'est le seul
qui corrige des pages en production). Ce qui **ne doit pas** être fusionné :
`damage/formula.ts` (BigInt) reste la référence binaire du damage calculator ;
`ratings.ts` est un modèle du solver, pas une règle du jeu.

## 5. Classement

**Déjà divergent**

1. Bonus d'évolution des 6 Core Fusion absents de la fiche (§ 2.2) — 206 valeurs.
2. Passif de classe + noyau réduit à un buff sur la fiche (§ 2.4) — 5 persos.
3. Passifs S2 permanents absents de la fiche (§ 2.5) — Claire, Ame, Bell Cranel.
4. Arrondi main stat double vs float32 (§ 2.7) — 21/27 720, 1 point.

**Peut diverger au prochain patch**

5. `0.4 / 0.05 / 10` recodés dans `solver.ts` (§ 3).
6. `EVO_UNLOCK_LEVEL` et `6 + LB` recodés dans `compose-stats.ts` (§ 3).
7. `200/400/700` recodés dans `char-progression.ts` (§ 3).
8. Baseline SPD pré-cuite lv100 pour les `OAT_RATE` (§ 2.8).
9. Deux filtres « passif permanent » (strict / premier buff) qui se rejoignent par
   hasard des données (§ 2.4).
10. Trois dictionnaires de clés de stats (§ 2.11).
11. `data-sync.ts` CHECKOUT : artefact manquant ignoré ; REPO : gardé sur le SHA
    du repo (§ 1.2).

**Sains**

12. Base par niveau et paliers LB (§ 2.1) — 6 966 + 1 161 valeurs, 0 écart.
13. `CalcFinalStat` (§ 2.6) — 27 740 évaluations, 0 écart.
14. CP (§ 2.6) — 130 persos, 0 écart.
15. Transcendance, codex, quirks (§ 2.3) — 946 + 12 + 2 064, 0 écart.
16. Kit scaling, bestSkill, Skill_8 (§ 2.9) — partagés ou 0 écart.
17. Verdict flat/% (§ 2.10) — 1 548, 0 écart.
18. Contrat de données (§ 1.1) — 19/19 identiques sur les trois copies.
19. Format hero-tracker (§ 2.11) — bornes et règle fusion identiques.

**Non vérifié** : la valeur affichée en jeu pour les 21 cas d'arrondi (§ 2.7)
et le SPD d'un Core Fusion sous lv100 (§ 2.8) — les deux demandent une
capture que ce rapport n'avait pas.
