# Damage calculator — mapping données du jeu ↔ formules

> Compagnon de [damage-formula.md](./damage-formula.md) : pour chaque **entrée**
> des formules extraites du binaire, la table et les colonnes de
> `.gamedata/parsed/` qui la fournissent. Ce document prépare les extracteurs
> **dédiés au damage calculator** — séparés de `datagen/generators/` et
> `datagen/extractor/`, dont les règles (curation, rétention, promotion) sont
> pensées pour la donnée AFFICHÉE, pas pour un moteur de calcul.
>
> Convention de lecture : ✅ = jointure vérifiée (données ouvertes + binaire) ;
> ⚠️ = forme vérifiée mais sémantique/jointure à confirmer ; les incertitudes
> renvoient au § 12 de la spec des formules.

## 1. Où vit la donnée

- Les tables brutes sont dans `.gamedata/parsed/*.json` (sortie couche 1 de
  datagen). **Colonnes éparses** : une ligne ne porte que les colonnes remplies ;
  **tout est string** (nombres et booléens compris) — les extracteurs doivent
  parser et défaut-à-zéro explicitement.
- Les primitives neutres de lecture (`@datagen/lib/tables` : cache, mtime,
  schéma effectif) sont réutilisables — ce sont les **règles métier** des
  générateurs existants qui ne le sont pas.

## 2. Stats de base (spec § 3.1 / § 3.2)

| Entrée formule        | Source                                                                                                                                                                                                                                                                                                                                                                          | Statut                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `min`, `max` par stat | `CharacterTemplet` : paires `HP_Min/Max`, `Speed_`, `Atk_`, `Def_`, `CriticalRate_`, `CriticalDMGRate_`, `BuffChance_`, `BuffResist_`                                                                                                                                                                                                                                           | ✅ le binaire lit ces champs du templet (HP à +0x64, ATK +0x72, DEF +0x76 dans `GetValueByLevel`) |
| `level`               | choix utilisateur (1 à `MAX_CHARACTER_LEVEL` = 120)                                                                                                                                                                                                                                                                                                                             | ✅                                                                                                |
| `modifierAfter100`    | `CharacterMaxLevelTemplet.LevelUpStatModifierAfter100` par (BasicStar, Element, Step) : palier 1 (→105) = 200 ‰, palier 2 (→110) = 400 ‰, palier 3 (→120) = 700 ‰                                                                                                                                                                                                               | ✅ champ 0x88 de CCharacterData, § 3.2                                                            |
| stats monstres        | `MonsterTemplet` (4492 lignes) : paires Min/Max étendues — HP/WG/Speed/Atk/Def/CriticalRate/CriticalDMGRate/BuffChance/BuffResist **plus** DMGReduceRate, PiercePowerRate, Vampiric, CounterRate, DamageBoost, Avoid, AvoidAddCap — et `BuffImmune`/`StatBuffImmune` ; `NPCCharacterTemplet` porte ses propres `SpawnAdvantageRate_*`. Pas de branche post-100 (réservée CT_PC) | ✅ colonnes inventoriées                                                                          |

Les stats sans paire Min/Max (Vampiric, PiercePower, DMGBoost…) partent de 0 et
ne viennent que des couches suivantes (items, buffs).

## 3. CalcFinalStat — les 13 paramètres (spec § 3)

