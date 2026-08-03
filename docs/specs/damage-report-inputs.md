# Damage calculator — du rapport de dégâts aux besoins en données

> Troisième volet : [damage-formula.md](./damage-formula.md) dit COMMENT le jeu
> calcule, [damage-data-mapping.md](./damage-data-mapping.md) dit OÙ vit chaque
> donnée. Ce document part de l'autre bout : **que doit produire un rapport de
> dégâts**, et on en déduit les entrées — donc le périmètre exact des
> extracteurs. Rien ne s'extrait qui ne serve une ligne du rapport.

## 1. Ce que le rapport produit

Pour un triplet **(attaquant construit, cible, scénario)**, et pour chaque skill
offensif de l'attaquant :

| Sortie                                                    | Formule d'appui                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| Dégâts par hit + total du skill                           | § 8 (facteur du skill × chaîne de hits, rattrapage du dernier hit) |
| Les 3 branches : **normal / critique / esquivé**          | § 7 — on ÉNUMÈRE les branches, on ne tire jamais                   |
| Probabilité exacte de chaque branche                      | § 4 : P = (v+1)/1001 (crit, esquive)                               |
| Espérance de dégâts (pondération des branches)            | dérivée des deux lignes ci-dessus                                  |
| Soin vampirique de l'attaquant, récup on-hit du défenseur | § 8.4                                                              |
| Dégâts de jauge (WG)                                      | § 11 (CalcDamageWG)                                                |
| DOT posés par le skill : dégâts par tick + proba de pose  | § 11 (CalcDamageDOT) + § 5 (CheckResist)                           |
| Soins / shields posés par le skill                        | § 14                                                               |
| Partage de dégâts côté cible (SHARE_DMG)                  | § 11                                                               |

Les tirages n'existent pas dans le rapport : chaque aléa (crit, esquive,
résistance) devient une **branche avec sa probabilité**. C'est pour ça que le
moteur prend des `rolls` injectés.

## 2. La chaîne de calcul (déjà couverte par le moteur)

```text
build attaquant ──► 13 paramètres × stat ──► calcFinalStat ──► couches § 16 ──► stats finales
build cible    ──►        (idem)                                              ──► stats finales
scénario (buffs, contenu, élément) ──► agrégats § 9, taux élémentaire, overrides
                    │
                    ▼
checkDamageRate (par branche) ──► calcDamageCore (par hit) ──► sorties § 1
```

Le moteur (`src/lib/damage/`) couvre tout le bas de la chaîne. Ce qui manque,
c'est **l'amont** : fabriquer les entrées à partir du build + des données du jeu.

## 3. Classification de chaque entrée

Quatre origines. C'est CETTE classification qui borne les extracteurs.

### 3.1 🎮 Donnée du jeu (à extraire — figée par version)

