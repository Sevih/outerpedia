# Clips d'animation joués par une compétence — règle du client, cas, mesures, correctif

> Enquête du lot F27 (constats R14 et R16 de la revue d'octobre 2026) : documentation seule, aucun code ni donnée modifiés. Le correctif viendra dans un lot à part, une fois les mesures faites ; c'est lui qui réécrira [damage-formula.md](./damage-formula.md) § 8.1 et les en-têtes cités au § 5.4.
>
> **Révisions lues (16/10/2026).** `main` à `fe40b008` : C24 n'est pas encore passé, les états fantômes de R15 (chaînes `2700019_*`, `2700070_*`, `2000088_*`, S1 d'Akari résolu chez Drakhan) sont encore dans les rapports. Client décompilé 1.11.404 (`outerpedia-gamedata`, commit `379096b`, `apk/dumped/src/`) ; tables et `data/generated/damage/` en 1.11.408 ; `datagen/damage/anim-events.json` du patch du 13/10. Aucune ligne du client n'est recopiée ici : chaque point renvoie au fichier, à la fonction et à une ligne approximative.
>
> **Scripts jetables** (hors dépôt, lancés par `pnpm exec tsx --tsconfig tsconfig.json`) : inventaire des compétences à plusieurs triggers ou clips, valeurs du moteur sous chaque règle candidate (moteur importé tel quel, seules les données en mémoire changent), valeurs des mesures par le chemin `?z=` du calculateur (`replayFixture`), effet sur `bestSkill` du contrat solver, rejeu de `multistate.mts` de la revue (42 cellules à plusieurs états, 16 à plus de 1 % : inchangé sur `fe40b008`).

## 1. La règle du client

### 1.1 Un lancer part UN trigger, choisi par son index

`CSkillTemplet.TriggerName` et `TriggerNameSkip` sont des CSV découpés en listes (`TriggerNameList`, `TriggerNameSkipList`, `CSkillTemplet.cs` l.7-9 et 60-80). `CSkill.TriggerName`, `TriggerNameSecond` et `TriggerNameThird` lisent les index 0, 1 et 2 de la liste (`CSkill.cs` l.95-99). Les autres colonnes « par trigger » du skill (`FocusType`, `ApproachType`, `ApproachZ`, `ApproachY`, `UseJiggleBone`) se lisent par la POSITION du trigger courant dans cette liste (`CSkillTemplet.GetValueByTriggerName`, l.169) : un index est une VARIANTE du lancer, avec sa propre portée et sa propre approche, pas une étape d'une séquence. `TriggerName` ne « liste pas les triggers du skill dans l'ordre ».

Le trigger retenu est calculé par `CCharacterBattle.GetUseTriggerName` (l.5123-5185) :

- par défaut l'index 0 ;
- Ame (`OriginalCharacterID` 2000065), pour son S1 et son S3 : l'index 1 sous un buff `BT_2000065_A`, l'index 2 sous `BT_2000065_B` (`FindBuff2000065`, l.5038, prend tout buff de type compris entre A et B). Son S1 reste sur l'index 0 si Ame porte `BT_SEAL_ADDITIVE_ATTACK` (`CheckSealAdditiveAttack`, l.5062). Son S3 sans buff A ni B reçoit un trigger VIDE ; `SkillFire` (l.2977-2986) n'anime alors rien et finit le skill aussitôt ;
- tout autre perso : l'index 1 si un buff `BT_SECOND_TRIGGER` de l'attaquant passe `CheckAvailable` puis son tirage `CheckProbabilityPermille(Value)` (`FindBuffSecondTrigger`, l.4881) ;
- à chaque choix d'index i, `CheckSkip(i)` (fonction locale, l.5170) remplace le trigger par `TriggerNameSkip[i]` si l'animation est passée (`CPlayer.CheckSkipAnimation`, `CPlayer.cs` l.1598 : toujours en PvP temps réel, sinon selon les trois réglages de `COption.SkipSkillType`, dont « passée après la première vue », mémorisée par perso) et que l'entrée existe. La liste skip est alignée sur les index : Ame porte `Skill3Skip` trois fois, Ais deux fois.

Le nom retenu est mis en cache dans `CSkill.m_strCurrentTriggerName` : `CheckUseTriggerName` ne le calcule que s'il est vide (`CSkill.cs` l.287), `UseSkill` le vide puis le recalcule (`CCharacterBattle.cs` l.2705-2706), l'approche (l.1334) et `SkillFire` relisent le cache. Un lancer fait donc UN tirage de `BT_SECOND_TRIGGER` et joue UN trigger. `UseSkill` fixe aussi le taux du § 7 de chaque cible une fois pour tout le lancer (`CFormula.CheckDamageRate`, l.2790-2823) : critique ou non, il vaut pour tous les clips du lancer.

### 1.2 Le deuxième clip d'un lancer : la frappe additionnelle

Le seul autre `SetTrigger` d'un trigger de compétence dans tout le client est `CCharacterBattle.EventAdditiveAttack` (l.3192-3203), un ANIMATION EVENT posé dans le clip. Quand il tombe, si la cible n'est pas anéantie et qu'un buff `BT_ADDITIVE_ATTACK_ON_EVENT` de l'attaquant passe `CheckAvailable(cible)` (`FindBuffAdditiveAttackOnEvent`, l.4909 : `CallerSkillType` contre le type de skill réservé, puis la condition du buff, `CBuff.CheckAvailable` l.522), et que l'attaquant ne porte pas `BT_SEAL_ADDITIVE_ATTACK`, l'animator reçoit `TriggerNameSecond` : le clip de l'index 1 s'ENCHAÎNE après celui de l'index 0. L'index 1 a donc deux usages exclusifs selon le kit : variante (sous `BT_SECOND_TRIGGER` ou pour Ame), ou suite conditionnelle (sous `BT_ADDITIVE_ATTACK_ON_EVENT`). Aucun perso de la donnée ne porte les deux.