| Paramètre                   | Source                                                                                                                                                                                                                                                                                                                                                                                          | Statut                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `base`                      | § 2 ci-dessus (`SetBaseValue`)                                                                                                                                                                                                                                                                                                                                                                  | ✅                                                                                                                                               |
| `spawnAdvantageRate`        | colonnes `SpawnAdvantageRate_{HP,Atk,Def,Spd}` des tables de contenu : `DungeonTemplet`, `AdventureDungeonTemplet`, `ExplorationStageTemplet`, `GuildDungeonLevelTemplet`, `MonadGateNodeTemplet`, `EventRankChallengeTemplet`, `SingularityGradeTemplet`, `WorldBossGradeTemplet`, `IrregularInfiltrateNodeTemplet`/`ItemTemplet`, et par NPC dans `NPCCharacterTemplet`. Monstres uniquement. | ✅ (colonnes)                                                                                                                                    |
| `evolutionValue` (plat)     | `CharacterEvolutionStatTemplet` : par (CharacterID, EvolutionLevel), `RewardStatType_i`/`RewardValue_i`                                                                                                                                                                                                                                                                                         | ✅ **cumul** : somme de TOUTES les lignes `EvolutionLevel ≤ courant` (spec § 17.3)                                                               |
| `awakeningValue`/`Rate`     | `CharacterAwakeningNodeTemplet` (arbre, `AwakeningLevelGroupID`) → `CharacterAwakeningLevelTemplet` : `OptionType` = `IOT_STAT` (→ `StatType`/`ApplyingType`/`OptionValue`) ou `IOT_BUFF` (→ `BuffID`, résolu en buff **niveau 1**)                                                                                                                                                             | ✅ `OAT_ADD` → somme plate, `OAT_RATE` → somme de taux, par stat (spec § 17.4) ; filtres élément/classe/race + nœuds « licence » liés à la scène |
| `monadEnchantValue`/`Rate`  | `MonadGateEnchantNodeTemplet` : par `ApplyCharacterID`, `IOT_STAT` ou `IOT_BUFF`/`BuffID` (idem éveil)                                                                                                                                                                                                                                                                                          | ✅ code identique à l'éveil (spec § 17.4)                                                                                                        |
| `transcendentStarValueRate` | `CharacterTranscendentTemplet.Reward{HP,Atk,Def}Rate` par (BasicStar, TransStar) — **HP/ATK/DEF uniquement**                                                                                                                                                                                                                                                                                    | ✅ prouvé par `GetValueByLevel` (switch stat 1/4/5, autres → 0)                                                                                  |
| `archiveStatValueRate`      | `ArchiveBonusTemplet` (CompleteCount → Level → `CharacterArchiveStatID`) → `CharacterArchiveStatTemplet.{Atk,Def,HP}_Rate`                                                                                                                                                                                                                                                                      | ✅ appliqué en taux sur ATK/DEF/HP seulement (spec § 17.3) ; l'`ArchiveStatID` du perso est une entrée utilisateur (progression de compte)       |
| `itemOptionValue`/`Rate`    | § 6 (équipement)                                                                                                                                                                                                                                                                                                                                                                                | —                                                                                                                                                |
| `buffValue`/`Rate`          | § 5 (buffs, en combat seulement)                                                                                                                                                                                                                                                                                                                                                                | —                                                                                                                                                |

Règle transversale ✅ : partout où apparaît le couple
`StatType`/`ApplyingType`/`OptionValue`, `OAT_ADD` alimente le paramètre **plat**
et `OAT_RATE` le paramètre **taux** (‰) de la stat `StatType`.

## 4. Skills et facteurs de dégâts (spec § 8)

