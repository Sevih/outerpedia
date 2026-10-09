# Audit — les tables du jeu jamais lues

> Tâche T7 du 2026-10-09. Données : `outerpedia-gamedata` en version de jeu
> **1.11.404** (258 tables dans `parsed/`), outerpedia au commit `1d55c84`.
> Ce document est un constat : il ne change rien au code ni aux données.

## En bref

- La génération lit **89 tables sur 258** : 84 par `datagen:build`, 5 de plus
  par `damage:build`. Les **169 autres** ne sont lues par rien qui produise une
  donnée du site.
- Ce qui vaut la peine, dans l'ordre d'intérêt pour un joueur :
  1. **Les sources de ressources hebdo/mensuelles** (`ItemCraft*`,
     `IrregularChaseExchangeTemplet`, `MissionTemplet`/`MissionTaskTemplet`,
     `AttendanceRewardTemplet`, `IrregularInfiltrate*`) : elles redonnent à
     l'unité près **23 des 38 quantités** saisies à la main dans
     `data/curated/timegate-resources.json`, et y ajoutent deux sources que le
     guide ne compte pas (§ 1.1).
  2. **Une mécanique de personnage invisible sur le site** : Demiurge Saeran
     (`2000129`) ne peut recevoir ni bouclier, ni invincibilité, ni
     résurrection (`CharacterIgnoreBuffTypeTemplet`, § 1.4).
  3. **Les héros que le jeu recommande lui-même** pour 176 combats (story,
     Skyward Tower difficile, Special Request), par besoin : immunité, purge,
     « recommandés » (`DungeonClearInfoTemplet`, § 2).
  4. **L'arène temps réel** (saisons, bans, règles de terrain, buffs de chef,
     récompenses) et **les reliques de Monad Gate** (166 artefacts), deux
     contenus que le site ne décrit pas à partir des tables.
- Les écarts trouvés avec la saisie à la main sont peu nombreux et tous à
  confirmer en jeu : le check-in mensuel du guide Ether (750 contre 400 par
  cycle de 15 jours dans la table) et deux sources de ressources absentes du
  guide « Weekly & Monthly Reference Tables » (§ 1.1, § 1.2).

## Méthode

### Qui lit quoi

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
le joueur fait (choix, tirage, rang) est signalé comme tel.

---

## 1. Ce que les tables confirment, complètent ou contredisent dans la saisie à la main

### 1.1 `data/curated/timegate-resources.json` — les sources « non-shop »

Le fichier dit lui-même que ces quantités sont « une estimation joueur absente
de la donnée ». Elles sont en fait presque toutes dans des tables non lues.

