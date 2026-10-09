# Audit — les tables du jeu jamais lues

> Tâche T7 du 2026-10-09. Données : `outerpedia-gamedata` en version de tables
> **1.11.404** (258 tables dans `parsed/`) et client décompilé **1.4.18**
> (`apk/dumped/src/`, numérotation différente, même build), outerpedia au
> commit `1d55c84`. Ce document est un constat : il ne change rien au code ni
> aux données. Il cite des noms de classes et de méthodes du client, jamais leur
> code (règle 10 : ce dépôt est public).

## En bref

- La génération lit **89 tables sur 258** : 84 par `datagen:build`, 5 de plus
  par `damage:build`. Les **169 autres** ne sont lues par rien qui produise une
  donnée du site.
- Le client du jeu en consulte **163** : **6 sont chargées mais jamais
  consultées** (`AreaRewardTemplet`, `EventGachaTemplet`,
  `EventIntegrationTemplet`, `EventIntegrationCategoryTemplet`,
  `MonadGateArtifactGroupTemplet`, `RemainsRewardTemplet`). Elles sont
  écartées : ce qu'elles disent n'est pas ce que le jeu affiche ou calcule
  (§ 3).
- Ce qui vaut la peine, dans l'ordre d'intérêt pour un joueur :
  1. **Les sources de ressources hebdo/mensuelles** (`ItemCraft*`,
     `IrregularChaseExchangeTemplet`, `MissionTemplet`/`MissionTaskTemplet`,
     `AttendanceRewardTemplet`, `IrregularInfiltrate*`) : elles redonnent à
     l'unité près **23 des 38 quantités** saisies à la main dans
     `data/curated/timegate-resources.json` (§ 1.1). **Mais** le code du jeu
     montre que la moitié des quantités d'Irregular Extermination n'est
     accessible qu'avec un **pass payant** : le guide les compte comme un gain
     de tout joueur.
  2. **Une mécanique de personnage invisible sur le site** : sous sa première
     forme, Demiurge Saeran (`2000129`) ne peut recevoir ni bouclier, ni
     invincibilité, ni résurrection, ni immortalité. C'est ce qui garantit
     qu'elle meure pour se transformer (§ 1.4).
  3. **Les héros que le jeu recommande lui-même** pour 176 combats (story,
     `DM_TOWER_HARD`, Special Request), affichés en jeu dans un écran
     « équipe recommandée » (`DungeonClearInfoTemplet`, § 2).
  4. **L'arène temps réel** (saisons, bans, règles de terrain, buffs de chef,
     récompenses, préréglages du mode « Tactics ») et **les reliques de Monad
     Gate** (166 artefacts), deux contenus que le site ne décrit pas.
- Écarts avec la saisie à la main : le check-in mensuel du guide Ether (750
  contre 800 sur 30 jours de connexion, cycle de 15 jours qui boucle, confirmé
  par le client) et le pass d'Irregular Extermination. La « mission quotidienne
  d'arène » de la première version de cet audit est en fait un **événement
  temporaire** : ce n'est pas une source régulière (§ 1.1).

## Méthode

### Qui lit quoi, côté outerpedia

Toutes les lectures de table passent par `loadTable`/`loadColumns`
(`datagen/lib/tables.ts`), donc par une seule fonction `load()`. Pour mesurer
plutôt que deviner, j'ai ajouté **temporairement** (non committé) une ligne en
tête de `load()` qui note le nom de chaque table chargée dans un fichier, puis
rejoué les deux générations sur les vraies données :

```bash
# dans datagen/lib/tables.ts, en tête de load() (instrumentation jetable) :
#   if (process.env.T7_LOG) appendFileSync(process.env.T7_LOG, name + '\n');
mkdir -p .editorial && cp -r ../outerpedia-gamedata/editorial/wallpapers .editorial/wallpapers
T7_LOG=/tmp/t7.log GAMEDATA_ROOT=../outerpedia-gamedata pnpm datagen:build
T7_LOG=/tmp/t7d.log GAMEDATA_ROOT=../outerpedia-gamedata pnpm damage:build --skip-anim
sort -u /tmp/t7.log /tmp/t7d.log | wc -l   # → 89
```

- `datagen:build` : 84 tables, sortie normale (« 130 persos, 1650 skills, 4848
  monstres… »).
- `damage:build --skip-anim` : 5 tables de plus (`ArtifactTemplet`,
  `BuffSystemTemplet`, `GameConfigTemplet`, `GuildBuffTemplet`,
  `MonadGateEnchantNodeTemplet`). Ses 42 fixtures passent et
  `data/generated/damage/` ressort **identique** à la version committée
  (`git status` propre après coup).
- La recherche statique des appels `loadTable('…')` dans `datagen/`, `src/` et
  `scripts/` retrouve exactement ces 89 noms : aucune table n'est chargée par
  un nom calculé que l'instrumentation aurait manqué.

Hors génération, deux lecteurs existent mais ne produisent rien pour le site :
l'admin local (`src/lib/admin/gamedata-store.ts`, navigateur générique de
toutes les tables, qui documente en commentaire les clés étrangères de
plusieurs tables non lues) et quick (`RecruitGroupTemplet`, déjà lue par le
build). `extract-portrait-fx.py` lit `CharacterExtraTemplet`, également déjà
dans les 89.

### Qui lit quoi, côté client du jeu

Le nom d'une table ne dit pas son usage. Pour chacune des 169, un script
jetable a parcouru `apk/dumped/src/` :

1. dans `CTempletManager`, le chargement de la table (`LoadData`,
   `AttachLoadData` ou `LoadUniTask`) et le dictionnaire qu'il remplit ;
2. les méthodes de `CTempletManager` qui lisent ce dictionnaire ;
3. les autres classes qui appellent ces méthodes ou nomment la classe de la
   table (`C<Table>`).

Les tables sans consommateur ont été revues à la main, parce qu'une méthode
intermédiaire peut masquer l'appel : `EventFireWorksEffectTemplet` semblait
morte, mais elle est lue par `GetFireWorkdsEffectName`, appelée par
`CUIEventFireWorksMain`. Il en reste six réellement mortes : chargées par
`CTempletManager`, jamais consultées. Pour les autres, le consommateur
principal figure dans l'inventaire (§ 3), et les tables qui portent un constat
ont été lues de près : propriétés de la classe de la table et méthodes qui les
utilisent.

Limite : le client dit ce qu'il affiche et calcule, pas ce que le serveur fait.
Une table morte côté client peut servir au serveur, par exemple pour les taux de
tirage. Elle ne décrit alors rien qu'un joueur voie, et un chiffre qu'on en
tirerait ne serait pas vérifiable depuis le client.

Les 89 tables lues, pour mémoire : `AdventureDungeonTemplet`,
`ArchiveBonusTemplet`, `ArchiveCharacterProfileTemplet`, `AreaTemplet`,
`ArtifactTemplet`, `BuffGroupTemplet`, `BuffSystemTemplet`, `BuffTemplet`,
`BuffToolTipTemplet`, `CharacterArchiveStatTemplet`,
`CharacterAwakening{Level,Node,}Templet`, `CharacterChangeTemplet`,
`CharacterDamageTemplet`, `CharacterEvolution{Stat,}Templet`,
`CharacterExtraTemplet`, `CharacterFusion{Level,}Templet`,
`CharacterMaxLevelTemplet`, `CharacterSkill{Enchant,Level,}Templet`,
`CharacterTemplet`, `CharacterTranscendentTemplet`, `ContentLockTemplet`,
`CostumeTemplet`, `DungeonPVEGroupTemplet`, `DungeonSpawnTemplet`,
`DungeonTeamConditionTemplet`, `DungeonTemplet`, `EventBossDungeonTemplet`,
`EventDungeonTemplet`, `EventRankChallengeTemplet`, `ExpCharacterTemplet`,
`ExplorationStageTemplet`, `GameConfigTemplet`, `GuildBuffTemplet`,
`GuildDungeon{Level,}Templet`, `GuildRaid{Geis,Grade,RankingReward,}Templet`,
`IrregularChaseTemplet`, `ItemBreakLimitTemplet`, `ItemEnchantTemplet`,
`ItemOptionTemplet`, `ItemSpecialOptionTemplet`, `ItemTemplet`,
`LobbyCustomResourceTemplet`, `MonadGate{EnchantNode,Event,NodeStage,Node,Route,ThemeRule,Theme}Templet`,
`MonsterSkill{Level,}Templet`, `MonsterTemplet`, `PVPRankTemplet`,
`ProductTemplet`, `RageTemplet`, `Recruit{GradeRecipe,Group,ItemRecipe,Recipe}Templet`,
`Reward{Group,}Templet`, `Singularity{DungeonGroup,EquipEnchant,Grade,Ranking,}Templet`,
`SpecialEquipEnchantTemplet`, `TextCharacter`, `TextItem`, `TextSkill`,
`TextSystem`, `ToolTipGroupTemplet`, `TowerElementalConfigTemplet`,
`TrustBuffTemplet`, `TrustTemplet`, `WorldBoss{Grade,League,Ranking,}Templet`.

