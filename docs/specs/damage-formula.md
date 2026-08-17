# Formules de dégâts — Outerplane (extraites du binaire)

> **Source de vérité** : `libil2cpp.so` ARM64 de l'APK **installé sur l'émulateur**
> (1.4.14 au 13/08/2026), classe `CFormula`
> (TypeDefIndex 7282) + méthodes satellites de `CCharacterBattle` / `CCharacterData` /
> `CCommonDefine`. Désassemblage ciblé capstone (mapping VA→offset via program headers
> ELF), cibles `bl` résolues par `script.json` d'Il2CppDumper. Les listings annotés sont
> dans [damage-formula-asm/](./damage-formula-asm/), régénérés À CHAQUE PATCH par
> `pnpm datagen:dump` (qui ré-extrait le binaire de l'APK installé sur l'émulateur,
> puis enchaîne sur [disasm.py](../../datagen/extract/disasm.py) — manifeste des
> méthodes résolues par NOM). Toute méthode que ce document se met à citer doit
> être AJOUTÉE au manifeste `M` de ce script, sinon son listing se fige.
>
> **Règle de rédaction** : chaque pseudo-code ci-dessous est la traduction fidèle de
> l'asm (ordre des opérations, arithmétique entière vs flottante, arrondis, clamps).
> Aucune formule n'est devinée ; toute zone non désassemblée est signalée en § 12.
>
> **Écart 1.4.9 → 1.4.14 (13/08/2026)** : sur 88 listings, 72 sont inchangés au
> comportement près et 3 ont bougé. Les trois sont désassemblés et rédigés
> (§ 8.5, § 9.2, § 14.5), et `BUFF_TYPE` a été **renuméroté** (§ 2 — les identifiants
> de ce document sont à jour, ne jamais reporter un numéro d'une version à l'autre).
> Le **moteur TS n'implémente aucun des trois** ; § 12.16 liste ce qui reste ouvert.
>
> Les **RVA** citées ici sont celles de 1.4.14 : les 44 adresses de 1.4.9 ont été
> réécrites le 13/08/2026 en réidentifiant chaque méthode par son nom, et un balayage
> final vérifie que toute adresse du document existe bien dans la table des méthodes
> du binaire courant. Elles bougent à CHAQUE patch — l'autorité reste le nom, et
> l'en-tête du listing correspondant dans [damage-formula-asm/](./damage-formula-asm/).

## 1. Conventions numériques

- **Tout est entier et en pour-mille (‰)** sauf mention contraire : `1000` = 100 %.
- `div1000(x)` : division **entière signée tronquée vers zéro** par 1000. Le binaire
  l'implémente par multiplication magique (`0x20C49BA5E353F7CF`, `smulh` + `asr #7`
  - correction de signe) — sémantique exacte du `/` C sur entiers signés 64 bits.
- `div1e6(x)` : idem par 1 000 000 (magique `0x431BDE82D7B634DB`, shift 18) ou `sdiv`.
- Les produits intermédiaires sont calculés en **64 bits** (`smull`/`mul` 64) : pas
  d'overflow 32 bits intermédiaire. Le résultat final est repris en 32 bits.
- Deux fonctions utilisent du **float32** (voir `CheckResist` § 5 et HitRecovery § 8.4) ;
  `FloorToInt` = `Mathf.FloorToInt` (floor puis cast, `int.MinValue` si +∞ — quirk Unity
  jamais atteint en pratique).
- `CCommonDefine.MulPermille(v, p)` = `div1000(v × p)` (RVA 0x2A00D74).
- `CCommonDefine.ApplyRate(v, r)` = `div1000(v × (1000 + r))` (RVA 0x29FA264).

## 2. Enums utiles (dump.cs)