| Source curée (clé)               | Table(s)                                                          | Verdict                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kates-workshop` (7 quantités)   | `ItemCraftCategoryTemplet` + `ItemCraftConsumeTemplet`            | **7/7 identiques.** Transistones : 1 par fabrication, limite 3, `RET_MONTHLY` → 3/mois. Stardust et Memory Stone bleus : 10 × 7/semaine = 70. Violets : 10 × 1/semaine, pour 30 bleus (le `costAmount: 30` curé). Armor Glunite : 1 × 4/semaine.                                                                                                                                   |
| `irregular-extermination-points` | `IrregularChaseExchangeTemplet`                                   | **7/7 identiques** en additionnant les pistes « Normal » et « Special » complètes des quatre monnaies (`AT_IRREGULAR_CHASE_1..4`) : Transistone total 12, individuel 12, Stardust bleu 35 + 60 + 55 = 150, violet 120 + 180 = 300, Memory Stone idem 150/300, Armor Glunite 3 + 6 = 9. La cadence mensuelle n'est **pas** dans cette table (non vérifié).                          |
| `weekly-mission`                 | `MissionTemplet` (ligne `MCT_WEEKLY`)                             | **Identique** : paliers 100 et 200 points → 1 Basic + 1 Intermediate Skill Manual.                                                                                                                                                                                                                                                                                                 |
| `arena-weekly-play`              | `MissionTaskTemplet` (`MCT_PVP_WEEKLY_PLAY`)                      | **Identique** : 10/20/30 matchs → 5 Basic, 3 Intermediate, 1 Professional.                                                                                                                                                                                                                                                                                                         |
| `singularity-weekly-mission`     | `MissionTaskTemplet` (`MCT_SINGULARITY_WEEKLY`)                   | **Identique** : 5 missions × 20 Fusion-Type Core = 100.                                                                                                                                                                                                                                                                                                                            |
| `irregular-infiltration-floor-3` | `IrregularInfiltrate{Floor,Node,Event}Templet` + `DungeonTemplet` | **Partiel.** Transistones 9/9 et Professional Manual 3/3 identiques. Basic 28 et Intermediate 17 : la partie fixe (coffres 6/4 + combats 10/5) fait 16/9 ; le reste dépend des événements de dialogue tirés sur l'étage (une bonne réponse rapporte 6 Basic + 4 Intermediate). 28/17 correspond à deux événements favorables sur trois nœuds de dialogue — plausible, non vérifié. |
| `singularity-*` (rank, daily)    | tables Singularity **déjà lues**                                  | Hors périmètre (13 quantités, tables lues).                                                                                                                                                                                                                                                                                                                                        |

Au total, sur les 38 quantités curées : **23 identiques**, 2 en partie
(Basic/Intermediate de l'étage 3), et 13 qui viennent des sources Singularity
(rang, run quotidien, classement quotidien), donc de tables déjà lues.

**Ce que les tables ajoutent et que le guide ne compte pas :**

- **Mission quotidienne d'arène** (`MissionTaskTemplet`, `MCT_PVP_DAILY`,
  « Use 15 Arena Tickets ») : **2 Transistone (Total) par jour**, soit 14 par
  semaine. C'est la plus grosse source de Transistone (Total) et elle est
  absente de l'onglet `transistones`. À confirmer en jeu que la mission est
  active.
- **Check-in normal** (`AttendanceScheduleTemplet` 3, `ATT_NORMAL`, 15 jours,
  `Loop: 1`) : par cycle, 10 Basic + 5 Intermediate + 1 Professional Skill
  Manual. Absent de l'onglet `books`.

**Ce que le site y gagnerait** : remplacer l'overlay chiffré par un générateur
qui lit ces tables, comme le générateur le fait déjà pour les sources de shop.
L'overlay garderait le choix des items et des onglets, plus les seules
quantités qui dépendent du joueur (choix de l'étage 3, rangs Singularity).

### 1.2 Guide « Ether income » (`src/app/[lang]/guides/_contents/general-guides/ether-income/data.ts`)

Pas dans `data/curated/`, mais saisi à la main de la même façon (« estimations
éditoriales »). Montants en Ether (`Crystal` dans `RewardTemplet`) :

| Ligne du guide                                                        | Table                                                | Verdict                                                                                                                                       |
| --------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `daily.missions` 50                                                   | `MissionTemplet` (`MCT_DAILY`)                       | **Identique** : 5 + 15 + 30.                                                                                                                  |
| `weekly.missions` 150                                                 | `MissionTemplet` (`MCT_WEEKLY`)                      | **Identique**.                                                                                                                                |
| `weekly.singularityMissions` 250                                      | `MissionTaskTemplet` (`MCT_SINGULARITY_WEEKLY*`)     | **Identique** : 5 × 10 + 200.                                                                                                                 |
| `weekly.guildCheckin` 150                                             | `AttendanceRewardTemplet` (planning 4, `ATT_GUILD`)  | **Identique** : 150 sur le cycle de 7 jours.                                                                                                  |
| `monthly.checkin` 750                                                 | `AttendanceRewardTemplet` (planning 3, `ATT_NORMAL`) | **Divergent** : 400 au 15ᵉ jour d'un cycle de 15 jours qui boucle, soit 800 sur 30 jours (ou 400 si un seul cycle compte). À vérifier en jeu. |
| `daily.antiparticle` 78                                               | `AetherTemplet` + `FacilityTemplet`                  | Non vérifié : la table donne un taux par niveau de compte (`BasicReward_0/1`) dont la formule est dans le client, pas dans la table.          |
| `daily.arena` 20, `daily.missionEvent` 30, `monthly.jointMission` 880 | —                                                    | Non retrouvés dans les tables non lues (récompenses d'arène ou d'événement : tables lues ou serveur).                                         |

### 1.3 `data/curated/gear-reco.json` — confrontation aux préréglages PvP du jeu

`PVPPresetCharacterTemplet` (114 personnages) et `PVPPresetEquipTemplet` (909
lignes) décrivent l'équipement que le jeu propose à chaque personnage dans un
mode PvP où l'équipement est fourni (déduit du nom des tables et des
colonnes : niveau 100, 6 évolutions, 9★, équipement +10 imposés) : arme, amulette, set d'armure, talisman et EE
par défaut, plus les choix autorisés. Sur les 90 personnages présents des deux
côtés, l'équipement **par défaut** du jeu figure parmi les recommandations
curées :

- arme (même passif unique) : **49/90** ;
- amulette : **71/90** ;
- combinaison de sets : **30/90**.

Ce n'est **pas** une contradiction : le préréglage vise le PvP et la reco curée
surtout le PvE. C'est une **vérification croisée** possible : un écart sur
l'amulette (19 personnages) mérite un coup d'œil, un écart sur les sets est
attendu. Une colonne « équipement PvP proposé par le jeu » sur la fiche serait
une donnée officielle, sans opinion éditoriale.

### 1.4 Une mécanique que la fiche ne dit pas : `CharacterIgnoreBuffTypeTemplet`

Une seule ligne : le personnage `2000129` (Demiurge Saeran) ignore les buffs de
type `BT_INVINCIBLE`, `BT_REVIVAL`, `BT_RESURRECTION`,
`BT_SHIELD_BASED_CASTER`, `BT_SHIELD_BASED_TARGET`, `BT_UNDEAD`. Le client
(`apk/dumped/dump.cs`, `CBuff.Initialize`) refuse l'application du buff quand
le **porteur** a ce type dans sa liste : elle ne peut donc recevoir ni
bouclier, ni invincibilité, ni résurrection d'un allié. Rien dans ses skills
générés (`data/generated/skills.json`, ids 129xx/130xx) ni dans
`data/curated/characters.json` ne le mentionne, alors que c'est décisif pour
composer une équipe autour d'elle.

À vérifier en jeu : son S2 accorde « Immortality » au lanceur ; si ce statut est
de type `BT_UNDEAD`, l'interaction est à comprendre avant de l'écrire.

### 1.5 Ce qui a été confronté sans rien trouver

- **`tags.json`, tag `free`** : `EventRecruitTemplet` liste 6 personnages
  (D.Stella, D.Astei, D.Drakhan, D.Vlada, M.Eva et Luna `2000119`) obtenables par des
  événements de missions (`ET_IVANEZ`, `ET_MIRSHA_SETTLEMENT`). Aucun n'a de tag
  curé ; ce ne sont pas des personnages « gratuits » au sens du tag (bannière de
  départ / histoire), donc pas de contradiction. La table pourrait alimenter une
  mention « obtenable via l'événement X » sur leur fiche.
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
dans un niveau suit l'intérêt, pas la taille.

### Niveau A — une page ou une section qui manque

| Tables                                                                                                                                             | Ce qu'elles contiennent                                                                                                                                                                                                                        | Ce que le wiki y gagnerait                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ItemCraftCategoryTemplet`, `ItemCraftConsumeTemplet`, `ItemCraftRecycleTemplet`, `ItemRecycleMaterialGroupTemplet`                                | L'atelier de fabrication : catégories, limites hebdo/mensuelles, recettes (matériaux, or, résultat), recyclage en points.                                                                                                                      | Dériver `kates-workshop` (§ 1.1) ; une page « Atelier » avec ce que chaque fabrication coûte et rapporte.                                                                                 |
| `IrregularChaseExchangeTemplet`, `IrregularRewardBonusTemplet`                                                                                     | Les pistes d'échange des quatre monnaies d'Irregular Extermination (paliers de points, récompense « Normal » et « Special ») et le bonus du jour de la semaine (+30 % à +60 % selon la monnaie).                                               | Dériver `irregular-extermination-points` ; ajouter aux guides `irregular-extermination` le jour où farmer quelle monnaie.                                                                 |
| `MissionTemplet`, `MissionTaskTemplet`, `ContentTaskTemplet`                                                                                       | Toutes les missions (3 508) : quotidiennes, hebdo, arène, Singularity, succès (`MCT_ACHIEVE`, 631), quêtes guidées, événements, pass. `ContentTaskTemplet` définit les conditions.                                                             | Dériver les sources « mission » des guides de ressources et d'Ether ; une page « Succès » (631 succès, récompenses en Ether) ; les missions d'événement sur les pages d'événement.        |
| `AttendanceScheduleTemplet`, `AttendanceRewardTemplet`                                                                                             | Les connexions : quotidienne (15 jours en boucle), nouveau joueur, retour, guilde, événements datés, packs.                                                                                                                                    | Sources de ressources et d'Ether (§ 1.1, § 1.2) ; récompenses de connexion des événements.                                                                                                |
| `DungeonClearInfoTemplet`                                                                                                                          | Pour 87 groupes, soit 176 combats (story 76, `DM_TOWER_HARD` 40, Special Request 60), les héros recommandés **par le jeu**, par besoin (ex. story 1-11 : immunité → Astei, Dianne, Nella ; purge → Luna, Viella, Liselotte).                   | Un encadré « Le jeu recommande » sur les guides de ces combats, à côté de la sélection éditoriale. Donnée officielle et localisée.                                                        |
| `PVPRealTimeScheduleTemplet`, `PVPRealTimeFieldSkillTemplet`, `PVPRealTimeLeaderBuffTemplet`, `PVPRealTimeRankTemplet`, `PVPRealTimeRewardTemplet` | L'arène temps réel : saisons et semaines, bans globaux (personnages, éléments, classes), plafond de stats « Tactics League », règles de terrain par tour, buffs de chef par classe, rangs, points, récompenses.                                | Une page « Arène temps réel » : règles de la semaine, bans, récompenses de saison. Aujourd'hui seule la saison 1 est dans la table (5 semaines avec bans).                                |
| `MonadGateArtifactTemplet`, `MonadGateArtifactGroupTemplet`, `MonadGateArtifactRegionTemplet`, `MonadGateCubeTemplet`, `MonadGateDepthTemplet`     | Les reliques de Monad Gate : 166 artefacts (83 familles, 3 raretés, effet `OptionID`, puissance ajoutée, prix), leurs taux de tirage, les cubes de récompense, et par profondeur la plage de niveau des monstres et le multiplicateur de gain. | Une liste des reliques sur les pages Monad Gate (le site génère routes et thème, pas les reliques) ; niveau de monstres et gain par profondeur.                                           |
| `PVPPresetCharacterTemplet`, `PVPPresetEquipTemplet`                                                                                               | Équipement PvP proposé par le jeu pour 114 personnages (défaut + choix autorisés).                                                                                                                                                             | Colonne de fiche et vérification de `gear-reco` (§ 1.3).                                                                                                                                  |
| `TrustDialogueTemplet`, `InteractionScenarioTemplet`, `TrustRewardTemplet`, `EmotionConnectTemplet`, `TrustInterReactionTemplet`                   | L'affinité : 425 dialogues sur 84 personnages avec récompense de bonne/mauvaise réponse (1 500 / 750), récompenses par niveau d'affinité, interactions tactiles qui donnent un buff de dégâts (20 personnages).                                | Une section « Affinité » sur la fiche. Limite : **quelle** réponse est la bonne est dans les fichiers de scénario (`FileName`), pas dans les tables ; non vérifié qu'ils soient extraits. |