### Ce que « non lue » ne dit pas

Une table lue peut avoir des colonnes jamais exploitées (exemple croisé en
passant : `DungeonTemplet.DungeonClearTip`, le conseil de combat officiel de
chaque donjon). Ce n'est pas l'objet de cet audit, qui porte sur les tables
entières.

### Comment les chiffres ci-dessous ont été obtenus

Par des scripts jetables (hors dépôt) qui lisent `parsed/*.json` et résolvent
les récompenses comme le jeu : `RewardTemplet` (monnaies + `StaticGroupID`,
`RandomGroupID`) → `RewardGroupTemplet` → `ItemTemplet` → `TextItem`. Les noms
de contenus viennent de `TextSystem` (anglais). Un chiffre qui dépend de ce que
le joueur fait (choix, tirage, rang, achat) est signalé comme tel.

---

## 1. Ce que les tables confirment, complètent ou contredisent dans la saisie à la main

### 1.1 `data/curated/timegate-resources.json` — les sources « non-shop »

Le fichier dit lui-même que ces quantités sont « une estimation joueur absente
de la donnée ». Elles sont en fait presque toutes dans des tables non lues.

| Source curée (clé)               | Table(s)                                                          | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kates-workshop` (7 quantités)   | `ItemCraftCategoryTemplet` + `ItemCraftConsumeTemplet`            | **7/7 identiques.** Transistones : 1 par fabrication, limite 3, `RET_MONTHLY` → 3/mois. Stardust et Memory Stone bleus : 10 × 7/semaine = 70. Violets : 10 × 1/semaine, pour 30 bleus (le `costAmount: 30` curé). Armor Glunite : 1 × 4/semaine. Le client applique bien `LimitCount` par catégorie (`CUICraftConsumablePanel`, compteur `CFacilityManager.CraftWorkshop`).                                                                                                                                                                                                                                                                                                                                |
| `irregular-extermination-points` | `IrregularChaseExchangeTemplet`                                   | **7/7 identiques, mais en comptant le pass payant.** Le curé additionne les pistes « Normal » et « Special » des quatre monnaies. Or `CIrregularData.IsRewardablePointExchange` ne rend une récompense `Special` réclamable que si `IsPurchasedIrregularPass()`, c'est-à-dire si le produit de boutique `PGT_IRREGULAR_PASS` a été acheté. Sans le pass, un joueur a Transistone (Total) 12, Transistone (Individual) **0** (au lieu de 12), Stardust bleu **60** (150), violet **120** (300), Memory Stone bleu **60** (150), violet **120** (300) et Armor Glunite **3** (9). Le cycle mensuel est confirmé côté client (`HasViewReddot` et `InTimeLimit` comptent depuis `CPlayer.m_ResetTimeMonthly`). |
| `weekly-mission`                 | `MissionTemplet` (ligne `MCT_WEEKLY`)                             | **Identique** : paliers 100 et 200 points → 1 Basic + 1 Intermediate Skill Manual.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `arena-weekly-play`              | `MissionTaskTemplet` (`MCT_PVP_WEEKLY_PLAY`)                      | **Identique** : 10/20/30 matchs → 5 Basic, 3 Intermediate, 1 Professional. Mission permanente, lue par `CPVPManager` et `CUIPvpMain`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `singularity-weekly-mission`     | `MissionTaskTemplet` (`MCT_SINGULARITY_WEEKLY`)                   | **Identique** : 5 missions × 20 Fusion-Type Core = 100.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `irregular-infiltration-floor-3` | `IrregularInfiltrate{Floor,Node,Event}Templet` + `DungeonTemplet` | **Partiel.** Transistones 9/9 et Professional Manual 3/3 identiques. Basic 28 et Intermediate 17 : la partie fixe (coffres 6/4 + combats 10/5) fait 16/9. Le reste dépend des événements de dialogue de l'étage, dont une issue rapporte 6 Basic + 4 Intermediate. 28/17 correspond à deux issues favorables sur trois nœuds de dialogue : c'est plausible, mais quel événement tombe sur quel nœud n'est pas dans le client.                                                                                                                                                                                                                                                                              |
| `singularity-*` (rank, daily)    | tables Singularity **déjà lues**                                  | Hors périmètre (13 quantités, tables lues).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

Au total, sur les 38 quantités curées : **23 identiques** (dont 7 qui supposent
le pass d'Irregular Extermination), 2 en partie (Basic/Intermediate de l'étage
3), et 13 qui viennent des sources Singularity (rang, run quotidien, classement
quotidien), donc de tables déjà lues.

**Ce que les tables ajoutent et que le guide ne compte pas :**

- **Check-in normal** (`AttendanceScheduleTemplet` 3, `ATT_NORMAL`, 15 jours,
  `Loop: 1`) : par cycle, 10 Basic + 5 Intermediate + 1 Professional Skill
  Manual, absents de l'onglet `books`. Le client confirme la boucle :
  `CAttendanceData.IsComplete` n'est jamais vrai pour un planning `IsLoop`.

**Corrigé par le code du jeu :** la première version de cet audit présentait
la « mission quotidienne d'arène » (`MCT_PVP_DAILY`, 2 Transistone (Total) par
jour) comme une source oubliée. Le client ne l'affiche que comme un événement
(`CUIEventUseAsset`, ouvert depuis `CTotalEventData` avec un compte à rebours ;
entrée `EventUITemplet` 13, « SYS_EVENT_PVP_TITLE »), dont les dates viennent du
serveur. Ce n'est pas une source régulière : elle n'a rien à faire dans un
tableau hebdo/mensuel.

**Ce que le site y gagnerait** : remplacer l'overlay chiffré par un générateur
qui lit ces tables, comme il le fait déjà pour les sources de shop. L'overlay
ne garderait que le choix des items et des onglets, les quantités qui dépendent
du joueur (choix de l'étage 3, rangs Singularity) et une marque « pass » sur
les paliers `Special`, pour séparer le gain gratuit du gain payant.

### 1.2 Guide « Ether income » (`src/app/[lang]/guides/_contents/general-guides/ether-income/data.ts`)

Pas dans `data/curated/`, mais saisi à la main de la même façon (« estimations
éditoriales »). Montants en Ether (`Crystal` dans `RewardTemplet`) :

| Ligne du guide                                                        | Table                                                | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daily.missions` 50                                                   | `MissionTemplet` (`MCT_DAILY`)                       | **Identique** : 5 + 15 + 30.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `weekly.missions` 150                                                 | `MissionTemplet` (`MCT_WEEKLY`)                      | **Identique**.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `weekly.singularityMissions` 250                                      | `MissionTaskTemplet` (`MCT_SINGULARITY_WEEKLY*`)     | **Identique** : 5 × 10 + 200.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `weekly.guildCheckin` 150                                             | `AttendanceRewardTemplet` (planning 4, `ATT_GUILD`)  | **Identique** : 150 sur le cycle de 7 jours, qui boucle aussi.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `monthly.checkin` 750                                                 | `AttendanceRewardTemplet` (planning 3, `ATT_NORMAL`) | **Divergent** : 400 au 15ᵉ jour d'un cycle de 15 jours de connexion qui boucle (confirmé par `CAttendanceData`), soit 800 pour 30 jours de connexion.                                                                                                                                                                                                                                                                                                                       |
| `daily.antiparticle` 78                                               | `AetherTemplet` + `FacilityTemplet`                  | **Non tranché.** Le client donne la formule (`CFacilityManager.GetRewardPerHour`) : taux horaire `BasicReward_0` du niveau de compte (3/h à partir du niveau 61), plus les améliorations `FET_AETHER_BASIC_INCREASE`, dans la limite de stockage `AETHER_BASIC_TIME` + `FET_AETHER_TIME`. 3/h donnent 72 par jour avant améliorations. 78 suppose +0,25/h, que je ne retrouve pas : la façon dont `GetFacilityEnchantValue` cumule les niveaux d'amélioration reste à lire. |
| `daily.arena` 20, `daily.missionEvent` 30, `monthly.jointMission` 880 | —                                                    | Non retrouvés dans les tables non lues (récompenses d'arène ou d'événement : tables lues ou serveur).                                                                                                                                                                                                                                                                                                                                                                       |