- `CHARACTER_ELEMENT_TYPE` : 0 Terre, 1 Eau, 2 Feu, 3 Lumière, 4 Ténèbres.
- `ELEMENT_SUPERIORITY_TYPE` : 0 ATTACKER_WIN, 1 EQUAL, 2 ATTACKER_LOSE.
- `DAMAGE_RATE_TYPE` (résultat d'un hit, `CSkillRecord.DamageRateType`) :
  0 NONE, 1 NORMAL, 2 CRITICAL, 3 MISSED, 4 INVINCIBLE.
- `STAT_TYPE` : 1 HP, 2 WG, 3 SPEED, 4 ATK, 5 DEF, 6 DMG_REDUCE_RATE, 7 CRITICAL_RATE,
  8 CRITICAL_DMG_RATE, 9 PIERCE_POWER, 10 PIERCE_POWER_RATE, 11 VAMPIRIC,
  12 HIT_HP_RECOVERY, 13 ACCURACY, 14 AVOID, 15 BUFF_CHANCE, 16 BUFF_RESIST,
  22 COUNTER_RATE, 23 AVOID_ADD_CAP, 24 AVOID_SUBTRACT_CAP, 25 DMG_BOOST,
  26 E_CRI_DMG_REDUCE.
- `BUFF_TYPE` (extraits pertinents pour les dégâts, **valeurs 1.4.14**) :
  3 INVINCIBLE, 5 MARKING, 90–113 famille `BT_DMG_*` (voir § 9), 115 DMG_REDUCE,
  118 DMG_REDUCE_MY_TEAM_INCREASE, 119–121 DMG_REDUCE_FINAL*, 141 SHARE_DMG,
  142 SHARE_DMG_MULTI, 154 STEALTHED.

> ⚠ **`BUFF_TYPE` a été RENUMÉROTÉ en 1.4.14.** L'insertion de
> `BT_REVERSE_HEAL_BASED_{CASTER,TARGET}_ABLE_KILL` en 18/19 (§ 14.5), puis d'autres
> membres plus loin, décale **tout ce qui suit** : le cap reverse heal passe de 18 à
> 20, les shields de 19/20 à 21/22, `DMG_REDUCE` de 110 à 115, `STEALTHED` de 149 à
> 154, les `IMMEDIATELY_*` de 60–65 à 63–69… Les 29 identifiants numériques cités
> dans ce document ont été réécrits le 13/08/2026 en résolvant chaque **nom** dans
> l'énumération 1.4.14 — ne jamais reporter un numéro d'une version à l'autre.
>
> Le moteur TS et les tables générées ne sont **pas** touchés : ils clés sur le nom
> (`Type: 'BT_DMG_REDUCE'`), jamais sur l'entier. Deux commentaires portent encore
> les anciens numéros — voir § 12.16.

Les stats finales d'un personnage vivent dans `CCharacterData.StatDict[STAT_TYPE]`
(recalcul lazy par `CCharacterData.CalcStat`) ; chaque getter (`get_Def`,
`get_CriticalRate`…) lit simplement cette entrée. Le recalcul par stat passe par
`CFormula.CalcFinalStat` (§ 3).

## 3. CalcFinalStat — RVA 0x2CB1C6C

Signature :
`CalcFinalStat(base, spawnAdvRate, evo, awak, awakRate, monad, monadRate, transRate, archiveRate, itemVal, itemRate, buffVal, buffRate)`

```text
flat  = base + evo + awak + monad                                  // valeurs plates
rate  = 1000 + spawnAdvRate + awakRate + monadRate + transRate + itemRate
sub   = div1000(flat × rate) + itemVal + buffVal
total = div1000(sub × (1000 + buffRate)) + div1000(base × archiveRate)
return max(total, 0)                                                // bic asr#31
```

Points fermes :

- Les **taux** (éveil, monad, transcendance, items) s'additionnent en un seul
  multiplicateur commun appliqué au _flat_ (base+évo+éveil+monad plats).
- `itemVal` et `buffVal` (plats) s'ajoutent **après** ce multiplicateur, puis le
  `buffRate` multiplie **le tout** (y compris les plats item/buff).
- Le bonus d'archive s'applique **sur la stat de base seule** et s'ajoute à la fin.
- Clamp final à ≥ 0. Chaque division tronque vers zéro.

### 3.1 CalcStat — RVA 0x2CB1BD4 (stat de base par niveau)

En amont : le `base` fourni à CalcFinalStat sort de
`CFormula.CalcStat(min, max, level)` (division magique `0xA57EB50295FAD40B`,
shift 6 = ÷99 signé tronqué vers zéro, vérifiée sur 200 000 triplets) :

```text
CalcStat(min, max, level) = min + trunc((level − 1) × (max − min) / 99)
```

Interpolation **linéaire** entre la stat niveau 1 (`min`) et la stat
niveau 100 (`max`), en 99 pas ; `level = 100` redonne exactement `max`.
Aucune courbe, aucun palier.

### 3.2 SetBaseValue — RVA 0x29FA03C (niveau > 100 et addRate)

L'appelant réel de CalcStat côté personnages est
`CStatValue.SetBaseValue(min, max, level, spawnAdvRate = 0, addRate = 0, owner)`
(`CStatValue_SetBaseValue.asm`) — et il ajoute deux couches :

```text
si level ≥ 101 ET owner.Type == CT_PC :
  base = min + trunc((level−1) × (max−min) / 99)              // = CalcStat, inliné
       + trunc((level−100) × (max−min) × mod / 99000)         // magique 0x54BBC10777CC3339, shift 15
sinon :
  base = CalcStat(min, max, level)
si addRate ≥ 1 : base = div1000(base × (1000 + addRate))      // multiplicateur direct sur la base
m_nBaseValue = base
m_nSpawnAdvantageRate = spawnAdvRate                          // conservé pour CalcFinalStat (§ 3)
```

- `mod` = `CCharacterData.LevelUpStatModifierAfter100` (champ 0x88), chargé depuis
  `CharacterMaxLevelTemplet.LevelUpStatModifierAfter100`. Données 1.4.9 : palier 1
  (→105) = **200 ‰**, palier 2 (→110) = **400 ‰**, palier 3 (→120) = **700 ‰**.
  Un seul `mod` (celui du palier courant) s'applique à TOUS les niveaux au-delà de
  100 : au palier 3, chaque niveau post-100 rapporte 1,7× le pas linéaire 1→100.
- La branche post-100 est réservée aux personnages (`Type == CT_PC`) ; les monstres
  restent sur CalcStat pur quel que soit le niveau.
- `addRate` : multiplicateur appliqué directement à la base — posé UNIQUEMENT
  par le scaling d'overgrade du boss de guild raid (§ 12.13, RÉSOLU), 0 partout
  ailleurs.
- `CCustomBossStatValue.SetBaseValue` (0x29FC7C4) : pour ST_HP, `base = max − min` ;
  pour les autres stats, CalcStat normal.

## 4. Probabilités — CheckProbability* (0x2CB1C0C / 0x2CB1C54 / 0x2CB1C60)

```text
CheckProbability(value, max, isAuto):
  if value < 1: return false
  roll = isAuto ? UnityEngine.Random.Range(0, max+1)   // uniforme [0, max]
                : GetBattleRandomRange(0, max)         // idem [0, max] inclus
  return roll <= value
```

- `CheckProbabilityPercent(v, isAuto)` = `CheckProbability(v, 100, isAuto)`.
- `CheckProbabilityPermille(v, isAuto)` = `CheckProbability(v, 1000, isAuto)`.
- `GetBattleRandomRange(min, max)` (0x2CB1B04) : en PvP temps réel, RNG synchronisé du
  match (`CPvpRealtimeMatch.GetRandomRange`) ; sinon `Random.Range(min, max+1)` →
  **entier uniforme inclusif** `[min, max]`.
- Conséquence : P(succès) = `(value+1)/(max+1)` pour `1 ≤ value ≤ max` (ex. 50 ‰ affiché
  → 51/1001 réels), 0 % si `value < 1`, 100 % si `value ≥ max`.

## 5. CheckResist — RVA 0x2CB21AC (résistance aux effets)

Entrées : `chance` = BUFF_CHANCE de l'attaquant (‰), `resist` = BUFF_RESIST du défenseur (‰).

```text
diff = resist - chance
if diff < 0: return false                       // jamais de résistance
d = (diff == 0) ? 1 : diff                      // csinc
p32 = 1000.0f / (100.0f / (float)d + 1.0f)      // arithmétique float32
p = FloorToInt(p32)
if p < 1: return false
roll = GetBattleRandomRange(0, 1000)
return roll <= p                                // résisté
```

Formule non linéaire : P(résist) ≈ `floor(1000·d/(d+100)) / 1001`-ish. Ex. diff=100 →
p=500 → ~50 % ; diff=0 → p=9 → ~1 % ; diff=300 → p=750. L'arithmétique float32 crée
de vrais artefacts d'arrondi : diff=900 donne 899 (et non 900) — valeurs vérifiées
contre une référence float32 exacte (rationnels) sur diff ∈ [0, 20000], ancrées par
somme de contrôle dans `src/lib/damage/formula.test.ts`.

## 6. Élément — GetElementSuperiority (0x2CB2A88) & GetElementeryDamageRate (0x2CB2984)

```text
GetElementSuperiority(att, def):                 // enum § 2
  if att ≤ 2 && def ≤ 2:                          // triangle Terre/Eau/Feu
    if (att+1) % 3 == def: return ATTACKER_WIN    // Terre>Eau, Eau>Feu, Feu>Terre
    if (def+1) % 3 == att: return ATTACKER_LOSE
    return EQUAL
  // au moins un Lumière/Ténèbres :
  if att < 3 or def < 3: return EQUAL             // L/T vs élément de base = neutre
  return (att == def) ? EQUAL : ATTACKER_WIN      // Lumière ↔ Ténèbres : les DEUX gagnent
```

```text
GetElementeryDamageRate(Attacker, Defender):      // retourne un taux ‰
  if Attacker.FindBuffElementSuperiority():       // buff BT_DMG_ELEMENT_SUPERIORITY (94)
    return 1200 + Attacker.FindBuffElementDamageRate()
  if Attacker.FindBuffElementInferiority():       // buff BT_DMG_ELEMENT_INFERIORITY (104)
    return 800
  sup = triangle sur Data.Element des deux persos (même logique que ci-dessus)
  ATTACKER_WIN  → 1200 + Attacker.FindBuffElementDamageRate()
  ATTACKER_LOSE → 800
  EQUAL         → 1000
```

- `FindBuffElementDamageRate` (0x28287F8) = **somme** des `Value` des buffs
  BT_DMG_ELEMENT_ENCHANT (95) disponibles. Ne s'applique **que** quand l'attaquant a
  l'avantage (réel ou forcé par le buff 94).
- Avantage = ×1,2 ; désavantage = ×0,8 ; neutre = ×1,0.

## 7. CheckDamageRate — RVA 0x2CB226C (fixe le résultat et le taux du hit)

Écrit `Defender.SkillRecord.DamageRateType` (résultat) et `.DamageRate` (‰), consommés
ensuite par `CalcDamage`. Ordre exact :

```text
CheckDamageRate(Attacker, Defender):
  // 1. World boss « finish attack » : le boss frappe en taux fixe
  if scène est WorldBoss && scene.IsUseWorldBossFinishAttack && Attacker.IsBoss:
    result = NORMAL(1) ; rate = 1000 ; return

  // 2. Invincibilité
  if Defender a un buff BT_INVINCIBLE (3):
    result = INVINCIBLE(4) ; rate = 0 ; return

  // 3. Attaque additive : réutilise le résultat du hit précédent
  if Attacker.SkillRecord.IsAdditiveAction && Defender.SkillRecord.DamageRateType != NONE:
    if result == MISSED(3):    rate = 1000
    elif result == CRITICAL(2): rate = Attacker.Data.CriticalDMGRate
                                if Defender.Data.EnemyCriticalDamageReduce != 0:
                                  rate -= Defender.Data.EnemyCriticalDamageReduce
    else:                       rate = 1000
    // (result inchangé) → sauter à l'étape 6
  else:
    // 4. Esquive : roll sur l'Avoid du défenseur (l'ACCURACY attaquant n'apparaît PAS ici)
    avoid = Defender.Data.Avoid
    if avoid ≥ 1 && GetBattleRandomRange(0,1000) ≤ avoid:
      result = MISSED(3) ; rate = 1000        // la pénalité ×0,5 vient plus tard (§ 8.2)
    else:
      // 5. Critique : roll sur le CriticalRate de l'attaquant
      crit = Attacker.Data.CriticalRate
      if crit ≥ 1 && GetBattleRandomRange(0,1000) ≤ crit:
        result = CRITICAL(2)
        rate = Attacker.Data.CriticalDMGRate
        if Defender.Data.EnemyCriticalDamageReduce != 0:
          rate -= Defender.Data.EnemyCriticalDamageReduce
      else:
        result = NORMAL(1) ; rate = 1000

    // 5bis. Overrides de contenu (forcent normal ×1000) :
    if WorldBoss && scene.IsUseWorldBossSpecialAttack: result = NORMAL ; rate = 1000
    if IrregularInfiltrate && scene.IsUseInfiltrateSatelliteAttack: result = NORMAL ; rate = 1000

  // 6. Modificateurs additifs de taux (‰, sur le rate quel que soit le résultat)
  rate += FindBuffAdditionalDamage(Attacker, Defender)     // § 9.1
  rate -= FindBuffDamageReduce(Defender, Attacker)         // § 9.2
  rate += Attacker.Data.DMGBoost                           // stat ST_DMG_BOOST (25)
  rate -= Defender.Data.DMGReduceRate                      // stat ST_DMG_REDUCE_RATE (6)

  // 7. Plancher
  if rate ≤ 299: rate = 300                                // minimum 30 %
```

Points fermes :

- Le crit **remplace** le 1000 par `CriticalDMGRate` (stat ‰, ex. 1500 = ×1,5), il ne
  multiplie pas. `EnemyCriticalDamageReduce` (stat 26) se soustrait de ce taux.
- DMG Boost / DMG Reduce / buffs additionnels sont **additifs sur le taux**, pas
  multiplicatifs.
- Plancher absolu du taux : **300 ‰**.
- Un MISS garde un taux de 1000 ici — la vraie pénalité (×0,5) est appliquée dans le
  cœur du calcul (§ 8.2) via `MISSED_DAMAGE_RATE`.

`AddCheckEnemyTeamDecreaseDamageRate(Attacker, count, ref rate)` (0x2CB2B1C) —
appelé par le code d'attaque (hors CFormula) pour les compétences dont la cible
« décroît » : `rate += FindBuffEnemyTeamDecreaseDamageRate(Attacker) × count`
(somme des buffs BT_DMG_ENEMY_TEAM_DECREASE (96) × nombre de cibles décomptées).
Le calcul du `count` par le code d'attaque n'est pas désassemblé ; **prouvé en
jeu** (fixture Noa vs Rhona 10/08/2026, EE +0 `BID_CEQUIP_2000022` 150 ‰,
Δ 0 exact) : `count = MAX_USER_TEAM_MEMBER − cibles touchées` (la taille
d'équipe, `CCommonDefine.MAX_USER_TEAM_MEMBER = 4` — dump.cs ; vague à
1 ennemi → ×3 → +450 ‰). Le moteur applique ce décompte via
`BuildReportOptions.targetsHit` (z `n`, défaut 1) ; le buff arrive gaté par
son `CallerSkillType` (application par slot, gear.ts).

## 8. CalcDamage — RVA 0x2CB2B54 (+ helper local 0x2CB330C)

Signature : `CalcDamage(Attacker, Defender, DamageTemplet, damageRate, out dmg, out vampiric, out hitRecovery)`.
`damageRate` = le `SkillRecord.DamageRate` produit par § 7. Sorties nulles si
`damageRate == 0` (invincible) ou si `DamageTemplet.DamageFactor == 0`.

### 8.1 Facteur total de la compétence (comptabilité multi-hit)

Un skill multi-hit appelle `CalcDamage` une fois **par hit**, avec le
`CDamageTemplet` du hit (`DamageFactor` ‰ du hit). Au premier hit
(`SkillRecord.ReceiveMaxDamage == 0`), le jeu scanne les `AnimationEvent` du clip
d'attaque courant de l'attaquant pour calculer le **facteur total** :

```text
totalFactor = Σ sur les events « hit » :
    templet = GetDamageTemplet(param.Split(',')[0])
    (templet.MaxHitCount == 0 ? 1 : templet.MaxHitCount) × templet.DamageFactor
  + Σ sur les events « facteur littéral » : int.Parse(param) si ≥ 1
```

Puis : `ReceiveMaxDamage = CalcDamageCore(totalFactor)` (§ 8.2),
`TotalSkillFactor = totalFactor`, compteurs remis à zéro.

### 8.2 Le cœur — `<CalcDamage>g__CalcDamage|17_0` (0x2CB330C)

```text
CalcDamageCore(factor):                       // factor = DamageFactor du hit (‰)
  atk         = Attacker.GetAttackStat()      // § 10.1
  skillFactor = Attacker.SkillManager.GetSkillFactor()
              // = SkillLevelTemplet.DamageFactor du skill courant (‰, données
              //   CharacterSkillLevelTemplet.json, ex. 960…1840)
  ppRate = Attacker.Data.PiercePowerRate      // stat 10, ‰ (pénétration %)
  pp     = Attacker.Data.PiercePower          // stat 9, plat
  def    = Defender.Data.Def                  // stat 5

  // Terme de défense (×1000), plancher -999000 :
  defTerm = max( def × max(0, 1000 - ppRate) - pp × 1000 , -999000 )

  d = div1000(atk × factor × skillFactor)          // produit 64 bits
  d = trunc( d × 1_000_000 / (1_000_000 + defTerm) )   // sdiv, mitigation défense
  d = div1000(d × damageRate)                      // crit/boosts/réduc (§ 7)

  if Defender a un buff BT_MARKING (5):
    d = div1000(d × 1150)                          // cible marquée : +15 % subis

  d = div1000(d × GetElementeryDamageRate(Attacker, Defender))   // § 6

  if Defender.SkillRecord.DamageRateType == MISSED(3):
    d = div1000(d × MISSED_DAMAGE_RATE)            // GameConfig 15 = 500 → ×0,5

  finalReduce = Defender.GetBuffDamgeFinalReduce(Attacker)       // § 9.3 (max, pas somme)
  d = trunc( d × (1000 - finalReduce) / 1_000_000 )              // ÷1e6 : retombe à l'échelle ATK
  return max(d, 1)                                 // un hit inflige toujours ≥ 1
```

Mitigation défensive en clair : `multiplicateur = 1e6 / (1e6 + def_effective × 1000)`
avec `def_effective = def × (1 - pen%) - penFlat`, soit la forme classique
`1 / (1 + def_eff / 1000)`. Le plancher `defTerm ≥ -999000` borne l'amplification à
×1000 quand la pénétration dépasse la défense.

### 8.3 Répartition par hit et rattrapage d'arrondi

Chaque hit stocke `CurrentSkillFactor += factor`. Au **dernier** hit
(`CurrentSkillFactor ≥ TotalSkillFactor`) : si `ReceiveMaxDamage >
ReceiveCurrentFactorDamage + dmg_hit`, le hit courant est **rehaussé** à
`ReceiveMaxDamage - ReceiveCurrentFactorDamage` (le total de la compétence est donc
exactement `CalcDamageCore(totalFactor)`, pas la somme des hits tronqués — sauf cas
dégénéré où les clamps `≥ 1` feraient dépasser, jamais corrigé à la baisse).
`ReceiveCurrentFactorDamage += dmg_hit` après chaque hit.

Limite de dégâts par tour (gimmick de boss, sauté si
`scene.IsUseWorldBossFinishAttack`) : si `Defender.TurnLimitMaxDamage != -1` et
`SkillRecord.SkillLimitMaxDamage == -1`, le plafond restant
`max(0, TurnLimitMaxDamage - TurnLimitCurrentDamage)` est borné par
`ReceiveMaxDamage`, passé par `CalcCharacterSharedDamage` (§ 11), et stocké.

### 8.4 Sorties annexes

```text
vampiric    = MulPermille(dmg, Attacker.Data.Vampiric)            // stat 11, ‰
hitRecovery = FloorToInt( (float32)(Defender.Data.HitHPRecovery × dmg) × 0.001f )
              // produit int 32 bits, puis float32 (0.001f = 0x3A83126F), floor
```

### 8.5 IsIgnoreTurnLimitDamage (0x2CB35A8) — exemption world boss, **1.4.14**

`CalcDamage` gagne un garde avant la comptabilité du facteur courant (§ 8.1). Le
prédicat est court et entièrement résolu :

```text
IsIgnoreTurnLimitDamage(attaquant):
  scene = CDungeonScene courante
  if scene == null:                       return false   // Unity op_Inequality
  if !scene.IsWorldBoss:                  return false
  if !scene.IsUseWorldBossSpecialAttack:  return false    // CDungeonScene+0x34
  if attaquant == null:                   return false
  return attaquant.UID == 0                               // attaquant sans UID
```

Effet dans `CalcDamage` :

```text
if IsIgnoreTurnLimitDamage(attaquant)  ou  scene.IsUseWorldBossFinishAttack:
    accumuler dans SkillRecord.CurrentSkillFactor        // CSkillRecord+0x8C
else:
    … chaîne de vérifications préexistante, puis même accumulation ou abandon
```

Autrement dit : pendant l'**attaque spéciale d'un world boss**, un attaquant **sans
UID** (source de dégâts qui n'est pas un personnage joueur instancié) échappe à la
limite par tour. En 1.4.9 seul `IsUseWorldBossFinishAttack` ouvrait ce chemin.

⚠ La **quantité accumulée** dans `CurrentSkillFactor` (`w22` au site d'appel) n'a pas
été tracée jusqu'à sa définition — voir § 12.16. La condition d'entrée, elle, est
certaine.

## 9. Agrégation des buffs de taux (CCharacterBattle)

> RÉALISÉ (03/08/2026) : `src/lib/damage/aggregate.ts` — les familles des
> tables § 9.1/9.2/9.3 (enums `BT_*` réels de BuffTemplet), la valeur
> effective § 14.1 (`value × stacks`), les canaux `BT_STAT` par stat pour
> l'identité § 16.1, et les drapeaux § 6/§ 7/§ 10.1 (marking, invincible,
> élément forcé/enchant, enemy-team-decrease, swap d'attaque). Contexte
> EXPLICITE : une famille sans son contexte contribue 0. `CheckAvailable`
> (§ 12) n'est pas émulé — l'UI ne propose que des buffs actifs.

### 9.1 FindBuffAdditionalDamage (0x28268C0) — buffs de l'ATTAQUANT, somme (‰)

Parcourt `m_BuffList` de l'attaquant ; chaque buff passe `CheckAvailable` (conditions
internes au buff : cible, stacks, cooldown d'application — non désassemblé, § 12) :

| BT  | Nom                     | Contribution                                                     |
| --- | ----------------------- | ---------------------------------------------------------------- |
| 85  | DMG                     | `+Value` (condition évaluée contre le défenseur)                 |
| 91  | DMG_OWNER_LOST_HP_RATE  | `+GetLostHPRateValue(attaquant, Value)`                          |
| 92  | DMG_TARGET_LOST_HP_RATE | `+GetLostHPRateValue(défenseur, Value)`                          |
| 93  | DMG_OWNER_STAT          | `+min(GetStatValuePermille(att.Data, StatType, Value), 1000)`    |
| 94  | DMG_TARGET_STAT         | idem sur les stats du **défenseur**, cap 1000                    |
| 95  | DMG_OWNER_BUFF          | `+Value × nb de buffs (positifs) de l'attaquant`                 |
| 96  | DMG_TARGET_BUFF         | `+Value × nb de buffs de att.TargetCharacter`                    |
| 97  | DMG_OWNER_DEBUFF        | `+Value × nb de débuffs de l'attaquant`                          |
| 98  | DMG_TARGET_DEBUFF       | `+Value × nb de débuffs de att.TargetCharacter`                  |
| 102 | DMG_TARGET_BREAK        | `+Value` si la cible est en Break (`RageManager.IsBreak`)        |
| 103 | DMG_TO_BOSS             | `+Value` si `target.Data.Type > 3` (types boss)                  |
| 104 | DMG_KILL_COUNT_STACK    | `+Value` (stacks gérés dans CheckAvailable/Value)                |
| 105 | DMG_NOT_CRITICAL        | `+Value` si résultat ∈ {NORMAL, MISSED}                          |
| 106 | DMG_PVP_CONTENT         | `+Value` si scène PvP                                            |
| 107 | DMG_CASTER_STAT         | `+min(GetStatValuePermille(caster.Data, StatType, Value), 1000)` |
| 108 | DMG_CASTER_LOST_HP_RATE | `+GetLostHPRateValue(caster du buff, Value)`                     |
| 110 | DMG_OWNER_TEAM_BUFF     | `+Value × Σ buffs (positifs) de l'équipe du caster`              |
| 111 | DMG_MY_TEAM_DECREASE    | `+Value × (4 - alliés vivants de l'équipe du caster)`            |
| 112 | DMG_MONADGATE_CONTENT   | `+Value` si scène Monad Gate                                     |
| 113 | DMG_TOWER_CONTENT       | `+Value` si mode Tour                                            |

Puis, en PvP temps réel : `+ CurrentMatchInfo.FieldSkillDmg`.

Helpers numériques (exacts) :

- `GetLostHPRateValue(c, v)` (0x280F19C) = `trunc((MaxHP - HP) × v / MaxHP)`, 0 si MaxHP < 1.
- `GetStatValuePermille(data, type, p)` (0x29033C8) = `div1000(GetStatValue(type) × p)`,
  0 si type NONE, `INT32_MAX` si le produit dépasse int32 après division. Les usages
  ci-dessus passent ensuite par `min(·, 1000.0f)` + `Math.Round` half-to-even (sans
  effet sur un entier) : **cap à 1000 ‰**.

### 9.2 FindBuffDamageReduce (0x2827AE4) — buffs du DÉFENSEUR, somme (‰)

| BT  | Nom                         | Contribution                                                                         |
| --- | --------------------------- | ------------------------------------------------------------------------------------ |
| 115 | DMG_REDUCE                  | `+Value` si `CheckAvailable(attaquant)` et `ApplyingType == 2`                       |
| 154 | STEALTHED                   | `+Value` si le skill de l'attaquant n'est **pas** mono-cible (`SkillRangeType != 1`) |
| 118 | DMG_REDUCE_MY_TEAM_INCREASE | `+Value × (alliés vivants du caster - 1)`                                            |

**Nouveauté 1.4.14 — réduction liée au DOT « punish ».** La fonction gagne 492 octets :
une quatrième boucle de buffs, un `CCharacterBattle.FindBuffByType(BT 62 BT_DOT_PUNISH)`
et **deux lectures de `GameConfig.PUNISH_DMG_REDUCE_VALUE`** (`GAME_CONFIG` 215, valeur
de table **300**, soit 30 %). Autrement dit : porter un DOT « punish » ouvre une
réduction de dégâts supplémentaire dont le montant vient désormais de la config
serveur, pas du buff. La **place exacte de ces 300 ‰ dans l'agrégation** (terme
additionnel de la somme, ou plafond appliqué au total) n'est pas tranchée — les deux
lectures sont sur des chemins distincts. Voir § 12.16 ; ne pas trancher au jugé.

### 9.3 GetBuffDamgeFinalReduce (0x2828164) — défenseur, **MAX** (‰), pas somme

Multiplicatif final `(1000 - r)/1000` dans § 8.2. `r` = maximum parmi :

- BT 119 DMG_REDUCE_FINAL : `Value` (si CheckAvailable vs attaquant).
- BT 120 DMG_REDUCE_FINAL_MY_TEAM_INCREASE : `Value × (alliés vivants du caster - 1)`.
- BT 121 DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL : `Value` si le skill de l'attaquant
  n'est pas le skill 1 (`SkillRecord.SkillType != 0`) ; sinon buff seulement consommé.

## 10. Stats d'entrée

### 10.1 GetAttackStat (0x282939C)

```text
if Attacker a un buff BT_SWAP_STAT_ATTACK (109) disponible :
  stat = Attacker.Data.GetFinalStat(buff.StatType)
  return (buff.ApplyingType == 2) ? MulPermille(stat, buff.Value) : stat + buff.Value
return Attacker.Data.Attack        // stat finale ST_ATK (4), buffs inclus
```

### 10.2 Getters `CCharacterData.get_*`

Tous identiques (ex. `get_Def` 0x2901FE8) : recalcul lazy (`CalcStat`) si dirty, puis
`StatDict[type].Value`. Les stats finales incluent base/évo/éveil/monad/trans/archive/
items/buffs via `CalcFinalStat` (§ 3). Le détail de `CCharacterData.CalcStat`
(assemblage des 13 paramètres par stat) n'a pas été désassemblé ici (§ 12).

## 11. Fonctions annexes

### CalcDamageDOT (0x2CB3BF0) — dégâts sur la durée

Entrées : `attackRate` (‰, du templet de buff DOT) et `statValue` (stat de référence
capturée). **Ignore** élément, crit, taux de § 7 ; seule mitigation : défense + DMG_REDUCE.

```text
defTerm  = max(def × max(0, 1000 - ppRate) - pp × 1000, -999000)   // même forme que § 8.2
reduce   = min(Defender.Data.DMGReduceRate, 900)                    // cap 90 %
d = trunc( attackRate × statValue × 1_000_000 / (1_000_000 + defTerm) )
d = trunc( d × (1000 - reduce) / 1_000_000 )
return d                                                            // PAS de clamp ≥ 1
```

### CalcDamageWG (0x2CB3D40) — dégâts de jauge de faiblesse

```text
if Defender.FindBuffWGInvincible(Attacker): return 0        // BT_WG_INVINCIBLE (82)
wg = customValue != 0 ? customValue
                      : Attacker.UsingSkill.WGReduce         // byte du SkillLevelTemplet
(flat, rate) = Defender.FindBuffWGDamageReduce(Attacker)     // BT 88/89, non désassemblé
return max(0, ApplyRate(flat + wg, rate))                    // = div1000((flat+wg)×(1000+rate))
```

### CalcCharacterSharedDamage (0x2CB36FC) — partage de dégâts

```text
restant = dmg
pour chaque allié du défenseur porteur de BT_SHARE_DMG_MULTI (137, ApplyingType 2):
  part = MulPermille(dmg, buff.Value)          // sur le dmg ORIGINAL
  allié.SkillRecord.MultiSharedDamage += part
  restant = max(0, restant - part)
partageur = équipe.GetCharacterSharedDamage()  // porteur unique de BT_SHARE_DMG (136)
if partageur existe et ≠ défenseur:
  part = MulPermille(restant, buff.Value)
  partageur.SkillRecord.SharedDamage += part
  restant -= part
return restant
```

## 12. Zones d'incertitude (à ne PAS combler par des suppositions)

1. **`CBuff.CheckAvailable`** : conditions d'activation internes (conditions de cible,
   « once per skill » via `MarkUsedHitOverThisSkill`) — non désassemblé. Le moteur TS
   prend les agrégats (§ 9) comme entrées. (`CBuff.get_Value` est lui résolu, § 14.1.)
   Les conditions d'ÉTAT DE COMBAT des passifs kit/équipement/quirks (ressource
   unique, buffs posés, seuils de PV… — liste `STATE_CONDITIONS` de gear.ts) ne
   sont JAMAIS devinées : l'entrée sort `stateful`, inactive par défaut, et ne
   s'active que si le scénario la DÉCLARE remplie (z `cs`, coche du harnais —
   10/08/2026, ex. les 5 Kaizer Energy du S3 de Noa, `2000022_3_3`).