### Niveau B — une colonne, une précision, une vérification

| Tables                                                                                                                                                                     | Ce qu'elles contiennent                                                                                                                                                           | Usage                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `CharacterIgnoreBuffTypeTemplet`                                                                                                                                           | Les types de buff qu'un personnage ne peut pas recevoir (1 ligne).                                                                                                                | Mention sur la fiche, et test qui casse quand une ligne arrive (§ 1.4).                                   |
| `IrregularInfiltrateFloorTemplet`, `IrregularInfiltrateNodeTemplet`, `IrregularInfiltrateEventTemplet`, `IrregularInfiltrateAreaTemplet`, `IrregularInfiltrateItemTemplet` | Irregular Infiltration : 3 étages (reset mensuel, le 3ᵉ en boucle), 274 nœuds (combats, coffres, dialogues, sanctuaires), choix de dialogue et leurs récompenses, objets d'étage. | Sources de l'étage 3 (§ 1.1) ; une carte de l'étage avec ce que donne chaque nœud.                        |
| `EventDungeonChapterTemplet`                                                                                                                                               | Pour chaque chapitre d'événement (116) : dates, héros bonus et pourcentage (+20 %, +10 %), monnaie d'événement, catégorie de boutique.                                            | Les héros bonus sur les pages d'événement (le générateur lit `EventDungeonTemplet` mais pas les bonus).   |
| `EventBossBonusTypeTemplet`, `EventBossRewardTemplet`                                                                                                                      | Bonus de score des boss d'événement (difficulté +10 % / +15 %…, conditions) et paliers de score mondial.                                                                          | Précision des guides de boss d'événement (`EventBossDungeonTemplet` est lu, ses bonus non).               |
| `UserNickNameTemplet`, `FrameTemplet`                                                                                                                                      | 51 titres de profil (comment les obtenir ; 24 donnent un buff, ex. réduction de stamina en story et Special Request) et 116 cadres de profil.                                     | Une page « Titres et cadres » ; les titres à buff intéressent les joueurs.                                |
| `SideStoryTemplet`, `SideStoryBonusTemplet`, `ArchiveCGTemplet`                                                                                                            | 65 histoires secondaires (une par personnage, niveau requis, récompense, illustration) ; 70 illustrations de scénario.                                                            | Une ligne « Histoire secondaire » sur la fiche ; la source d'Ether `variable.sideStories` du guide Ether. |
| `ArchiveRelationTemplet`, `ArchiveCharacterTemplet`, `ArchiveItemTemplet`                                                                                                  | 21 « relations » nommées entre 3 à 4 personnages (ex. « Unexpected Heroes » : K, Eva, Snow, Lisha) ; récompenses de collection par personnage et par équipement.                  | Les relations sur la fiche (liens entre personnages, donnée du jeu localisée).                            |
| `ItemCraftTemplet`, `ItemCraftRewardTemplet`                                                                                                                               | Fabrication d'armes et d'armures par élément et étoile : matériaux, or, taux par palier de résultat (50/30/15/5 %).                                                               | Taux de fabrication dans le guide `gear`.                                                                 |
| `ItemEnchantExpTemplet`, `ItemMergeTemplet`, `ItemGemMergeTemplet`, `ItemOptionChangeTemplet`, `ItemSmeltingTemplet`                                                       | Coûts d'amélioration de l'équipement : XP donnée par pièce sacrifiée, fusion de matériaux, fusion de gemmes, changement d'option, forge (reforge).                                | Calculs de coût dans les guides d'équipement.                                                             |
| `GuildRaidPointRewardTemplet`                                                                                                                                              | Paliers de points de guild raid (380 lignes) et récompenses.                                                                                                                      | Compléter les guides `guild-raid` (les classements sont déjà lus).                                        |
| `PVPLeagueScheduleTemplet`, `PVPLeagueRankTemplet`, `PVPArenaTemplet`, `PVPArenaMemberTemplet`                                                                             | Saisons de ligue (dates, buff de saison), récompenses par rang de ligue ; arène d'entraînement contre des PNJ.                                                                    | Récompenses et buff de saison sur un guide d'arène.                                                       |
| `TicketRestoreTemplet`, `ExpAccountTemplet`, `AdMobTemplet`                                                                                                                | Recharge des tickets (stamina 1 / 5 min, max 60 ; arène 1 / h, max 15 ; guild raid 2/jour…), stamina max par niveau de compte, pubs.                                              | Vérifier ou dériver les chiffres du progress tracker et du guide `daily-stamina`.                         |
| `GuideTemplet`, `GuideCategoryTemplet`                                                                                                                                     | Le guide officiel en jeu : 217 entrées (combat, éléments, calcul des dégâts, jauge de priorité, burst, chaîne…), en 6 langues, avec images.                                       | Texte officiel localisé pour le glossaire et les guides généraux (`stats`, `beginner-faq`).               |
| `SideDungeonIncreaseTemplet`                                                                                                                                               | Bonus de stats (+10 %) d'un personnage ou d'une classe dans certains donjons.                                                                                                     | Précision sur les guides concernés.                                                                       |
| `EventRecruitTemplet`                                                                                                                                                      | Personnages obtenables par missions d'événement (§ 1.5).                                                                                                                          | Mention sur la fiche.                                                                                     |
| `EarlyClearBonusTemplet`, `DungeonMissionTemplet`, `AreaRewardTemplet`                                                                                                     | Bonus de victoire rapide (par nombre de tours), conditions d'étoiles des niveaux (sans mort, en N tours…), récompenses d'étoiles par zone.                                        | Précisions sur les guides d'aventure.                                                                     |