### 1.3 `data/curated/gear-reco.json` — confrontation aux préréglages de l'arène temps réel

`PVPPresetCharacterTemplet` (114 personnages) et `PVPPresetEquipTemplet` (909
lignes) sont lus par `CPvPRealtimeTactics` et
`CUIPvpRealtimeTacticsPresetChange` : ce sont les préréglages du mode
« Tactics » de l'arène temps réel, où le jeu fournit le personnage (niveau 100,
6 évolutions, 9★ pour les 114) et son équipement (+10). Chaque personnage a un
équipement par défaut (arme, amulette, set d'armure, talisman, EE) et des
choix autorisés. Sur les 90 personnages présents des deux côtés, l'équipement
**par défaut** du jeu figure parmi les recommandations curées :

- arme (même passif unique) : **49/90** ;
- amulette : **71/90** ;
- combinaison de sets : **30/90**.

Ce n'est **pas** une contradiction : le préréglage sert un mode PvP précis,
alors que la reco curée vise surtout le PvE. C'est une **vérification croisée**
possible : un écart sur l'amulette (19 personnages) mérite un coup d'œil, un
écart sur les sets est attendu. Une colonne « équipement Tactics proposé par le
jeu » sur la fiche serait une donnée officielle, sans opinion éditoriale.

### 1.4 Une mécanique que la fiche ne dit pas : `CharacterIgnoreBuffTypeTemplet`

Une seule ligne : le personnage `2000129` (Demiurge Saeran) ignore les buffs de
type `BT_INVINCIBLE`, `BT_REVIVAL`, `BT_RESURRECTION`,
`BT_SHIELD_BASED_CASTER`, `BT_SHIELD_BASED_TARGET` et `BT_UNDEAD`. Dans le
client, `CBuff.Initialize` refuse le buff dès que son **porteur** a ce type
dans sa liste. Elle ne peut donc recevoir ni bouclier, ni invincibilité, ni
résurrection, ni immortalité, quel que soit l'allié qui les donne.

Le code du jeu explique pourquoi. `CharacterChangeTemplet` transforme
`2000129` en `2000130` à sa mort (`ON_DIE`, traité par
`CCharacterBattle.RegisterReviveChangeCharacter`). La forme `2000130` est un
autre identifiant, que la liste ne couvre pas : c'est elle qui s'accorde
l'immortalité (`2000130_2_2`, `BT_UNDEAD`). La liste garantit simplement que la
première forme meure pour se transformer. Rien dans les skills générés
(`data/generated/skills.json`) ni dans `data/curated/characters.json` ne le
dit, alors que c'est décisif pour composer une équipe : un soutien à boucliers
ou à résurrection est sans effet sur elle avant sa transformation.

### 1.5 Ce qui a été confronté sans rien trouver

- **`tags.json`, tag `free`** : `EventRecruitTemplet` liste 6 personnages
  (D.Stella, D.Astei, D.Drakhan, D.Vlada, M.Eva et Luna `2000119`) liés aux
  événements de missions Demiurge (`CIvanez`, `CMirshaSettlement`). Aucun n'a
  de tag curé ; ce ne sont pas des personnages « gratuits » au sens du tag
  (bannière de départ, histoire), donc pas de contradiction.
- **Progress tracker** (`src/app/[lang]/tools/_contents/progress-tracker/tasks.ts`) :
  « 10 pubs × 18 stamina » = `AdMobTemplet` (10 lignes, 18 stamina chacune) ;
  guild raid 2/jour = `TicketRestoreTemplet` (`TICKET_GUILD_RAID` 2). Identiques.
- **`banner.json`, `recruit-banners.json`, `coupons.json`, `singularity.json`,
  `shop-priorities.json`, `effects*.json`, `monster-skills.json`,
  `short-names.json`** : aucune table non lue ne porte la même donnée.

---

## 2. Les tables classées par intérêt pour un joueur

Quatre niveaux. **A** : une page ou une section qui manque, et que des joueurs
cherchent. **B** : une colonne, une précision ou une vérification sur une page
existante. **C** : du contexte, utile à un guide mais pas en page à part.
**D** : sans intérêt pour le wiki (technique, interface, modération). L'ordre
dans un niveau suit l'intérêt, pas la taille. Les six tables mortes dans le
client ne sont pas classées.

### Niveau A — une page ou une section qui manque

| Tables                                                                                                                                                                                                   | Ce qu'elles contiennent (et ce que le client en fait)                                                                                                                                                                                                                                                                                                                                                                                            | Ce que le wiki y gagnerait                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ItemCraftCategoryTemplet`, `ItemCraftConsumeTemplet`, `ItemCraftRecycleTemplet`, `ItemRecycleMaterialGroupTemplet`                                                                                      | L'atelier (`CFacilityManager.CraftWorkshop`, panneaux `CUICraft*`) : catégories et limites hebdo/mensuelles, recettes (matériaux, or, résultat), recyclage en points.                                                                                                                                                                                                                                                                            | Dériver `kates-workshop` (§ 1.1) ; une page « Atelier » avec ce que chaque fabrication coûte et rapporte.                                                                                                                                                                    |
| `IrregularChaseExchangeTemplet`, `IrregularRewardBonusTemplet`                                                                                                                                           | L'échange de points des quatre monnaies d'Irregular Extermination : piste gratuite et piste `Special`, réservée au pass (`CIrregularData`), cycle mensuel ; bonus de monnaie par jour de la semaine (+30 % à +60 %, affiché par `CUIIrregularMainSchedule`).                                                                                                                                                                                     | Dériver `irregular-extermination-points` en séparant gratuit et pass ; ajouter aux guides `irregular-extermination` le jour où farmer quelle monnaie.                                                                                                                        |
| `MissionTemplet`, `MissionTaskTemplet`, `ContentTaskTemplet`                                                                                                                                             | Toutes les missions (3 508, `CMissionManager`) : quotidiennes, hebdo, arène, Singularity, succès (`MCT_ACHIEVE`, 631), quêtes guidées, missions d'événement (certaines catégories, comme `MCT_PVP_DAILY`, ne vivent que le temps d'un événement daté par le serveur).                                                                                                                                                                            | Dériver les sources « mission » des guides de ressources et d'Ether ; une page « Succès » (631 succès, récompenses en Ether).                                                                                                                                                |
| `AttendanceScheduleTemplet`, `AttendanceRewardTemplet`                                                                                                                                                   | Les connexions (`CAttendanceData`) : quotidienne (15 jours en boucle), nouveau joueur, retour, guilde, événements datés, packs.                                                                                                                                                                                                                                                                                                                  | Sources de ressources et d'Ether (§ 1.1, § 1.2) ; récompenses de connexion des événements.                                                                                                                                                                                   |
| `DungeonClearInfoTemplet`                                                                                                                                                                                | L'écran « équipe recommandée » du jeu (`CUIDungeonRecommandDeckScrollView`) : pour 87 groupes, soit 176 combats (story 76, `DM_TOWER_HARD` 40, Special Request 60), trois héros par besoin, avec un besoin marqué buff ou débuff (`IsBuff`) ; ex. story 1-11 : immunité → Astei, Dianne, Nella ; purge → Luna, Viella, Liselotte.                                                                                                                | Un encadré « Le jeu recommande » sur les guides de ces combats, à côté de la sélection éditoriale. Donnée officielle et localisée.                                                                                                                                           |
| `PVPRealTimeScheduleTemplet`, `PVPRealTimeFieldSkillTemplet`, `PVPRealTimeLeaderBuffTemplet`, `PVPRealTimeRankTemplet`, `PVPRealTimeRewardTemplet`, `PVPPresetCharacterTemplet`, `PVPPresetEquipTemplet` | L'arène temps réel (`CPVPRealTimeManager`, `CPvpRealtimeMatch`) : saisons et semaines, bans globaux (personnages, éléments, classes), plafond de stats du mode « Tactics », règles de terrain par tour, buffs de chef par classe, rangs, points, récompenses, préréglages Tactics (§ 1.3).                                                                                                                                                       | Une page « Arène temps réel » : règles de la semaine, bans, récompenses de saison, préréglages. Aujourd'hui seule la saison 1 est dans la table (5 semaines avec bans).                                                                                                      |
| `MonadGateArtifactTemplet`, `MonadGateArtifactRegionTemplet`, `MonadGateCubeTemplet`, `MonadGateDepthTemplet`                                                                                            | Les reliques de Monad Gate (`CMonadGateData`, `CUIMonadGateArtifactListPopup`) : 166 artefacts (83 familles, 3 raretés, effet `OptionID`, puissance ajoutée, prix) ; cubes de récompense ; par profondeur, la plage de niveau des monstres et le multiplicateur de gain, affichés par `CUIMonadGateGradeSettingScrollCell`. Les **taux** de tirage des reliques (`MonadGateArtifactGroupTemplet`, `ArtifactRate`) ne sont pas lus par le client. | Une liste des reliques sur les pages Monad Gate (le site génère routes et thème, pas les reliques) ; niveau de monstres et gain par profondeur. Pas de taux.                                                                                                                 |
| `TrustDialogueTemplet`, `InteractionScenarioTemplet`, `TrustRewardTemplet`, `EmotionConnectTemplet`, `TrustInterReactionTemplet`                                                                         | L'affinité (`CUITrustMain`, `CAffinityScene`) : 425 dialogues sur 84 personnages, avec un gain de bonne et de mauvaise réponse (1 500 / 750), récompenses par niveau d'affinité, interactions tactiles qui donnent un buff de dégâts (20 personnages).                                                                                                                                                                                           | Une section « Affinité » sur la fiche. Limite : **quelle** réponse est la bonne n'est pas dans les tables. Le client la lit dans une action du fichier de scénario (`CScenarioActionAffinityResult.IsAffinityGood`), et ces fichiers ne sont pas dans `outerpedia-gamedata`. |

