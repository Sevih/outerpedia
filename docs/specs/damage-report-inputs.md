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

| Bloc                 | Contenu                                                                                                                                                                                                                                    | Tables (cf. mapping)                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identité perso**   | ID, élément, classe, étoiles de base                                                                                                                                                                                                       | `CharacterTemplet`                                                                                                                                                         |
| **Stats de base**    | 8 paires Min/Max + palier max (mod post-100)                                                                                                                                                                                               | `CharacterTemplet`, `CharacterMaxLevelTemplet`                                                                                                                             |
| **Croissance**       | évolution (lignes cumulatives), transcendance (taux/étoile), archive = **Codex** (taux/niveau), éveil = **Quirks/Gift** (nœuds → stat/buff), monad (nœuds par perso) — glossaire binaire↔UI en formule § 16.1                              | `CharacterEvolutionStatTemplet`, `CharacterTranscendentTemplet`, `CharacterArchiveStatTemplet`+`ArchiveBonusTemplet`, `CharacterAwakening*`, `MonadGateEnchantNodeTemplet` |
| **Kit offensif**     | par skill : `DamageFactor`/`WGReduce`/`BuffID` par niveau ; chaînes de hits (damage templets par convention d'ID, variantes listées)                                                                                                       | `CharacterSkillTemplet`, `CharacterSkillLevelTemplet`, `CharacterDamageTemplet`                                                                                            |
| **Buffs référencés** | pour chaque `BuffID` atteignable depuis le rapport : Type, StatType, ApplyingType, Value, StackCount, CreateRate, niveaux                                                                                                                  | `BuffTemplet` (sous-ensemble atteignable, pas les 10 838 lignes)                                                                                                           |
| **Équipement**       | pièces équipables, groupes d'options main/sub (valeurs), facteurs d'enchant par sous-type, break limit, sets 2P/4P, EE (buff/niveau), artefacts (buff)                                                                                     | `ItemTemplet`, `ItemOptionTemplet`, `ItemEnchantTemplet`, `ItemSpecialOptionTemplet`, `ArtifactTemplet`                                                                    |
| **Cibles PvE**       | stats Min/Max monstres + immunités (`BuffImmune`/`StatBuffImmune`) + kit (pour les passifs défensifs) ; spawns : niveau réel + `SpawnAdvantageRate_*` par contenu                                                                          | `MonsterTemplet`, `MonsterSkill*`, `DungeonTemplet` et tables de contenu                                                                                                   |
| **Config**           | le sous-ensemble GameConfig du § 7 du mapping (déjà en constantes dans `types.ts` — l'extracteur les VÉRIFIE à chaque patch au lieu de les figer)                                                                                          | `GameConfigTemplet`                                                                                                                                                        |
| **Affinité (Trust)** | 5 paliers = 5 buffs passifs permanents PLATS (`BT_STAT`/`OAT_ADD`, self) : +60 ATK, +40 DEF, +300 HP par palier — canal `buffValue`, donc ABSENTS de la fiche affichée et multipliés par `buffRate` en combat (vérifié binaire 27/07/2026) | `TrustBuffTemplet` → `BuffTemplet` (ids `trust_level_*`)                                                                                                                   |

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

## 5. Décisions produit à trancher (avant d'écrire le premier extracteur)

1. **Cible du rapport** — presets monstres par contenu (niveau réel + spawn
   advantage pré-résolus) et/ou perso ennemi construit (PvP) ?
   _Reco : structurer pour les deux, livrer monstres d'abord (PvE = pas de
   branche esquive/pénalités, rapport plus simple à valider in-game)._
2. **Saisie des buffs de combat** — générique (« +50 % ATK, 2 stacks ») ou
   dérivée des kits (cocher les skills de l'équipe → BuffID réels) ?
   _Reco : le moteur prend du générique ; l'extracteur livre quand même les
   BuffTemplet des kits pour que l'UI puisse proposer les deux._
3. **Granularité temporelle** — hit unique/skill (v1) ou rotation multi-tours
   (DOT qui tickent, cooldowns, escalade PvP) ?
   _Reco : v1 = par skill + DOT « par tick » ; la rotation est une couche au-dessus,
   elle ne change pas les extracteurs._
4. **Variantes de damage templets** (`_Upgrade`, `_A/_B`, `_Burst3`) — la
   convention d'ID liste les candidats, pas la sélection. Curation par perso
   (admin) ou vérification in-game au fil de l'eau ?
   _Reco : l'extracteur livre TOUTES les variantes groupées par skill avec un
   statut « non affecté » ; une table curée (comme les tags) fixe l'affectation._

## 6. Extracteurs qui en découlent (ordre de construction)

Chacun ne lit que les tables de sa ligne § 3.1, sort du brut aux unités des
formules, avec `gameVersion` et le statut ✅/⚠️ hérité du mapping :

1. **`characters`** — identité + stats + croissance + kit + chaînes de hits.
   Débloque : rapport PvE attaquant complet sans équipement.
2. **`equipment`** — pièces, options, enchant, sets, EE, artefacts.
   Débloque : le build complet.
3. **`buffs`** — fermeture transitive des `BuffID` référencés par 1 et 2.
   Débloque : passifs de kit/gear dans les stats, DOT/soins/shields du rapport.
4. **`targets`** — monstres + spawns par contenu (+ immunités).
   Débloque : presets de cible.
5. **`config`** — GameConfig du périmètre, en garde-fou de `types.ts` à chaque
   patch.

La décision § 5.1 ne bloque que l'extracteur 4 ; § 5.4 ne bloque que la partie
« affectation » de l'extracteur 1 (les chaînes de hits sont livrées quoi qu'il
arrive). On peut donc commencer par 1 sans rien trancher d'irréversible.