| Bloc                 | Contenu                                                                                                                                                                                                                                                             | Tables (cf. mapping)                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identité perso**   | ID, élément, classe, étoiles de base                                                                                                                                                                                                                                | `CharacterTemplet`                                                                                                                                                         |
| **Stats de base**    | 8 paires Min/Max + palier max (mod post-100)                                                                                                                                                                                                                        | `CharacterTemplet`, `CharacterMaxLevelTemplet`                                                                                                                             |
| **Croissance**       | évolution (lignes cumulatives), transcendance (taux/étoile), archive = **Codex** (taux/niveau), éveil = **Quirks/Gift** (nœuds → stat/buff), monad (nœuds par perso) — glossaire binaire↔UI en formule § 16.1                                                       | `CharacterEvolutionStatTemplet`, `CharacterTranscendentTemplet`, `CharacterArchiveStatTemplet`+`ArchiveBonusTemplet`, `CharacterAwakening*`, `MonadGateEnchantNodeTemplet` |
| **Kit offensif**     | par skill : `DamageFactor`/`WGReduce`/`BuffID` par niveau ; chaînes de hits (damage templets par convention d'ID, variantes listées)                                                                                                                                | `CharacterSkillTemplet`, `CharacterSkillLevelTemplet`, `CharacterDamageTemplet`                                                                                            |
| **Buffs référencés** | pour chaque `BuffID` atteignable depuis le rapport : Type, StatType, ApplyingType, Value, StackCount, CreateRate, niveaux                                                                                                                                           | `BuffTemplet` (sous-ensemble atteignable, pas les 10 838 lignes)                                                                                                           |
| **Équipement**       | pièces équipables, groupes d'options main/sub (valeurs), facteurs d'enchant par sous-type, break limit, sets 2P/4P, EE (buff/niveau), artefacts (buff)                                                                                                              | `ItemTemplet`, `ItemOptionTemplet`, `ItemEnchantTemplet`, `ItemSpecialOptionTemplet`, `ArtifactTemplet`                                                                    |
| **Cibles PvE**       | stats Min/Max monstres + immunités (`BuffImmune`/`StatBuffImmune`) + kit (pour les passifs défensifs) + break/enrage (`RageTemplet`) ; spawns : niveau réel + `SpawnAdvantageRate_*` par contenu — déjà en BRUT dans `encounters.json`, NON ré-extraits (cf. § 6.4) | `MonsterTemplet`, `MonsterSkill*`, `RageTemplet` (spawns : `encounters.json` existant)                                                                                     |
| **Config**           | le sous-ensemble GameConfig du § 7 du mapping (déjà en constantes dans `types.ts` — l'extracteur les VÉRIFIE à chaque patch au lieu de les figer)                                                                                                                   | `GameConfigTemplet`                                                                                                                                                        |
| **Affinité (Trust)** | 5 paliers = 5 buffs passifs permanents PLATS (`BT_STAT`/`OAT_ADD`, self) : +60 ATK, +40 DEF, +300 HP par palier — canal `buffValue`, donc ABSENTS de la fiche affichée et multipliés par `buffRate` en combat (vérifié binaire 27/07/2026)                          | `TrustBuffTemplet` → `BuffTemplet` (ids `trust_level_*`)                                                                                                                   |

### 3.2 🧑 Build utilisateur (saisie, jamais extraite)

Niveau (1-120), évolution, transcendance, niveau de skill, nœuds d'éveil
débloqués, nœuds monad, niveau d'archive (Codex, réglage de COMPTE — 0..11),
palier d'affinité (Trust, 0..5), 6 pièces (item + enchant + main +
subs effectives + break limit + singularité), EE + niveau, artefact + niveau.
→ Les sub-options sont saisies **telles quelles** (les tirages n'existent pas
dans le rapport) ; l'extracteur fournit seulement les bornes/choix possibles.

**⚠️ Décomposition du terme d'archive (Codex)** — vérifié binaire 27/07/2026 :
la fiche affichée en jeu (celle que l'utilisateur SAISIT) inclut déjà le terme
`div1000(base × archiveRate)`, ajouté HORS multiplicateur de buffs
(CalcFinalStat, formule § 3). L'affinité est le cas INVERSE : absente de la
fiche saisie, à AJOUTER au canal buff. L'identité de reconstruction EXACTE
(fiche saisie → stat de combat) et la table complète « quelle couche est dans
la fiche / multipliée par les buffs », avec le glossaire binaire↔UI
(archive=Codex, éveil=Quirks, Trust=Affinité), vivent dans **formule § 16.1** —
les lire là-bas, ne pas les recopier ici.

### 3.3 ⚔️ Scénario de combat (saisie/presets)

Cible (monstre d'un contenu à son niveau de spawn, ou perso construit), contenu
(PvE / PvP / world boss / infiltrate — pour les overrides § 7, pénalités § 17.6,
caps de scène § 12.10), buffs/débuffs actifs des deux côtés avec stacks
(la couche § 9 : DMG_INCREASE, DMG_REDUCE, MARKING, INVINCIBLE…), nombre de
cibles touchées (§ 7 décroissance), cycle de pénalité PvP.

### 3.4 🧮 Calculé (jamais saisi, jamais extrait)

Stats finales (calcFinalStat + § 16), agrégats de buffs (§ 9), taux élémentaire,
branches et probabilités, facteurs d'enchant (float32), espérance.

## 4. Ce dont le rapport n'a PAS besoin (hors périmètre extracteurs)

Textes localisés et icônes (viendront de la couche AFFICHAGE existante au moment
de l'UI — pas des extracteurs damage), animations/timings, IA des monstres,
cooldowns (tant que le rapport est « par skill », pas « par rotation »), CP,
économie, gacha des sub-options (`Normal_i`…), tout templet non listé en § 3.1.

## 5. Décisions produit (statut au 03/08/2026)

1. **Cible du rapport** — ✅ TRANCHÉE DE FAIT par l'UI livrée (26-27/07) :
   presets monstres par contenu (niveau réel + spawn advantage pré-résolus)
   - cible à stats manuelles. Le perso ennemi construit (PvP) n'est pas livré —
     la reco « structurer pour les deux » reste valable pour les extracteurs.
2. **Saisie des buffs de combat** — ✅ TRANCHÉE (Sevih 03/08/2026) : **dérivée
   des kits, en AUTO**. L'UI propose les buffs issus des kits de l'équipe
   (vrais BuffID), FILTRÉS par pertinence dégâts pour l'attaquant courant —
   ex. un buff DEF ne s'affiche pas pour un perso qui scale sur l'ATK (le
   scaling par perso vit déjà dans `damage-scaling.ts`). Comme l'équipe est
   connue, les mécaniques RELATIVES à l'équipe s'incluent aussi — ex. M.Ame
   donne des dégâts bonus à sa team chaque tour ⇒ l'UI expose un compteur de
   stacks pour ce buff. Le générique manuel de l'UI actuelle reste le
   fallback (moteur inchangé : il consomme des agrégats § 9, peu importe leur
   origine).
3. **Granularité temporelle** — ✅ TRANCHÉE (Sevih 03/08/2026) : **par skill,
   aucune notion de rotation**. Le tableau donne les dégâts par hit de chaque
   skill ; si le kit pose des DOT, leurs dégâts PAR TICK s'ajoutent comme
   lignes du même tableau. La rotation multi-tours (cooldowns, escalade PvP)
   est explicitement hors périmètre.
4. **Variantes de damage templets** (`_Upgrade`, `_A/_B`, `_Burst3`) —
   ✅ TRANCHÉE (Sevih 03/08/2026) : **on n'affecte pas UNE variante, on montre
   TOUS les états** — chaque état d'un skill (burst 1/2/3, upgrade…) devient
   une SOUS-LIGNE du rapport sous le skill, avec ses propres résultats.
   Exemple donné : le S2 d'Aer, burstable — b1 dégâts accrus (+ bonus vs
   Earth), b2 dégâts accrus, b3 devient Enhanced Attack + reset du cooldown
   de « Gone Surfing! » : trois sous-lignes aux résultats différents.
   L'extracteur livre donc toutes les variantes groupées par skill ; le
   rattachement variante→état suit la convention d'ID, et une curation
   n'intervient que là où la convention est ambiguë (jamais de devinette).

## 6. Extracteurs qui en découlent (ordre de construction)

Chacun ne lit que les tables de sa ligne § 3.1, sort du brut aux unités des
formules, avec `gameVersion` et le statut ✅/⚠️ hérité du mapping :

1. **`characters`** — identité + stats + croissance + kit + chaînes de hits.
   Débloque : rapport PvE attaquant complet sans équipement.
   ✅ LIVRÉ (03/08/2026) : `pnpm damage:build` →
   `data/generated/damage/characters.json` (persos du roster validé + skills
   avec niveaux et hits, jointure par colonne `SkillID` — cf. mapping § 4) et
   `growth.json` (transcendance, archive/Codex, paliers post-100, éveil,
   monad). Les skills offensifs sans chaîne par cette jointure sont marqués
   `hitsUnresolved` (AnimationEvents, formule § 12.4) — jamais comblés.
2. **`equipment`** — pièces, options, enchant, sets, EE, artefacts.
   Débloque : le build complet.
   ✅ LIVRÉ (03/08/2026) : `data/generated/damage/equipment.json` — pièces
   `ITS_EQUIP_*` (EE filtrés au roster validé), groupes d'options référencés,
   facteurs d'enchant/break limit/singularité bruts, sets (sélection par
   break limit), effets uniques EE lvl 1/10, artefacts. Jointures constatées
   consignées au mapping § 6 (UniqueOptionID par ID de ligne, etc.).
3. **`buffs`** — fermeture transitive des `BuffID` référencés par 1 et 2.
   Débloque : passifs de kit/gear dans les stats, DOT/soins/shields du rapport.
   ✅ LIVRÉ (03/08/2026) : `data/generated/damage/buffs.json` — 5809 buffs
   atteignables (kits, éveil, monad, équipement, artefacts, affinité, et
   cibles depuis l'extracteur 4 : kits de monstres + break), zéro ref morte. `BuffTemplet` n'a AUCUNE colonne de référence vers d'autres
   buffs (vérifié) : la fermeture est directe. Les niveaux d'un `BuffID`
   (ex. options principales d'EE, résolues à `enchant + 1`) sont tous émis.
   Témoins binaires re-vérifiés en test : affinité = +60 ATK / +40 DEF /
   +300 HP plats par palier.
4. **`targets`** — monstres + spawns par contenu (+ immunités).
   Débloque : presets de cible.
   ✅ LIVRÉ (03/08/2026) : `data/generated/damage/targets.json` — 1560 cibles
   (boss des rencontres peuplées non retirées d'`encounters.json` — preuve
   d'intégration, même philosophie que `roster.ts`), 2480 skills de monstre.
   Conception actée ce jour :
   - **Clé de liaison = l'ID de monstre** (`MonsterTemplet.ID`) — déjà la clé
     des presets UI (`${encounterId}:${bossId}`), de `monsters.json` et des
     tables brutes ; aucune clé nouvelle.
   - **Spawns NON ré-extraits** : les contextes (niveau réel, adv ‰, PV de
     boss, paliers) vivent déjà en brut dans `encounters.json` ; la couche
     preset les fournit au moteur comme entrées de SCÉNARIO (§ 3.3), la
     formule partagée `statAt` (src/lib/monster-stats, vérifiée in-game) fait
     l'interpolation. Re-jointer les 11 tables de contenu aurait créé une
     deuxième liste de contenus à curer en concurrence avec l'affichage.
     ✅ `TransLevel` ÉLUCIDÉ au binaire (03/08/2026,
     `CCustomBossData.ChangeNextLevelData`) : c'est le niveau du palier
     SUIVANT de la chaîne de level-up des boss à score (0 = dernier palier ;
     donnée : trans[i] = base[i+1] sur guilde 42/42 et event 252/252) —
     « Trans » = transition, PAS transcendance. Seul `BaseLevel` passe à
     `set_Level` : aucun effet sur les stats, rien à appliquer. Même listing :
     les stats de palier n'utilisent le templet que pour `SpawnAdvantageRate_*`
     (switch ATK/DEF/SPD) et les PV du boss = largeur `MinDamage..MaxDamage`
     (la « barre »), ce qui confirme le calcul d'affichage.
   - **Buffs de palier** : au changement de palier, le jeu applique la
     `BuffList` du templet (`CreateBuff`, vérifié même listing) — les passifs
     de rang (« Pénétration +30 % » Singularity, boss élémentaires de guilde)
     sont de VRAIS buffs. Les `OptionID` des 4 tables de palier (42 refs, 0
     morte) entrent dans la fermeture (`targets.json` → `rankBuffIds`) ; quels
     buffs s'appliquent à quel palier reste porté par les presets
     (`encounters.json`, champ `options`).
   - **Kit SANS chaînes de hits** : la jointure `SkillID` n'existe pas côté
     monstres (`MonsterDamageTemplet` : 0/961) et le rapport ne calcule
     jamais les dégâts de la cible (§ 1) — le kit est extrait pour ses
     `BuffID` (passifs défensifs) et ses types.
   - **Break/enrage** : `RageTemplet` porte les buffs d'état break même sans
     enrage (trigger `NONE`) — `BID_BREAK_1` = −200 ‰ de `DMG_REDUCE`
     pendant le break (l'entrée du conditionnel « vs break »), `BID_BREAK_2/3`
     = Avoid −900 / Buff Resist −100 %. Fermeture buffs étendue aux cibles :
     2843 → 5809 buffs, toujours zéro ref morte (`BuffTemplet` a une colonne
     `ID` de LIGNE et une colonne `BuffID` de clé logique — la fermeture
     résout sur `BuffID`).
5. **`config`** — GameConfig du périmètre, en garde-fou de `types.ts` à chaque
   patch.
   ✅ LIVRÉ (03/08/2026) : `data/generated/damage/config.json` — 12 clés
   (MISSED_DAMAGE_RATE, pénalités PvP § 17.6, CHECK_AVOID_VALUE_1..4,
   MAX_CHARACTER_LEVEL) ; le test d'invariants les compare aux constantes du
   moteur — une divergence après patch = constante à REVOIR, pas à deviner.

Les 5 extracteurs sont livrés (03/08/2026) : `pnpm damage:build` régénère
`data/generated/damage/` en entier, et `datagen/damage/damage-data.test.ts`
verrouille les invariants sur les JSON committés (tourne sans `.gamedata`).
La suite est l'AMONT du moteur : fabriquer les entrées de `src/lib/damage`
depuis ces fichiers + le build saisi (§ 2), puis le harnais de fixtures.