| Entrée formule                  | Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Statut                                                                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| skills d'un perso               | `CharacterTemplet.Skill_1…Skill_22` → `CharacterSkillTemplet` (ID, `SkillType`, `SkillSubType`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | ✅                                                                                                                                                                                                  |
| `skillFactor` (‰)               | `CharacterSkillLevelTemplet` par (SkillID, SkillLevel) : `DamageFactor` (‰ de l'ATK), `WGReduce`, `BuffID` (liste), `Cool`/`StartCool`                                                                                                                                                                                                                                                                                                                                                                                                                                     | ✅ échelle validée dans la spec § 8                                                                                                                                                                 |
| facteurs par hit (multi-hit)    | `CharacterDamageTemplet` : ID **par perso** (`2000001_…`) ou communs (`DT_…`, `Common_…`, `Skip_…`) — `MultiHit`, `MaxHitCount`, `DamageFactor` (‰ par hit), `IsAdditiveAttack`                                                                                                                                                                                                                                                                                                                                                                                            | ✅ colonnes                                                                                                                                                                                         |
| **lien skill → damage templet** | DÉCOUVERT le 03/08/2026 : la colonne **`SkillID`** de `CharacterDamageTemplet` porte la jointure DIRECTE (1506/1542 lignes), en **CSV multi-skills** — la même chaîne sert le skill de base ET ses états burst (`2000055_Skill_2_* → 5502,5519,5520`), les états burst/upgrade étant des SKILLS séparés (slots 19-21, `SKT_BURST_1..3`). Le reliquat sans `SkillID` = templets communs (`DT_*`, `Skip_Finish_*`) affectés par AnimationEvents (spec § 12.4). La convention de nommage `<charId>_Skill_<n>[_<variante>]_<hit>` ne sert plus que de clé de chaîne INDICATIVE | ✅ jointure par colonne (extracteur livré) ; ⚠️ 256 skills à `DamageFactor > 0` SANS ligne de hits par cette jointure (chain passives, backups surtout) → AnimationEvents, marqués `hitsUnresolved` |
| équivalents monstres            | `MonsterSkillTemplet` (avec `TriggerName`) / `MonsterSkillLevelTemplet` (`DamageFactor`, `WGReduce`, `BuffID`, `Cool`) / `MonsterDamageTemplet` (IDs `<monsterId>_Skill_<n>_<hit>`) — ⚠️ constaté 03/08/2026 : la colonne `SkillID` n'y est JAMAIS remplie (0/961) — la jointure des persos n'existe pas côté monstres, seule la convention d'ID relie hits et skills. L'extracteur `targets` n'extrait PAS les hits (le rapport ne calcule jamais les dégâts de la cible), seulement types + niveaux pour leurs `BuffID`                                                  | ✅ formes inventoriées ; hits hors périmètre                                                                                                                                                        |

## 5. Buffs (spec § 9 / § 14 / § 15)

`BuffTemplet` (10 838 lignes) ↔ champs `CBuffTemplet` du binaire :

| Colonne                                              | Champ binaire (offset) | Rôle dans les formules                                                                                          |
| ---------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `Type` (`BT_*`)                                      | 0x24                   | familles § 9 (85–108 attaquant, 110/113/149 défenseur, 114–116 MAX…), soins/shields § 14                        |
| `StatType` / `ApplyingType` / `Value`                | 0x4C / 0x50 / 0x54     | buff de stat → `buffValue`/`buffValueRate` de CalcFinalStat ; sinon valeur de l'effet (‰ ou plat selon le type) |
| `StackCount`                                         | —                      | valeur effective = `Value × stacks` (§ 14.1, `CBuff.get_Value`)                                                 |
| `CreateRate` (‰)                                     | —                      | proba de pose → `CheckProbabilityPermille` puis `CheckResist` § 5 si débuff                                     |
| `BuffCreateType` / `TurnDuration` / `BuffRemoveType` | —                      | déclenchement/durée (moteur de combat, pas la formule)                                                          |
| `IsEquip` / `IsEquipBuff`                            | —                      | marqueurs des passifs d'équipement (spec § 15 : collectés par `GetBuffList` comme les autres)                   |

`BuffGroupTemplet`, `GuildBuffTemplet`, `TrustBuffTemplet`,
`PVPRealTimeLeaderBuffTemplet` : buffs de sources annexes, même format. ✅ forme /
⚠️ inventaire complet à faire à l'extraction.

Constaté à l'extraction (03/08/2026) : `BuffTemplet` n'a AUCUNE colonne de
référence vers d'autres buffs — la fermeture des refs est DIRECTE (pas de
transitivité) ; un `BuffID` peut avoir plusieurs lignes (`Level`), toutes
émises par l'extracteur `buffs`. ⚠️ La table a une colonne `ID` (numéro de
LIGNE) et une colonne `BuffID` (clé logique) : toute résolution se fait sur
`BuffID` — comparer à `ID` fait croire à des milliers de refs mortes. Les kits
de MONSTRES (`MonsterSkillLevelTemplet.BuffID`), les buffs de break
(`RageTemplet.BreakBuffID`, CSV) et les buffs de PALIER (`OptionID` des 4
tables de rang au schéma `CCustomBossLevelTemplet` — appliqués par
`CreateBuff` au changement de palier, vérifié binaire 03/08/2026) référencent
la MÊME table et entrent dans la fermeture via l'extracteur `targets`.