Les templets du clip additionnel portent en général `CDamageTemplet.IsAdditiveAttack = True` : 13 lignes, celles des clips d'index 1 de Francesca, Parti et Sterope (S1 et B3), plus deux templets du burst de Kanon (`2000071_Skill_Burst1_*`, clip à trigger unique) ; ceux de Luna et de Poolside Regina ne le portent pas (§ 3.3). Le client ne lit ce drapeau qu'en simulation (`CCharacterBattle.DamageSimulation`, l.2948-2975, mode `IsYSLSimulator`), qui ne compte ces hits que si le buff passe : le simulateur du jeu applique la même règle. En combat, `CCharacter.EventAttackStart` (`CCharacter.cs` l.1338) ne le regarde pas : un templet additionnel posé directement dans un clip frappe sans condition (burst de Francesca, burst de Luna).

Les transitions automatiques de l'animator (fin de clip vers l'état suivant, sans trigger) ne sont ni dans le code ni dans `anim-events.json`. Aucun des 12 cas n'en a besoin. Le seul indice qu'il en existe sur un skill est le S1 de Vera (201, § 3.3) : `Skill1` mène à `Battle_Approach`, sans event, et le clip à events `Skill_1_2` porte un trigger que rien dans le code ne pose.

### 1.3 Ce que voit le scan du facteur total

`CFormula.CalcDamage` (l.286-322) scanne, au premier hit d'une cascade (`ReceiveMaxDamage == 0`), les events de `GetCurrentAnimatorClipInfo(0)` : les clips de l'ÉTAT COURANT du layer 0, un seul hors blend tree. Au dernier hit (`CurrentSkillFactor >= TotalSkillFactor`), `ReceiveMaxDamage` et `TotalSkillFactor` repassent à 0 (l.332-341) : le hit suivant rescanne. Un clip additionnel fait donc sa propre cascade, à condition que son premier `EventAttackStart` tombe quand l'animator est entré dans son état.

Pendant un fondu, Unity rend l'état SOURCE comme état courant ; les clips de la destination ne sont visibles que par `GetNextAnimatorClipInfo`, que le client ne lit pas. Si le premier hit du clip additionnel tombait pendant le fondu, le scan relirait le clip d'index 0 : la cascade viserait `core(F0)`, les hits du clip additionnel (somme `F1 < F0`) ne la fermeraient jamais, et `CBattleManager.CompensateMissedDamage` (l.315-380, appelée par `EventSkillFinish`, `CCharacterBattle.cs` l.3261) verserait le reste en un nombre de plus, affiché non critique. Le lancer vaudrait alors `core(F0) + core(F0)` : c'est la règle candidate « fondu » des tableaux. La paire de mesures de Francesca l'exclut pour elle (§ 2) ; rien ne l'exclut ailleurs sans mesure ou sans les durées de transition.

Au passage, le second paramètre d'un `EventAttackStart` (« 34.142, 45, 200… », réputé non élucidé par `extract-anim-events.py`) est une rotation du hit : `CCharacter.EventAttackStart` le lit en `fHitRotation`.

### 1.4 Porteurs (`BuffTemplet`)

Les conditions `*_HAS_BUFF` lisent un groupe de `ToolTipGroupTemplet` (`CCharacterBattle.IsCheckHasBuff`, l.616 ; -1 = un buff, -2 = un débuff). Tous les buffs de kit ci-dessous sont `PASSIVE` et portés par le skill lui-même (`buffIds` de ses niveaux).

