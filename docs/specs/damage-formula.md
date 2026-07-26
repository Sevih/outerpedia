# Formules de dégâts — Outerplane (extraites du binaire)

> **Source de vérité** : `libil2cpp.so` ARM64, APK 1.4.9 (APKPure), classe `CFormula`
> (TypeDefIndex 7258) + méthodes satellites de `CCharacterBattle` / `CCharacterData` /
> `CCommonDefine`. Désassemblage ciblé capstone (mapping VA→offset via program headers
> ELF), cibles `bl` résolues par `script.json` d'Il2CppDumper. Les listings annotés sont
> dans [damage-formula-asm/](./damage-formula-asm/) ; les scripts de génération dans
> `.gamedata/apk/dump_cformula.py` et `dump_deps.py`.
>
> **Règle de rédaction** : chaque pseudo-code ci-dessous est la traduction fidèle de
> l'asm (ordre des opérations, arithmétique entière vs flottante, arrondis, clamps).
> Aucune formule n'est devinée ; toute zone non désassemblée est signalée en § 12.

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
- `CCommonDefine.MulPermille(v, p)` = `div1000(v × p)` (RVA 0x28D81C0).
- `CCommonDefine.ApplyRate(v, r)` = `div1000(v × (1000 + r))` (RVA 0x28D18E4).

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
- `BUFF_TYPE` (extraits pertinents pour les dégâts) : 3 INVINCIBLE, 5 MARKING,
  85–108 famille `BT_DMG_*` (voir § 9), 110 DMG_REDUCE, 113 DMG_REDUCE_MY_TEAM_INCREASE,
  114–116 DMG_REDUCE_FINAL*, 136 SHARE_DMG, 137 SHARE_DMG_MULTI, 149 STEALTHED.

Les stats finales d'un personnage vivent dans `CCharacterData.StatDict[STAT_TYPE]`
(recalcul lazy par `CCharacterData.CalcStat`) ; chaque getter (`get_Def`,
`get_CriticalRate`…) lit simplement cette entrée. Le recalcul par stat passe par
`CFormula.CalcFinalStat` (§ 3).

## 3. CalcFinalStat — RVA 0x2C59E48

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

### 3.1 CalcStat — RVA 0x2C59DB0 (stat de base par niveau)

En amont : le `base` fourni à CalcFinalStat sort de
`CFormula.CalcStat(min, max, level)` (division magique `0xA57EB50295FAD40B`,
shift 6 = ÷99 signé tronqué vers zéro, vérifiée sur 200 000 triplets) :

```text
CalcStat(min, max, level) = min + trunc((level − 1) × (max − min) / 99)
```

Interpolation **linéaire** entre la stat niveau 1 (`min`) et la stat
niveau 100 (`max`), en 99 pas ; `level = 100` redonne exactement `max`.
Aucune courbe, aucun palier.

### 3.2 SetBaseValue — RVA 0x28D16BC (niveau > 100 et addRate)

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
- `addRate` : multiplicateur appliqué directement à la base (qui l'utilise et avec
  quelles valeurs : non tracé, § 12.13).
- `CCustomBossStatValue.SetBaseValue` (0x28D3DC4) : pour ST_HP, `base = max − min` ;
  pour les autres stats, CalcStat normal.

## 4. Probabilités — CheckProbability* (0x2C59DE8 / 0x2C59E30 / 0x2C59E3C)

```text
CheckProbability(value, max, isAuto):
  if value < 1: return false
  roll = isAuto ? UnityEngine.Random.Range(0, max+1)   // uniforme [0, max]
                : GetBattleRandomRange(0, max)         // idem [0, max] inclus
  return roll <= value
```

- `CheckProbabilityPercent(v, isAuto)` = `CheckProbability(v, 100, isAuto)`.
- `CheckProbabilityPermille(v, isAuto)` = `CheckProbability(v, 1000, isAuto)`.
- `GetBattleRandomRange(min, max)` (0x2C59CE0) : en PvP temps réel, RNG synchronisé du
  match (`CPvpRealtimeMatch.GetRandomRange`) ; sinon `Random.Range(min, max+1)` →
  **entier uniforme inclusif** `[min, max]`.