2. ~~`CCharacterData.CalcStat`~~ — **RÉSOLU** : le mapping complet templet → 13
   paramètres est désormais extrait, voir § 17.
3. **`FindBuffWGDamageReduce`** (BT 88/89) : les deux sorties (flat, rate) sont
   identifiées mais leur agrégation interne n'est pas désassemblée.
4. **Événements d'animation** (§ 8.1) : les noms exacts des `functionName` comparés
   sont des littéraux runtime (metadata chiffrée) non extraits ; la _structure_ du
   calcul (MaxHitCount × DamageFactor + littéraux) est certaine.
5. **`GetSkillFactor` — skill courant** : lit `CurrentSkillType` (offset 0x70 du
   SkillManager) ; la correspondance SKILL_TYPE → skill équipé est du ressort du
   code d'attaque, pas de la formule.
6. **Wrap 32 bits** : le binaire reprend les résultats en 32 bits ; pour des valeurs
   réalistes aucun wrap ne se produit. Le moteur TS calcule en BigInt sans émuler le
   wrap (documenté dans le code).
7. ~~Escalade des pénalités PvP~~ — **RÉSOLU** (`CDungeonScene.UpdatePvpTurnPenalty`
   0x259F724 + `CStateBattle.PvpAttackTeamPenaltyDmg`, § 17.6) : première pénalité au
   tour `PVP_ATK_PENALTY_START_TURN` (10), puis tous les `…_LOOP_TURN` (5) tours.
   À chaque cycle : (a) chaque attaquant vivant subit
   `AddHP(−MulPermille(MaxHP, dmgRate))` avec `dmgRate` = 100 ‰ puis +30 ‰/cycle,
   **sans cap**, `bIgnoreUndead=true` (perce UNDEAD) ; (b) la réduction de soins de
   la scène (`[scene+0x100]`, lue par § 14.2) passe de **0** (avant le premier
   cycle, les soins PvP ne sont PAS réduits) à 500 ‰, puis +250 ‰/cycle,
   **cap 1000 ‰** (`min(x, 1000)`).