### Niveau C — du contexte pour un guide

| Tables                                                                                                                                                                                                                                                                    | Ce qu'elles contiennent                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Exploration{Templet,Boss,Event,Order,Team,Weather}Templet`                                                                                                                                                                                                               | Terminus Isle : 10 niveaux, boss par météo, 1 000 événements, ordres, bonus d'équipe par élément.                                           |
| `AetherTemplet`, `FacilityTemplet`, `FacilityCategoryTemplet`, `DetachmentTemplet`, `SynchroTemplet`                                                                                                                                                                      | La base : générateur d'antiparticules (gain par niveau de compte), améliorations, expéditions, synchro.                                     |
| `RemainsFloorTemplet`, `RemainsNodeTemplet`, `RemainsRewardTemplet`, `SkipArtifactRewardTemplet`                                                                                                                                                                          | « The Deeps » : 29 zones, 2 656 nœuds, puissance recommandée, récompenses.                                                                  |
| `AdventureTemplet`, `AdventureLevelTemplet`                                                                                                                                                                                                                               | Adventure License : rangs, XP, récompenses (les guides `adventure-license` existent, les rangs non).                                        |
| `BattlePassTemplet`, `BattlePassGradeTemplet`, `BattlePassTaskTemplet`                                                                                                                                                                                                    | Pass de combat courant (dates, costume, paliers gratuits et premium, missions).                                                             |
| `EventGameTemplet`, `Bingo{Page,Number,LineReward}Templet`, `EventFireWorks{,Effect}Templet`, `DrawLots{,Reward}Templet`, `EventGacha/LuckyBox/Roulette/RPS/Global{,Node}Templet`, `EventTimeRewardTemplet`                                                               | Mini-jeux d'événement : 22 jeux (bingo, feux d'artifice, omikuji, loterie…), récompenses et **taux**.                                       |
| `EventUITemplet`, `EventIntegration{,Category}Templet`                                                                                                                                                                                                                    | Bannières et regroupement des événements en jeu.                                                                                            |
| `GuildMonolithTemplet`, `GuildMarkTemplet`                                                                                                                                                                                                                                | Améliorations de guilde (membres, effets) et emblèmes.                                                                                      |
| `ProductBannerTemplet`, `ProductPackageGroupTemplet`, `PersonalProductTemplet`, `ProductSubCategoryTemplet`, `ProductShopTabGroupTemplet`, `ProductCategoryGroupTemplet`, `ProductBuyBonusRewardTemplet`, `ProductPopupConditionTemplet`, `LimitedProduct{,Level}Templet` | La boutique au-delà de `ProductTemplet` : contenu des packs, offres personnelles, conditions d'apparition.                                  |
| `PieceTransformTemplet`, `CharacterExpansionTemplet`, `NPCCharacterTemplet`, `RewardViewTemplet`, `RewardGroupExpansionTemplet`                                                                                                                                           | Conversion de pièces, 2 « boosts » de personnage, builds des PNJ, aperçus de récompense, options fixes de récompenses d'équipement.         |
| `VoiceTemplet`, `TrustVoiceTemplet`, `VoiceEtcTemplet`, `TextVoice`                                                                                                                                                                                                       | Répliques vocales par personnage (133) et leur texte en 6 langues. Une section « Voix » est possible ; question de droits à trancher avant. |
| `TextScenario`…`TextScenario7`, `TextCutScene`, `ScenarioTemplet`                                                                                                                                                                                                         | Tout le texte du scénario (~120 000 lignes, ~90 Mo). Mêmes réserves.                                                                        |
| `SingularityOptionPopUpTemplet`, `ChainCombinationTemplet`, `IrregularInfiltrateItemTemplet`                                                                                                                                                                              | Fourchettes d'options singulières affichées en jeu ; icône de chaîne par personnage.                                                        |