- Conséquence : P(succès) = `(value+1)/(max+1)` pour `1 ≤ value ≤ max` (ex. 50 ‰ affiché
  → 51/1001 réels), 0 % si `value < 1`, 100 % si `value ≥ max`.

## 5. CheckResist — RVA 0x2C5A388 (résistance aux effets)

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

## 6. Élément — GetElementSuperiority (0x2C5AC64) & GetElementeryDamageRate (0x2C5AB60)

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

- `FindBuffElementDamageRate` (0x26DF700) = **somme** des `Value` des buffs
  BT_DMG_ELEMENT_ENCHANT (95) disponibles. Ne s'applique **que** quand l'attaquant a
  l'avantage (réel ou forcé par le buff 94).
- Avantage = ×1,2 ; désavantage = ×0,8 ; neutre = ×1,0.

## 7. CheckDamageRate — RVA 0x2C5A448 (fixe le résultat et le taux du hit)

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

`AddCheckEnemyTeamDecreaseDamageRate(Attacker, count, ref rate)` (0x2C5ACF8) —
appelé par le code d'attaque (hors CFormula) pour les compétences dont la cible
« décroît » : `rate += FindBuffEnemyTeamDecreaseDamageRate(Attacker) × count`
(somme des buffs BT_DMG_ENEMY_TEAM_DECREASE (96) × nombre de cibles décomptées).

## 8. CalcDamage — RVA 0x2C5AD30 (+ helper local 0x2C5B4DC)

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

### 8.2 Le cœur — `<CalcDamage>g__CalcDamage|17_0` (0x2C5B4DC)

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

## 9. Agrégation des buffs de taux (CCharacterBattle)

### 9.1 FindBuffAdditionalDamage (0x26DD9B4) — buffs de l'ATTAQUANT, somme (‰)

Parcourt `m_BuffList` de l'attaquant ; chaque buff passe `CheckAvailable` (conditions
internes au buff : cible, stacks, cooldown d'application — non désassemblé, § 12) :

| BT  | Nom                     | Contribution                                                     |
| --- | ----------------------- | ---------------------------------------------------------------- |
| 85  | DMG                     | `+Value` (condition évaluée contre le défenseur)                 |
| 86  | DMG_OWNER_LOST_HP_RATE  | `+GetLostHPRateValue(attaquant, Value)`                          |
| 87  | DMG_TARGET_LOST_HP_RATE | `+GetLostHPRateValue(défenseur, Value)`                          |
| 88  | DMG_OWNER_STAT          | `+min(GetStatValuePermille(att.Data, StatType, Value), 1000)`    |
| 89  | DMG_TARGET_STAT         | idem sur les stats du **défenseur**, cap 1000                    |
| 90  | DMG_OWNER_BUFF          | `+Value × nb de buffs (positifs) de l'attaquant`                 |
| 91  | DMG_TARGET_BUFF         | `+Value × nb de buffs de att.TargetCharacter`                    |
| 92  | DMG_OWNER_DEBUFF        | `+Value × nb de débuffs de l'attaquant`                          |
| 93  | DMG_TARGET_DEBUFF       | `+Value × nb de débuffs de att.TargetCharacter`                  |
| 97  | DMG_TARGET_BREAK        | `+Value` si la cible est en Break (`RageManager.IsBreak`)        |
| 98  | DMG_TO_BOSS             | `+Value` si `target.Data.Type > 3` (types boss)                  |
| 99  | DMG_KILL_COUNT_STACK    | `+Value` (stacks gérés dans CheckAvailable/Value)                |
| 100 | DMG_NOT_CRITICAL        | `+Value` si résultat ∈ {NORMAL, MISSED}                          |
| 101 | DMG_PVP_CONTENT         | `+Value` si scène PvP                                            |
| 102 | DMG_CASTER_STAT         | `+min(GetStatValuePermille(caster.Data, StatType, Value), 1000)` |
| 103 | DMG_CASTER_LOST_HP_RATE | `+GetLostHPRateValue(caster du buff, Value)`                     |
| 105 | DMG_OWNER_TEAM_BUFF     | `+Value × Σ buffs (positifs) de l'équipe du caster`              |
| 106 | DMG_MY_TEAM_DECREASE    | `+Value × (4 - alliés vivants de l'équipe du caster)`            |
| 107 | DMG_MONADGATE_CONTENT   | `+Value` si scène Monad Gate                                     |
| 108 | DMG_TOWER_CONTENT       | `+Value` si mode Tour                                            |