### Niveau B — une colonne, une précision, une vérification

| Tables                                                                                                                                                                     | Ce qu'elles contiennent                                                                                                                                                                                                                             | Usage                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `CharacterIgnoreBuffTypeTemplet`                                                                                                                                           | Les types de buff qu'un personnage ne peut pas recevoir (1 ligne, `CBuff`).                                                                                                                                                                         | Mention sur la fiche, et test qui casse quand une ligne arrive (§ 1.4).                                   |
| `IrregularInfiltrateFloorTemplet`, `IrregularInfiltrateNodeTemplet`, `IrregularInfiltrateEventTemplet`, `IrregularInfiltrateAreaTemplet`, `IrregularInfiltrateItemTemplet` | Irregular Infiltration (`CInfiltrate`) : 3 étages (reset mensuel, le 3ᵉ en boucle), 274 nœuds (combats, coffres, dialogues, sanctuaires), choix de dialogue et leurs récompenses, objets d'étage.                                                   | Sources de l'étage 3 (§ 1.1) ; une carte de l'étage avec ce que donne chaque nœud.                        |
| `EventDungeonChapterTemplet`                                                                                                                                               | Pour chaque chapitre d'événement (116) : dates, héros bonus et pourcentage de monnaie en plus (+20 %, +10 %), affichés sur les vignettes de l'équipe (`GetBonusValue`, `CUITeamSetting`), monnaie et catégorie de boutique.                         | Les héros bonus sur les pages d'événement (le générateur lit `EventDungeonTemplet` mais pas les bonus).   |
| `EventBossBonusTypeTemplet`, `EventBossRewardTemplet`                                                                                                                      | Bonus de score des boss d'événement (difficulté +10 % / +15 %…, conditions) et paliers de score mondial (`CUIEventBossDungeon`).                                                                                                                    | Précision des guides de boss d'événement (`EventBossDungeonTemplet` est lu, ses bonus non).               |
| `UserNickNameTemplet`, `FrameTemplet`                                                                                                                                      | 51 titres de profil (comment les obtenir) et 116 cadres. 24 titres portent un buff que `CBuffSystemManager` applique **pour le titre équipé** (`CPlayer.SelectedUserTitleID`), hors PvP : réduction de stamina en story et Special Request, PV max… | Une page « Titres et cadres » ; les titres à buff intéressent les joueurs.                                |
| `SideStoryTemplet`, `SideStoryBonusTemplet`, `ArchiveCGTemplet`                                                                                                            | 65 histoires secondaires (une par personnage, niveau requis, récompense, illustration) ; 70 illustrations de scénario.                                                                                                                              | Une ligne « Histoire secondaire » sur la fiche ; la source d'Ether `variable.sideStories` du guide Ether. |
| `ArchiveRelationTemplet`, `ArchiveCharacterTemplet`, `ArchiveItemTemplet`                                                                                                  | Archives (`CArchiveManager`) : 21 « relations » nommées entre 3 ou 4 personnages (ex. « Unexpected Heroes » : K, Eva, Snow, Lisha) ; récompenses de collection par personnage et par équipement.                                                    | Les relations sur la fiche (liens entre personnages, donnée du jeu localisée).                            |
| `ItemCraftTemplet`, `ItemCraftRewardTemplet`                                                                                                                               | Fabrication d'armes et d'armures par élément et étoile : matériaux, or, taux par palier de résultat (50/30/15/5 %), affichés par `CUICrafting`.                                                                                                     | Taux de fabrication dans le guide `gear`.                                                                 |
| `ItemEnchantExpTemplet`, `ItemMergeTemplet`, `ItemGemMergeTemplet`, `ItemOptionChangeTemplet`, `ItemSmeltingTemplet`                                                       | Coûts d'amélioration de l'équipement : XP donnée par pièce sacrifiée, fusion de matériaux, fusion de gemmes, changement d'option, reforge.                                                                                                          | Calculs de coût dans les guides d'équipement.                                                             |
| `GuildRaidPointRewardTemplet`                                                                                                                                              | Paliers de points de guild raid (380 lignes) et récompenses.                                                                                                                                                                                        | Compléter les guides `guild-raid` (les classements sont déjà lus).                                        |
| `PVPLeagueScheduleTemplet`, `PVPLeagueRankTemplet`, `PVPArenaTemplet`, `PVPArenaMemberTemplet`                                                                             | Saisons de ligue (dates, buff de saison), récompenses par rang de ligue ; « memorial match » contre des PNJ (`CUIPvpMemorial*`).                                                                                                                    | Récompenses et buff de saison sur un guide d'arène.                                                       |
| `TicketRestoreTemplet`, `ExpAccountTemplet`, `AdMobTemplet`                                                                                                                | Recharge des tickets (`CTicketManager` : stamina 1 / 5 min, max 60 ; arène 1 / h, max 15 ; guild raid 2/jour…), stamina max par niveau de compte, pubs.                                                                                             | Vérifier ou dériver les chiffres du progress tracker et du guide `daily-stamina`.                         |
| `GuideTemplet`, `GuideCategoryTemplet`                                                                                                                                     | L'aide en jeu (`CUIHelpPopup`) : 217 entrées (combat, éléments, calcul des dégâts, jauge de priorité, burst, chaîne…), en 6 langues, avec images.                                                                                                   | Texte officiel localisé pour le glossaire et les guides généraux (`stats`, `beginner-faq`).               |
| `SideDungeonIncreaseTemplet`                                                                                                                                               | Bonus de stats (+10 %) d'un personnage ou d'une classe, appliqué à la composition du deck (`CCharacterDeck`).                                                                                                                                       | Précision sur les guides concernés.                                                                       |
| `EventRecruitTemplet`                                                                                                                                                      | Personnages des événements de missions Demiurge (§ 1.5).                                                                                                                                                                                            | Mention sur la fiche.                                                                                     |
| `EarlyClearBonusTemplet`, `DungeonMissionTemplet`                                                                                                                          | Bonus de victoire rapide (par nombre de tours) ; conditions d'étoiles des niveaux (sans mort, en N tours…), vérifiées par `CBattleManager`.                                                                                                         | Précisions sur les guides d'aventure.                                                                     |