## 6. Équipement (spec § 15)

| Élément                  | Source                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Statut                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| pièce d'équipement       | `ItemTemplet` (`ItemSubType = ITS_EQUIP_*`, `MainOptionGroupID`, `SubOptionGroupID`, `BreakLimitGroupID`)                                                                                                                                                                                                                                                                                                                                              | ✅                                                                                        |
| options (main/sub)       | `ItemOptionTemplet` par `GroupID` : `Rate` (poids de tirage /10000), `OptionType`, `StatType`, `ApplyingType`, `OptionValue` → `itemOptionValue`/`Rate` selon `OAT_ADD`/`OAT_RATE`                                                                                                                                                                                                                                                                     | ✅                                                                                        |
| montée par enchant       | `ItemEnchantTemplet.UpgradeFactorforOP` : `enchantFactor = Σ float32 (niveaux 1..enchant)` ; **option principale** = `trunc_f32(OptionValue × (1 + enchant + singularité) × (1 + breakLimit))` — les sub-options ne sont PAS multipliées (spec § 17.5, moteur `item.ts`)                                                                                                                                                                               | ✅ formule extraite ; colonnes `Normal_i`…`Unique_i` hors chemin de calcul (spec § 12.14) |
| sets (2P/4P)             | `ItemSpecialOptionTemplet` : `OptionType_2P`/`_4P` + `StatType`/`ApplyingType`/`OptionValue`, ou buffs ; la sélection du `Level` d'un set se fait par le NOMBRE DE BREAK LIMIT de la pièce (`BreakLimitCount`, ex. « 0,1,2,3 » puis « 4 » — constaté 03/08) ; ligne `IsAdd=false` = remplace, `IsAdd=true` = s'ajoute                                                                                                                                  | ✅                                                                                        |
| équipement exclusif (EE) | `SpecialEquipEnchantTemplet` (coûts) ; l'effet PRINCIPAL est une option de type **buff**, résolue au niveau **`enchant + 1`** dans `BuffTemplet` (spec § 17.5). L'effet UNIQUE (`UniqueOptionID` de l'ItemTemplet) référence `ItemSpecialOptionTemplet` par **ID DE LIGNE** (pas GroupID — constaté 03/08) : `Level` 1 = base, `Level` 10 = « EE+10 », qui s'AJOUTE (`IsAdd=True`, buff `_ADD`) ou REMPLACE (`IsAdd=False`, buff `_CHANGE`) selon l'EE | ✅                                                                                        |
| break limit              | `ItemBreakLimitTemplet` (`Factor1..4`, float32 cumulés sur [0..breakCount-1]) se résout par (`BasicStar`, `ItemGrade`) — le `BreakLimitGroupID` des pièces n'est PAS une clé de cette table (constaté 03/08)                                                                                                                                                                                                                                           | ✅                                                                                        |
| artefacts                | `ArtifactTemplet.OptionID` → `BuffTemplet.BuffID` (`bid_artifact_*`, CSV base + variante `_e`) — des buffs ordinaires, comme prévu § 15 ; 4 lignes à effet DIRECT (`BuffType` `ABT_REDUCE_HP` + `BuffValue`) sans OptionID                                                                                                                                                                                                                             | ✅                                                                                        |

## 7. Contenus et configuration (spec § 7 / § 14 / § 16)

- `GameConfigTemplet` (ID → ValueString) — valeurs 1.4.9 vérifiées :
  `MISSED_DAMAGE_RATE = 500` ✅ (= la constante § 7),
  pénalités PvP ✅ **mécanisme extrait** (spec § 17.6) : premier cycle au tour
  `PVP_ATK_PENALTY_START_TURN` (10) puis tous les `_LOOP_TURN` (5) ; dégâts aux
  attaquants = `_DMG_RATE` (100 ‰ des PV max) `+ _ADD_RATE` (30 ‰)/cycle sans cap,
  percent UNDEAD ; soins réduits de `PVP_HEAL_PENALTY_REDUCE_RATE` (500 ‰)
  `+ _ADD_RATE` (250 ‰)/cycle, cap 1000 ‰ — **0 avant le premier cycle** ;
  `CHECK_AVOID_VALUE_1..4 = 1000/1/100/1` (rôle exact non tracé),
  `MAX_CHARACTER_LEVEL = 120`.
- PvP temps réel : `PVPRealTimeFieldSkillTemplet` (`Turn`, `DMG`,
  `ReduceReceiveHeal`, `BuffChance`, `BuffID`) — alimente le bonus plat
  `PvpRealtimeFieldSkillValue` (§ 16) et `FieldSkillReduceReceiveHeal` (§ 14.3). ✅ colonnes
- Caps de stat par scène (§ 12.10) : source de données non identifiée
  (piste : `TowerElementalConfigTemplet`).

## 8. Reste à tracer côté données

1. Le **choix de variante** des damage templets (`_Upgrade`, `_A/_B`, `_New`…) par
   skill et par état d'ascension — la convention d'ID donne les candidats, pas la
   sélection (curation ou vérification in-game).
2. Les remplisseurs du cap de stat par scène (§ 12.10) et des champs
   `AddRateAtk`/`AddRateDef` (§ 12.13 — setters inlinés, défaut 0).
3. Consommateurs des colonnes `Normal_i`…`Unique_i` de `ItemEnchantTemplet`
   (§ 12.14 — hors chemin de calcul déterministe).
4. Inventaire effectif des buffs annexes (guilde, trust, leader PvP temps réel) au
   moment de l'extraction — le format est le `BuffTemplet` standard.

## 9. Extracteurs dédiés — principes actés

> RÉALISÉ (03/08/2026) pour les CINQ extracteurs : module `datagen/damage/`
> (`characters.ts`, `growth.ts`, `equipment.ts`, `targets.ts`, `buffs.ts`,
> `config.ts`, `roster.ts`, `build.ts`), commande `pnpm damage:build` →
> `data/generated/damage/{characters,growth,equipment,targets,buffs,config}.json`,
> estampillés `resVersion` (version de ressources du manifeste — celle qui
> bouge quand les tables changent). Pas de couche `extracted`/`promote` : la
> revue est le diff git. GARDES DE SORTIE : les persos passent par le roster
> VALIDÉ `data/generated/characters.json`, les cibles par les BOSS des
> rencontres vivantes de `data/generated/encounters.json` (preuve
> d'intégration, même philosophie que `lib/released.ts`) — un patch non promu
> ne peut rien publier de non sorti. Les SPAWNS (niveau, adv ‰, PV de boss)
> ne sont PAS ré-extraits : la clé de liaison est l'ID de monstre, les
> contextes viennent d'`encounters.json` comme entrées de scénario
> (report-inputs § 6.4). Invariants : `datagen/damage/damage-data.test.ts`.

- **Séparation** : nouveau module (proposition : `datagen/damage/`), qui ne
  réutilise NI les specs de `datagen/extractor/`, NI les règles des générateurs
  (curation d'affichage, rétention, arrondis d'UI). Seules les primitives
  neutres (`lib/tables`, enums) sont partagées.
- **Fidélité > présentation** : les extracteurs livrent les valeurs BRUTES du
  jeu (‰, plats, IDs), dans les unités des formules — aucun arrondi, aucun
  renommage cosmétique. La mise en forme est le travail de l'UI du calculateur.
- **Sortie propre** : artefacts JSON dédiés (par exemple
  `data/generated/damage/`), jamais mélangés aux entités affichées — une
  correction d'affichage ne doit jamais pouvoir changer un calcul.
- Toute donnée ⚠️ ci-dessus est extraite avec son statut : le calculateur doit
  savoir ce qui est certain et ce qui attend une vérification in-game.