Puis, en PvP temps réel : `+ CurrentMatchInfo.FieldSkillDmg`.

Helpers numériques (exacts) :

- `GetLostHPRateValue(c, v)` (0x26C6CBC) = `trunc((MaxHP - HP) × v / MaxHP)`, 0 si MaxHP < 1.
- `GetStatValuePermille(data, type, p)` (0x27E14B8) = `div1000(GetStatValue(type) × p)`,
  0 si type NONE, `INT32_MAX` si le produit dépasse int32 après division. Les usages
  ci-dessus passent ensuite par `min(·, 1000.0f)` + `Math.Round` half-to-even (sans
  effet sur un entier) : **cap à 1000 ‰**.

### 9.2 FindBuffDamageReduce (0x26DEBD8) — buffs du DÉFENSEUR, somme (‰)

| BT  | Nom                         | Contribution                                                                         |
| --- | --------------------------- | ------------------------------------------------------------------------------------ |
| 110 | DMG_REDUCE                  | `+Value` si `CheckAvailable(attaquant)` et `ApplyingType == 2`                       |
| 149 | STEALTHED                   | `+Value` si le skill de l'attaquant n'est **pas** mono-cible (`SkillRangeType != 1`) |
| 113 | DMG_REDUCE_MY_TEAM_INCREASE | `+Value × (alliés vivants du caster - 1)`                                            |

### 9.3 GetBuffDamgeFinalReduce (0x26DF06C) — défenseur, **MAX** (‰), pas somme

Multiplicatif final `(1000 - r)/1000` dans § 8.2. `r` = maximum parmi :

- BT 114 DMG_REDUCE_FINAL : `Value` (si CheckAvailable vs attaquant).
- BT 115 DMG_REDUCE_FINAL_MY_TEAM_INCREASE : `Value × (alliés vivants du caster - 1)`.
- BT 116 DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL : `Value` si le skill de l'attaquant
  n'est pas le skill 1 (`SkillRecord.SkillType != 0`) ; sinon buff seulement consommé.

## 10. Stats d'entrée

### 10.1 GetAttackStat (0x26E02A4)

```text
if Attacker a un buff BT_SWAP_STAT_ATTACK (109) disponible :
  stat = Attacker.Data.GetFinalStat(buff.StatType)
  return (buff.ApplyingType == 2) ? MulPermille(stat, buff.Value) : stat + buff.Value
return Attacker.Data.Attack        // stat finale ST_ATK (4), buffs inclus
```

### 10.2 Getters `CCharacterData.get_*`

Tous identiques (ex. `get_Def` 0x27E00D8) : recalcul lazy (`CalcStat`) si dirty, puis
`StatDict[type].Value`. Les stats finales incluent base/évo/éveil/monad/trans/archive/
items/buffs via `CalcFinalStat` (§ 3). Le détail de `CCharacterData.CalcStat`
(assemblage des 13 paramètres par stat) n'a pas été désassemblé ici (§ 12).

## 11. Fonctions annexes

### CalcDamageDOT (0x2C5BC6C) — dégâts sur la durée

Entrées : `attackRate` (‰, du templet de buff DOT) et `statValue` (stat de référence
capturée). **Ignore** élément, crit, taux de § 7 ; seule mitigation : défense + DMG_REDUCE.

```text
defTerm  = max(def × max(0, 1000 - ppRate) - pp × 1000, -999000)   // même forme que § 8.2
reduce   = min(Defender.Data.DMGReduceRate, 900)                    // cap 90 %
d = trunc( attackRate × statValue × 1_000_000 / (1_000_000 + defTerm) )
d = trunc( d × (1000 - reduce) / 1_000_000 )
return d                                                            // PAS de clamp ≥ 1
```

### CalcDamageWG (0x2C5BDBC) — dégâts de jauge de faiblesse

```text
if Defender.FindBuffWGInvincible(Attacker): return 0        // BT_WG_INVINCIBLE (82)
wg = customValue != 0 ? customValue
                      : Attacker.UsingSkill.WGReduce         // byte du SkillLevelTemplet
(flat, rate) = Defender.FindBuffWGDamageReduce(Attacker)     // BT 83/84, non désassemblé
return max(0, ApplyRate(flat + wg, rate))                    // = div1000((flat+wg)×(1000+rate))
```