### Niveau C — du contexte pour un guide

| Tables                                                                                                                                                                                                                                                                    | Ce qu'elles contiennent                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Exploration{Templet,Boss,Event,Order,Team,Weather}Templet`                                                                                                                                                                                                               | Terminus Isle (`CRuinIslandData`) : 10 niveaux, boss par météo, 1 000 événements, ordres, bonus d'équipe par élément.                                                                                                                                                                                                                                                      |
| `AetherTemplet`, `FacilityTemplet`, `FacilityCategoryTemplet`, `DetachmentTemplet`, `SynchroTemplet`                                                                                                                                                                      | La base (`CFacilityManager`) : générateur d'antiparticules (formule au § 1.2), améliorations, expéditions, synchro.                                                                                                                                                                                                                                                        |
| `RemainsFloorTemplet`, `RemainsNodeTemplet`, `SkipArtifactRewardTemplet`                                                                                                                                                                                                  | « The Deeps » (`CPveRemainsManager`) : 29 zones, 2 656 nœuds sur grille hexagonale, puissance recommandée.                                                                                                                                                                                                                                                                 |
| `AdventureTemplet`, `AdventureLevelTemplet`                                                                                                                                                                                                                               | Adventure License (`CAdventureLicense`) : rangs, XP, récompenses (les guides `adventure-license` existent, les rangs non).                                                                                                                                                                                                                                                 |
| `BattlePassTemplet`, `BattlePassGradeTemplet`, `BattlePassTaskTemplet`                                                                                                                                                                                                    | Pass de combat courant (dates, costume, paliers gratuits et premium, missions).                                                                                                                                                                                                                                                                                            |
| `EventGameTemplet`, `Bingo{Page,Number,LineReward}Templet`, `EventFireWorks{,Effect}Templet`, `DrawLots{,Reward}Templet`, `EventLuckyBox/Roulette/RPS/Global{,Node}Templet`, `EventTimeRewardTemplet`                                                                     | Mini-jeux d'événement : 22 jeux (bingo, feux d'artifice, omikuji, roulette…) et leurs récompenses. Les colonnes de taux de la roulette et du pierre-feuille-ciseaux (`_unknown_0` pour le parser) n'ont **pas** de propriété dans les classes du client : il ne les lit pas.                                                                                               |
| `EventUITemplet`                                                                                                                                                                                                                                                          | Bannières des événements en jeu et lien vers leur contenu (`CTotalEventManager`).                                                                                                                                                                                                                                                                                          |
| `GuildMonolithTemplet`, `GuildMarkTemplet`                                                                                                                                                                                                                                | Améliorations de guilde (membres, effets) et emblèmes.                                                                                                                                                                                                                                                                                                                     |
| `ProductBannerTemplet`, `ProductPackageGroupTemplet`, `PersonalProductTemplet`, `ProductSubCategoryTemplet`, `ProductShopTabGroupTemplet`, `ProductCategoryGroupTemplet`, `ProductBuyBonusRewardTemplet`, `ProductPopupConditionTemplet`, `LimitedProduct{,Level}Templet` | La boutique au-delà de `ProductTemplet` (`CShopManager`) : contenu des packs, offres personnelles, conditions d'apparition.                                                                                                                                                                                                                                                |
| `PieceTransformTemplet`, `CharacterExpansionTemplet`, `NPCCharacterTemplet`, `RewardViewTemplet`, `RewardGroupExpansionTemplet`                                                                                                                                           | Conversion de pièces, 2 « boosts » de personnage, builds des PNJ, aperçus de récompense, options fixes de récompenses d'équipement.                                                                                                                                                                                                                                        |
| `MonsterDamageTemplet`                                                                                                                                                                                                                                                    | Facteurs de dégâts des skills de monstres. Le client les charge **dans le même dictionnaire** que `CharacterDamageTemplet` (déjà lue), et `CFormula` les somme sur les événements d'animation comme pour un personnage. Utile seulement si le calculateur de dégâts calcule un jour les dégâts reçus, ce qu'il exclut aujourd'hui par choix (`datagen/damage/targets.ts`). |
| `VoiceTemplet`, `TrustVoiceTemplet`, `VoiceEtcTemplet`, `TextVoice`                                                                                                                                                                                                       | Répliques vocales par personnage (133, `CVoiceManager`) et leur texte en 6 langues. Une section « Voix » est possible ; question de droits à trancher avant.                                                                                                                                                                                                               |
| `TextScenario`…`TextScenario7`, `TextCutScene`, `ScenarioTemplet`                                                                                                                                                                                                         | Tout le texte du scénario (~120 000 lignes, ~90 Mo), chargé dans le dictionnaire de texte commun. Mêmes réserves.                                                                                                                                                                                                                                                          |
| `SingularityOptionPopUpTemplet`, `ChainCombinationTemplet`                                                                                                                                                                                                                | Fourchettes d'options singulières affichées en jeu ; buff de chaîne par personnage, utilisé par le filtre de la liste de héros (`CFilterResult`).                                                                                                                                                                                                                          |

### Niveau D — sans intérêt pour le wiki