| Type                          | BuffID (skill)                                                                                           | Condition                                                                        | Effet                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| `BT_SECOND_TRIGGER`           | `2000059_1_1` (Demiurge Astei S1 5901)                                                                   | lanceur a le groupe 53 (`2000059`, Doll Garden's Caretaker), tirage 1000 ‰       | index 1                                     |
| `BT_SECOND_TRIGGER`           | `2000090_1_1`, `2000090_1_2` (Gnosis Dahlia S1 9001)                                                     | sans / avec Hubris's Dominion (`2000090`), 150-350 ‰ / 300-700 ‰ selon le niveau | index 1, tiré                               |
| `BT_SECOND_TRIGGER`           | `2000094_1_3` (Ember S1 9401)                                                                            | lanceur a `2000094` (Radiant Will), 1000 ‰                                       | index 1                                     |
| `BT_SECOND_TRIGGER`           | `2000096_3_2` (Ais S3 9603)                                                                              | lanceur a `2000096` (Ariel), 1000 ‰                                              | index 1                                     |
| `BT_SECOND_TRIGGER`           | `tower_very_hard_monster_2000059_1_1`                                                                    | monstre de tour                                                                  | —                                           |
| `BT_2000065_A`                | `2000065_3_1`, `2000065_3_1_element` (Ame S3 6503)                                                       | `SKILL_START`, PV de la cible au-dessus de 90 %                                  | index 1 (S1, S3)                            |
| `BT_2000065_B`                | `2000065_3_2`, `2000065_3_2_element` (Ame S3 6503)                                                       | `SKILL_START`, PV de la cible en dessous de 90 %                                 | index 2 (S1, S3)                            |
| `BT_2000065_A/B`              | `tower_very_hard_boss_2000065_3_1/2`, `event_monster_buff_132` (B)                                       | monstres                                                                         | —                                           |
| `BT_ADDITIVE_ATTACK_ON_EVENT` | `2000015_2_2` (Francesca S2 1502)                                                                        | cible en Saignement (groupe 3), S2 et bursts                                     | suite index 1                               |
| `BT_ADDITIVE_ATTACK_ON_EVENT` | `2000032_2_1` (Parti S2 3202)                                                                            | cible Brûlée (groupe 1), S2 et bursts                                            | suite index 1                               |
| `BT_ADDITIVE_ATTACK_ON_EVENT` | `2000057_1_1` (Sterope S1 5701)                                                                          | Sterope a un buff (groupe 9998), S1 et bursts                                    | suite index 1                               |
| `BT_ADDITIVE_ATTACK_ON_EVENT` | `2000085_2_2`, `2000085_2_3` (Poolside Regina S2 8502)                                                   | cible boss, ou cible sans buff (9998)                                            | suite index 1                               |
| `BT_ADDITIVE_ATTACK_ON_EVENT` | `2000103_1_1` (Luna S1 10301)                                                                            | Luna a une Barrière (groupe 29), S1 seul                                         | suite index 1                               |
| `BT_ADDITIVE_ATTACK_ON_EVENT` | `tower_element_52312_1`, `tower_element_52318_1`, `monad_gate_monster_19`                                | monstres                                                                         | —                                           |
| `BT_SEAL_ADDITIVE_ATTACK`     | `2000084_2_3`, `trancendent_8_seal_additive_attack`, `Q19`, `4086013_4_2`, `event_monster_buff_12st_453` | posé sur l'équipe adverse                                                        | bloque la suite, garde Ame S1 sur l'index 0 |

Côté Ame, `CBuff` (l.2399) ne fait que basculer l'objet rendu (`ToggleObject(1/2)`) ; `CBattleManager` (l.591) remplace le templet `Test_Skip_Finish` par `2000065_SKIP_A` ou `_B` selon le buff.

## 2. Confrontation aux mesures

**Francesca S2 (1502), mesurée en deux cascades.** `TriggerName` vaut `Skill2,Skill2_2` ; le S2 porte `2000015_2_2` (`BT_ADDITIVE_ATTACK_ON_EVENT`, cible en Saignement) et `2000015_2_1` (Saignement, créé sur `DAMAGE` par le templet `2000015_Skill_2_1`, premier event du clip `2000015_Skill_2_1`). Le premier hit saigne la cible, l'`EventAdditiveAttack` du clip tombe ensuite, la condition passe, `Skill2_2` s'enchaîne : `cascade(700) + cascade(300)`, 10 202 en normal et 22 028 en critique (`francesca-s2.json`, `francesca-s2-crit.json`), exacts. Le critique est commun aux deux clips (un seul `CheckDamageRate` par lancer). Le `BT_DMG` +40 % `2000015_2_5`, même condition, reste inactif dans la mesure : le taux est fixé dans `UseSkill`, avant que le premier hit ne pose le saignement. Le clip additionnel a bien été scanné seul : sous la règle « fondu », la mesure aurait valu `2 × core(700)`.

La mesure tient, l'explication de la spec est fausse, et l'hypothèse de la revue (une transition d'animator) n'est pas nécessaire : l'enchaînement est la frappe additionnelle, conditionnelle. Le seul maillon non LU est la présence de l'event `EventAdditiveAttack` dans `2000015_Skill_2_1` : l'extracteur ne garde que les `EventAttackStart`. La mesure la prouve pour ce clip.

**Burst du S2 (`francesca-s2-burst2.json`, 30 476, un clip de 1 000 ‰).** Les bursts n'ont qu'un trigger, `Burst1`, dont le clip `2000015_Skill_2_Upgrade` porte aussi les templets additionnels : une cascade, sans condition. Un `EventAdditiveAttack` dans ce clip lirait un index 1 absent de la liste ; il n'y en a donc pas, ce que la mesure confirme.

**Francesca S3 (1503), mesurée dans l'état SKIP.** `Skill3`, skip `Skill3Skip` : un des deux clips, selon l'option du joueur, jamais les deux. `2000015_Skill_3` (1 000 ‰, chaînes `Skill_3` 800 et `Skill_3_1` 200 dans la même cascade) ou `2000015_Skill_3_Skip` (`2000015_SKIP`, 1 000 ‰). La fixture `francesca-s3.json` vise la ligne `S3#2000015_SKIP`, dont l'unique clip est exactement celui que joue un lancer passé : une cascade de 1 000 ‰, 36 798 exact. Elle tombe juste parce que le site range les deux clips dans des chaînes différentes, donc des lignes différentes, et ne les additionne pas. La somme des trois lignes (14 000 dans le scénario du § 3) serait fausse ; animation jouée, la bonne valeur est la fusion des lignes `Skill_3` et `Skill_3_1` (R16).

Les autres fixtures ne portent qu'un clip par lancer : la règle ne les change pas.

## 3. Les cas

### 3.1 Inventaire

Refait sur `data/generated/damage/characters.json` et `CharacterSkillTemplet` : 16 skills de kit ont plusieurs triggers ou plusieurs clips. Douze ont au moins deux clips au site (la liste du lot) ; quatre n'en ont qu'un ou aucun (§ 3.3). Deux familles et un cas à part :

- **variantes** (un clip par lancer, choisi par l'index) : Ame S1, Francesca S3 (skip), Demiurge Astei S1, Ember S1, Ais S3 ;
- **suite additionnelle** (index 0, puis index 1 si la condition passe) : Francesca S2, Parti S2, Sterope S1 et ses trois bursts, Luna S1.

### 3.2 Valeurs sous chaque règle

Scénario commun : niveau 100, skills au niveau 5, ATK 5 000, DC 150 %, cible de même élément que l'attaquant (neutre), 1 000 000 PV, DEF 1 000, branche normale. « Site » = la cellule actuelle (`states[0]`) et la somme des lignes ; « somme » = tous les clips, une cascade chacun ; « clip i » = ce clip seul. Facteurs en ‰ du facteur du skill. Le rejeu `ame.mts` de la revue (cible Eau) donnait 7 335 contre 2 445 pour Ame ; ici, cible neutre, 6 111 contre 2 037.

| Skill                    | Triggers (skip)                     | Clips (‰)                         | Site : cellule ; Σ lignes      | Somme  | Clip 0 | Clip 1 | Règle                                                                         | Classement                      |
| ------------------------ | ----------------------------------- | --------------------------------- | ------------------------------ | ------ | ------ | ------ | ----------------------------------------------------------------------------- | ------------------------------- |
| Ame S1 6501              | `Skill1,Skill1_2,Skill1_3`          | 500, 500, 500 (events identiques) | 6 111 (1 500) ; 14 668         | 6 111  | 2 037  | 2 037  | un clip, 500 : **2 037** quel que soit A/B                                    | code seul                       |
| Francesca S2 1502        | `Skill2,Skill2_2`                   | 700, 300 additionnel              | 5 500 ; 5 500                  | 5 500  | 3 850  | 1 650  | **5 500** (saignement posé par le 1er hit), 3 850 si la cible y est immunisée | code + mesure                   |
| Francesca S3 1503        | `Skill3` (`Skill3Skip`)             | 1 000, 1 000 skip                 | 7 000 (SKIP) ; 14 000          | 14 000 | 7 000  | 7 000  | un des deux : **7 000**                                                       | code + mesure                   |
| Parti S2 3202            | `Skill2,Skill2_2`                   | 1 000, 300 additionnel            | 6 955 ; 9 041                  | 9 041  | 6 955  | 2 086  | **6 955**, 9 041 sur cible Brûlée                                             | non tranché : event non extrait |
| Sterope S1 5701          | `Skill1,Skill1_2`                   | 1 000, 300 additionnel            | 5 200 ; 5 200                  | 5 200  | 4 000  | 1 200  | **4 000**, 5 200 si Sterope a un buff                                         | non tranché : M1                |
| Sterope B1/B2 5719, 5720 | `Burst1,Skill1_2`                   | 1 000, 300 additionnel            | 5 980 ; 5 980                  | 5 980  | 4 600  | 1 380  | **4 600**, 5 980 avec un buff                                                 | non tranché : M2                |
| Sterope B3 5721          | `Burst3,Skill1_3`                   | 1 000, 300 additionnel            | 1 772 (la suite seule) ; 7 680 | 7 680  | 5 908  | 1 772  | **5 908**, 7 680 avec un buff                                                 | non tranché : M2 par analogie   |
| Demiurge Astei S1 5901   | `Skill1,Skill1_1`                   | 1 000, 1 300                      | 10 500 ; 24 150                | 24 150 | 10 500 | 13 650 | **10 500**, 13 650 sous Doll Garden's Caretaker                               | code seul                       |
| Ember S1 9401            | `Skill1,Skill1_1`                   | 1 000, 1 300                      | 3 500 ; 8 050                  | 8 050  | 3 500  | 4 550  | **3 500**, 4 550 sous Radiant Will                                            | code seul                       |
| Ais S3 9603              | `Skill3_1,Skill3` (`Skill3Skip` ×2) | 1 000, 1 000                      | 4 325 ; 8 650                  | 8 650  | 4 325  | 4 325  | **4 325** ; sous Ariel, Lil Rafaga (AoE) 4 325                                | code seul                       |
| Luna S1 10301            | `Skill1,Skill1_2`                   | 1 000, 300 additionnel            | 3 625 ; 4 712                  | 4 712  | 3 625  | 1 087  | **3 625**, 4 712 sous Barrière                                                | non tranché : event non extrait |

Deux règles candidates de la liste du lot se confondent ici. « Clip du trigger retenu » vaut le clip 0 sans condition et le clip 1 avec, pour les variantes ; le clip 0 seul, pour les suites (l'index 1 n'y est jamais RETENU, il est enchaîné). « Enchaînement » vaut la somme des deux clips en deux cascades, pour les suites seulement : c'est la valeur du site quand les deux clips tombent dans une même ligne. Une cascade unique sur les deux clips (le scan qui verrait les deux) donne la même valeur à 1 point près (Parti 12 530 contre 12 529 au § 4) : aucune capture ne départagera ces deux-là, et le client ne permet pas la seconde. La règle « fondu » (§ 1.3) donne `2 × clip 0` sur les suites.

Ce que la règle change au site : Ame S1 ÷ 3 ; les deux lignes de Francesca S3, Parti S2 et Luna S1 deviennent une ligne et une variante ; Sterope (S1, B1, B2) perd sa suite par défaut et la reprend sous condition ; la cellule de Sterope B3 montre la frappe de base au lieu de la suite seule ; Demiurge Astei, Ember et Ais ne changent pas de valeur (leurs variantes sont déjà des lignes séparées, la cellule montre la base), seulement de libellé.

Ais : le clip d'index 0 (`2000096_Skill_3-1`) porte les templets de la chaîne `2000096_Skill_2`, d'où le libellé trompeur de la cellule ; l'index 1 (`Skill_3`) est Lil Rafaga, AoE qui ignore 30 % de la DEF (non modélisé ici, hors périmètre).

### 3.3 Hors des douze : plusieurs triggers, un clip ou aucun au site

- **Vera S1 201** (`Skill1,Skill1_2`) : `Skill1` mène à `Battle_Approach` sans event ; aucun buff de second trigger. Chaîne irrésolue au site (templets `2000002_Skill_1_3` à `_1_5` absents de la table), facteur de repli. Le seul skill où une transition automatique semble jouer : non tranché, sans enjeu de somme.
- **Ame S3 6503** (`Skill3,Skill3_1,Skill3_2`, skip ×3) : `Skill3` n'existe pas dans `AC_2000065`, le S3 ne part que sous A ou B (§ 1.1). Pas de clips au site : les templets des clips (`2000065_Skill_3_1`, `_3_2_A`, `_3_2_B`) sont rattachés au skill 6505, et ses lignes `2000065_SKIP_A` (1 000) et `_B` (1 200) sont deux variantes en repli. La cellule montre A.
- **Poolside Regina S2 8502** (`Skill2,Skill2_2`) : suite additionnelle (cible boss, ou sans buff). Ses templets (`2000085_Skill_2_2_1`, `_2_2`) sont rattachés à 8505/8506 et ne portent pas `IsAdditiveAttack` ; `clips.ts` (l.141) écarte donc le clip, et la suite n'est jamais comptée.
- **Gnosis Dahlia S1 9001** (`Skill1,Skill1_1`) : variante tirée (`BT_SECOND_TRIGGER`, 15 à 70 %). Le clip renforcé `2000090_Skill_1-1` porte des templets rattachés au skill 9002 : écarté de même, la variante n'existe pas au site.

Ces rattachements de templets à un autre skill relèvent de R15 (les clips font foi, pas `SkillID`) : le correctif de la règle doit les accepter quand l'index du skill mène au clip.

## 4. Mesures demandées

Les variantes sont tranchées par le code ; Francesca est mesurée. Restent deux questions ouvertes, une mesure chacune.

- **Q1.** La suite additionnelle d'un skill non mesuré se comporte-t-elle comme celle de Francesca : l'event est-il dans le clip, la condition est-elle lue au moment de l'event, le clip additionnel est-il scanné seul (pas de fondu) ? Sterope S1 est le cas de la liste du lot, et sa condition porte sur le lanceur, pas sur la cible.
- **Q2.** Un burst à deux triggers (`Burst1,Skill1_2`) enchaîne-t-il la suite ? Francesca ne le dit pas (un trigger, templets additionnels dans le clip).

Parti S2 et Luna S1 posent Q1 à leur tour (présence de l'event dans leur clip). Une ré-extraction qui garde les `EventAdditiveAttack` (§ 5.1) y répond sans jouer ; M3 et M4 ne servent que si elle ne se fait pas.

**Conditions communes.** Cible : « Securing Parts (1) » (Path to Nationhood, normal hard), Scrap Metal Grid (`ti` `210102:4143042`), le stage déjà joué par Sevih avec Sterope dans l'équipe (`gnosisbeth-scrapmetal-effbuff.json`). Le lien porte une fiche de RÉFÉRENCE (niveau 120, transcendance 6, skills 5/5/5, ATK 3 000, DC 200 %) : remplacer ATK, DC et pénétration par la fiche réelle, le calculateur affiche alors la règle actuelle du site (la somme). Les valeurs ci-dessous sont celles de la fiche de référence, avec codex, guilde et quirks du compte (ceux des fixtures de Francesca). Une capture tranche seule par le RAPPORT entre les nombres : la suite pèse 30 % de la frappe de base en deux cascades, 100 % sous « fondu », 0 sans suite. Le critique est commun à tout le lancer.

**M1 — Sterope S1 avec un buff (Q1).** Combat dédié. Tour 1 : S3 de Sterope (DEF et Effectiveness de l'équipe, des buffs du groupe 9998). Tour suivant, buff actif : S1, la PREMIÈRE du combat (Divine Retribution, posée par les hits additionnels, monte les dégâts des lancers suivants). Pas d'état skip sur ce skill. Lire chaque nombre : 3 hits de base (`2000057_Skill_1_1` à `_1_3`), puis 6 de suite (`_1_4`, `_1_5` ×4, `_1_6`), puis l'éventuel nombre de compensation en fin de skill.

```text
https://outerpedia.com/fr/damage-calculator?z=N4IghiBcIEwAwLgVgOwgDQgB5QGyYGspQBlARiiUxJkuoGZKBfTAN2PABcjp7EMQAYwBOAS06jBYADYB9ACYBbAOZRYCECxAS1MMnH0xIAFjLG+x2kyA
```

| Règle                                            | Normal | Critique | Ce qu'on voit                                                             |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------- |
| pas de suite (event absent, ou condition fausse) | 4 121  | 6 804    | 3 nombres                                                                 |
| deux cascades (règle proposée, site actuel)      | 5 357  | 8 845    | 3 + 6 nombres, les 6 ≈ 30 % des 3                                         |
| fondu                                            | 8 242  | 13 608   | 3 + 6 nombres + un nombre non critique en fin de skill, total ≈ 2 × les 3 |

Témoin facultatif dans un autre combat : S1 sans aucun buff sur Sterope, 3 nombres attendus.

**M2 — Sterope burst 1 du S1 avec un buff (Q2).** Autre combat, mêmes conditions (S3, puis le burst 1 en premier lancer offensif, AP disponible) ; même lien, ligne `S1b1` du calculateur. Mêmes nombres à lire.

| Règle         | Normal | Critique |
| ------------- | ------ | -------- |
| pas de suite  | 4 523  | 7 206    |
| deux cascades | 5 880  | 9 368    |
| fondu         | 9 046  | 14 412   |

Le burst 3 (`Burst3,Skill1_3`) suit M2 par analogie ; une capture de plus seulement si M2 surprend.

**Résultat de M1 et M2 (Sevih, 18/10/2026).** Sans buff sur Sterope, le S1 fait 3 hits. Avec un buff, il fait 3 hits, puis Divine Retribution part et ajoute 6 hits (3 + 6) ; aucun nombre de compensation en fin de skill n'a été relevé. Les bursts suivent la même règle : la suite ne dépend que de la condition (un buff sur Sterope), pas du burst. Q1 et Q2 sont tranchées pour Sterope : l'event est dans le clip, la condition est lue sur le lanceur, et la suite tombe en nombres séparés, donc pas de fondu ; la règle « deux cascades » est retenue. Le rapport des nombres (30 %) n'a pas été mesuré : les hits sont trop rapides à compter.

**M3, M4 (facultatives, sans ré-extraction).** Parti S2 sur une cible Brûlée (S1 de Parti d'abord, qui brûle au tirage) : 9 638 sans suite, 12 529 en deux cascades, 19 276 sous fondu (critique 15 191, 19 748, 30 382). Luna S1 sous Barrière (S2 de Luna d'abord) : 2 404, 3 125, 4 808 (critique 4 349, 5 653, 8 698). Même cible, liens :

```text
Parti : https://outerpedia.com/fr/damage-calculator?z=N4IghiBcIEwAwLgZhiANCAHlAbBg1lKAMoCMUArBsapFSMUpQL4YBuR4ALodEouhABjAE4BLLmKFgANgH0AJgFsA5lFgIQrEJPUxScAzEgAWUif4nUzIA
Luna  : https://outerpedia.com/fr/damage-calculator?z=N4IghiBcIEwAwIIxwMwgDQgB5QGyYGspQBlRKAVkxJkurUgoF9MA3Y8AFyOhQTgwgAxgCcAlpzFCwAGwD6AEwC2AcyiwEIFiEnqYyZDEgAWRMb7HaTIA
```

**Contrôle facultatif d'Ame S1** (tranché par le code ; le site le surestime ×3, une capture coûte peu) : 2 536 normal, 3 903 critique sous la règle, contre 7 608 et 11 709 au site, sous A, sous B ou sans buff.

```text
https://outerpedia.com/fr/damage-calculator?z=N4IghiBcIEwAwLgNgKwgDQgB5SZg1lKAMoCMUKmxMFVAzBQL6YBuR4ALodHYhiAGMATgEsOIgWAA2AfQAmAWwDmUWAhDMQ41TFJw9MSABZSR3kZqMgA
```

## 5. Correctif proposé (non codé)

> **Codé par F29 le 19/10/2026** (commit `fix(damage): clips joues par variante d index, suite additionnelle conditionnelle, une ligne par variante (R14, R16, F29)`). Décisions du § 5.4 prises telles que recommandées : suite comptée par défaut quand le clip de base pose lui-même la condition (dérivée des tables, Francesca seule, gardée au build), déclarée sinon (`cs`) ; `bestSkill` compte la suite ; clés de slot des fixtures = `#<clé de variante>` (`francesca-s3.json` → `S3#base-skip`, `noa-rhona.json` → `S1#base`). Le nom du champ est `DamageSkill.variants`. Le reste de ce § est l'état d'avant le lot.

> **Complété par F30 le 20/10/2026 : le clip de base étranger à la jointure.** F29 avait gardé à l'index 0 la règle d'avant (un clip sans aucun templet que `SkillID` rattache au skill est écarté), ce qui laissait 16 bursts et skills en repli § 12.4. Le client tranche (1.4.19, `apk/dumped/src/`) : `UseSkill` pose `UsingSkill = SkillManager.GetCurrentSkill()` (`CCharacterBattle.cs` l.2694), le burst lui-même sous burst (`CSkillManager.GetCurrentSkill` l.357, le niveau du burst est celui du skill d'entrée, l.82-89, et son facteur `SkillLevelTemplet.DamageFactor`, `CSkill.cs` l.123) ; `GetUseTriggerName` (l.5158) lit l'index 0 de SON `TriggerName` (`CSkill.cs` l.95), sans suffixe ni table de burst ; un `BT_SECOND_TRIGGER` à `CallerSkillType` SKT_FIRST (Demiurge Astei, Gnosis Dahlia) n'y passe pas `CBuff.CheckAvailable` (l.526, `ReservedSkillType` du lanceur), et un index 1 lu sur une liste d'un seul trigger lèverait. `CFormula.CalcDamage` scanne le clip courant (l.286-322) et chaque `EventAttackStart` frappe avec SON templet (`CCharacter.EventAttackStart` l.1363-1381 ; `fHitRotation`, l.1369, n'est qu'une rotation, et ni le scan ni le rattrapage, l.332-341, ne distinguent un burst). La jointure `SkillID` n'est lue que par `GetDamageTempletBySkillID` (`CTempletManager.cs` l.2978), dans `SkillSimulation` (l.2910, mode simulateur seul, l.2882). Règle : le clip de l'index 0 appartient au skill dès qu'il porte un templet de skill (pas seulement des communs) ; quand il ne porte AUCUN templet de la jointure, celle-ci est fausse au combat et les hits du skill deviennent les templets de ses clips (`clipHitTemplets` de `resolveSkillClips`, appliqué par `characters.ts`), sans repli fantôme pour la chaîne de la jointure. Les 16 : 1210, 3019-3021, 4819-4821, 5221, 5919-5920, 9019-9021, 9319-9320, 10721 ; deux familles changent de valeur, Demiurge Astei B1/B2 (1 000 → 1 300 ‰, les templets de la variante renforcée du S1) et Gnosis Dahlia B1-B3 (680 comblé à 1 000 → 1 200 ‰, idem) ; les douze autres gardent 1 000 ‰ (tableau dans l'entrée DONE de F30). La fixture `hdianne-meteos.json` (S2b1, 6 356) tombe juste des deux façons : 5 × 200 ‰ du templet du S2 et 4 × 250 ‰ de celui du S1 font la même cascade. Sous F29, elle rougissait parce que la chaîne de la jointure gardait son repli à côté de la variante : deux lignes, plus de clé `S2b1`.

> **Complété par A76 le 21/10/2026 : le clip de base propre.** Même maladie quand le clip de l'index 0 JOUE la jointure : une chaîne que `SkillID` rattache au skill sans qu'aucun de ses clips (base, autres index, skip, suite) ne la joue n'existe qu'au simulateur, et gardait un repli § 12.4 à côté des variantes (cellule juste, une ligne de tooltip en trop). Règle : clip de base présent, aucune chaîne irrésolue → ces chaînes sortent des hits (`unplayedChains` de `resolveSkillClips`, appliqué par `characters.ts`). 13 skills : 1205, 1206, 1209 (Valentine), 2201 (Noa S1, chaîne `_Skill_1_UP`), 4021 (Mero B3), 6501, 6505 (Ame), 7601 (Bryn S1), 8505, 8506 (Regina), 9419-9421 (Ember B1-B3). Le S3 d'Ame (6503) n'a pas de clip d'index 0 : ses lignes `2000065_SKIP_A`/`_B` restent son état SKIP en repli. La fixture `noa-rhona.json` reprend la clé `S1` (son `S1#base` ne venait que de la ligne fantôme), valeurs inchangées.

> **Complété par A81 le 25/10/2026 : un clip sert plusieurs skills.** Le clip de base propre d'un skill peut jouer un templet que `SkillID` rattache à d'AUTRES skills seulement : `2000012_Skill_6` (Valentine 1206) joue `2000012_Skill_5_1` (300 ‰, jointure 1205/1209) avant `_5_2` (100 × 7). Le total était juste (le calcul lit les events du clip), les lignes de détail le taisaient. Règle : clip de base présent, aucune chaîne irrésolue → ces templets entrent dans les hits (`sharedTemplets` de `resolveSkillClips`, appliqué par `characters.ts`) ; un templet commun (sans `SkillID`) n'y entre pas. 11 skills, totaux et états identiques : 1019-1021, 1206, 6201, 6821, 8502, 8519-8521, 9001. Un skill SANS jointure (`hitsUnresolved` : bursts, backups, fusionnés) reste hors de la règle — 143 d'entre eux ont un clip d'index 0 propre, lot à part ; parmi eux les bursts 6519-6521 d'Ame, dont le clip `2000065_Skill_1_Burst` joue `2000065_Skill_1_5_B` (1 100 ‰).

### 5.1 Données

- FAIT (B64, 19/10/2026) : `datagen/damage/extract-anim-events.py` garde les `EventAdditiveAttack` des clips du controller, clé `additive` par personnage : `{ "<clipName>": [{ "time": <s, 3 décimales>, "after": <EventAttackStart du clip strictement avant> }] }`, absente quand aucun clip n'en porte (`CharAnimEntry.additive` de `clips.ts`, pas encore lu). L'extraction tranche : cinq personnages seulement, un event chacun, toujours dans le clip de l'INDEX 0 et APRÈS tous ses `EventAttackStart` — Francesca S2 (1502, `2000015_Skill_2_1`, 1,533 s, après 2 sur 2), Parti S2 (3202, `2000032_Skill_2_1`, 1,833 s, 2 sur 2), Sterope S1 (5701, `2000057_Skill_1`, 1,667 s, 3 sur 3), ses bursts 1 et 2 (5719, 5720, `2000057_Skill_1_Upgrade`, 4,065 s, 3 sur 3) et son burst 3 (5721, `2000057_Skill_7`, 3,903 s, 2 sur 2), Poolside Regina S2 (8502, `2000085_Skill_2`, 3,567 s, 4 sur 4), Luna S1 (10301, `2000103_Skill_1`, 1,733 s, 3 sur 3). Absence constatée : les bursts de Luna (`2000103_Skill_1_Burst_1`, cinq `EventAttackStart`, base et suite dans le même clip, sans condition), celui de Kanon et tout autre clip du roster. Chaque suite est donc demandée une fois tous les hits du clip de base posés ; le risque de fondu du § 1.3 reste entier pour le premier hit du clip additionnel. En option, toujours à faire : les durées des transitions des triggers d'index 1, pour juger ce risque sans jouer.
- `datagen/damage/clips.ts`, `resolveSkillClips` : ne plus parcourir `TriggerName` puis `TriggerNameSkip` en une seule séquence. Pour chaque index i : le clip de `TriggerName[i]` et celui de `TriggerNameSkip[i]` s'il existe. Le kit du perso (types et `CallerSkillType` des buffs de ses skills) classe l'index 1 : variante sous `BT_SECOND_TRIGGER` (avec le tirage et la condition), suite sous `BT_ADDITIVE_ATTACK_ON_EVENT` (avec ses buffIds) ; Ame lit A et B. Un clip atteint par un index du skill lui appartient même si ses templets sont rattachés à un autre skill (Regina, Dahlia, Ame S3 ; cohérent avec R15). Les deux types sur un même skill : `clipsUnresolvedChains`, jamais deviné.

### 5.2 Forme de `DamageSkill.clips`

Des ALTERNATIVES de séquences, pas une séquence : `clips` cède la place à des variantes, chacune une ligne du rapport.

```ts
interface DamageClipVariant {
  /** 'base' (index 0), 'second', 'third', avec suffixe '-skip' pour l'état passé. */
  key: string;
  trigger: string;
  /** Absent pour la base. */
  gate?: { type: 'BT_SECOND_TRIGGER' | 'BT_2000065_A' | 'BT_2000065_B'; buffIds: string[] };
  /** Le clip joué (une cascade). */
  clip: DamageSkillClip;
  /** Suite par EventAdditiveAttack : jouée si un des buffs passe, sa propre cascade. */
  additive?: { clip: DamageSkillClip; buffIds: string[] };
}
```

La forme change dans `characters.json` du calculateur ; le contrat solver ne change pas de forme.

### 5.3 Moteur, calculateur, solver (R16 avec)

- `src/lib/damage/report.ts` : `attachChainClips` cède la place à des états PAR VARIANTE. Un état = la cascade de son clip, plus celle de la suite si sa condition est déclarée remplie ; tous les hits du clip forment sa ligne, quelle que soit leur chaîne d'id (R16 : `CFormula.CalcDamage` fait une seule cascade de tous les `EventAttackStart` du clip). Les chaînes deviennent un détail (tooltip), plus des lignes. `stateTotalFactor` rend la somme des cascades de la variante. Le repli § 12.4 reste pour les chaînes sans clip.
- `ResultTable.tsx:166` : la cellule montre la variante de base (avec ou sans suite selon sa condition), le tooltip les autres variantes au lieu des chaînes. La condition de la suite passe par `cs` (`metConditions`) avec le buffId du `BT_ADDITIVE_ATTACK_ON_EVENT`, comme les conditions d'état.
- Les 16 cellules de R16 sous la règle (scénario de la revue, cible Eau) : fusion d'un clip à plusieurs chaînes pour K S3 (2 250 → 3 000), Naru Kang S1 (1 890 → 2 520), Demiurge Drakhan S1 (2 → 9), Luna B1 à B3 (3 622 → 4 712 : un seul clip porte base et suite, sans condition, comme Francesca), Rin B1 et B2 (1 860 → 6 201, 2 146 → 7 155, une fois les fantômes de C24 partis) ; burst qui ne joue que son trigger pour Ember B1 à B3 (2 800 → 3 640) ; base au lieu de la suite pour Sterope B3 (1 772 → 5 908, 7 680 avec un buff) ; Akari S1 relève de R15 (C24). Demiurge Astei S1, Ember S1 et Ame S3 : la cellule montre déjà la bonne variante de base, l'écart venait de la référence « max » du script.
- `datagen/generators/solver-best-skill.ts` : `skillMaxFactor` prend le max sur les variantes. Avec la suite comptée (meilleur cas, comme les bursts), seul Sterope bouge : S1 2 080 → burst 3 à 2 672. Sans la suite, Sterope passe au burst 3 à 2 055. Luna passe de « S1 burst 1 » à « S1 » à facteur égal (1 885, la base l'emporte à égalité). Ame reste au S3 (3 864, repli SKIP_B) : la correction de son S1 (2 445 → 815) ne touche pas `bestSkill`. Francesca, Parti, Demiurge Astei, Ember et Ais : inchangés. Valeurs seulement.
- `pnpm damage:check` : rien ne bouge numériquement si la suite de Francesca est comptée par défaut (ses deux fixtures du S2 restent exactes, le burst et le S3 n'ont qu'un clip). La clé `S3#2000015_SKIP` de `francesca-s3.json` change si les états passent de la chaîne à la variante : clé à migrer, ou alias.

### 5.4 Décisions pour le lot du correctif, et ce qui part tout de suite

À trancher au lot du correctif, recommandations : la suite par défaut, comptée quand le clip de base pose lui-même la condition (Francesca : saignement par `2000015_Skill_2_1`) et déclarée sinon (Parti, Sterope, Luna, Regina ; la condition « boss » de Regina peut se lire du preset) ; `bestSkill` compte la suite ; les clés de slot des fixtures suivent les variantes.

Livrable tout de suite : la forme par variantes, Ame S1 (500 ‰), les variantes de Demiurge Astei, Ember, Ais et Dahlia, Francesca S2 et S3, les fusions de R16 sur un clip (K, Naru Kang, Demiurge Drakhan, Luna B1-B3, Ember B1-B3, et Rin après C24), la suite déclarée de Parti, Sterope et Luna. Attendent : le statut « vérifié » des suites non mesurées (M1, M2, ou la ré-extraction), et la réponse sur le fondu ailleurs que chez Francesca.

Phrases qui deviendront fausses :

- `damage-formula.md` § 8.1 : « `CharacterSkillTemplet.TriggerName` liste les triggers du skill DANS L'ORDRE (« Skill2,Skill2_2 » = deux clips chez Francesca … `TriggerNameSkip` porte l'état SKIP) » ; l'attribution de la paire de mesures de Francesca à « ses deux clips » sans la frappe additionnelle ; « le moteur (`report.ts`) fait une cascade § 8.2 + § 8.3 par clip — les events d'une AUTRE chaîne présents dans le clip comptent dans son facteur et consomment leur part, chaque chaîne n'affiche que ses hits » (une ligne par variante) ; « la valeur après la virgule n'est PAS un facteur » reste vraie mais devient `fHitRotation`.
- `datagen/damage/clips.ts`, en-tête l.13-16 : « `TriggerName` (et `TriggerNameSkip` pour l'état SKIP) liste les triggers d'animator du skill DANS L'ORDRE (« Skill2,Skill2_2 » = deux clips successifs chez Francesca) » ; l.8-9, le S2 de Francesca « joué en deux clips » sans sa condition ; l.53, `clips` « dans l'ordre des triggers (base puis skip) » ; la boucle l.118 elle-même.
- `datagen/damage/extract-anim-events.py`, en-tête : la même phrase sur `TriggerName` (« deux clips successifs ») et le param « non élucidé ».
- `src/lib/damage/report.ts` : les commentaires de `ReportState.clips` (« Clips jouant cette chaîne »), d'`attachChainClips` et du chemin résolu de `buildSkillReport` (« seuls les hits de LA chaîne alimentent sa ligne »).