### CalcCharacterSharedDamage (0x2C5B778) — partage de dégâts

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
2. ~~`CCharacterData.CalcStat`~~ — **RÉSOLU** : le mapping complet templet → 13
   paramètres est désormais extrait, voir § 17.
3. **`FindBuffWGDamageReduce`** (BT 83/84) : les deux sorties (flat, rate) sont
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
   0x255A430 + `CStateBattle.PvpAttackTeamPenaltyDmg`, § 17.6) : première pénalité au
   tour `PVP_ATK_PENALTY_START_TURN` (10), puis tous les `…_LOOP_TURN` (5) tours.
   À chaque cycle : (a) chaque attaquant vivant subit
   `AddHP(−MulPermille(MaxHP, dmgRate))` avec `dmgRate` = 100 ‰ puis +30 ‰/cycle,
   **sans cap**, `bIgnoreUndead=true` (perce UNDEAD) ; (b) la réduction de soins de
   la scène (`[scene+0x100]`, lue par § 14.2) passe de **0** (avant le premier
   cycle, les soins PvP ne sont PAS réduits) à 500 ‰, puis +250 ‰/cycle,
   **cap 1000 ‰** (`min(x, 1000)`).
8. **`CBattleManager.ProcessDamageOverTime`** : le tick périodique des DOT (qui appelle
   `CalcDamageDOT` § 11 avec la stat capturée) et l'ordre exact des ENHANCE
   (BT 66–74) n'ont pas été désassemblés ; seul le déclenchement « immédiat »
   (BT 60–65, § 14.6) l'a été.
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
13. **`addRate` de `SetBaseValue`** (§ 3.2) : identifié comme
    `CCharacterData.AddRateAtk`/`AddRateDef` (champs 0xC0/0xC4 — seuls ATK et DEF
    en ont). Les écritures sont inlinées (aucun `bl` vers les setters) : la source
    de la valeur reste non tracée. Défaut 0 pour le calculateur.
14. **Colonnes `Normal_i`/`Magic_i`/`Rare_i`/`Unique_i` de `ItemEnchantTemplet`** :
    consommateurs non tracés (getters inlinés). Hors chemin de calcul déterministe —
    la croissance des stats à l'enchant passe par `UpgradeFactorforOP` (§ 17.5) et
    les sub-options effectives d'une pièce sont une entrée utilisateur.

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

## 14. Soins, shields, reverse heal, WG — CBuff.OnCreate (0x22FC71C) & AddHP (0x26C5FD8)

Ces mécaniques ne sont pas dans `CFormula` : ce sont des **buffs**, résolus dans le
dispatch `CBuff.OnCreate` (~12,7 Ko, table de saut sur BUFF_TYPE 10–81) et appliqués
via `CCharacterBattle.AddHP`. Listings : `CBuff_OnCreate.asm`, `CCharacterBattle_AddHP.asm`,
`CBuff_get_Value.asm`, `CBuff_CheckReverseHealCAP.asm`, `CCharacterBattle_SetShieldHP.asm`.

### 14.1 Valeur d'un buff et enhance

- `CBuff.Value` (0x22F4B38) = `Templet.Value × StackCount` — **linéaire en stacks**,
  partout (dégâts § 9, soins, shields…).
- Buffs de stat (BT 27/28 STAT_BUFF/DEBUFF_ENHANCE sur le porteur) : la valeur
  effective du buff de stat posé devient `ApplyRate(value, enhance.Value)`
  = `trunc(value × (1000 + enhance) / 1000)` (stockée en `InstanceValue`).
- BT 31 STAT_OWNER_LOST_HP_RATE : `InstanceValue = GetLostHPRateValue(owner, value)`.
- BT 32 …_HALF : `hpEff = clamp(2×HP − MaxHP, 0, MaxHP)` puis
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

### 14.4 Shields (BT 19 SHIELD_BASED_CASTER / 20 SHIELD_BASED_TARGET)