### Niveau D — sans intérêt pour le wiki

`BadWordChatTemplet` et `BadWordNameTemplet` (et leurs `_0` à `_4`, filtres de
modération), `LoadingTemplet` (écrans de chargement), `MailTemplet`,
`EmoticonTemplet`, `ExpressionTemplet`, `FormationTemplet` (caméra),
`DamageTypeTemplet` (effets visuels et sonores des coups), `StateTemplet`
(physique des animations), `MonsterDamageTemplet` (réactions aux coups ; le
pipeline damage note qu'aucune ligne n'en porte de facteur utile),
`ModelGroupTemplet`, `SpeechActionTemplet`, `Tutorial{,Action,MoveGroup}Templet`,
`TextTutorial`, `TextStaff`, `GuideQuestGroupTemplet`, `ItemShortcut{,Group}Templet`
(raccourcis d'interface), `RecruitConditionTemplet`.

---

## 3. Inventaire complet des 169 tables non lues

Niveau : A, B, C, D comme au § 2. Lignes au 1.11.404.

| Table                            | Lignes | Contenu                                          | Niv. |
| -------------------------------- | -----: | ------------------------------------------------ | :--: |
| AdMobTemplet                     |     10 | Pubs : 10 par jour, 18 stamina                   |  B   |
| AdventureLevelTemplet            |    150 | Rangs d'Adventure License, XP                    |  C   |
| AdventureTemplet                 |     19 | Adventure License : rangs, récompenses           |  C   |
| AetherTemplet                    |     70 | Générateur d'antiparticules par niveau de compte |  C   |
| ArchiveCGTemplet                 |     70 | Illustrations de scénario                        |  C   |
| ArchiveCharacterTemplet          |    492 | Récompenses de collection par personnage         |  B   |
| ArchiveItemTemplet               |     76 | Récompenses de collection d'équipement           |  B   |
| ArchiveRelationTemplet           |     21 | Relations nommées entre personnages              |  B   |
| AreaRewardTemplet                |     15 | Récompenses d'étoiles par zone                   |  B   |
| AttendanceRewardTemplet          |    869 | Récompenses de connexion par jour                |  A   |
| AttendanceScheduleTemplet        |     34 | Plannings de connexion                           |  A   |
| BadWordChatTemplet (+ \_0 à \_4) | 13 248 | Filtre de modération du chat                     |  D   |
| BadWordNameTemplet (+ \_0 à \_4) | 11 847 | Filtre de modération des noms                    |  D   |
| BattlePassGradeTemplet           |     62 | Paliers du pass                                  |  C   |
| BattlePassTaskTemplet            |     46 | Missions du pass                                 |  C   |
| BattlePassTemplet                |      2 | Pass courant et précédent                        |  C   |
| BingoLineRewardTemplet           |    583 | Bingo : récompenses de ligne                     |  C   |
| BingoNumberRewardTemplet         |    950 | Bingo : récompenses par numéro                   |  C   |
| BingoPageTemplet                 |     53 | Bingo : pages                                    |  C   |
| ChainCombinationTemplet          |    171 | Icône de chaîne par personnage                   |  C   |
| CharacterExpansionTemplet        |      2 | Boosts de personnage                             |  C   |
| CharacterIgnoreBuffTypeTemplet   |      1 | Buffs qu'un personnage ne peut recevoir          |  B   |
| ContentTaskTemplet               |  1 695 | Conditions des missions                          |  A   |
| DamageTypeTemplet                |     49 | Effets visuels/sonores des coups                 |  D   |
| DetachmentTemplet                |     15 | Expéditions                                      |  C   |
| DrawLotsRewardTemplet            |      7 | Omikuji : récompenses et taux                    |  C   |
| DrawLotsTemplet                  |      1 | Omikuji                                          |  C   |
| DungeonClearInfoTemplet          |    263 | Héros recommandés par le jeu                     |  A   |
| DungeonMissionTemplet            |    163 | Conditions d'étoiles des niveaux                 |  B   |
| EarlyClearBonusTemplet           |    120 | Bonus de victoire rapide                         |  B   |
| EmoticonTemplet                  |     35 | Émoticônes du chat                               |  D   |
| EmotionConnectTemplet            |     38 | Interactions d'affinité (buff)                   |  A   |
| EventBossBonusTypeTemplet        |     11 | Bonus de score des boss d'événement              |  B   |
| EventBossRewardTemplet           |     10 | Paliers de score mondial                         |  B   |
| EventDungeonChapterTemplet       |    116 | Chapitres d'événement, héros bonus               |  B   |
| EventFireWorksEffectTemplet      |      6 | Feux d'artifice : effets                         |  C   |
| EventFireWorksTemplet            |      3 | Feux d'artifice : règles                         |  C   |
| EventGachaTemplet                |      5 | Mini-gacha d'événement : taux                    |  C   |
| EventGameTemplet                 |     22 | Mini-jeux d'événement                            |  C   |
| EventGlobalNodeTemplet           |     80 | Événement « global » : nœuds                     |  C   |
| EventGlobalTemplet               |     40 | Événement « global » : grille                    |  C   |
| EventIntegrationCategoryTemplet  |      2 | Catégories d'événements                          |  C   |
| EventIntegrationTemplet          |      3 | Regroupement d'événements                        |  C   |
| EventLuckyBoxTemplet             |      4 | Boîte chance : taux                              |  C   |
| EventRPSTemplet                  |      2 | Pierre-feuille-ciseaux : taux                    |  C   |
| EventRecruitTemplet              |     10 | Personnages obtenables par missions              |  B   |
| EventRouletteTemplet             |      6 | Roulette : taux                                  |  C   |
| EventTimeRewardTemplet           |      2 | Récompenses horaires                             |  C   |
| EventUITemplet                   |    214 | Bannières d'événements                           |  C   |
| ExpAccountTemplet                |     70 | XP et stamina max par niveau de compte           |  B   |
| ExplorationBossTemplet           |     50 | Terminus Isle : boss                             |  C   |
| ExplorationEventTemplet          |  1 000 | Terminus Isle : événements                       |  C   |
| ExplorationOrderTemplet          |      7 | Terminus Isle : ordres                           |  C   |
| ExplorationTeamTemplet           |     75 | Terminus Isle : bonus d'équipe                   |  C   |
| ExplorationTemplet               |     10 | Terminus Isle : niveaux                          |  C   |
| ExplorationWeatherTemplet        |     50 | Terminus Isle : météo                            |  C   |
| ExpressionTemplet                |     12 | Expressions faciales                             |  D   |
| FacilityCategoryTemplet          |     24 | Base : catégories                                |  C   |
| FacilityTemplet                  |     61 | Base : améliorations                             |  C   |
| FormationTemplet                 |      5 | Caméra de combat                                 |  D   |
| FrameTemplet                     |    116 | Cadres de profil                                 |  B   |
| GuideCategoryTemplet             |     20 | Guide en jeu : catégories                        |  B   |
| GuideQuestGroupTemplet           |      6 | Quêtes guidées : groupes                         |  D   |
| GuideTemplet                     |    217 | Guide en jeu : entrées                           |  B   |
| GuildMarkTemplet                 |     12 | Emblèmes de guilde                               |  C   |
| GuildMonolithTemplet             |     29 | Améliorations de guilde                          |  C   |
| GuildRaidPointRewardTemplet      |    380 | Guild raid : paliers de points                   |  B   |
| InteractionScenarioTemplet       |    415 | Dialogues d'affinité : fichiers                  |  A   |
| IrregularChaseExchangeTemplet    |    120 | Irregular Extermination : échange de points      |  A   |
| IrregularInfiltrateAreaTemplet   |     16 | Infiltration : zones                             |  B   |
| IrregularInfiltrateEventTemplet  |     74 | Infiltration : dialogues et choix                |  B   |
| IrregularInfiltrateFloorTemplet  |      3 | Infiltration : étages                            |  B   |
| IrregularInfiltrateItemTemplet   |     22 | Infiltration : objets d'étage                    |  B   |
| IrregularInfiltrateNodeTemplet   |    274 | Infiltration : nœuds et récompenses              |  B   |
| IrregularRewardBonusTemplet      |      7 | Bonus de monnaie par jour de la semaine          |  A   |
| ItemCraftCategoryTemplet         |     17 | Atelier : catégories et limites                  |  A   |
| ItemCraftConsumeTemplet          |      9 | Atelier : recettes de consommables               |  A   |
| ItemCraftRecycleTemplet          |      9 | Atelier : recyclage                              |  A   |
| ItemCraftRewardTemplet           |  2 400 | Fabrication : contenu des groupes de résultat    |  B   |
| ItemCraftTemplet                 |    210 | Fabrication d'équipement : coûts et taux         |  B   |
| ItemEnchantExpTemplet            |    193 | XP d'amélioration par pièce                      |  B   |
| ItemGemMergeTemplet              |      6 | Fusion de gemmes : coûts                         |  B   |
| ItemMergeTemplet                 |     41 | Fusion de matériaux                              |  B   |
| ItemOptionChangeTemplet          |     50 | Changement d'option : coûts                      |  B   |
| ItemRecycleMaterialGroupTemplet  |     35 | Atelier : points de recyclage par matériau       |  A   |
| ItemShortcutGroupTemplet         |    311 | Raccourcis d'interface par item                  |  D   |
| ItemShortcutTemplet              |     82 | Raccourcis d'interface                           |  D   |
| ItemSmeltingTemplet              |     24 | Reforge : coûts                                  |  B   |
| LimitedProductLevelTemplet       |     10 | Boutique limitée : niveaux                       |  C   |
| LimitedProductTemplet            |      4 | Boutique limitée                                 |  C   |
| LoadingTemplet                   |  2 603 | Écrans de chargement                             |  D   |
| MailTemplet                      |     49 | Modèles de courrier                              |  D   |
| MissionTaskTemplet               |  3 508 | Toutes les missions                              |  A   |
| MissionTemplet                   |      6 | Paliers quotidiens/hebdo                         |  A   |
| ModelGroupTemplet                |     30 | Modèles 3D des monstres                          |  D   |
| MonadGateArtifactGroupTemplet    |    468 | Reliques : taux de tirage                        |  A   |
| MonadGateArtifactRegionTemplet   |      1 | Reliques : régions                               |  A   |
| MonadGateArtifactTemplet         |    166 | Reliques de Monad Gate                           |  A   |
| MonadGateCubeTemplet             |    520 | Cubes de récompense                              |  A   |
| MonadGateDepthTemplet            |     10 | Profondeurs : niveaux, gain                      |  A   |
| MonsterDamageTemplet             |  1 001 | Réactions aux coups des monstres                 |  D   |
| NPCCharacterTemplet              |    593 | Builds des PNJ                                   |  C   |
| PVPArenaMemberTemplet            |     65 | Arène d'entraînement : PNJ                       |  B   |
| PVPArenaTemplet                  |      5 | Arène d'entraînement                             |  B   |
| PVPLeagueRankTemplet             |     60 | Ligue : rangs et récompenses                     |  B   |
| PVPLeagueScheduleTemplet         |      5 | Ligue : saisons et buffs                         |  B   |
| PVPPresetCharacterTemplet        |    114 | PvP imposé : niveaux et préréglages              |  A   |
| PVPPresetEquipTemplet            |    909 | PvP imposé : équipement                          |  A   |
| PVPRealTimeFieldSkillTemplet     |    115 | Arène temps réel : règles de terrain             |  A   |
| PVPRealTimeLeaderBuffTemplet     |      6 | Arène temps réel : buffs de chef                 |  A   |
| PVPRealTimeRankTemplet           |     24 | Arène temps réel : rangs                         |  A   |
| PVPRealTimeRewardTemplet         |     48 | Arène temps réel : récompenses                   |  A   |
| PVPRealTimeScheduleTemplet       |     33 | Arène temps réel : semaines, bans                |  A   |
| PersonalProductTemplet           |  3 715 | Offres personnelles                              |  C   |
| PieceTransformTemplet            |      4 | Conversion de pièces                             |  C   |
| ProductBannerTemplet             |    574 | Bannières de boutique                            |  C   |
| ProductBuyBonusRewardTemplet     |      6 | Bonus d'achat                                    |  C   |
| ProductCategoryGroupTemplet      |      2 | Boutique : catégories                            |  C   |
| ProductPackageGroupTemplet       |  5 515 | Contenu des packs                                |  C   |
| ProductPopupConditionTemplet     |    455 | Conditions d'apparition des offres               |  C   |
| ProductShopTabGroupTemplet       |     25 | Boutique : onglets                               |  C   |
| ProductSubCategoryTemplet        |     94 | Boutique : sous-catégories                       |  C   |
| RecruitConditionTemplet          |      1 | Condition de recrutement                         |  D   |
| RemainsFloorTemplet              |     29 | The Deeps : zones                                |  C   |
| RemainsNodeTemplet               |  2 656 | The Deeps : nœuds                                |  C   |
| RemainsRewardTemplet             |      3 | The Deeps : récompenses                          |  C   |
| RewardGroupExpansionTemplet      |    933 | Options fixes des récompenses d'équipement       |  C   |
| RewardViewTemplet                |    930 | Aperçus de récompense                            |  C   |
| ScenarioTemplet                  |  3 430 | Index des scénarios                              |  C   |
| SideDungeonIncreaseTemplet       |      5 | Bonus de stats par personnage ou classe          |  B   |
| SideStoryBonusTemplet            |     16 | Histoires secondaires : bonus                    |  B   |
| SideStoryTemplet                 |     65 | Histoires secondaires                            |  B   |
| SingularityOptionPopUpTemplet    |     20 | Options singulières affichées                    |  C   |
| SkipArtifactRewardTemplet        |    135 | The Deeps : artefacts de saut                    |  C   |
| SpeechActionTemplet              |     20 | Bulles de dialogue                               |  D   |
| StateTemplet                     |  1 014 | Physique des animations                          |  D   |
| SynchroTemplet                   |      5 | Base : synchro                                   |  C   |
| TextCutScene                     |  1 030 | Texte des cinématiques                           |  C   |
| TextScenario                     | 12 341 | Texte du scénario                                |  C   |
| TextScenario2                    | 31 683 | Texte du scénario                                |  C   |
| TextScenario3                    | 19 612 | Texte du scénario                                |  C   |
| TextScenario4                    | 16 932 | Texte du scénario                                |  C   |
| TextScenario5                    | 12 149 | Texte du scénario                                |  C   |
| TextScenario6                    | 20 304 | Texte du scénario                                |  C   |
| TextScenario7                    |  3 886 | Texte du scénario (affinité)                     |  C   |
| TextStaff                        |      3 | Crédits                                          |  D   |
| TextTutorial                     |  1 642 | Texte du tutoriel                                |  D   |
| TextVoice                        |  8 909 | Texte des répliques vocales                      |  C   |
| TicketRestoreTemplet             |     10 | Recharge des tickets                             |  B   |
| TrustDialogueTemplet             |    425 | Dialogues d'affinité                             |  A   |
| TrustInterReactionTemplet        |      2 | Types d'interaction d'affinité                   |  A   |
| TrustRewardTemplet               |  2 172 | Récompenses par niveau d'affinité                |  A   |
| TrustVoiceTemplet                |  5 637 | Répliques débloquées par l'affinité              |  C   |
| TutorialActionTemplet            |  1 124 | Tutoriel : actions                               |  D   |
| TutorialMoveGroupTemplet         |      7 | Tutoriel : déplacements                          |  D   |
| TutorialTemplet                  |    110 | Tutoriel : étapes                                |  D   |
| UserNickNameTemplet              |     51 | Titres de profil (24 avec buff)                  |  B   |
| VoiceEtcTemplet                  |    385 | Répliques diverses                               |  C   |
| VoiceTemplet                     |    133 | Répliques vocales par personnage                 |  C   |

Les douze tables `BadWord*` comptent pour 12 lignes de l'inventaire (169) et
tiennent ici en deux.

---

## Ce qui est vérifié, et ce qui ne l'est pas

**Vérifié, sur les données 1.11.404 :**

- le compte de 89 tables lues, par instrumentation des deux générations et
  confirmation statique ;
- chaque chiffre des § 1.1 à 1.5, rejoué par script sur `parsed/` et comparé
  aux fichiers curés et au code du site cités ;
- le comportement de `CharacterIgnoreBuffTypeTemplet`, lu dans le code
  décompilé du client.

**Non vérifié :**

- tout ce qui demande le jeu : cadence mensuelle de l'échange d'Irregular
  Extermination, activité réelle de la mission d'arène quotidienne, montant du
  check-in mensuel, nombre d'événements favorables à l'étage 3, interaction
  entre l'« Immortality » de Demiurge Saeran et son immunité aux buffs ;
- la sémantique de quelques colonnes nommées `_unknown_*` par le parser
  (taux dans `EventGachaTemplet`, `EventRouletteTemplet`, `EventRPSTemplet`),
  interprétées d'après leurs valeurs ;
- la présence des fichiers de scénario d'affinité qui diraient quelle réponse
  est la bonne ;
- les droits de reprise des textes de scénario et des répliques vocales.