`BadWordChatTemplet` et `BadWordNameTemplet` (et leurs `_0` à `_4` : listes par
langue, filtres de modération de `CUtilUI`), `LoadingTemplet` (écrans de
chargement), `MailTemplet`, `EmoticonTemplet`, `ExpressionTemplet`,
`FormationTemplet` (caméra), `DamageTypeTemplet` (effets visuels et sonores des
coups), `StateTemplet` (physique des animations), `ModelGroupTemplet`,
`SpeechActionTemplet`, `Tutorial{,Action,MoveGroup}Templet`, `TextTutorial`,
`TextStaff`, `GuideQuestGroupTemplet`, `ItemShortcut{,Group}Templet`
(raccourcis d'interface), `RecruitConditionTemplet`.

### Écartées — chargées mais jamais consultées par le client

| Table                                                        | Ce qu'elle semble dire             | Ce que dit le client                                                                                       |
| ------------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `AreaRewardTemplet`                                          | Récompenses d'étoiles par zone     | `GetAreaRewardTemplet` n'est appelée nulle part.                                                           |
| `EventGachaTemplet`                                          | Mini-gacha d'événement et taux     | Aucune méthode ne lit le dictionnaire.                                                                     |
| `EventIntegrationTemplet`, `EventIntegrationCategoryTemplet` | Regroupement des événements en jeu | `GetEventIntegrationTemplet(s)` et `GetEventIntegrationCategoryTemplets` ne sont appelées nulle part.      |
| `MonadGateArtifactGroupTemplet`                              | Taux de tirage des reliques        | Aucune méthode ne lit le dictionnaire. Les taux sont sans doute appliqués par le serveur : non vérifiable. |
| `RemainsRewardTemplet`                                       | Récompenses de The Deeps           | `GetRemainsWeekGroupCount` n'est appelée nulle part.                                                       |

---

## 3. Inventaire complet des 169 tables non lues

Niveau : A, B, C, D comme au § 2 ; « — » pour une table que le client ne
consulte pas. Lignes au 1.11.404. La colonne « Lu dans le client par » donne
une ou deux classes consommatrices, pas la liste complète.

| Table                            | Lignes | Contenu                                                 | Lu dans le client par                                                       | Niv. |
| -------------------------------- | -----: | ------------------------------------------------------- | --------------------------------------------------------------------------- | :--: |
| AdMobTemplet                     |     10 | Pubs : 10 par jour, 18 stamina                          | CUIBuyTicketPopup, CUIItemUsePopup                                          |  B   |
| AdventureLevelTemplet            |    150 | Rangs d'Adventure License, XP                           | CAdventureLicense                                                           |  C   |
| AdventureTemplet                 |     19 | Adventure License : rangs, récompenses                  | CAdventureLicense                                                           |  C   |
| AetherTemplet                    |     70 | Générateur d'antiparticules par niveau de compte        | CFacilityManager                                                            |  C   |
| ArchiveCGTemplet                 |     70 | Illustrations de scénario                               | CUIArchiveCG                                                                |  C   |
| ArchiveCharacterTemplet          |    492 | Récompenses de collection par personnage                | CArchiveManager, CCharacterData                                             |  B   |
| ArchiveItemTemplet               |     76 | Récompenses de collection d'équipement                  | CArchiveManager, CUIArchiveEquipFilterPopup                                 |  B   |
| ArchiveRelationTemplet           |     21 | Relations nommées entre personnages                     | CArchiveManager, CUIArchiveRelation                                         |  B   |
| AreaRewardTemplet                |     15 | Récompenses d'étoiles par zone (pas lues par le client) | **personne** : chargée par `CTempletManager`, jamais consultée              |  —   |
| AttendanceRewardTemplet          |    869 | Récompenses de connexion par jour                       | CEventAttendanceScrollData, CUIAttendanceNewPopup                           |  A   |
| AttendanceScheduleTemplet        |     34 | Plannings de connexion                                  | CAttendanceData                                                             |  A   |
| BadWordChatTemplet (+ \_0 à \_4) | 13 248 | Filtre de modération du chat                            | CUtilUI (filtre ; `_0`…`_6` = listes par langue)                            |  D   |
| BadWordNameTemplet (+ \_0 à \_4) | 11 847 | Filtre de modération des noms                           | CUtilUI (filtre ; `_0`…`_6` = listes par langue)                            |  D   |
| BattlePassGradeTemplet           |     62 | Paliers du pass                                         | CBattlePassMissionManager, CUIBattlePassBuyPointPopup                       |  C   |
| BattlePassTaskTemplet            |     46 | Missions du pass                                        | CBattlePassMissionManager, CBattlePassMissionTaskData                       |  C   |
| BattlePassTemplet                |      2 | Pass courant et précédent                               | CBattlePassMissionManager, CUIBattlePass                                    |  C   |
| BingoLineRewardTemplet           |    583 | Bingo : récompenses de ligne                            | CEventGameData_Bingo, CUIEventBingo                                         |  C   |
| BingoNumberRewardTemplet         |    950 | Bingo : récompenses par numéro                          | CUIEventBingoScrollCell                                                     |  C   |
| BingoPageTemplet                 |     53 | Bingo : pages                                           | CEventGameData_Bingo, CUIEventBingo                                         |  C   |
| ChainCombinationTemplet          |    171 | Icône de chaîne par personnage                          | CCharacterData, CFilterResult                                               |  C   |
| CharacterExpansionTemplet        |      2 | Boosts de personnage                                    | CUICharacterCustomSelectScrollCell, CUICharacterSelectScrollCell            |  C   |
| CharacterIgnoreBuffTypeTemplet   |      1 | Buffs qu'un personnage ne peut recevoir                 | CBuff                                                                       |  B   |
| ContentTaskTemplet               |  1 695 | Conditions des missions                                 | CBaseTaskTemplet, CBattlePassMissionTaskData                                |  A   |
| DamageTypeTemplet                |     49 | Effets visuels/sonores des coups                        | CBattleManager, CCharacterBattle                                            |  D   |
| DetachmentTemplet                |     15 | Expéditions                                             | CDetachmentData, CFacilityManager                                           |  C   |
| DrawLotsRewardTemplet            |      7 | Omikuji : récompenses et taux                           | CEventGameData_DrawLot, CUIEventOmikuji                                     |  C   |
| DrawLotsTemplet                  |      1 | Omikuji                                                 | CEventGameData_DrawLot                                                      |  C   |
| DungeonClearInfoTemplet          |    263 | Héros recommandés par le jeu                            | CUIDungeonRecommandDeckScrollView                                           |  A   |
| DungeonMissionTemplet            |    163 | Conditions d'étoiles des niveaux                        | CBattleManager, CDungeonScene                                               |  B   |
| EarlyClearBonusTemplet           |    120 | Bonus de victoire rapide                                | CDungeonDataManager, CUIChallengeDungeonInfoItem                            |  B   |
| EmoticonTemplet                  |     35 | Émoticônes du chat                                      | CUIChatEmoticonScrollCell, CUIChatLogScrollCell                             |  D   |
| EmotionConnectTemplet            |     38 | Interactions d'affinité (buff)                          | CAffinityScene, CAffinityTouch                                              |  A   |
| EventBossBonusTypeTemplet        |     11 | Bonus de score des boss d'événement                     | CEventBoss, CUIEventBossDungeon                                             |  B   |
| EventBossRewardTemplet           |     10 | Paliers de score mondial                                | CUIEventBossDungeon, CUIEventBossDungeonRewardPopUp                         |  B   |
| EventDungeonChapterTemplet       |    116 | Chapitres d'événement, héros bonus                      | CDungeonDataManager, CMissionTaskData                                       |  B   |
| EventFireWorksEffectTemplet      |      6 | Feux d'artifice : effets                                | CUIEventFireWorksMain (via `GetFireWorkdsEffectName`)                       |  C   |
| EventFireWorksTemplet            |      3 | Feux d'artifice : règles                                | CEventGameData_FireWorks                                                    |  C   |
| EventGachaTemplet                |      5 | Mini-gacha d'événement (pas lu par le client)           | **personne** : chargée par `CTempletManager`, jamais consultée              |  —   |
| EventGameTemplet                 |     22 | Mini-jeux d'événement                                   | CEventGameData, CEventGameData_Arcade                                       |  C   |
| EventGlobalNodeTemplet           |     80 | Événement « global » : nœuds                            | CEventGameData_Global                                                       |  C   |
| EventGlobalTemplet               |     40 | Événement « global » : grille                           | CEventGameData_Global                                                       |  C   |
| EventIntegrationCategoryTemplet  |      2 | Catégories d'événements (pas lues par le client)        | **personne** : chargée par `CTempletManager`, jamais consultée              |  —   |
| EventIntegrationTemplet          |      3 | Regroupement d'événements (pas lu par le client)        | **personne** : chargée par `CTempletManager`, jamais consultée              |  —   |
| EventLuckyBoxTemplet             |      4 | Boîte chance : taux                                     | CUIEventLuckyBoxItem                                                        |  C   |
| EventRPSTemplet                  |      2 | Pierre-feuille-ciseaux : taux                           | CUIEventRockPaperScissorsItem                                               |  C   |
| EventRecruitTemplet              |     10 | Personnages obtenables par missions                     | CIvanez, CIvanezMissionManager                                              |  B   |
| EventRouletteTemplet             |      6 | Roulette : taux                                         | CUIEventLuckyRouletteItem                                                   |  C   |
| EventTimeRewardTemplet           |      2 | Récompenses horaires                                    | CTotalEventData, CUIEventTimeRewardItem                                     |  C   |
| EventUITemplet                   |    214 | Bannières d'événements                                  | CContentTaskManager, CEventGameData_FireWorks                               |  C   |
| ExpAccountTemplet                |     70 | XP et stamina max par niveau de compte                  | CPlayer, CTicketManager                                                     |  B   |
| ExplorationBossTemplet           |     50 | Terminus Isle : boss                                    | CDungeonScene, CRuinIslandData                                              |  C   |
| ExplorationEventTemplet          |  1 000 | Terminus Isle : événements                              | CDungeonScene, CIrregularInfiltrateEventTemplet                             |  C   |
| ExplorationOrderTemplet          |      7 | Terminus Isle : ordres                                  | CRuinIslandBossSpot, CRuinIslandData                                        |  C   |
| ExplorationTeamTemplet           |     75 | Terminus Isle : bonus d'équipe                          | CDungeonScene, CRuinIslandData                                              |  C   |
| ExplorationTemplet               |     10 | Terminus Isle : niveaux                                 | CDungeonScene, CRuinIslandData                                              |  C   |
| ExplorationWeatherTemplet        |     50 | Terminus Isle : météo                                   | CDungeonScene, CUIRuinIsland                                                |  C   |
| ExpressionTemplet                |     12 | Expressions faciales                                    | CTrustData, CUITrustMain                                                    |  D   |
| FacilityCategoryTemplet          |     24 | Base : catégories                                       | CFacilityManager, CUIFacilityLevelCtr                                       |  C   |
| FacilityTemplet                  |     61 | Base : améliorations                                    | CFacilityManager, CPvpUserMatchInfo                                         |  C   |
| FormationTemplet                 |      5 | Caméra de combat                                        | CBattlePosition, CCameraController                                          |  D   |
| FrameTemplet                     |    116 | Cadres de profil                                        | CPlayer, CUIItemRecuritResultSlot                                           |  B   |
| GuideCategoryTemplet             |     20 | Guide en jeu : catégories                               | CUIHelpPopup, CUIHelpTabScrollCell                                          |  B   |
| GuideQuestGroupTemplet           |      6 | Quêtes guidées : groupes                                | CMissionManager, CUIGuideQuestBanner                                        |  D   |
| GuideTemplet                     |    217 | Guide en jeu : entrées                                  | CUIGuideSubTabScrollCell, CUIHelpPopup                                      |  B   |
| GuildMarkTemplet                 |     12 | Emblèmes de guilde                                      | CGuildInfo, CUIGuildCreate                                                  |  C   |
| GuildMonolithTemplet             |     29 | Améliorations de guilde                                 | CGuild, CGuildInfo                                                          |  C   |
| GuildRaidPointRewardTemplet      |    380 | Guild raid : paliers de points                          | CGuildInfo, CGuildRaidPointRewardScrollData                                 |  B   |
| InteractionScenarioTemplet       |    415 | Dialogues d'affinité : fichiers                         | CDungeonScene, CStateScenario                                               |  A   |
| IrregularChaseExchangeTemplet    |    120 | Irregular Extermination : échange de points             | CIrregularData, CUIIrregularPointExchange                                   |  A   |
| IrregularInfiltrateAreaTemplet   |     16 | Infiltration : zones                                    | CInfilreateAreaLockItem, CInfiltrate                                        |  B   |
| IrregularInfiltrateEventTemplet  |     74 | Infiltration : dialogues et choix                       | CInfiltrateNodeItem, CUIRuinIslandEventStoryPopup                           |  B   |
| IrregularInfiltrateFloorTemplet  |      3 | Infiltration : étages                                   | CInfiltrate, CInfiltrateScene                                               |  B   |
| IrregularInfiltrateItemTemplet   |     22 | Infiltration : objets d'étage                           | CDungeonScene, CInfiltrate                                                  |  B   |
| IrregularInfiltrateNodeTemplet   |    274 | Infiltration : nœuds et récompenses                     | CContentChecker, CInfiltrate                                                |  B   |
| IrregularRewardBonusTemplet      |      7 | Bonus de monnaie par jour de la semaine                 | CUIChaseBoard, CUIChaseBoss                                                 |  A   |
| ItemCraftCategoryTemplet         |     17 | Atelier : catégories et limites                         | CUICraftConsumablePanel                                                     |  A   |
| ItemCraftConsumeTemplet          |      9 | Atelier : recettes de consommables                      | CUICraftConsumablePanel                                                     |  A   |
| ItemCraftRecycleTemplet          |      9 | Atelier : recyclage                                     | CUICraftRecyclePanel, CUICraftingMaterial                                   |  A   |
| ItemCraftRewardTemplet           |  2 400 | Fabrication : contenu des groupes de résultat           | CUICrafting, CUIRaidCrafting                                                |  B   |
| ItemCraftTemplet                 |    210 | Fabrication d'équipement : coûts et taux                | CContentChecker, CUICrafting                                                |  B   |
| ItemEnchantExpTemplet            |    193 | XP d'amélioration par pièce                             | CItem, CUICharacterGrowthResetPopup                                         |  B   |
| ItemGemMergeTemplet              |      6 | Fusion de gemmes : coûts                                | CUIGemMain, CUIGemNormalMergeItem                                           |  B   |
| ItemMergeTemplet                 |     41 | Fusion de matériaux                                     | CUIItemMerge, CUIItemThumbnailSlot                                          |  B   |
| ItemOptionChangeTemplet          |     50 | Changement d'option : coûts                             | CUIItemOptionChange, CUIItemSmelting                                        |  B   |
| ItemRecycleMaterialGroupTemplet  |     35 | Atelier : points de recyclage par matériau              | CUICraftRecyclePanel                                                        |  A   |
| ItemShortcutGroupTemplet         |    311 | Raccourcis d'interface par item                         | CUIItemShortcutDetailPopup, CUIItemToolTip                                  |  D   |
| ItemShortcutTemplet              |     82 | Raccourcis d'interface                                  | CUIItemShortcutDetailPopup, CUIItemShortcutDetailScrollCell                 |  D   |
| ItemSmeltingTemplet              |     24 | Reforge : coûts                                         | CUIItemSmelting                                                             |  B   |
| LimitedProductLevelTemplet       |     10 | Boutique limitée : niveaux                              | CFacilityManager, CUILimitedPersonalShopDetailInfoPopup                     |  C   |
| LimitedProductTemplet            |      4 | Boutique limitée                                        | CExtension, CFacilityManager                                                |  C   |
| LoadingTemplet                   |  2 603 | Écrans de chargement                                    | CLoadingScene                                                               |  D   |
| MailTemplet                      |     49 | Modèles de courrier                                     | CUIMailPopup, CUIMailboxScrollCell                                          |  D   |
| MissionTaskTemplet               |  3 508 | Toutes les missions                                     | CMissionManager, CContentTaskManager                                        |  A   |
| MissionTemplet                   |      6 | Paliers quotidiens/hebdo                                | CDemiurgeMissionData, CMissionData                                          |  A   |
| ModelGroupTemplet                |     30 | Modèles 3D des monstres                                 | CResourceManager, CUtils                                                    |  D   |
| MonadGateArtifactGroupTemplet    |    468 | Reliques : groupes et taux (pas lus par le client)      | **personne** : chargée par `CTempletManager`, jamais consultée              |  —   |
| MonadGateArtifactRegionTemplet   |      1 | Reliques : régions                                      | CMonadGateData                                                              |  A   |
| MonadGateArtifactTemplet         |    166 | Reliques de Monad Gate                                  | CMonadGateData, CUIMonadGateArtifactIcon                                    |  A   |
| MonadGateCubeTemplet             |    520 | Cubes de récompense                                     | CUIMonadGateCubeItem                                                        |  A   |
| MonadGateDepthTemplet            |     10 | Profondeurs : niveaux, gain                             | CMonadGateData, CUIMonadGate                                                |  A   |
| MonsterDamageTemplet             |  1 001 | Facteurs de dégâts des skills de monstres               | CFormula, CCharacterBattle (même dictionnaire que `CharacterDamageTemplet`) |  C   |
| NPCCharacterTemplet              |    593 | Builds des PNJ                                          | CCharacterDeck                                                              |  C   |
| PVPArenaMemberTemplet            |     65 | Arène d'entraînement : PNJ                              | CPVPManager, CUINoticePopup                                                 |  B   |
| PVPArenaTemplet                  |      5 | Arène d'entraînement                                    | CPVPManager, CUIPvpMain                                                     |  B   |
| PVPLeagueRankTemplet             |     60 | Ligue : rangs et récompenses                            | CPVPManager, CUIPvpRankingInfoScrollCell                                    |  B   |
| PVPLeagueScheduleTemplet         |      5 | Ligue : saisons et buffs                                | CPVPManager, CUIDungeonTeamPVPSkillItem                                     |  B   |
| PVPPresetCharacterTemplet        |    114 | PvP imposé : niveaux et préréglages                     | CPvPRealtimeTactics                                                         |  A   |
| PVPPresetEquipTemplet            |    909 | PvP imposé : équipement                                 | CPvPRealtimeTactics                                                         |  A   |
| PVPRealTimeFieldSkillTemplet     |    115 | Arène temps réel : règles de terrain                    | CHudPvpRealtimeGauge, CPvpRealtimeMatch                                     |  A   |
| PVPRealTimeLeaderBuffTemplet     |      6 | Arène temps réel : buffs de chef                        | CBuffManager, CHudPvpRealtimeGauge                                          |  A   |
| PVPRealTimeRankTemplet           |     24 | Arène temps réel : rangs                                | CHudPvpRealtimeGauge, CUIPVPDraftUserInfo                                   |  A   |
| PVPRealTimeRewardTemplet         |     48 | Arène temps réel : récompenses                          | CUIPvpRealtime, CUIPvpRealtimeRewardScrollCell                              |  A   |
| PVPRealTimeScheduleTemplet       |     33 | Arène temps réel : semaines, bans                       | CBuffManager, CHudPvpRealtimeGauge                                          |  A   |
| PersonalProductTemplet           |  3 715 | Offres personnelles                                     | CUILimitedPersonalShopScrollCell                                            |  C   |
| PieceTransformTemplet            |      4 | Conversion de pièces                                    | CUICharacterMainPage, CUIPieceTransform                                     |  C   |
| ProductBannerTemplet             |    574 | Bannières de boutique                                   | CPopupPackageData, CPopupPackageManager                                     |  C   |
| ProductBuyBonusRewardTemplet     |      6 | Bonus d'achat                                           | CUIGeneralShopRecommend, CUIShopBuyBonusRewardScrollCell                    |  C   |
| ProductCategoryGroupTemplet      |      2 | Boutique : catégories                                   | CShopManager, CUIContentsShop                                               |  C   |
| ProductPackageGroupTemplet       |  5 515 | Contenu des packs                                       | CShopCustomPackageData, CShopManager                                        |  C   |
| ProductPopupConditionTemplet     |    455 | Conditions d'apparition des offres                      | CPopupPackageData, CPopupPackageManager                                     |  C   |
| ProductShopTabGroupTemplet       |     25 | Boutique : onglets                                      | CShopManager                                                                |  C   |
| ProductSubCategoryTemplet        |     94 | Boutique : sous-catégories                              | CShopManager, CUIGeneralShopCostume                                         |  C   |
| RecruitConditionTemplet          |      1 | Condition de recrutement                                | CDungeonScene, CRecruitRecipeTemplet                                        |  D   |
| RemainsFloorTemplet              |     29 | The Deeps : zones                                       | CPveRemainsDataManager, CPveRemainsManager                                  |  C   |
| RemainsNodeTemplet               |  2 656 | The Deeps : nœuds                                       | CHexagonalCell, CHexagonalGrid                                              |  C   |
| RemainsRewardTemplet             |      3 | The Deeps : récompenses (pas lues par le client)        | **personne** : chargée par `CTempletManager`, jamais consultée              |  —   |
| RewardGroupExpansionTemplet      |    933 | Options fixes des récompenses d'équipement              | CUIItemSelectScrollCell, CUIItemToolTip                                     |  C   |
| RewardViewTemplet                |    930 | Aperçus de récompense                                   | CUIIvanezDungeon, CUIRaidDungeonList                                        |  C   |
| ScenarioTemplet                  |  3 430 | Index des scénarios                                     | CDungeonScene, CInteractionScenarioTemplet                                  |  C   |
| SideDungeonIncreaseTemplet       |      5 | Bonus de stats par personnage ou classe                 | CCharacterDeck                                                              |  B   |
| SideStoryBonusTemplet            |     16 | Histoires secondaires : bonus                           | CUISideStoryDungeonPopup                                                    |  B   |
| SideStoryTemplet                 |     65 | Histoires secondaires                                   | CArchiveStoryAreaScrollData, CDungeonDataManager                            |  B   |
| SingularityOptionPopUpTemplet    |     20 | Options singulières affichées                           | CUISingularityOptionInfo, CUISingularityOptionScrollCell                    |  C   |
| SkipArtifactRewardTemplet        |    135 | The Deeps : artefacts de saut                           | CPveRemainsManager                                                          |  C   |
| SpeechActionTemplet              |     20 | Bulles de dialogue                                      | CUISpeechActionDialog                                                       |  D   |
| StateTemplet                     |  1 014 | Physique des animations                                 | CCharacter                                                                  |  D   |
| SynchroTemplet                   |      5 | Base : synchro                                          | CUISynchroSlot                                                              |  C   |
| TextCutScene                     |  1 030 | Texte des cinématiques                                  | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario                     | 12 341 | Texte du scénario                                       | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario2                    | 31 683 | Texte du scénario                                       | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario3                    | 19 612 | Texte du scénario                                       | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario4                    | 16 932 | Texte du scénario                                       | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario5                    | 12 149 | Texte du scénario                                       | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario6                    | 20 304 | Texte du scénario                                       | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextScenario7                    |  3 886 | Texte du scénario (affinité)                            | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TextStaff                        |      3 | Crédits                                                 | dictionnaire de texte commun (`m_dicText`)                                  |  D   |
| TextTutorial                     |  1 642 | Texte du tutoriel                                       | dictionnaire de texte commun (`m_dicText`)                                  |  D   |
| TextVoice                        |  8 909 | Texte des répliques vocales                             | dictionnaire de texte commun (`m_dicText`)                                  |  C   |
| TicketRestoreTemplet             |     10 | Recharge des tickets                                    | CIrregularData, CStandaloneTaskManager                                      |  B   |
| TrustDialogueTemplet             |    425 | Dialogues d'affinité                                    | CUIScenarioTrustItem, CUITrustMain                                          |  A   |
| TrustInterReactionTemplet        |      2 | Types d'interaction d'affinité                          | CUITrustRewardInfoTooltip                                                   |  A   |
| TrustRewardTemplet               |  2 172 | Récompenses par niveau d'affinité                       | CDungeonScene, CTrustData                                                   |  A   |
| TrustVoiceTemplet                |  5 637 | Répliques débloquées par l'affinité                     | CUITrustMain, CUITrustRewardInfoTooltip                                     |  C   |
| TutorialActionTemplet            |  1 124 | Tutoriel : actions                                      | CTutorialActionDialog, CTutorialActionEvent                                 |  D   |
| TutorialMoveGroupTemplet         |      7 | Tutoriel : déplacements                                 | CTutorialManager                                                            |  D   |
| TutorialTemplet                  |    110 | Tutoriel : étapes                                       | CExtension, CTutorialActionEvent                                            |  D   |
| UserNickNameTemplet              |     51 | Titres de profil (24 avec buff)                         | CBuffSystemManager, CPlayer                                                 |  B   |
| VoiceEtcTemplet                  |    385 | Répliques diverses                                      | CVoiceManager                                                               |  C   |
| VoiceTemplet                     |    133 | Répliques vocales par personnage                        | CVoiceManager                                                               |  C   |

Les douze tables `BadWord*` comptent pour 12 lignes de l'inventaire (169) et
tiennent ici en deux.

---

## Ce que le code du jeu a changé à cet audit

La première version reposait sur les seules tables. Le client décompilé a
changé quatre conclusions :

- **Irregular Extermination** : les quantités curées supposent le pass payant.
  Sans lui, la moitié disparaît (§ 1.1).
- **Mission quotidienne d'arène** : c'est un événement temporaire, pas une
  source oubliée. Le constat est retiré (§ 1.1).
- **Demiurge Saeran** : la liste de buffs ignorés s'explique par sa
  transformation à la mort, et l'« Immortality » de son S2 vient de sa seconde
  forme. Ce n'est donc pas une contradiction à vérifier (§ 1.4).
- **Six tables mortes** sont écartées. Parmi elles, les taux de tirage des
  reliques de Monad Gate, que la première version proposait d'afficher (§ 2).

Il a aussi confirmé deux points : le cycle mensuel de l'échange d'Extermination
et la boucle du check-in de 15 jours, qui fonde l'écart avec le guide Ether. Il
a précisé les usages : l'équipe recommandée, les préréglages Tactics, les buffs
de titre équipé, et `MonsterDamageTemplet`, qui passe de D à C.

## Ce qui est vérifié, et ce qui ne l'est pas

**Vérifié, sur les tables 1.11.404 et le client 1.4.18 :**

- le compte de 89 tables lues par outerpedia, par instrumentation des deux
  générations et confirmation statique ;
- les 163 tables consultées par le client et les 6 qui ne le sont pas, par
  recherche dans `apk/dumped/src/`, revue à la main pour les cas sans
  consommateur direct ;
- chaque chiffre des § 1.1 à 1.5, rejoué par script sur `parsed/` et comparé
  aux fichiers curés et au code du site cités ;
- les comportements attribués au client (pass d'Extermination, boucle des
  check-ins, événement d'arène, `CBuff.Initialize`, transformation de Saeran,
  buffs de titre), lus dans les méthodes nommées.

**Non vérifié :**

- ce que fait le serveur : dates des événements, attribution des récompenses,
  usage éventuel des six tables mortes et des colonnes de taux que le client
  ignore ;
- la répartition des événements de dialogue sur les nœuds de l'étage 3, et
  donc les 28/17 Skill Manuals curés ;
- le cumul des améliorations du générateur d'antiparticules
  (`GetFacilityEnchantValue`), donc les 78 Ether par jour du guide ;
- la bonne réponse de chaque dialogue d'affinité, qui est dans des fichiers de
  scénario absents d'`outerpedia-gamedata` ;
- les droits de reprise des textes de scénario et des répliques vocales.