```text
shield = (Templet.StatType != 0)
           ? GetStatValuePermille(source.Data, StatType, value)  // source = caster (19) ou porteur (20)
           : value
SetShieldHP(owner, shield)     // REMPLACE m_nShieldHP (aucun cumul), mémorise le max pour la jauge
```

Pas de réduction PvP sur les shields. La consommation est dans AddHP (§ 14.3) ;
`RemoveBuffShield` retire le buff quand le shield tombe à 0.

### 14.5 Reverse heal (BT 16 REVERSE_HEAL_BASED_CASTER / 17 …_TARGET, cap BT 18)

```text
v = (Templet.StatType != 0) ? GetStatValuePermille(source.Data, StatType, value) : value
v = CheckReverseHealCAP(v)     // min(v, plus petit BT_REVERSE_HEAL_CAP (18) dont la condition passe)
if HP + ShieldHP > v:
  AddHP(owner, -v, bIgnoreHealModifier…)      // passe par le shield, ignore la mitigation de dégâts
else:                                          // serait létal
  if scène ∈ {GuildDungeon, EventChallenge, WorldBoss, MonadGateSingularity} ou owner.IsBoss:
    AddHP(owner, -v)                           // peut tuer
  else:
    AddHP(owner, 1 - (HP + ShieldHP))          // laisse exactement 1 (PV+shield)
```

Le reverse heal ignore défense, élément, crit et DMG_REDUCE — c'est une perte de PV
brute, pas un dégât.

### 14.6 Jauge de faiblesse et DOT immédiats

- BT 80 WG_HEAL : `wg += (ApplyingType == 2) ? MulPermille(MaxWG, value) : value`.
- BT 84 WG_DMG : si la cible peut perdre du WG :
  `wg -= CalcDamageWG(caster, owner, (ApplyingType == 2) ? MulPermille(MaxWG, value) : value)`.