8. **`CBattleManager.ProcessDamageOverTime`** : le tick périodique des DOT (qui appelle
   `CalcDamageDOT` § 11 avec la stat capturée) et l'ordre exact des ENHANCE
   (BT 70–76 `*_ENHANCE`) n'ont pas été désassemblés ; seul le déclenchement « immédiat »
   (BT 63–69, § 14.6) l'a été.
9. **Contre-attaques** : `get_CounterRate` n'est lu que par
   `CCharacterBattle.OnReturnFinishDefenderTeam` (§ 16) — le roll et le skill
   utilisé en contre ne sont pas désassemblés.
10. **Caps de stat par scène** (§ 16) : le dictionnaire `[scene+0x168]` existe et
    borne les stats par contenu ; quels contenus le remplissent et avec quelles
    valeurs n'a pas été extrait (probable lien avec les configs de tour —
    `TowerElementalConfigTemplet.json`).
11. **`GetCriticalStatBuffValues`** : l'agrégation spéciale des buffs de taux
    critique (branche type 7 de `SetFinalValue`, § 16) n'est pas détaillée.
12. **`ProcessDamage` / `ProcessDamageSimulator`** : l'orchestration autour de
    `CalcDamage` (ordre shield → HP, WG, événements on-damage) n'est pas
    désassemblée — les formules qu'elle appelle le sont toutes.