- BT 60–65 IMMEDIATELY_(BURN…) : chaque DOT du type correspondant déjà présent sur la
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

   Le collecteur central `CSkillManager.GetBuffList` (RVA 0x24D3138, listing
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
   (0x24D655C) refuse le déclenchement tant que `compteur < BuffCool` puis le
   remet à zéro ; `AddItemBuffCool` incrémente le compteur (cadence
   d'incrémentation non désassemblée).

## 16. Couches contextuelles au-dessus de CalcFinalStat — CStatValue (audit de couverture)

La stat lue en combat est `CStatValue.GetFinalValue` (0x28D33B4), pas la sortie brute
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
| CheckProbability / …Percent / …Permille                      | § 4 (wrappers vérifiés : `b` vers 0x2C59DE8 avec max=100/1000)      |
| CheckResist                                                  | § 5                                                                 |
| GetElementSuperiority / GetElementeryDamageRate              | § 6                                                                 |
| CheckDamageRate / AddCheckEnemyTeamDecreaseDamageRate        | § 7                                                                 |
| CalcDamage + helper local `g__CalcDamage\|17_0`              | § 8                                                                 |
| CalcDamageDOT / CalcDamageWG / CalcCharacterSharedDamage     | § 11                                                                |
| InitRandomSeed / GetRandomRange ×2 / GetBattleRandomRange ×2 | RNG — tirages injectés dans le moteur (§ 4)                         |
| Approximately                                                | comparaison float à tolérance, aucun appel dans les formules        |
| CalcBattlePower (0x2C59EE4)                                  | **hors périmètre** : calcul du CP affiché, ne touche pas aux dégâts |

Ce qui s'applique **hors combat vs en combat** :

- Permanents (partout, via CalcFinalStat) : évolution, éveil, monad, transcendance,
  archive, items ; les stats affichées hors combat = même pipeline sans `buffVal`/`buffRate`.
- Combat/contenu uniquement : buffs (§ 9/14/15), pénalités PvP (soins § 14.2, ATK
  § 12.7), field skills PvP temps réel (plat, ci-dessus), caps de stat par scène,
  override synchro (`TempMaxValue`), avantage d'apparition (`spawnAdvantageRate`,
  monstres PvE), listes de buffs par contenu (§ 15).
- Jamais en combat : ST_GET_GOLD_RATE (20), ST_GET_CHARACTER_EXP_RATE (21)
  (économie), et de fait ST_ACCURACY (13).

## 17. Agrégation des couches — CCharacterData.CalcStat (0x27E2870) et satellites

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

### 17.2 CalcBasicStats (0x27E4750) — appels SetBaseValue par stat

Chaque stat reçoit `SetBaseValue(min, max, level, spawnAdv, addRate, this)` (§ 3.2)
avec les paires Min/Max du CharacterTemplet. Particularités :

- `spawnAdv` n'est passé que pour ATK/DEF/HP/SPEED, depuis les champs
  `SpawnAdvantageRate{Atk,Def,HP,Spd}` (remplis par les colonnes
  `SpawnAdvantageRate_*` des tables de contenu — monstres).
- `addRate` n'existe que pour ATK (`AddRateAtk`, 0xC0) et DEF (`AddRateDef`, 0xC4) —
  écritures inlinées non tracées (§ 12.13), défaut 0.
- Les stats sans paire Min/Max partent de 0.

### 17.3 Évolution (cumulative) et archive

- `GetEvolutionStat(this, cumulatif=1, 0)` (0x27E6B50) : parcourt les lignes
  `CharacterEvolutionStatTemplet` du perso et **somme** les `RewardValue_i` de
  TOUTES les lignes avec `EvolutionLevel ≤ niveau d'évolution courant`
  (`AddEvolutionStatToDictionary` : `dict[stat] += value`). Valeurs **plates**.
- `CalcArchiveStats` (0x27E5C18) : ligne `CharacterArchiveStatTemplet` d'ID
  `ArchiveStatID` → `SetArchiveStatValueRate` sur ATK (+0x14), DEF (+0x16),
  HP (+0x18) — **taux**, ces trois stats seulement.
- `CalcTranscendentStarStats` (0x27E59CC) : ligne `(BasicStar, TransStar)` de
  `CharacterTranscendentTemplet` → taux `RewardHPRate`/`RewardAtkRate`/
  `RewardDefRate` sur HP/ATK/DEF — confirme § 3 (les autres stats → 0).

### 17.4 Éveil et Monad (mêmes règles, code identique au champ près)

`CalcAwakeningNodeStats` (0x27E3668) parcourt les nœuds débloqués :

- Les nœuds de **type 2** (skill) sont ignorés pour les stats.
- `CheckNodeApply` (0x27E6F34) filtre : l'`AwakeningApplyType` compare
  `AwakeningApplyTypeValue` à l'élément/classe/race du perso ; les nœuds
  « licence » (type 5) ne s'appliquent que si
  `CDungeonScene.IsApplyAwakeningNodeAdventureLicense()` — **dépendant du
  contenu** ; type 3 réservé à certains IDs (198–201) et types de perso.
- `OptionType == IOT_BUFF` → chaque `BuffID` est résolu en `CBuffTemplet`
  **niveau 1** et rejoint la liste de buffs (appliqué comme un buff ordinaire).
- `OptionType == IOT_STAT` → groupé par `StatType`, puis
  `CStatValue.SetAwakeningNodeStatValue` (0x28D38A8) : remise à zéro puis, pour
  chaque templet du groupe, `ApplyingType == OAT_ADD (1)` → **somme plate**
  (`awakeningValue`), `OAT_RATE (2)` → **somme de taux** (`awakeningValueRate`).

`CalcMonadGateEnchantNodeStats` / `SetMonadGateEnchantNodeStatValue` (0x28D3AEC) :
diff instruction par instruction = identique à l'éveil (champs monad à la place).

### 17.5 Options d'équipement — CItem (enchant, break limit, singularité)

`CItem.InitializeOptionData` (0x230F9C4) construit les options d'une pièce :

```text
enchantFactor     = Σ float32 UpgradeFactorforOP des lignes ItemEnchantTemplet
                    (ItemSubType de la pièce, EnchantLevel 1..enchant)   // GetEnchantFactor
breakLimitFactor  = Σ float32 des valeurs BreakLimit [0..breakCount-1]   // GetBreakLimitFactor
singularityFactor = analogue (SingularityEquipEnchantTemplet)            // GetSingularityFactor

option PRINCIPALE (CItemMainOption.get_OptionValue, 0x230DB18, float32) :
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

### 17.6 Pénalités PvP (UpdatePvpTurnPenalty, 0x255A430)

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