13. ~~`addRate` de `SetBaseValue`~~ — **RÉSOLU** (04/08/2026, scan exhaustif des
    stores inlinés 0xC0/0xC4 du binaire + callers de `SetStatValue` 0x29065C0) :
    la SEULE source combat est `CGuildRaidSpawnData.GetCharacterData`
    (0x231B804) — le scaling du BOSS de guild raid en **overgrade**. Au-delà du
    grade 10, avec `GameConfig.GUILD_RAID_AFTER_10_BOSS_STAT` (enum 149) =
    `[300, 300, 10]` :
    `MaxHP = floor(float32((1 + overGrade × 300 × 0.001f)) × float32(BossMonsterHP))`
    (+30 %/overgrade), `AddRateAtk = overGrade × 300` (‰, +30 %/overgrade),
    `AddRateDef = overGrade × 10` (‰, +1 %/overgrade) — le canal addRate § 3.2.
    L'overgrade est un état SERVEUR (progression de la guilde pendant le raid) :
    le calculateur ne le devine jamais — depuis le 17/08/2026 il l'EXPOSE en
    sélection de stage (les stages > 10 du main boss sont des contextes de
    spawn du donjon stage 10, `overGrade = stage − 10`, appliqués par `statAt`
    jusqu'à la borne `GameConfig.GUILD_RAID_MAIN_BOSS_MAX_GRADE` = 100) ; une
    fixture guild raid doit NOTER le stage joué. (`CUICharacterToolTip.Open`
    refait le même calcul pour l'affichage.) Les 11 autres fabriques de spawn
    (`CSpawnData` et sous-classes — world boss, guild dungeon, event challenge,
    singularity, monad, adventure…) n'appliquent AUCUN modificateur de stat
    custom (audit de leurs `GetCharacterData`, 04/08/2026) : leurs spawns sont
    fidèles aux tables + spawn advantage standard.
14. **Colonnes `Normal_i`/`Magic_i`/`Rare_i`/`Unique_i` de `ItemEnchantTemplet`** :
    consommateurs non tracés (getters inlinés). Hors chemin de calcul déterministe —
    la croissance des stats à l'enchant passe par `UpgradeFactorforOP` (§ 17.5) et
    les sub-options effectives d'une pièce sont une entrée utilisateur.
15. **Modificateurs de RUN d'infiltration** :
    `CInfiltrateSpawnData.GetCharacterData` applique
    `CInfiltrate.GetSpawnAdventageRates` — des `SpawnAdvantageRate_*` accumulés
    PENDANT la run (items/nœuds ramassés,
    `IrregularInfiltrate{Item,Node}Templet`). Les presets du calculateur donnent
    l'état de base (sans objets de run) ; l'agrégation exacte n'est pas
    désassemblée — une fixture d'infiltration doit être capturée en début de
    run, sans modificateur actif.
16. **Écart 1.4.9 → 1.4.14 (13/08/2026) — rédigé, PAS implémenté.** Comparaison
    des 88 corps normalisés (RVA, pages `adrp` et slots de métadonnées
    neutralisés) : **72 inchangés**, 13 à allocation de registres près, **3
    changements de comportement** — tous les trois désassemblés et rédigés :
    § 8.5 (`IsIgnoreTurnLimitDamage`), § 9.2 (réduction `BT_DOT_PUNISH` via
    `GameConfig.PUNISH_DMG_REDUCE_VALUE` = 300) et § 14.5 (reverse heal
    `_ABLE_KILL` + `TrySetDieByReverseHeal`). S'y ajoute la **renumérotation de
    `BUFF_TYPE`** traitée en § 2.

    Ce qui reste ouvert, à ne PAS combler au jugé :
    - **§ 9.2 — place des 300 ‰.** Les deux `GetGameConfig(215)` sont sur des
      chemins distincts ; terme additionnel de la somme ou plafond du total,
      non tranché. Le moteur applique encore l'agrégation 1.4.9.
    - **§ 8.5 — quantité accumulée** dans `CSkillRecord.CurrentSkillFactor`
      (`w22` au site d'appel) : définition non atteinte par lecture linéaire,
      il faut suivre les arcs arrière du bloc.
    - **§ 14.5 — le slot virtuel 0x198** de `CCharacterBattle` (la mise à mort
      appelée par `TrySetDieByReverseHeal`) n'est pas résolu en nom.

    **Le moteur TS n'implémente aucun des trois.** Il n'est pas pour autant
    faux sur les identifiants : il clé sur les noms de `BUFF_TYPE`, pas sur les
    entiers. Deux commentaires portent en revanche les anciens numéros et
    mentent désormais — [`src/lib/damage/recovery.ts:182`](../../src/lib/damage/recovery.ts)
    (« BT_REVERSE_HEAL_CAP (18) », lire 20) et
    [`src/lib/damage/types.ts:175`](../../src/lib/damage/types.ts) (« buffs
    114/115/116 », lire 119/120/121). Laissés en l'état volontairement : cette
    passe est documentaire, aucun fichier de code n'a été touché.

## 13. À vérifier in-game (phase 2)

- Un hit « raté » (esquive) inflige bien ~50 % (MISSED_DAMAGE_RATE=500) et peut critiquer ?
  (par construction : non — MISSED court-circuite le roll de crit).
- Le plancher de taux à 300 ‰ (empiler DMG Reduce ne descend jamais sous 30 % du hit).
- Le cap à 1000 ‰ des bonus BT_DMG_*_STAT (§ 9.1).
- La pénalité de MARKING ×1,15 (buff type 5).
- L'arrondi « dernier hit rattrape le total » sur un skill multi-hit (comparer somme
  des hits affichés vs calcul du total).
- Un shield reposé **écrase** l'ancien même s'il est plus petit (§ 14.4).
- Le saignement divise les soins reçus par 2 (§ 14.3) et INCREASE_RECEIVE_HEAL
  prime sur REDUCE (un seul des deux s'applique).
- Le reverse heal laisse à 1 PV hors contenus « létaux » (§ 14.5).

## 14. Soins, shields, reverse heal, WG — CBuff.OnCreate (0x232856C) & AddHP (0x280E4B8)

Ces mécaniques ne sont pas dans `CFormula` : ce sont des **buffs**, résolus dans le
dispatch `CBuff.OnCreate` (~12,7 Ko, table de saut sur BUFF_TYPE 10–81) et appliqués
via `CCharacterBattle.AddHP`. Listings : `CBuff_OnCreate.asm`, `CCharacterBattle_AddHP.asm`,
`CBuff_get_Value.asm`, `CBuff_CheckReverseHealCAP.asm`, `CCharacterBattle_SetShieldHP.asm`.

### 14.1 Valeur d'un buff et enhance

- `CBuff.Value` (0x232036C) = `Templet.Value × StackCount` — **linéaire en stacks**,
  partout (dégâts § 9, soins, shields…).
- Buffs de stat (BT 29/30 STAT_BUFF/DEBUFF_ENHANCE sur le porteur) : la valeur
  effective du buff de stat posé devient `ApplyRate(value, enhance.Value)`
  = `trunc(value × (1000 + enhance) / 1000)` (stockée en `InstanceValue`).
- BT 33 STAT_OWNER_LOST_HP_RATE : `InstanceValue = GetLostHPRateValue(owner, value)`.
- BT 34 …_HALF : `hpEff = clamp(2×HP − MaxHP, 0, MaxHP)` puis
  `GetLostHPRateValue(hpEff)` — le bonus croît deux fois plus vite et sature quand
  HP ≤ 50 %.
- Un buff de MaxHP préserve le **ratio de PV** : `HP' = trunc(MaxHP' × HP / MaxHP)`
  (plein PV reste plein PV).

### 14.2 Soins directs (BT 14 HEAL_BASED_CASTER / 15 HEAL_BASED_TARGET)

```text
heal = (Templet.StatType != 0)
         ? GetStatValuePermille(source.Data, StatType, value)   // source = caster (14) ou porteur (15)
         : value                                                 // valeur plate
if IsPvp ou IsPvpRealtime:
  heal = MulPermille(heal, 1000 - scene.pvpHealReduce)   // [scene+0x100] : 0 avant le 1er cycle de
                                                          // pénalité, puis 500/750/1000 ‰ (§ 12.7, § 17.6)
healEffectif = AddHP(owner, heal, bHeal=true)             // § 14.3
SkillRecord.Heal += healEffectif ; CTeam.AddTotalHeal(casterUID, healEffectif)
```

Les HoT (soins sur la durée) sont ces mêmes buffs re-déclenchés à chaque tick de tour.

### 14.3 AddHP(value, bHeal, bIgnoreUndead, bIgnoreHealModifier) — modificateurs

Pour `value ≥ 1` (soin), si `!bIgnoreHealModifier` et que le porteur a un buff de
modification de soins reçus :

```text
if BT_SEALED_RECEIVE_HEAL (7):        return 0            // soin annulé
elif BT_INCREASE_RECEIVE_HEAL (8):    value += MulPermille(value, buff.Value)
elif BT_REDUCE_RECEIVE_HEAL (9):      value -= MulPermille(value, buff.Value)
// chaîne elif : INCREASE prime, un seul des deux s'applique
```

Puis, inconditionnellement pour les soins :

```text
if IsPvpRealtime: value -= MulPermille(value, match.FieldSkillReduceReceiveHeal)
if porteur a BT_DOT_BLEED (55): value = MulPermille(value, 500)   // saignement : soins ÷ 2
```

Pour `value < 0` (dégâts) : le **shield absorbe d'abord**
(`shield > |value|` → shield -= |value|, dégâts 0 ; sinon shield = 0 et
`value += shield`). Enfin `HP = clamp(HP + value, 0, MaxHP)` ; si HP tombe à 0 et
BT_UNDEAD (111) présent (et `!bIgnoreUndead`) → HP = 1. Retourne le delta effectif
(c'est lui qui alimente `SkillRecord.Heal`). Le paramètre `bHeal` n'est pas lu dans
le corps (uniquement transmis par les appelants).

### 14.4 Shields (BT 21 SHIELD_BASED_CASTER / 22 SHIELD_BASED_TARGET)

```text
shield = (Templet.StatType != 0)
           ? GetStatValuePermille(source.Data, StatType, value)  // source = caster (19) ou porteur (20)
           : value
SetShieldHP(owner, shield)     // REMPLACE m_nShieldHP (aucun cumul), mémorise le max pour la jauge
```

Pas de réduction PvP sur les shields. La consommation est dans AddHP (§ 14.3) ;
`RemoveBuffShield` retire le buff quand le shield tombe à 0.

### 14.5 Reverse heal (BT 16 …_CASTER / 17 …_TARGET, **18/19 `_ABLE_KILL`**, cap BT 20)

```text
v = (Templet.StatType != 0) ? GetStatValuePermille(source.Data, StatType, value) : value
v = CheckReverseHealCAP(v)     // min(v, plus petit BT_REVERSE_HEAL_CAP (20) dont la condition passe)
if HP + ShieldHP > v:
  AddHP(owner, -v, bIgnoreHealModifier…)      // passe par le shield, ignore la mitigation de dégâts
else:                                          // serait létal
  if Templet.Type == 18 (BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL):   // ← 1.4.14
    AddHP(owner, -v)
    TrySetDieByReverseHeal()                   // tue, PARTOUT, sans condition de scène
  elif scène ∈ {GuildDungeon, EventChallenge, WorldBoss, MonadGateSingularity} ou owner.IsBoss:
    AddHP(owner, -v)                           // peut tuer
  else:
    AddHP(owner, 1 - (HP + ShieldHP))          // laisse exactement 1 (PV+shield)
```

Le reverse heal ignore défense, élément, crit et DMG_REDUCE — c'est une perte de PV
brute, pas un dégât.

**Nouveauté 1.4.14 — le reverse heal peut tuer explicitement.** L'énumération gagne
`BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL` (18) et `…_TARGET_ABLE_KILL` (19). Quand le
buff appliqué est de ce type, la branche létale court-circuite entièrement la liste
de scènes ci-dessus et appelle `CBuff.TrySetDieByReverseHeal` (0x232C11C) :

```text
TrySetDieByReverseHeal():
  owner = buff.Owner
  if owner.HP != 0:      return          // le AddHP précédent ne l'a pas mis à 0
  if !owner.IsAlive:     return
  if owner.IsNotDie:     return          // CCharacterBattle+0x2E8
  owner.<slot virtuel 0x198>(false)      // la mise à mort ; méthode non résolue
  if owner.TeamType != ENEMY: return
  if !owner.IsBoss:           return
  owner.GetTeam().BossKill(null)         // CTeam.BossKill — comptabilité de kill de boss
```

Le garde `IsNotDie` est le seul verrou : un porteur marqué « ne meurt pas » survit.
Le tour de comptabilité `BossKill` ne s'exécute que pour un boss de l'équipe ENNEMIE.

### 14.6 Jauge de faiblesse et DOT immédiats

- BT 85 WG_HEAL : `wg += (ApplyingType == 2) ? MulPermille(MaxWG, value) : value`.
- BT 89 WG_DMG : si la cible peut perdre du WG :
  `wg -= CalcDamageWG(caster, owner, (ApplyingType == 2) ? MulPermille(MaxWG, value) : value)`.
- BT 63–69 IMMEDIATELY_(BURN…) : chaque DOT du type correspondant déjà présent sur la
  cible tick immédiatement à `ApplyRate(dot.Value, value)` = `dot × (1000+value)/1000`
  (via `CBuffManager.ProcessDamageOverTime`, qui applique ensuite `CalcDamageDOT` § 11).

## 15. Passifs d'équipement (sets, options uniques, EE, artefacts…)

Deux canaux distincts, tous deux côté `CCharacterData` / `CSkillManager` :

1. **Stats chiffrées** (main stat, substats, bonus de set en %) : agrégées par
   `CCharacterData.CalcStat` / `CalcSetItem` dans les paramètres
   `itemOptionValue`/`itemOptionValueRate` de `CalcFinalStat` (§ 3). Données :
   `ItemOptionTemplet.json`. (Mapping détaillé non désassemblé — § 12.2.)

2. **Passifs à effet** (procs de set, option unique d'une pièce, équipement
   exclusif, ooparts, artefacts…) : ce sont des **`CBuffTemplet` ordinaires**,
   chargés dans des listes dédiées de `CSkillManager` :
   - `InitializeItemUniqueBuff(Weapon, Accessory, Helmet, Armor, Gloves, Shoes,
Exclusive, Ooparts)` → `m_ItemBuffTempletList` (0x18) ;
   - `CCharacterData.CreateBuffSetItem` → `InitializeItemSetBuff` →
     `m_ItemSetBuffTempletList` (0x20) ;
   - `SetArtifactBuffTempletList` (0x28) et les listes de contenu (guild raid,
     PvP league, nœuds d'éveil, infiltration, Monad gate, leader PvP temps réel,
     daily gift — offsets 0x30…0x60).

   Le collecteur central `CSkillManager.GetBuffList` (RVA 0x2510400, listing
   `CSkillManager_GetBuffList.asm`) parcourt, dans cet ordre : les buffs des
   skills (`m_SkillList`) **puis toutes ces listes**, filtrés par
   `IsBuffCreateType` (le moment, enum `BUFF_CREATE_TYPE` : 1–2 PASSIVE, 3–4
   ON_SPAWN, 5 ON_TURN, 6–11 SKILL_START/FINISH, 16 DAMAGE, 17 AVOID, 18 DIE,
   20–25 CHAIN, 26 ON_BREAK, 27 ON_RESIST…) et `IsCallerSkillType`. Les wrappers
   `GetBuffListOn*` fixent juste le `BUFF_CREATE_TYPE` (ex. `OnSpawn` = types 3
   puis 4).

   **Conséquence pour le calculateur : un passif d'équipement instancié est un
   `CBuff` comme un autre** — il passe par les mêmes agrégations que les buffs de
   skills (§ 9, § 14) : un set qui donne du DMG Boost alimente `CheckDamageRate`,
   un proc de soin passe par § 14.2, etc. Aucune formule spécifique aux items.

   Particularité : les buffs d'équipement portant un `BuffCool` sont gardés par
   `m_EquipItemBuffCoolList` (dictionnaire par BuffID) — `CheckItemBuffCool`
   (0x2513824) refuse le déclenchement tant que `compteur < BuffCool` puis le
   remet à zéro ; `AddItemBuffCool` incrémente le compteur (cadence
   d'incrémentation non désassemblée).

> RÉALISÉ (05/08/2026) : `src/lib/damage/gear.ts` — le canal 2 (buffs) est
> branché pour l'ÉQUIPEMENT DU PORTEUR : arme, accessoire (niveau de buff
> = breakthrough + 1), sets (ligne par `BreakLimitCount` 0/4, 1 set choisi
> = 2P + 4P), Rogue's Charm (interrupteur « +10 », ligne Lv10
> `BT_DMG_TARGET_BREAK`), EE (lignes spéciales ≤ `max(enchant, 1)`, main à
> buff au niveau `enchant + 1` — § 17.5). Créations `PASSIVE`/`PASSIVE2`
> appliquées via les canaux § 9/§ 16.1 ; les familles « PV perdus » § 14
> (BT 33/34) alimentent désormais les canaux de stats (contexte = PV de
> combat × % saisis). Procs damage-pertinents : signalés `dynamic`, jamais
> simulés (le marking de Rampaging Caracal se coche en chip d'état).
> `MY_TEAM_WITHOUT_ME` (Absolute Music) : jamais appliqué au porteur, affiché
> inactif. `BT_WG_*` → non résolu § 12.3 ; conditions non évaluables § 12.1 →
> non résolu, contribution 0.
>
> Condition `TARGET_ELEMENT` PROUVÉE : `BuffConditionValue` =
> `CHARACTER_ELEMENT_TYPE` de la CIBLE (dump.cs : EARTH=0, WATER=1, FIRE=2,
> LIGHT=3, DARK=4 ; valeur absente = 0 = terre). Corroborations : la desc
> officielle de l'EE 2000019 (« damage dealt to Fire enemies ») porte la
> valeur 2 = CET_FIRE ; les mains d'EE `BID_CEQUIP_MAIN_DMG_<EL>` visent
> l'élément que le porteur BAT (feu → terre…), les armes de Singularité
> `Singularity_equip_dmg_<el>` l'élément qui les contre — les deux familles
> se déduisent de la même table sans exception.

## 16. Couches contextuelles au-dessus de CalcFinalStat — CStatValue (audit de couverture)

La stat lue en combat est `CStatValue.GetFinalValue` (0x29FBD34), pas la sortie brute
de `CalcFinalStat`. Chaîne exacte (`CStatValue_SetFinalValue.asm` / `_GetFinalValue.asm`) :

```text
SetFinalValue():                              // au recalcul (dirty)
  final = CalcFinalStat(les 13 paramètres)    // § 3
  core  = CalcFinalStat(base, spawn, évo, éveil, éveilRate, 0, 0, 0, 0, 0, 0, 0, 0)
  m_nEquipIncrementValue = final − core       // SORTIE : part monad/trans/archive/items/buffs
                                              // (consommée par l'UI/CP, pas une entrée)
  final += m_nPvpRealtimeFieldSkillValue      // field skills PvP temps réel : bonus PLAT additif
  if type == ST_CRITICAL_RATE (7):
    final = max(0, min(final, 1000))          // CAP DUR : 100 % de taux critique
                                              // (le type 7 a aussi une branche dédiée où les
                                              //  buffs de crit passent par GetCriticalStatBuffValues)

GetFinalValue():
  if m_nTempMaxValue != -1: return m_nTempMaxValue        // OVERRIDE total (synchro de niveau)
  if dirty: SetFinalValue()
  if scene.StatCapDict[scene+0x168] contient le STAT_TYPE :
    return min(m_nFinalValue, cap)                        // cap de stat PAR CONTENU
  return m_nFinalValue
```

Vérifications de couverture par scan exhaustif des `bl` du binaire
(`.gamedata/apk/find_callers.py`) :

- **`get_Accuracy` (ST_ACCURACY, 13) : ZÉRO appelant** — la précision n'est lue par
  aucun code de combat en 1.4.9 (l'esquive ne roll que sur l'Avoid § 7 ; le
  « toucher » des effets, c'est BUFF_CHANCE/BUFF_RESIST § 5). Elle ne peut agir que
  si un buff dynamique la référence par StatType.
- `get_Avoid` : 1 seul appelant = `CheckDamageRate` ✓ (couverture § 7 confirmée).
- `get_BuffChance`/`get_BuffResist` : consommées par `CBuff.Initialize` (le
  `CheckResist` § 5 se joue à la pose du buff) et par `CalcBattlePower`.
- `get_CounterRate` (ST_COUNTER_RATE, 22) : 1 appelant,
  `CCharacterBattle.OnReturnFinishDefenderTeam` — le roll de contre-attaque, non
  désassemblé (§ 12.9).
- `CalcDamage` : 2 appelants — `CBattleManager.ProcessDamage` et
  `ProcessDamageSimulator` (chemin « simulateur » identique, utilisé pour les
  prévisualisations/IA). `CheckDamageRate` : 1 appelant (`UseSkill`).
- `CalcFinalStat` : uniquement `CStatValue` (le pipeline ci-dessus est le seul).

Audit d'exhaustivité de la classe `CFormula` (dump.cs, TypeDefIndex 7258) — les
19 méthodes sont toutes comptabilisées :

| Méthode                                                      | Statut                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| CalcStat                                                     | § 3.1                                                               |
| CalcFinalStat                                                | § 3                                                                 |
| CheckProbability / …Percent / …Permille                      | § 4 (wrappers vérifiés : `b` vers 0x2CB1C0C avec max=100/1000)      |
| CheckResist                                                  | § 5                                                                 |
| GetElementSuperiority / GetElementeryDamageRate              | § 6                                                                 |
| CheckDamageRate / AddCheckEnemyTeamDecreaseDamageRate        | § 7                                                                 |
| CalcDamage + helper local `g__CalcDamage\|17_0`              | § 8                                                                 |
| CalcDamageDOT / CalcDamageWG / CalcCharacterSharedDamage     | § 11                                                                |
| InitRandomSeed / GetRandomRange ×2 / GetBattleRandomRange ×2 | RNG — tirages injectés dans le moteur (§ 4)                         |
| Approximately                                                | comparaison float à tolérance, aucun appel dans les formules        |
| CalcBattlePower (0x2CB1D08)                                  | **hors périmètre** : calcul du CP affiché, ne touche pas aux dégâts |

Ce qui s'applique **hors combat vs en combat** :

- Permanents (partout, via CalcFinalStat) : évolution, éveil, monad, transcendance,
  archive, items ; les stats affichées hors combat = même pipeline sans `buffVal`/`buffRate`.
- Combat/contenu uniquement : buffs (§ 9/14/15), pénalités PvP (soins § 14.2, ATK
  § 12.7), field skills PvP temps réel (plat, ci-dessus), caps de stat par scène,
  override synchro (`TempMaxValue`), avantage d'apparition (`spawnAdvantageRate`,
  monstres PvE), listes de buffs par contenu (§ 15).
- Jamais en combat : ST_GET_GOLD_RATE (20), ST_GET_CHARACTER_EXP_RATE (21)
  (économie), et de fait ST_ACCURACY (13).

### 16.1 De la fiche affichée aux stats de combat (consolidé 27/07/2026)

Ajouté après l'angle mort « Codex » (le terme d'archive était documenté au § 3
depuis la phase 1, mais sa CONSÉQUENCE de saisie n'était reliée nulle part —
la faute au vocabulaire : chaque système a un nom FORMULE et un nom UI).

**Glossaire binaire ↔ jeu** — toujours donner les deux :

| Nom formule / tables                       | Nom en jeu (UI)          | Canal CalcFinalStat                                                                      |
| ------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------- |
| archive (`CharacterArchiveStatTemplet`)    | **Hero Codex**           | `base × archiveRate`, HORS sous-total                                                    |
| éveil / Awakening (`CharacterAwakening*`)  | **Quirks / Gift**        | `awakVal` (plats) + `awakRate` (IOT_STAT) ; les nœuds IOT_BUFF sont des CBuffs de combat |
| Trust (`TrustBuffTemplet` → `BuffTemplet`) | **Affinité** (5 paliers) | `buffVal` — buffs passifs plats (+60 ATK/+40 DEF/+300 HP par palier)                     |
| monad (`MonadGateEnchantNodeTemplet`)      | **Monad Gate**           | `monadVal`/`monadRate`                                                                   |
| transcendance                              | **Transcendance** (aura) | `transRate` (multiplicateur commun)                                                      |

**Ce que la fiche affichée contient** (pipeline § 16 sans `buffVal`/`buffRate`,
corroboré in-game 27/07/2026 — l'affinité n'apparaît PAS dans la fiche) :

| Couche                                     | Dans la fiche ? | Multipliée par `buffRate` en combat ?          |
| ------------------------------------------ | --------------- | ---------------------------------------------- |
| base, évolution, éveil, monad (plats)      | oui             | oui                                            |
| taux éveil/monad/transcendance/items       | oui             | oui                                            |
| plats d'équipement (`itemVal`)             | oui             | oui — mais PAS multipliés par `itemRate` (§ 3) |
| archive / **Codex**                        | oui             | **NON** (ajouté après le ×buffRate)            |
| Trust / **Affinité**                       | **NON**         | oui (canal `buffVal`)                          |
| buffs de combat, passifs d'équipement § 15 | non             | —                                              |

**Identité de reconstruction** (EXACTE, aucune approximation — les troncatures
s'annulent car `fiche = sub_sans_buffs + A`) : pour passer d'une stat SAISIE
depuis la fiche à la stat de combat,

```text
A       = div1000(base × archiveRate)        // terme Codex (base = CalcStat § 3.1)
combat  = div1000((fiche − A + buffVal) × (1000 + buffRate)) + A
```

avec `buffVal` incluant les paliers d'affinité. Le moteur n'a donc besoin que
de : la fiche saisie, la stat de base recalculée, le niveau de Codex, le palier
d'affinité, et les buffs du scénario. (Re-vérification du 27/07/2026 : la
formule § 3 a été re-dérivée indépendamment depuis `CalcFinalStat.asm` —
conforme, y compris le clamp `bic` et les troncatures vers zéro.)

> RÉALISÉ (03/08/2026) : `src/lib/damage/sheet.ts` (`sheetToCombatStat`,
> `archiveTerm`, `sheetToCombatStatAtLevel`) — l'identité est PROUVÉE par test
> de propriété (`sheet.test.ts` : 500 configurations de couches balayées, la
> reconstruction est EXACTEMENT `calcFinalStat`, pas une approximation).
> NB pour l'amont : le terme Codex exige la stat de BASE, donc le NIVEAU de
> l'attaquant — l'UI ne le demande pas encore (défaut 120 à prévoir).

### 16.2 Buff de guilde (event buff MAX_HP) — get_MaxHP (0x2901A30), 04/08/2026

Signalé par Sevih (le « buff de guilde » n'est pas actif dans tous les modes) ;
chaîne ENTIÈRE vérifiée au binaire :

```text
// Au CHARGEMENT du donjon (CDungeonScene.<LoadResource>d__247.MoveNext,
// 0x25ABC8C) — seul appelant dans tout le binaire :
rate = CBuffSystemManager.CheckMaxHPEvent(dungeonMode, dungeonPlayMode, areaID)
CCharacterData.MaxHPRate = rate                       // str s0, [x20, #0x120]
// remis à neutre par ResetMaxHPRate (CStateResult.OnStart, fin de combat)

// CBuffSystemManager.CheckMaxHPEvent (0x24A6F5C) :
sum  = Σ CEventBuffGroupData.CheckMaxHPEvent(...)     // par groupe de buff actif
     + (buff de ZONE type EBT_MAX_HP=5 si areaID matche et playMode ≠ 2)
rate = float32(sum + 100) × 0.01f                     // constante 0.01f à 0x1056648

// CCharacterData.get_MaxHP (0x2901A30) :
MaxHP = floor(float32(MaxHPRate × float32(HP_final)))  // scvtf/fmul/frintm
        // HP_final = la stat § 16/§ 3 ; float32 exact tant que HP < 2^24
```

**La donnée** (`BuffSystemTemplet` via `GuildBuffTemplet.BuffGroupID` →
`BuffSystemTemplet.GroupID`) : chaque niveau de guilde 1..10 accorde 3 buffs
système — GOLD et CHAR_EXP (économie, sans effet combat) et **EBT_MAX_HP**, le
seul qui pèse : `BuffValue` = 8 (Lv 1–3), 10 (Lv 4–6), 12 (Lv 7), 13 (Lv 8),
14 (Lv 9), 15 (Lv 10) → jusqu'à ×1.15 de PV max.

**Modes où le MAX_HP s'applique** (`DungeonMode` de la ligne, identique aux 10
niveaux ; `IgnoreDungeonMode` vide) : `DM_NORMAL` (l'histoire ENTIÈRE — les
quatre slugs d'encounters `normal`/`normal_hard`/`origin`/`origin_hard` sont
un découpage site par zone AreaTemplet du même mode DM_NORMAL), `DM_SIDESTORY`,
`DM_GOLD`, `DM_FARMING`, `DM_RAID_1`, `DM_RAID_2` (Special Request),
`DM_TOWER` (Skyward normal SEULEMENT), `DM_GUILD_DUNGEON`. Donc PAS en world
boss, guild raid, tours hard/very hard/élémentaires, irregular, PvP, monad,
adventure — ni nulle part ailleurs.

**Conséquences moteur** : la FICHE hors combat n'inclut jamais ce taux
(`MaxHPRate` n'est posé qu'au chargement d'un donjon) — en contenu éligible,
le HP de combat = `floor(float32(rate × HP_fiche_reconstruite))`, à reproduire
en float32 (`Math.fround`). Seul le HP max bouge (scaling § 10.1 sur HP,
contexte PV § 8, vampiric § 14) ; l'ATK/DEF/vitesse ne sont pas touchés, et
les MONSTRES n'ont pas ce champ (classe `CCharacterData` = persos).

**Autres sources `EBT_MAX_HP` recensées** (scan exhaustif 04/08/2026 :
`BuffSystemTemplet` entier + `UserNickNameTemplet` + `GameConfigTemplet` +
stores binaires de `MaxHPRate`) : UNE seule autre ligne existe — groupe 65,
« Title Buff [Premium Body] » (`SYS_BUFF_USERNICKNAME_LICENSE_04`) :
**+5 % PV max**, modes `DM_NORMAL`, `DM_RAID_1`, `DM_RAID_2`,
`DM_ADVENTURE_MISSION`, `DM_ADVENTURE_CHALLENGE`. Aucune table CLIENT ne
l'accorde (ce n'est pas un titre de `UserNickNameTemplet`) : buff poussé par le
SERVEUR — vraisemblablement le pass Story License premium. Il se CUMULE avec le
buff de guilde dans la somme du manager (listes de modes différentes : lui ne
couvre ni side story/gold/farming/tour/donjon de guilde ; la guilde ne couvre
pas les modes Adventure). Les event buffs des ~24 autres types
(`EVENT_BUFF_TYPE`) sont TOUS économie/QoL (gold, exp, drop, stamina,
entrées…) — aucun autre ne touche une stat de combat, et les buffs de titres
existants ne portent que gold/exp/drop/stamina.

> RÉALISÉ (05/08/2026, décision Sevih — le +5 % est introuvable dans l'UI du
> jeu, on l'expose et les fixtures trancheront) : la SOMME du manager est
> implémentée dans l'amont (`MaxHpBuffInfo` : parts guilde + titre, chacune
> active selon SES modes ou SA coche manuelle,
> `rate = float32(100 + Σ actives) × 0.01f`). L'extracteur émet
> `growth.titleMaxHp` (lignes EBT_MAX_HP hors guilde — le test datagen casse
> si un patch en ajoute) ; réglage de compte « Title Buff [Premium Body] »
> (toggle settings, localStorage, hors z), coche manuelle dédiée (`pb`),
> capturé dans `DamageFixture.premium`. Le tooltip in-game du buff de guilde
> (Sevih 05/08/2026) corrobore les 8 modes de la table : Story, Side Story,
> Hypnotic Frog Hall (gold), Ark Raid (farming), les deux Special Request
> (raid_1/raid_2), Skyward Tower (normale), Guild Security Area (donjon de
> guilde).

### 16.3 Passifs de boss (kits de monstres preset) — 05/08/2026

Les monstres portent leurs skills aux slots `Skill_<n>` du templet ; les
`SkillSubType == PASSIVE` posent leurs `BuffID` en PERMANENT au combat quand la
ligne de buff a `BuffCreateType == PASSIVE` (les autres `BuffCreateType` sont
des créations DYNAMIQUES — `ON_TURN`, `SKILL_FINISH`… — dépendantes de l'état
du combat). Ce sont de VRAIS buffs de `BuffTemplet` : mêmes familles `BT_*`,
mêmes canaux d'agrégation § 9/§ 16.1 — décision Sevih 05/08/2026 : « c'est un
débuff comme un autre », on ne trafique JAMAIS les stats saisies pour les
simuler.

**Classement par `TargetType`** (point de vue du boss) : `ENEMY_TEAM*` =
l'équipe du JOUEUR (ex. « Starving Devil » de l'Unidentified Chimera, stage 12,
skill 131113 : `4076007_15_1` crit +1000 ‰ forcé + `4076007_15_2` crit dmg
−850 ‰, tous deux `BT_STAT OAT_ADD` permanents et indélébiles
`IsIgnoreInterruption`) ; `ME`/`MY_TEAM` = le boss lui-même (réductions de
dégâts, ex. buffs génériques `1`/`2`/`3` : `BT_DMG_REDUCE OAT_RATE` −150/+500/
+500 conditionnés à l'élément de l'attaquant).

**Conditions élémentaires** : `ATTACKER_ELEMENT_WIN/EQUAL/LOSE`
(`BUFF_CONDITION_TYPE` 123-125) s'évaluent par `CheckElementWin` →
`ELEMENT_SUPERIORITY_TYPE`, enum à TROIS valeurs (`ATTACKER_WIN`/`EQUAL`/
`ATTACKER_LOSE`) : **EQUAL est le « ni avantage ni désavantage »** (couvre
même-élément ET les hors-cycle type lumière vs terre), pas « même élément ».
C'est la MÊME relation que le taux élémentaire § 6 — corroboré par la desc du
passif (le monde y est partagé en « Fire / non-Fire » pour un boss terre).
Toute autre condition (`OWNER_HAS_BUFF` — le WG reduce sous bouclier de rage —,
`OWNER_RAGE`…) dépend de l'état du combat : non évaluable statiquement.

> RÉALISÉ (05/08/2026) : `src/lib/damage/passives.ts` —
> `staticBossPassives(monsterId)` (targets.json → skills PASSIVE → buffs.json,
> 650/650 passifs mono-niveau, garde datagen) classe les lignes par côté ;
> `resolveBossPassives` évalue les conditions élémentaires via
> `getElementSuperiority` (§ 6). `buildDamageReport` verse les entrées actives
> dans `attackerBuffs`/`defenderBuffs` (le crit forcé passe par le canal
> § 16.1 → la branche critique devient P = 1 dès que la CHC est saisie) et
> expose `result.bossPassives` (harnais). NON appliqué et SIGNALÉ
> (`unresolved`, contribution 0) : `BT_WG_DMG_REDUCE` (agrégation jauge non
> désassemblée § 12.3), conditions non élémentaires, `BT_STAT` sur le boss
> (canal défenseur non consommé — aucun cas statique en 1.4.9). Ignorés
> silencieusement (documenté) : `BT_DMG*` sortants du boss (le rapport ne
> calcule jamais les dégâts de la cible) et les soins/CP/boucliers. Côté UI,
> le preset porte `monsterId` (pont + resolvers) et la section buff/débuff
> affiche les chips AUTO « passif du boss » (nom localisé du skill, jamais
> togglables, état actif/inactif selon l'élément de l'attaquant courant).

## 17. Agrégation des couches — CCharacterData.CalcStat (0x2904780) et satellites

Le mapping templet → 13 paramètres de CalcFinalStat, extrait fonction par fonction
(listings `CCharacterData_*.asm`, `CStatValue_SetAwakeningNodeStatValue.asm`,
`CItem*.asm`).

### 17.1 Orchestration (CalcStat, 876 o)

```text
CalcStat():
  CalcBasicStats()                        // § 17.2 — base par niveau, par stat
  si Templet.Type == CT_PC:
    CalcEvolutionStats()                  // § 17.3
    CalcTranscendentStarStats()           // taux HP/ATK/DEF de CharacterTranscendentTemplet
    CalcArchiveStats()                    // § 17.3
  CalcSetItem()                           // options d'items + sets (§ 15/17.5)
  pour chaque stat: SetItemOptionValue / SetBuffValue…  // agrégats par stat
  CreateBuffSetItem()                     // buffs de sets (§ 15)
  CalcPvpRealtimeFieldSkillStats()        // bonus plat § 16
  CalcAwakeningNodeStats()                // § 17.4 — l'éveil passe EN DERNIER
```

### 17.2 CalcBasicStats (0x2906660) — appels SetBaseValue par stat

Chaque stat reçoit `SetBaseValue(min, max, level, spawnAdv, addRate, this)` (§ 3.2)
avec les paires Min/Max du CharacterTemplet. Particularités :

- `spawnAdv` n'est passé que pour ATK/DEF/HP/SPEED, depuis les champs
  `SpawnAdvantageRate{Atk,Def,HP,Spd}` (remplis par les colonnes
  `SpawnAdvantageRate_*` des tables de contenu — monstres).
- `addRate` n'existe que pour ATK (`AddRateAtk`, 0xC0) et DEF (`AddRateDef`, 0xC4) —
  posés par `SetStatValue(ST_ATK|ST_DEF, v)`, dont la seule source combat est
  l'overgrade du boss de guild raid (§ 12.13, RÉSOLU) ; défaut 0.
- Les stats sans paire Min/Max partent de 0.

### 17.3 Évolution (cumulative) et archive

- `GetEvolutionStat(this, cumulatif=1, 0)` (0x2908A60) : parcourt les lignes
  `CharacterEvolutionStatTemplet` du perso et **somme** les `RewardValue_i` de
  TOUTES les lignes avec `EvolutionLevel ≤ niveau d'évolution courant`
  (`AddEvolutionStatToDictionary` : `dict[stat] += value`). Valeurs **plates**.
- `CalcArchiveStats` (0x2907B28) : ligne `CharacterArchiveStatTemplet` d'ID
  `ArchiveStatID` → `SetArchiveStatValueRate` sur ATK (+0x14), DEF (+0x16),
  HP (+0x18) — **taux**, ces trois stats seulement.
- `CalcTranscendentStarStats` (0x29078DC) : ligne `(BasicStar, TransStar)` de
  `CharacterTranscendentTemplet` → taux `RewardHPRate`/`RewardAtkRate`/
  `RewardDefRate` sur HP/ATK/DEF — confirme § 3 (les autres stats → 0).

### 17.4 Éveil et Monad (mêmes règles, code identique au champ près)

`CalcAwakeningNodeStats` (0x2905578) parcourt les nœuds débloqués :

- Les nœuds de **type 2** (skill) sont ignorés pour les stats.
- `CheckNodeApply` (0x2908E44) filtre : l'`AwakeningApplyType` compare
  `AwakeningApplyTypeValue` à l'élément/classe/race du perso ; les nœuds
  « licence » (type 5) ne s'appliquent que si
  `CDungeonScene.IsApplyAwakeningNodeAdventureLicense()` — **dépendant du
  contenu** ; type 3 réservé à certains IDs (198–201) et types de perso.
- `OptionType == IOT_BUFF` → chaque `BuffID` est résolu en `CBuffTemplet`
  **niveau 1** et rejoint la liste de buffs (appliqué comme un buff ordinaire).
- `OptionType == IOT_STAT` → groupé par `StatType`, puis
  `CStatValue.SetAwakeningNodeStatValue` (0x29FC228) : remise à zéro puis, pour
  chaque templet du groupe, `ApplyingType == OAT_ADD (1)` → **somme plate**
  (`awakeningValue`), `OAT_RATE (2)` → **somme de taux** (`awakeningValueRate`).

`CalcMonadGateEnchantNodeStats` / `SetMonadGateEnchantNodeStatValue` (0x29FC46C) :
diff instruction par instruction = identique à l'éveil (champs monad à la place).

### 17.5 Options d'équipement — CItem (enchant, break limit, singularité)

`CItem.InitializeOptionData` (0x2340FF0) construit les options d'une pièce :

```text
enchantFactor     = Σ float32 UpgradeFactorforOP des lignes ItemEnchantTemplet
                    (ItemSubType de la pièce, EnchantLevel 1..enchant)   // GetEnchantFactor
breakLimitFactor  = Σ float32 des valeurs BreakLimit [0..breakCount-1]   // GetBreakLimitFactor
singularityFactor = analogue (SingularityEquipEnchantTemplet)            // GetSingularityFactor

option PRINCIPALE (CItemMainOption.get_OptionValue, 0x233F1B0, float32) :
  final = trunc_f32(OptionValue × (1 + enchantFactor + singularityFactor)
                                × (1 + breakLimitFactor))
  ordre exact : t = fround(enchantFactor + 1) ; t = fround(t + singularityFactor) ;
                t = fround(t × (float)OptionValue) ; t = fround(t × fround(breakLimitFactor + 1)) ;
                final = trunc(t)   // fcvtzs, +∞ → int.MinValue jamais atteint
```

- Les **sub-options ne sont PAS multipliées** par ces facteurs (leurs valeurs sont
  stockées telles quelles ; leur croissance passe par des re-tirages — hors calcul).
- Option principale de type **buff** (EE, etc.) : le `CBuffTemplet` est résolu au
  **niveau `enchantLevel + 1`** si la pièce est enchantable en spécial, niveau 1
  sinon — c'est ainsi que l'effet unique d'un EE grandit avec l'enchant.
- Options de set (`ItemSpecialOptionTemplet`) : sélection par niveau
  (`max(enchant, 1)` pour les enchantables), une ligne `IsAdd=false` remplace les
  niveaux inférieurs, `IsAdd=true` s'ajoute.

### 17.6 Pénalités PvP (UpdatePvpTurnPenalty, 0x259F724)

Cycle : premier déclenchement au tour `PVP_ATK_PENALTY_START_TURN` (10), puis tous
les `PVP_ATK_PENALTY_LOOP_TURN` (5) tours. À chaque cycle :

```text
scene.pvpAtkDmgRate   = (précédent ou PVP_ATK_PENALTY_DMG_RATE=100) + 30/cycle  // SANS cap
scene.pvpHealReduce   = (0 → 500) puis +250/cycle, min(…, 1000)                  // cap 100 %
chaque attaquant vivant : AddHP(−MulPermille(MaxHP, pvpAtkDmgRate),
                                bHeal=false, bIgnoreUndead=TRUE)
```

Les « dégâts de pénalité » sont donc des pertes de PV directes (% des PV max,
passent par l'absorption de shield § 14.3, percent UNDEAD) — pas une baisse d'ATK.
Avant le premier cycle, `pvpHealReduce = 0` : **les soins PvP ne sont pas réduits
en début de match**.
