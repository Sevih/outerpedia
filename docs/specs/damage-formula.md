# Formules de dégâts — Outerplane (extraites du binaire)

> **Source de vérité** : `Assembly-CSharp.dll` du **client Steam** (Mono — 1.4.15 au
> 26/08/2026), décompilé en C# lisible et non obfusqué par `ilspycmd`
> (`pnpm datagen:dump-steam`, racine `.gamedata-steam/`) : classe `CFormula` +
> méthodes satellites de `CCharacterBattle` / `CCharacterData` / `CStatValue` /
> `CBuff` / `CCommonDefine`. Les listings cités vivent dans
> [damage-formula-cs/](./damage-formula-cs/) — un fichier par entrée du manifeste
> [datagen/extract/listings.json](../../datagen/extract/listings.json), régénérés À
> CHAQUE PATCH par `pnpm datagen:extract-cs` (particularités en tête de
> [extract-cs.ts](../../datagen/extract/extract-cs.ts) : un listing porte TOUTES les
> surcharges, `get_X` = la propriété entière, les noms fabriqués par le compilateur
> sont repliés dans leur méthode porteuse). Le code complet est dans
> `.gamedata-steam/apk/dumped/src/` (un type par fichier) et `dump.cs` (à plat, pour
> grep) — pour tout ce qui dépasse les listings. Toute méthode que ce document se met
> à citer doit être AJOUTÉE au manifeste, sinon son listing n'existe pas.
>
> **Jusqu'au 25/08/2026** la source était `libil2cpp.so` ARM64 de l'APK Android
> (désassemblage capstone). Ces listings, dans
> [damage-formula-asm/](./damage-formula-asm/), sont FIGÉS à 1.4.15 Android et ne
> seront plus régénérés : témoin lisible, mais en cas d'écart C# ↔ ASM **le C# fait
> foi** (c'est la source, l'ASM en est la compilation) — un écart se NOTE dans la
> section concernée, jamais résolu au jugé. Les RVA n'ont plus de sens : l'identifiant
> d'une méthode est son NOM (`Classe$$Membre`). Migration faite section par section
> le 26/08/2026 : TOUTES les sections sont relues sur le C# — chaque écart avec la
> lecture ASM est noté dans sa section, daté, avec le listing qui le tranche.
>
> **Règle de rédaction** : chaque pseudo-code ci-dessous est la traduction fidèle du
> code (ordre des opérations, entier vs flottant, arrondis, clamps). En C#, `/ 1000`
> sur `int`/`long` tronque vers zéro — c'est le `div1000` de ce document ; ce sont les
> TYPES (`int`, `long`, `float`) qui décident, pas les instructions. Aucune formule
> n'est devinée ; toute zone non lue est signalée en § 12.
>
> **Écart 1.4.9 → 1.4.14 (13/08/2026)** : sur 88 listings, 72 sont inchangés au
> comportement près et 3 ont bougé. Les trois sont désassemblés et rédigés
> (§ 8.5, § 9.2, § 14.5), et `BUFF_TYPE` a été **renuméroté** (§ 2 — les identifiants
> de ce document sont à jour, ne jamais reporter un numéro d'une version à l'autre).
> Le **moteur TS n'implémente aucun des trois** ; les inconnues de lecture que l'ASM
> laissait sont FERMÉES par le C# du client Steam (26/08/2026, § 12.16).

## 1. Conventions numériques

- **Tout est entier et en pour-mille (‰)** sauf mention contraire : `1000` = 100 %.
- `div1000(x)` : division **entière tronquée vers zéro** par 1000 — le `/ 1000` C# sur
  `int`/`long` (l'ASM l'implémentait par multiplication magique, même sémantique).
- `div1e6(x)` : idem par 1 000 000.
- Les produits intermédiaires sont calculés en **`long` (64 bits)** — les casts
  `(long)` sont explicites dans le code : pas d'overflow 32 bits intermédiaire. Le
  résultat final est repris en `int` par cast tronquant.
- Deux fonctions utilisent du **`float` (32 bits)** (voir `CheckResist` § 5 et
  HitRecovery § 8.4) ; `FloorToInt` = `Mathf.FloorToInt`, `RoundToInt` =
  `Mathf.RoundToInt`.
- `CCommonDefine.MulPermille(v, p)` = `(int)((long)v × p / 1000)` —
  [`MulPermille.cs`](./damage-formula-cs/MulPermille.cs).
- `CCommonDefine.ApplyRate(v, r)` = `(int)((long)v × (1000 + r) / 1000)` —
  [`ApplyRate.cs`](./damage-formula-cs/ApplyRate.cs).

## 2. Enums utiles (`src/<ENUM>.cs` du client Steam — en clair, séquentiels)

- `CHARACTER_ELEMENT_TYPE` : 0 Terre, 1 Eau, 2 Feu, 3 Lumière, 4 Ténèbres.
- `ELEMENT_SUPERIORITY_TYPE` : 0 ATTACKER_WIN, 1 EQUAL, 2 ATTACKER_LOSE.
- `DAMAGE_RATE_TYPE` (résultat d'un hit, `CSkillRecord.DamageRateType`) :
  0 NONE, 1 NORMAL, 2 CRITICAL, 3 MISSED, 4 INVINCIBLE.
- `STAT_TYPE` : 1 HP, 2 WG, 3 SPEED, 4 ATK, 5 DEF, 6 DMG_REDUCE_RATE, 7 CRITICAL_RATE,
  8 CRITICAL_DMG_RATE, 9 PIERCE_POWER, 10 PIERCE_POWER_RATE, 11 VAMPIRIC,
  12 HIT_HP_RECOVERY, 13 ACCURACY, 14 AVOID, 15 BUFF_CHANCE, 16 BUFF_RESIST,
  22 COUNTER_RATE, 23 AVOID_ADD_CAP, 24 AVOID_SUBTRACT_CAP, 25 DMG_BOOST,
  26 E_CRI_DMG_REDUCE.
- `BUFF_TYPE` (extraits pertinents pour les dégâts, **valeurs 1.4.15** —
  `BUFF_TYPE.cs`, enum séquentiel sans valeur explicite) : 3 INVINCIBLE, 5 MARKING,
  90–113 famille `BT_DMG_*` (voir § 9 — `BT_DMG` lui-même est 90),
  114 SWAP_STAT_ATTACK, 115 DMG_REDUCE, 118 DMG_REDUCE_MY_TEAM_INCREASE,
  119–121 DMG_REDUCE_FINAL*, 141 SHARE_DMG, 142 SHARE_DMG_MULTI, 154 STEALTHED.
  **1.4.15 n'a fait qu'ajouter en queue** : 156–162 `BT_IMMEDIATELY_*_CAP`,
  163 `BT_DOT_LIMIT`, 164 `BT_DMG_TARGET_DEBUFF_LIMIT`, 165 `BT_DMG_TARGET_BUFF_LIMIT`
  (§ 9.1) — rien n'a bougé avant.

> ⚠ **`BUFF_TYPE` a été RENUMÉROTÉ en 1.4.14.** L'insertion de
> `BT_REVERSE_HEAL_BASED_{CASTER,TARGET}_ABLE_KILL` en 18/19 (§ 14.5), puis d'autres
> membres plus loin, décale **tout ce qui suit** : le cap reverse heal passe de 18 à
> 20, les shields de 19/20 à 21/22, `DMG_REDUCE` de 110 à 115, `STEALTHED` de 149 à
> 154, les `IMMEDIATELY_*` de 60–65 à 63–69… Les 29 identifiants numériques cités
> dans ce document ont été réécrits le 13/08/2026 en résolvant chaque **nom** dans
> l'énumération 1.4.14 — ne jamais reporter un numéro d'une version à l'autre.
> Relecture du 26/08/2026 sur l'enum C# : six numéros avaient échappé à cette passe
> — `BT_DMG` (85 → 90), `BT_DMG_ELEMENT_SUPERIORITY` (94 → 99),
> `BT_DMG_ELEMENT_ENCHANT` (95 → 100), `BT_DMG_ENEMY_TEAM_DECREASE` (96 → 101),
> `BT_DMG_ELEMENT_INFERIORITY` (104 → 109), `BT_SWAP_STAT_ATTACK` (109 → 114) —
> corrigés dans § 6, § 7, § 9.1 et § 10.1.
>
> Le moteur TS et les tables générées ne sont **pas** touchés : ils clés sur le nom
> (`Type: 'BT_DMG_REDUCE'`), jamais sur l'entier. (Les deux commentaires du moteur
> qui portaient encore les anciens numéros sont corrigés le 26/08/2026 — § 12.16.)

Les stats finales d'un personnage vivent dans `CCharacterData.StatDict[STAT_TYPE]`
(recalcul lazy par `CCharacterData.CalcStat`) ; chaque getter (`get_Def`,
`get_CriticalRate`…) lit simplement cette entrée. Le recalcul par stat passe par
`CFormula.CalcFinalStat` (§ 3).

## 3. CalcFinalStat

Listing : [`CalcFinalStat.cs`](./damage-formula-cs/CalcFinalStat.cs). Signature :
`CalcFinalStat(base, spawnAdvRate, evo, awak, awakRate, monad, monadRate, transRate, archiveRate, itemVal, itemRate, buffVal, buffRate)`
— 13 `int`, calcul en `long`.

```text
flat  = base + evo + awak + monad                                  // valeurs plates
rate  = 1000 + spawnAdvRate + transRate + itemRate + awakRate + monadRate
sub   = div1000(flat × rate) + itemVal + buffVal
total = div1000(sub × (1000 + buffRate)) + div1000(base × archiveRate)
return Mathf.Max(0, (int)total)                     // cast int AVANT le clamp (§ 12.6)
```

Points fermes :

- Les **taux** (éveil, monad, transcendance, items, spawn advantage) s'additionnent en
  un seul multiplicateur commun appliqué au _flat_ (base+évo+éveil+monad plats).
- `itemVal` et `buffVal` (plats) s'ajoutent **après** ce multiplicateur, puis le
  `buffRate` multiplie **le tout** (y compris les plats item/buff).
- Le bonus d'archive s'applique **sur la stat de base seule** et s'ajoute à la fin.
- Clamp final à ≥ 0. Chaque division tronque vers zéro.

### 3.1 CalcStat — stat de base par niveau

Listing : [`CalcStat.cs`](./damage-formula-cs/CalcStat.cs). En amont : le `base` fourni
à CalcFinalStat sort de `CFormula.CalcStat(min, max, level)` :

```text
CalcStat(min, max, level) = (int)( (long)(max − min) × (level − 1) / 99 ) + min
```

Interpolation **linéaire** entre la stat niveau 1 (`min`) et la stat niveau 100
(`max`), en 99 pas (division `long` tronquée vers zéro, puis cast `int`) ;
`level = 100` redonne exactement `max`. Aucune courbe, aucun palier.

### 3.2 SetBaseValue — niveau > 100 et addRate

L'appelant réel de CalcStat côté personnages est
`CStatValue.SetBaseValue(min, max, level, spawnAdvRate = 0, addRate = 0, owner = null)`
— surcharge complète de [`CStatValue_SetBaseValue.cs`](./damage-formula-cs/CStatValue_SetBaseValue.cs)
(la courte, `SetBaseValue(int)`, pose une valeur brute). Elle ajoute deux couches, la
première dans une méthode que l'ASM inlinait et que le C# nomme :
[`CStatValue_CalcPcExtendedBaseValue.cs`](./damage-formula-cs/CStatValue_CalcPcExtendedBaseValue.cs).

```text
si owner != null : OwnerCharacter = owner
si OwnerCharacter != null ET OwnerCharacter.Type == CT_PC ET level > 100 :
  base = CalcPcExtendedBaseValue(min, max, level, mod)
       = (int)((long)(max−min) × (level−1) / 99) + min                    // = CalcStat
       + (int)((long)(max−min) × mod × max(level−100, 0) / 1000 / 99)     // long, deux troncatures
sinon :
  base = CalcStat(min, max, level)
si addRate > 0 : base = ApplyRate(base, addRate)             // = div1000(base × (1000 + addRate))
m_nBaseValue = base
m_nSpawnAdvantageRate = spawnAdvRate                          // conservé pour CalcFinalStat (§ 3)
```

- `mod` = `CCharacterData.LevelUpStatModifierAfter100`, chargé depuis
  `CharacterMaxLevelTemplet.LevelUpStatModifierAfter100`. Données 1.4.9 : palier 1
  (→105) = **200 ‰**, palier 2 (→110) = **400 ‰**, palier 3 (→120) = **700 ‰**.
  Un seul `mod` (celui du palier courant) s'applique à TOUS les niveaux au-delà de
  100 : au palier 3, chaque niveau post-100 rapporte 1,7× le pas linéaire 1→100.
- La branche post-100 est réservée aux personnages (`Type == CT_PC`) ; les monstres
  restent sur CalcStat pur quel que soit le niveau.
- `addRate` : multiplicateur appliqué directement à la base — posé UNIQUEMENT
  par le scaling d'overgrade du boss de guild raid (§ 12.13, RÉSOLU), 0 partout
  ailleurs.
- `CCustomBossStatValue.SetBaseValue`
  ([`CCustomBossStatValue_SetBaseValue.cs`](./damage-formula-cs/CCustomBossStatValue_SetBaseValue.cs)) :
  pour ST_HP, `base = max − min` ; pour les autres stats, CalcStat normal — et elle
  IGNORE `addRate` comme `spawnAdvRate` (jamais posés).

## 4. Probabilités — CheckProbability\*

Listings : [`CheckProbability.cs`](./damage-formula-cs/CheckProbability.cs),
[`CheckProbabilityPercent.cs`](./damage-formula-cs/CheckProbabilityPercent.cs),
[`CheckProbabilityPermille.cs`](./damage-formula-cs/CheckProbabilityPermille.cs),
[`GetBattleRandomRange_int.cs`](./damage-formula-cs/GetBattleRandomRange_int.cs),
[`GetRandomRange_int.cs`](./damage-formula-cs/GetRandomRange_int.cs).

```text
CheckProbability(value, max, isAuto = false):
  if value <= 0: return false
  roll = isAuto ? GetRandomRange(0, max)          // Random.Range(0, max+1) : uniforme [0, max]
                : GetBattleRandomRange(0, max)    // idem, RNG du match en PvP temps réel
  return value >= roll
```

- `CheckProbabilityPercent(v, isAuto)` = `CheckProbability(v, 100, isAuto)`.
- `CheckProbabilityPermille(v, isAuto)` = `CheckProbability(v, 1000, isAuto)`.
- `GetBattleRandomRange(min, max)` : en PvP temps réel, RNG synchronisé du match
  (`CPVPRealTimeManager.PvpRealtimeMatch.GetRandomRange`) ; sinon
  `GetRandomRange(min, max)` = `Random.Range(min, max + 1)` → **entier uniforme
  inclusif** `[min, max]` (la surcharge `float` est `Random.Range(min, max)`, sans +1).
- Conséquence : P(succès) = `(value+1)/(max+1)` pour `1 ≤ value ≤ max` (ex. 50 ‰ affiché
  → 51/1001 réels), 0 % si `value ≤ 0`, 100 % si `value ≥ max`.

## 5. CheckResist — résistance aux effets

Listing : [`CheckResist.cs`](./damage-formula-cs/CheckResist.cs). Entrées : `chance` =
BUFF_CHANCE de l'attaquant (‰), `resist` = BUFF_RESIST du défenseur (‰).

```text
if chance > resist: return false                // jamais de résistance
d = resist - chance
if d == 0: d = 1
p = FloorToInt( 1000f / (1f + 100f / (float)d) ) // arithmétique float 32 bits
return CheckProbabilityPermille(p)              // § 4 : faux si p ≤ 0, sinon roll [0,1000] ≤ p
```

Formule non linéaire : P(résist) ≈ `floor(1000·d/(d+100)) / 1001`-ish. Ex. diff=100 →
p=500 → ~50 % ; diff=0 → p=9 → ~1 % ; diff=300 → p=750. L'arithmétique float32 crée
de vrais artefacts d'arrondi : diff=900 donne 899 (et non 900) — valeurs vérifiées
contre une référence float32 exacte (rationnels) sur diff ∈ [0, 20000], ancrées par
somme de contrôle dans `src/lib/damage/formula.test.ts`.

## 6. Élément — GetElementSuperiority & GetElementeryDamageRate

Listings : [`GetElementSuperiority.cs`](./damage-formula-cs/GetElementSuperiority.cs),
[`GetElementeryDamageRate.cs`](./damage-formula-cs/GetElementeryDamageRate.cs),
[`FindBuffElementDamageRate.cs`](./damage-formula-cs/FindBuffElementDamageRate.cs).

```text
GetElementSuperiority(att, def):                 // enum § 2
  if att ≤ CET_FIRE && def ≤ CET_FIRE:            // triangle Terre/Eau/Feu (0/1/2)
    if (att+1) % 3 == def: return ATTACKER_WIN    // Terre>Eau, Eau>Feu, Feu>Terre
    if (def+1) % 3 == att: return ATTACKER_LOSE
    return EQUAL
  if att ≥ CET_LIGHT && def ≥ CET_LIGHT:          // Lumière ↔ Ténèbres : les DEUX gagnent
    return (att == def) ? EQUAL : ATTACKER_WIN
  return EQUAL                                    // L/T vs élément de base = neutre
```

```text
GetElementeryDamageRate(Attacker, Defender):      // retourne un taux ‰
  rate = 1000
  if Attacker.FindBuffElementSuperiority():       rate = 1200   // buff BT_DMG_ELEMENT_SUPERIORITY (99)
  elif Attacker.FindBuffElementInferiority():     rate = 800    // buff BT_DMG_ELEMENT_INFERIORITY (109)
  else:
    sup = GetElementSuperiority(Attacker.Data.Element, Defender.Data.Element)
    ATTACKER_WIN → rate = 1200 ; ATTACKER_LOSE → rate = 800 ; EQUAL → 1000
  if rate == 1200: rate += Attacker.FindBuffElementDamageRate()
  return rate
```

- `FindBuffElementDamageRate` = **somme** des `Value` des buffs BT_DMG_ELEMENT_ENCHANT
  (100) dont `CheckAvailable()` passe. Ne s'applique **que** quand l'attaquant a
  l'avantage (réel ou forcé par le buff 99).
- Avantage = ×1,2 ; désavantage = ×0,8 ; neutre = ×1,0.

## 7. CheckDamageRate — fixe le résultat et le taux du hit

Listing : [`CheckDamageRate.cs`](./damage-formula-cs/CheckDamageRate.cs). Écrit `Defender.SkillRecord.DamageRateType` (résultat) et `.DamageRate` (‰), consommés
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
    if CheckProbabilityPermille(Defender.Data.Avoid):        // § 4 : avoid ≥ 1 et roll ≤ avoid
      result = MISSED(3) ; rate = 1000        // la pénalité ×0,5 vient plus tard (§ 8.2)
    else:
      // 5. Critique : roll sur le CriticalRate de l'attaquant
      if CheckProbabilityPermille(Attacker.Data.CriticalRate):
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

`AddCheckEnemyTeamDecreaseDamageRate(Attacker, count, ref rate)`
([`AddCheckEnemyTeamDecreaseDamageRate.cs`](./damage-formula-cs/AddCheckEnemyTeamDecreaseDamageRate.cs),
[`FindBuffEnemyTeamDecreaseDamageRate.cs`](./damage-formula-cs/FindBuffEnemyTeamDecreaseDamageRate.cs)) —
appelé par le code d'attaque (hors CFormula) pour les compétences dont la cible
« décroît » : `rate += FindBuffEnemyTeamDecreaseDamageRate(Attacker) × count`
(somme des buffs BT_DMG_ENEMY_TEAM_DECREASE (101) dont `CheckAvailable()` passe ×
nombre de cibles décomptées).
Le calcul du `count` par le code d'attaque n'est pas désassemblé ; **prouvé en
jeu** (fixture Noa vs Rhona 10/08/2026, EE +0 `BID_CEQUIP_2000022` 150 ‰,
Δ 0 exact) : `count = MAX_USER_TEAM_MEMBER − cibles touchées` (la taille
d'équipe, `CCommonDefine.MAX_USER_TEAM_MEMBER = 4`, `const` de `CCommonDefine.cs` ; vague à
1 ennemi → ×3 → +450 ‰). Le moteur applique ce décompte via
`BuildReportOptions.targetsHit` (z `n`, défaut 1) ; le buff arrive gaté par
son `CallerSkillType` (application par slot, gear.ts).

## 8. CalcDamage

Listing : [`CalcDamage.cs`](./damage-formula-cs/CalcDamage.cs) — la fonction locale
`CalcDamage(int factor)` qu'il contient (nom binaire `<CalcDamage>g__CalcDamage|17_0`,
repliée par ILSpy ; [`CalcDamage_g__helper.cs`](./damage-formula-cs/CalcDamage_g__helper.cs)
en est la même sortie) est le cœur § 8.2.

Signature : `CalcDamage(Attacker, Defender, DamageTemplet, damageRate, out dmg, out vampiric, out hitRecovery)`.
`damageRate` = le `SkillRecord.DamageRate` produit par § 7. Sorties nulles si
`damageRate == 0` (invincible) ou si `DamageTemplet.DamageFactor == 0`.

### 8.1 Facteur total de la compétence (comptabilité multi-hit) — PAR CLIP

Un skill multi-hit appelle `CalcDamage` une fois **par hit**, avec le
`CDamageTemplet` du hit (`DamageFactor` ‰ du hit). Les compteurs sont portés par le
`SkillRecord` du **DÉFENSEUR** (un AoE tient une cascade par cible). Au premier hit
(`Defender.SkillRecord.ReceiveMaxDamage == 0`), le jeu scanne les `AnimationEvent`
des clips en cours de l'attaquant pour calculer le **facteur total** :

```text
total = 0
pour chaque clip de Attacker.Animator.GetCurrentAnimatorClipInfo(0):   // layer 0, clip(s) en cours
  pour chaque AnimationEvent du clip :
    "EventAttackStart" : templet = GetDamageTemplet(param.Replace(" ", "").Split(',')[0])
                         total += templet.DamageFactor × (templet.MaxHitCount == 0 ? 1 : templet.MaxHitCount)
    "EventEffect"      : si param.Split(',')[1] est un int > 0 : total += cet int   // « facteur littéral »
if total == 0 && Attacker.SkillRecord.TotalSkillFactor != 0:
  total = Attacker.SkillRecord.TotalSkillFactor                // repli — simulateur seulement, voir ci-dessous
Defender.SkillRecord.ReceiveMaxDamage = CalcDamageCore(total)   // § 8.2
Defender.SkillRecord.TotalSkillFactor = total
Defender.SkillRecord.ReceiveCurrentFactorDamage = 0
Defender.SkillRecord.CurrentSkillFactor = 0
```

**Le repli « Σ tables » n'existe qu'en mode simulateur.** Le seul code qui écrit le
`TotalSkillFactor` de l'ATTAQUANT est `CCharacterBattle.SkillSimulation()`
([`CCharacterBattle_SkillSimulation.cs`](./damage-formula-cs/CCharacterBattle_SkillSimulation.cs)),
appelé UNIQUEMENT quand `CPlayer.IsYSLSimulator` : Σ sur
`GetDamageTempletBySkillID(skill.ID)` de `DamageFactor × max(1, MaxHitCount)`. En
combat réel il vaut 0 : un clip sans event laisse `total = 0` →
`ReceiveMaxDamage = CalcDamageCore(0) = 1` (clamp ≥ 1), `TotalSkillFactor = 0`, et
chaque hit passe `CurrentSkillFactor ≥ 0` dès le premier — aucune rehausse possible,
hits servis bruts, compteurs remis à zéro à chaque hit. L'heuristique du moteur pour
les chaînes irrésolues (§ 12.4 : « Σ tables, comblée à 1000 sous 990 ») est donc un
repli du CALCULATEUR borné par les mesures, pas un comportement du jeu.

**Le scan ne voit que le(s) clip(s) COURANT(S) — un skill joué en plusieurs clips fait
plusieurs cascades** (le rattrapage § 8.3 remet les compteurs à zéro à la fin
de chaque clip, le clip suivant re-scanne). Prouvé le 22/08/2026 par la paire
de mesures du S2 de Francesca (10202 normal / 22028 crit, exacts UNIQUEMENT en
`cascade(700) + cascade(300)` — ses deux clips) et validé par l'extraction des
events (voir ci-dessous) : le S1 de Caren joue son hit 300 ‰ DEUX fois (+400 =
1000, le « comblement » mesuré du 18/08 était un rejeu absent des tables), les
clips uniques d'Eris S2 (1000) et Noa S2 (999, servi brut) restent exacts.

**Source de la donnée (22/08/2026)** : les bundles Unity ne sont pas chiffrés —
`datagen/damage/extract-anim-events.py` (UnityPy) extrait les
`EventAttackStart` de chaque clip (param `<templetId>,<valeur>` — seul `[0]` est lu
par `CalcDamage`, la valeur après la virgule n'est PAS un facteur) ET le mapping
trigger → clips du controller compilé `AC_<charId>`. La liaison skill → clips
est de la donnée aussi : `CharacterSkillTemplet.TriggerName` liste les
triggers du skill DANS L'ORDRE (« Skill2,Skill2_2 » = deux clips chez
Francesca ; « Burst1 » → clip `Skill_2_Upgrade` : le burst du S2 refait la
même chaîne en UNE cascade de 1000 ‰), `TriggerNameSkip` porte l'état SKIP.
`datagen/damage/clips.ts` assemble le tout dans `characters.json`
(`DamageSkill.clips`) ; le moteur (`report.ts`) fait une cascade § 8.2 + § 8.3
par clip — les events d'une AUTRE chaîne présents dans le clip comptent dans
son facteur et consomment leur part, chaque chaîne n'affiche que ses hits.
⚠ L'extracteur ne garde que les `EventAttackStart` : le « facteur littéral » du jeu
est l'event `EventEffect` (2ᵉ paramètre entier > 0 — nom lu en C# le 26/08/2026),
NON extrait à ce jour (§ 12.4 c).

### 8.2 Le cœur — fonction locale `CalcDamage(int factor)`

```text
CalcDamageCore(factor):                        // factor = DamageFactor du hit (‰)
  atk         = Attacker.GetAttackStat()       // § 10.1
  skillFactor = Attacker.SkillManager.GetSkillFactor()
              // = GetCurrentSkill()?.DamageFactor ?? 0 (SkillLevelTemplet.DamageFactor
              //   du skill courant, ‰ — CharacterSkillLevelTemplet.json, ex. 960…1840)
  d       = (long)atk × skillFactor × factor / 1000               // long
  ppRate  = min(1000, Attacker.Data.PiercePowerRate)              // stat 10, ‰ (pénétration %)
  pp      = Attacker.Data.PiercePower                             // stat 9, plat
  defTerm = max( -999000, (long)Defender.Data.Def × (1000 − ppRate) − (long)pp × 1000 )
  d = d × 1_000_000 / (1_000_000 + defTerm)                       // mitigation défense
  d = d × damageRate / 1000                                       // crit/boosts/réduc (§ 7)
  if Defender.FindBuffByType(BT_MARKING) != null:
    d = d × 1150 / 1000                                           // cible marquée : +15 % subis
  d = d × GetElementeryDamageRate(Attacker, Defender) / 1000      // § 6
  if Defender.SkillRecord.DamageRateType == MISSED:
    d = d × MISSED_DAMAGE_RATE_PERMILLE / 1000                    // GameConfig MISSED_DAMAGE_RATE (15) = 500
  finalReduce = Defender.GetBuffDamgeFinalReduce(Attacker)        // § 9.3 (max, pas somme)
  d = d × (1000 − finalReduce) / 1000
  return Mathf.Max(1, (int)(d / 1000))                            // ÷1000 final : échelle ATK ; ≥ 1
```

`MISSED_DAMAGE_RATE_PERMILLE` — [`get_MISSED_DAMAGE_RATE.cs`](./damage-formula-cs/get_MISSED_DAMAGE_RATE.cs),
lu une fois dans `GameConfig` (valeur de table 500 → ×0,5). Toutes les divisions sont
des divisions `long` tronquées vers zéro (les deux `/ 1000` finaux valent un `/ 1e6`
sur un entier positif).

Mitigation défensive en clair : `multiplicateur = 1e6 / (1e6 + def_effective × 1000)`
avec `def_effective = def × (1 - pen%) - penFlat`, soit la forme classique
`1 / (1 + def_eff / 1000)`. Le plancher `defTerm ≥ -999000` borne l'amplification à
×1000 quand la pénétration dépasse la défense.

### 8.3 Répartition par hit et rattrapage d'arrondi

```text
Defender.SkillRecord.CurrentSkillFactor += factor                 // chaque hit (après le garde § 8.5)
if CurrentSkillFactor ≥ TotalSkillFactor:                        // DERNIER hit du clip
  if ReceiveMaxDamage > ReceiveCurrentFactorDamage + dmg:
    dmg = ReceiveMaxDamage − ReceiveCurrentFactorDamage           // rehausse
  TotalSkillFactor = 0 ; ReceiveMaxDamage = 0                     // le clip suivant re-scanne (§ 8.1)
ReceiveCurrentFactorDamage += dmg
```

Au **dernier** hit le hit courant est **rehaussé** (le total de la compétence est donc
exactement `CalcDamageCore(totalFactor)`, pas la somme des hits tronqués — sauf cas
dégénéré où les clamps `≥ 1` feraient dépasser, jamais corrigé à la baisse). Le
rattrapage vaut PAR CLIP (§ 8.1) : le dernier event du clip atteint
`TotalSkillFactor`, les compteurs repartent à zéro, et le clip suivant refait sa
propre cascade — c'est la séquence RÉELLE des events (rejeux compris) qui décide qui
est « dernier », pas les tables.

Limite de dégâts par tour (world boss) : voir § 8.5 — calculée AVANT l'accumulation,
dans le même appel.

### 8.4 Sorties annexes

```text
vampiric    = MulPermille(dmg, Attacker.Data.Vampiric)            // stat 11, ‰
hitRecovery = FloorToInt( (float)(dmg × Defender.Data.HitHPRecovery) × 0.001f )
              // produit int 32 bits, puis float 32 bits × 0.001f, floor
```

### 8.5 IsIgnoreTurnLimitDamage — exemption world boss, **1.4.14**

Listing : [`CFormula_IsIgnoreTurnLimitDamage.cs`](./damage-formula-cs/CFormula_IsIgnoreTurnLimitDamage.cs) ;
site d'appel dans [`CalcDamage.cs`](./damage-formula-cs/CalcDamage.cs). Le prédicat
est court et entièrement résolu :

```text
IsIgnoreTurnLimitDamage(attaquant):
  scene = CDungeonScene.Instance
  if scene == null:                       return false
  if !scene.IsWorldBoss:                  return false
  if !scene.IsUseWorldBossSpecialAttack:  return false
  if attaquant == null:                   return false
  return attaquant.UID == 0                               // attaquant sans UID
```

Effet dans `CalcDamage`, lu en clair (26/08/2026) — le garde ne gouverne QUE la
**limite de dégâts par tour** (§ 8.3), jamais la comptabilité du facteur :

```text
if !IsIgnoreTurnLimitDamage(attaquant)
   and !scene.IsUseWorldBossFinishAttack
   and Defender.TurnLimitMaxDamage != -1
   and Defender.SkillRecord.SkillLimitMaxDamage == -1:
    reste = min( max(0, TurnLimitMaxDamage - TurnLimitCurrentDamage), ReceiveMaxDamage )
    Defender.SkillRecord.SkillLimitMaxDamage = CalcCharacterSharedDamage(Defender, reste)  // § 11
    Defender.TurnLimitCurrentDamage += reste
Defender.SkillRecord.CurrentSkillFactor += DamageTemplet.DamageFactor    // INCONDITIONNEL (§ 8.3)
```

Autrement dit : pendant l'**attaque spéciale d'un world boss**, un attaquant **sans
UID** (source de dégâts qui n'est pas un personnage joueur instancié) échappe à la
limite par tour, exactement comme `IsUseWorldBossFinishAttack` (seul chemin en 1.4.9).

La lecture ASM du 13/08/2026 plaçait « l'accumulation dans `CurrentSkillFactor` » SOUS
ce garde : c'était faux. L'accumulation suit le garde sans condition, et la quantité
que § 12.16 n'avait pas tracée (`w22`) est simplement le `DamageFactor` du hit courant.

## 9. Agrégation des buffs de taux (CCharacterBattle)

> RÉALISÉ (03/08/2026) : `src/lib/damage/aggregate.ts` — les familles des
> tables § 9.1/9.2/9.3 (enums `BT_*` réels de BuffTemplet), la valeur
> effective § 14.1 (`value × stacks`), les canaux `BT_STAT` par stat pour
> l'identité § 16.1, et les drapeaux § 6/§ 7/§ 10.1 (marking, invincible,
> élément forcé/enchant, enemy-team-decrease, swap d'attaque). Contexte
> EXPLICITE : une famille sans son contexte contribue 0. `CheckAvailable`
> (§ 12) n'est pas émulé — l'UI ne propose que des buffs actifs.

### 9.1 FindBuffAdditionalDamage — buffs de l'ATTAQUANT, somme (‰)

Listing : [`FindBuffAdditionalDamage.cs`](./damage-formula-cs/FindBuffAdditionalDamage.cs).
Parcourt `m_BuffList` de l'attaquant (`if / else if` : un buff n'entre que dans UNE
branche) ; chaque buff passe `CheckAvailable` (conditions internes au buff : cible,
stacks, cooldown d'application — non lu, § 12.1). Deux « cibles » coexistent dans le
code : `_TargetCharacter`, le PARAMÈTRE (le défenseur du hit), et `TargetCharacter`,
le CHAMP de l'attaquant (sa cible principale) — identiques sur un mono-cible, pas sur
un AoE.

| BT  | Nom                     | Contribution                                                                                                   |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| 90  | DMG                     | `+Value` — `CheckAvailable(défenseur)`                                                                         |
| 91  | DMG_OWNER_LOST_HP_RATE  | `+GetLostHPRateValue(attaquant, Value)`                                                                        |
| 92  | DMG_TARGET_LOST_HP_RATE | `+GetLostHPRateValue(défenseur, Value)`                                                                        |
| 93  | DMG_OWNER_STAT          | `+RoundToInt(min((float)GetStatValuePermille(att.Data, StatType, Value), 1000f))`                              |
| 94  | DMG_TARGET_STAT         | idem sur les stats du **défenseur** (paramètre), cap 1000                                                      |
| 95  | DMG_OWNER_BUFF          | `+Value × GetBuffCount(attaquant, buffs)`                                                                      |
| 96  | DMG_TARGET_BUFF         | `+Value × GetBuffCount(défenseur, buffs)`                                                                      |
| 165 | DMG_TARGET_BUFF_LIMIT   | comme 96, mais le CUMUL des instances d'un même `BuffID` est plafonné à `Templet.LimitValue` (**1.4.15**)      |
| 97  | DMG_OWNER_DEBUFF        | `+Value × GetBuffCount(attaquant, débuffs)`                                                                    |
| 98  | DMG_TARGET_DEBUFF       | `+Value × GetBuffCount(défenseur, débuffs)`                                                                    |
| 164 | DMG_TARGET_DEBUFF_LIMIT | comme 98, plafonné à `Templet.LimitValue` par `BuffID` (**1.4.15**, § 12.18)                                   |
| 102 | DMG_TARGET_BREAK        | `+Value` si `att.TargetCharacter.m_RageManager.IsBreak` (le CHAMP)                                             |
| 103 | DMG_TO_BOSS             | `+Value` si `att.TargetCharacter.IsBoss` (le CHAMP ; `IsBoss` = `Data.Type ≥ CT_BOSS_MONSTER` = 4)             |
| 104 | DMG_KILL_COUNT_STACK    | `+Value` — `CheckAvailable(défenseur)` (stacks gérés dans CheckAvailable/Value)                                |
| 105 | DMG_NOT_CRITICAL        | `+Value` si `défenseur.SkillRecord.DamageRateType ∈ {NORMAL, MISSED}`                                          |
| 106 | DMG_PVP_CONTENT         | `+Value` si `scene.IsPvp`                                                                                      |
| 107 | DMG_CASTER_STAT         | `+RoundToInt(min((float)GetStatValuePermille(caster.Data, StatType, Value), 1000f))` — caster du buff non null |
| 108 | DMG_CASTER_LOST_HP_RATE | `+GetLostHPRateValue(caster du buff, Value)`                                                                   |
| 110 | DMG_OWNER_TEAM_BUFF     | `+Value × Σ sur les membres (vivants ou non) de l'équipe du porteur : GetBuffList(buffs).Count`                |
| 111 | DMG_MY_TEAM_DECREASE    | `+Value × (4 − membres vivants de l'équipe du porteur)`                                                        |
| 112 | DMG_MONADGATE_CONTENT   | `+Value` si `scene.IsMonadGate`                                                                                |
| 113 | DMG_TOWER_CONTENT       | `+Value` si `scene.DungeonTemplet.DungeonMode.IsTowerModes()`                                                  |

Puis, en PvP temps réel : `+ CurrentMatchInfo.FieldSkillDmg`.

Plafond par ID (164/165) : `cumul[ID] = min(cumul[ID] + GetBuffCount(·) × Value, LimitValue)`
(dictionnaire local à l'appel), la contribution ajoutée est `cumul − ancien cumul` —
plusieurs instances du même buff (stacks, re-poses) ne dépassent jamais `LimitValue`
ensemble.

Helpers numériques (exacts) :

- `GetLostHPRateValue(c, v)` ([`GetLostHPRateValue_1.cs`](./damage-formula-cs/GetLostHPRateValue_1.cs),
  les deux surcharges) = `(int)((long)(MaxHP − HP) × v / MaxHP)`, 0 si `MaxHP ≤ 0`.
- `GetStatValuePermille(data, type, p)` ([`GetStatValuePermille.cs`](./damage-formula-cs/GetStatValuePermille.cs))
  = `(long)GetStatValue(type) × p / 1000`, 0 si type NONE, `int.MaxValue` si le
  quotient dépasse `int`. Les usages 93/94/107 passent le résultat en `float`, le
  bornent à `1000f` puis `RoundToInt` — sans effet sur un entier ≤ 1000 : **cap à
  1000 ‰**.
- `GetBuffCount(isDebuff)` ([`CCharacterBattle_GetBuffCount.cs`](./damage-formula-cs/CCharacterBattle_GetBuffCount.cs))
  compte les buffs **VISIBLES** : `IsDebuff == isDebuff && !IsNeutral && Templet.ToolTipID > 0`
  — exactement les icônes que le joueur voit (les compteurs § 9.1 DÉCLARÉS par le
  scénario comptent la même chose). `GetBuffList(isDebuff)` (110) filtre autrement :
  `IsDebuff == isDebuff && !IsNeutral && RemainTurnCont > 0` — pas de condition de
  tooltip, mais des tours restants.

### 9.2 FindBuffDamageReduce — buffs du DÉFENSEUR, somme (‰)

Listing : [`FindBuffDamageReduce.cs`](./damage-formula-cs/FindBuffDamageReduce.cs). UNE
boucle sur `m_BuffList` du défenseur (`if / else if` dans cet ordre), puis un terme
hors boucle :

| BT  | Nom                         | Contribution                                                                                                                                  |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 115 | DMG_REDUCE                  | `+Value` si `CheckAvailable(attaquant)` et `ApplyingType == OAT_RATE` (buff consommé : `MarkUsedHitOverThisSkill`)                            |
| 154 | STEALTHED                   | `+Value` si attaquant non null et son skill n'est **pas** mono-cible (`SkillRangeType != SINGLE`)                                             |
| 118 | DMG_REDUCE_MY_TEAM_INCREASE | `+Value × (membres vivants de l'équipe du caster − 1)` si `CheckAvailable(attaquant)` ; ignoré si le caster n'a plus d'équipe (buff consommé) |
| 62  | DOT_PUNISH                  | `+GameConfig.PUNISH_DMG_REDUCE_VALUE` (**300**) si `CheckAvailable()` — un **terme de la somme**, PAS un plafond                              |

Puis, hors boucle : si l'**attaquant** porte lui-même un `BT_DOT_PUNISH`
(`FindBuffByType`), `+300` une fois de plus.

**Nouveauté 1.4.14, tranchée le 26/08/2026 à la lecture du C#.** Les « deux lectures
de `PUNISH_DMG_REDUCE_VALUE` sur des chemins distincts » que l'ASM montrait sont deux
TERMES additifs : un par buff punish du défenseur (dans la boucle), un si l'attaquant
en porte un (hors boucle). Le montant vient de la config serveur (`GAME_CONFIG` 215,
valeur de table 300 = 30 %), pas du buff.

⚠ Le moteur TS n'implémente pas les termes DOT_PUNISH — aucune mesure ne les
contraint encore ; à brancher sur une fixture (§ 12.16).

### 9.3 GetBuffDamgeFinalReduce — défenseur, **MAX** (‰), pas somme

Listing : [`GetBuffDamgeFinalReduce.cs`](./damage-formula-cs/GetBuffDamgeFinalReduce.cs).
Multiplicatif final `(1000 − r)/1000` dans § 8.2. `r` = maximum parmi (quatre `if`
indépendants par buff, pas de `else`) :

- BT 119 DMG_REDUCE_FINAL : `Value` si `CheckAvailable(attaquant)` et `Value > r`
  (buff consommé — `MarkUsedHitOverThisSkill`).
- BT 120 DMG_REDUCE_FINAL_MY_TEAM_INCREASE : `Value × (membres vivants de l'équipe du
porteur − 1)` si `CheckAvailable(attaquant)` et supérieur à `r` (consommé).
- BT 121 DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL : `Value` si le skill de l'attaquant
  n'est pas le S1 (`SkillRecord.SkillType != SKT_FIRST`), `CheckAvailable(attaquant,
SkillType)` et `Value > r` (consommé) ; sur un S1, le buff est seulement consommé.

## 10. Stats d'entrée

### 10.1 GetAttackStat

Listing : [`GetAttackStat.cs`](./damage-formula-cs/GetAttackStat.cs).

```text
buff = Attacker.FindBuffByType(BT_SWAP_STAT_ATTACK (114))
if buff != null && buff.CheckAvailable(Attacker):
  stat = Attacker.Data.GetFinalStat(buff.StatType)
  return (buff.ApplyingType == OAT_RATE) ? MulPermille(stat, buff.Value) : stat + buff.Value
return Attacker.Data.Atk        // stat finale ST_ATK (4), buffs inclus
```

### 10.2 Getters `CCharacterData.get_*`

Tous identiques (ex. [`CCharacterData_get_Def.cs`](./damage-formula-cs/CCharacterData_get_Def.cs)) :
`CheckStatDirty()` (recalcul lazy par `CCharacterData.CalcStat` si dirty) puis
`m_StatDic[type].GetFinalValue()`. Les stats finales incluent
base/évo/éveil/monad/trans/archive/items/buffs via `CalcFinalStat` (§ 3) ;
l'assemblage des 13 paramètres par stat est extrait en § 17.

## 11. Fonctions annexes

### CalcDamageDOT — dégâts sur la durée

Listing : [`CalcDamageDOT.cs`](./damage-formula-cs/CalcDamageDOT.cs). Entrées :
`attackRate` (‰ — le taux du buff DOT déjà modulé par les ENHANCE, voir le tick) et
`statValue` (stat de référence, lue AU TICK). **Ignore** élément, crit, taux de § 7 ;
seule mitigation : défense + DMG_REDUCE.

```text
d       = (long)statValue × attackRate
ppRate  = min(1000, Attacker.Data.PiercePowerRate)
defTerm = max( -999000, (long)Defender.Data.Def × (1000 − ppRate) − (long)Attacker.Data.PiercePower × 1000 )
d       = d × 1_000_000 / (1_000_000 + defTerm)                 // même forme que § 8.2
reduce  = min(900, Defender.Data.DMGReduceRate)                 // cap 90 %
return (int)( d × (1000 − reduce) / 1000 / 1000 )               // PAS de clamp ≥ 1
```

### Le TICK par type — `CBattleManager.ProcessDamageOverTime`

Listings : [`CBattleManager_ProcessDamageOverTime.cs`](./damage-formula-cs/CBattleManager_ProcessDamageOverTime.cs),
[`CCharacterBattle_GetDotDamageIncreaseBuffValue.cs`](./damage-formula-cs/CCharacterBattle_GetDotDamageIncreaseBuffValue.cs),
[`CCharacterBattle_GetSpecificDotEnhanceBuffType.cs`](./damage-formula-cs/CCharacterBattle_GetSpecificDotEnhanceBuffType.cs),
[`CCharacterBattle_IsDotBuffType.cs`](./damage-formula-cs/CCharacterBattle_IsDotBuffType.cs) ;
appelants : [`CBuff_OnTurnStart.cs`](./damage-formula-cs/CBuff_OnTurnStart.cs) (tick
périodique) et [`CBuff_OnCreate.cs`](./damage-formula-cs/CBuff_OnCreate.cs) (détonation,
§ 14.6). Désassemblé le 24/08/2026 (déclencheur : le tick d'Eternal Bleeding de Gnosis
Beth, −71 % avec la formule standard), relu en C# le 26/08/2026.

`ProcessDamageOverTime(buff, buffValue, count, immediatelyCaster)` : `caster` =
`buff.Caster` (le POSEUR), `defender` = `buff.Owner` (la CIBLE) — l'un des deux nul →
`false`. Un `switch` sur le type route chaque DoT vers SA formule ; `CalcDamageDOT`
ci-dessus n'est PAS servi à tous :

| BUFF_TYPE             | stat lue AU TICK                                                        | formule (`taux = ApplyRate(buffValue, Σ ENHANCE)`)                                                            |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 56 `BT_DOT_BURN`      | `caster.Data.Atk` (en dur — la stat de la LIGNE est ignorée)            | `MulPermille(atk, taux) × count` — **sans défense ni réduction**                                              |
| 57 `BT_DOT_BLEED`     | `caster.Data.GetStatValue(StatType de la ligne)`                        | `CalcDamageDOT(caster, cible, taux, stat) × count` (défense + réduction)                                      |
| 58 `BT_DOT_POISON`    | idem                                                                    | `CalcDamageDOT` × count                                                                                       |
| 59 `BT_DOT_LIGHTNING` | idem                                                                    | `CalcDamageDOT` × count                                                                                       |
| 60 `BT_DOT_CURSE`     | PV MAX de la **CIBLE** (`cible.Data.GetStatValuePermille(ST_HP, taux)`) | % des PV max, **plafonné** au min des `BT_DOT_CURSE_CAP` (77) actifs sur la cible (`CheckCondition`), × count |
| 61 `BT_DOT_2000092`   | `caster.Data.GetFinalStat(ST_BUFF_CHANCE)` (Effectiveness, en dur)      | `MulPermille(eff, taux) × count` — **sans défense ni réduction** (+ effet de jauge, ci-dessous)               |
| 62 `BT_DOT_PUNISH`    | `caster.Data.GetStatValue(StatType de la ligne)`                        | `CalcDamageDOT` × count                                                                                       |

Une ligne BLEED/POISON/LIGHTNING/PUNISH sans `StatType` (`ST_NONE`) est une erreur
de donnée : `LogError`, pas de tick. La lecture ASM plaçait la CURSE sur les PV max du
POSEUR — le C# lit `_Defender` (la cible) : corrigé le 26/08/2026.

Fin commune, dans l'ordre :

```text
if immediatelyCaster != null:                        // détonation seulement (§ 14.6)
  dmg = ApplyImmediatelyDotDamageCap(cible, type, dmg)   // cap BT_IMMEDIATELY_<TYPE>_CAP (156–161) puis
                                                          // BT_IMMEDIATELY_ALL_CAP (162) : min des caps dont CheckCondition passe
if cible a BT_INVINCIBLE (3): dmg = 0                   // effet SYS_BUFF_INVINCIBLE
if dmg > 0: cible.AddHP(−dmg) (shield § 14.3), popup, totaux d'équipe
if cible.HP == 0 && IsAlive && !IsNotDie: SetDie() (+ BossKill si boss ennemi)   // même garde que § 14.5
```

- **`taux = ApplyRate(buffValue, Σ ENHANCE)`** — toutes branches. Les
  `BT_*_ENHANCE` sont lus SUR LA CIBLE (`GetDotDamageIncreaseBuffValue`, listing) :
  Σ du spécifique (70..76 — `GetSpecificDotEnhanceBuffType`, mapping 1:1 56→70 …
  62→76) + `BT_ENHANCE_COMMON` (78 — **DoT standard 56..60 seulement**,
  `IsCommonDotEnhanceTarget`, le code exclut 61 et 62) + `BT_ENHANCE_ALL` (79),
  `buff.CheckCondition(cible)` évalué par buff dans `BuffList` de la cible.
  Les débuffs passifs `ENEMY_TEAM` du kit joueur (trans_8 de Gnosis Beth :
  +500 sans condition dès la transcendance 4★) et de son EE
  (`BID_CEQUIP_2000092` : +500 `OWNER_IS_BOSS` — le porteur du débuff est la
  CIBLE) **sont posés et se SOMMENT** : PROUVÉ par la triple mesure du
  24/08/2026 (fixtures `gnosisbeth-*`) — tick = EFF × 700 % × 2,0 avec EE
  (207 → 2898, deux boss / deux modes), × 1,5 SANS EE (190 → 1995). La
  capture sans EE est LA mesure discriminante : sans elle, « 2 poses × 1,0 »
  et « 1 pose × 2,0 » sont numériquement indiscernables — une conclusion
  « jamais posés » a vécu quelques heures le même jour sur l'autre branche
  de cette ambiguïté, gate ajouté puis retiré.
- **La stat est lue EN DIRECT à chaque tick**, jamais capturée à la pose —
  prouvé TROIS fois in-game (24/08/2026) : (a) les procs `SKILL_START`
  actifs à la pose n'y sont pas (Beth : tick = 7000 ‰ × 636 fiche, pas
  × 694) ; (b) l'expérience LIVE (fixture `gnosisbeth-scrapmetal-effbuff`) —
  Sterope buffe +100 % EFF ENTRE deux ticks, le tick passe de 1995 à 3990 ;
  (c) le MÊME protocole sur un DoT à formule DÉFENSE (fixtures
  `francesca-dot-scrapmetal[-atkbuff]`) — ATK +30 % entre deux ticks du
  Bleed, 771 → 1110 : le « live » vaut pour toute la table, et la
  PÉNÉTRATION du poseur (pierce +300 du S2, active au tick) est lue en
  direct elle aussi (`CalcDamageDOT` la consomme, § ci-dessus). Un buff de
  stat posé ou expiré en cours de route déplace donc les ticks restants.
  Le couple 771/1110 valide au passage `CalcDamageDOT` de bout en bout HORS
  raid (def 789 + `DMG_REDUCE` 64 ‰ d'un boss `normal_hard`) et l'assiette
  § 16.1 des buffs `OAT_RATE` avec un taux premium dans la fiche (le nœud
  de quirk 101 — voir § 16.1, la mesure qui l'a rendu déclarable). Le C# le
  confirme : chaque branche lit `caster.CharacterData.<stat>` au moment de
  l'appel, rien n'est mémorisé dans le buff.
- **`× count`** : le tick PÉRIODIQUE passe TOUJOURS `count = 1` —
  `CBuff.OnTurnStart` appelle `ProcessDamageOverTime(this, Value, 1, null)` (C#,
  26/08/2026 ; les 3 mesures d'Eternal Bleeding du 24/08 le contraignaient déjà :
  popup = tick UNITAIRE × enhance, 2898 = 207 × 7 × 2,0 ; 1995 = 190 × 7 × 1,5).
  `StackCount` agit sur le TAUX, via `buffValue = Value = Templet.Value × StackCount`
  (§ 14.1), jamais sur le compteur. `count > 1` n'existe qu'à la DÉTONATION
  (tours restants, § 14.6). **Les INSTANCES coexistent** (observé en jeu par
  Sevih, 25/08/2026) : deux casts successifs du S1 (le boss survit) = deux DoT
  de 2 tours SIMULTANÉS, chacun tick SÉPARÉMENT au même montant (mêmes règles à
  la pose, même stat live au tick) — un re-cast n'est ni un refresh ni un cumul
  dans un même popup. Le moteur affiche le tick d'UNE instance (une ligne par
  type/tooltip) et c'est le bon contrat : la 2ᵉ ligne `_1_2` d'un même cast ne
  produit pas de 2ᵉ instance côté joueur (comme le `_1_2` `OWNER_IS_BOSS` de
  Francesca — variante monstre du kit ; § 12.17).
- **DÉTONATION (`BT_IMMEDIATELY_<TYPE>`, 63–69) — LUE en clair, PAS branchée**
  (décision Sevih 25/08/2026 : pas une priorité bloquante). À la création du
  buff détonateur (`CBuff.OnCreate`, § 14.6) : pour CHAQUE DoT du type converti
  présent sur la cible, `ProcessDamageOverTime(dot, ApplyRate(dot.Value,
détonateur.Templet.Value), dot.RemainTurnCont, caster)` puis
  `dot.RemainTurnCont = 0`, et `ClearBuffFinishDuration()` retire les DoT
  consommés. Donc : **dégâts = tick(taux = ApplyRate(ApplyRate(dot.Value, valeur
  du détonateur), Σ ENHANCE)) × tours restants**, sous les caps IMMEDIATELY
  ci-dessus — la valeur du détonateur est son `Templet.Value` (pas × stacks),
  celle du DoT son `Value` (× stacks). Porteurs en donnée 1.4.14 : Gnosis Beth
  S3 (`2000092_3_2`, 500/750/1000 ‰ par niveau, gate `CASTER_HAS_BUFF`), Vlada
  S2 + burst (`2000073_2_*`/`_u_1_1`, BURN 700/500/1000 ‰), Tamamo Eternity S3
  (`2000086_3_2`, CURSE), Francesca S3 (`2000015_3_2`, BLEED), et
  2000032/200005299/2000109/2000117/2700056. À MESURER avant tout branchement.
- **Effet de jauge du DoT 2000092** (hors dégâts) : chaque tick donne à chaque
  membre de l'équipe du POSEUR `AddActionPoint(GetDot2000092ActionGaugeEnhanceValue() × count)`
  — 50 ‰ de `MAX_ACTION_POINT`, × `(1000 + Σ BT_ACTION_GAUGE_ENHANCE (51)) / 1000`
  ([`CCharacterBattle_GetDot2000092ActionGaugeEnhanceValue.cs`](./damage-formula-cs/CCharacterBattle_GetDot2000092ActionGaugeEnhanceValue.cs)).
- Un `BT_DOT_*` hors de cette table (futur DoT custom d'un autre perso) :
  SIGNALÉ par le moteur, jamais calculé par une formule supposée — chaque
  custom a sa propre branche dans le code.

### CalcDamageWG — dégâts de jauge de faiblesse

Listings : [`CalcDamageWG.cs`](./damage-formula-cs/CalcDamageWG.cs),
[`CCharacterBattle_FindBuffWGInvincible.cs`](./damage-formula-cs/CCharacterBattle_FindBuffWGInvincible.cs),
[`CCharacterBattle_FindBuffWGDamageReduce.cs`](./damage-formula-cs/CCharacterBattle_FindBuffWGDamageReduce.cs).

```text
if Defender.FindBuffWGInvincible(Attacker) != null:      // BT_WG_INVINCIBLE (87), CheckAvailable(attaquant)
  buff.PlayActivateEffect() ; return 0
wg = (customValue == 0) ? Attacker.UsingSkill.WGReduce : customValue   // WGReduce du SkillLevelTemplet
(add, rate) = Defender.FindBuffWGDamageReduce(Attacker)
return max(0, ApplyRate(wg + add, rate))                  // = div1000((wg + add) × (1000 + rate))
```

`FindBuffWGDamageReduce` (§ 12.3, LEVÉE le 26/08/2026) : `add`/`rate` partent de 0 ;
chaque `BT_WG_DMG` (89) de l'ATTAQUANT dont `CheckAvailable(attaquant)` passe AJOUTE
`Value` à `add` (`OAT_ADD`) ou à `rate` (`OAT_RATE`) ; chaque `BT_WG_DMG_REDUCE` (88)
du DÉFENSEUR dont `CheckAvailable(attaquant)` passe RETRANCHE de même (et joue son
effet d'activation).

### CalcCharacterSharedDamage — partage de dégâts

Listing : [`CalcCharacterSharedDamage.cs`](./damage-formula-cs/CalcCharacterSharedDamage.cs).

```text
restant = dmg
multi = membres de l'équipe du défenseur portant un BT_SHARE_DMG_MULTI (142)
        DONT LE CASTER EST le défenseur (FindBuffShareMultiDamage(défenseur))
pour chaque membre de multi, si son buff est OAT_RATE :
  part = MulPermille(dmg, buff.Value)          // sur le dmg ORIGINAL
  membre.SkillRecord.MultiSharedDamage += part
  restant = max(0, restant − part)
partageur = équipe.GetCharacterSharedDamage()   // porteur de BT_SHARE_DMG (141) — le plus de MaxHP s'il y en a plusieurs
if partageur existe et ≠ défenseur:
  part = MulPermille(restant, buff.Value)
  partageur.SkillRecord.SharedDamage += part
  restant −= part
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
3. ~~`FindBuffWGDamageReduce`~~ — **RÉSOLU** (26/08/2026, C#) : Σ des `BT_WG_DMG`
   (89) de l'attaquant MOINS Σ des `BT_WG_DMG_REDUCE` (88) du défenseur, chacun
   dans la sortie de son `ApplyingType` (add / rate) — § 11 CalcDamageWG.
4. ~~Événements d'animation (§ 8.1)~~ — **RÉSOLU pour l'essentiel**
   (22/08/2026) : les bundles ne sont pas chiffrés — les `EventAttackStart`
   des clips ET le mapping trigger → clips des controllers `AC_<charId>` sont
   extraits (`extract-anim-events.py` → `anim-events.json` → `clips.ts`), la
   liaison skill → clips vient de `CharacterSkillTemplet.TriggerName` (données,
   pas convention), et le moteur fait une cascade § 8.2/8.3 PAR CLIP (§ 8.1) —
   les 26 observations des fixtures sont toutes exactes au point près, dont la
   paire Francesca S2 qui a prouvé le découpage en clips. RESTE non résolu :
   (a) les chaînes `clipsUnresolvedChains` (13 en 1.4.14 : trigger menant à
   plusieurs états alternatifs, ou couverture partielle de la chaîne par les
   clips) et les skills sans clips extraits — le moteur retombe sur
   l'heuristique historique « Σ tables, comblée à 1000 sous 990 » (flag
   `factorFilled`), bornée par les deux mesures Caren S1 (700 → 1000, 18/08)
   et Noa S2 (999 brut, 22/08) ;
   (b) la valeur après la virgule du `data` des events (34.142, 45, 200…) —
   PAS un facteur : `CalcDamage` ne lit que `[0]` (C#, 26/08/2026) ; son
   consommateur, s'il existe, est ailleurs — non lu ;
   (c) ~~noms des `functionName`~~ — LUS en C# (26/08/2026) :
   `"EventAttackStart"` (facteur par templet) et `"EventEffect"` (2ᵉ paramètre
   entier > 0 = facteur littéral, § 8.1). L'extracteur ne garde que les
   premiers : les `EventEffect` à facteur ne sont PAS cherchés dans la donnée —
   à extraire avant d'affirmer qu'il n'y en a aucun ;
   (d) les events des monstres (`character/monster/…`) ne sont pas extraits —
   sans objet tant que le calculateur ne calcule pas côté monstre.
5. **`GetSkillFactor` — skill courant** : `GetCurrentSkill()?.DamageFactor ?? 0`
   ([`GetSkillFactor.cs`](./damage-formula-cs/GetSkillFactor.cs)) ; la
   correspondance skill courant → skill équipé est du ressort de
   `CSkillManager.GetCurrentSkill`, pas de la formule.
6. **Wrap 32 bits** : le binaire reprend les résultats en 32 bits ; pour des valeurs
   réalistes aucun wrap ne se produit. Le moteur TS calcule en BigInt sans émuler le
   wrap (documenté dans le code).
7. ~~Escalade des pénalités PvP~~ — **RÉSOLU** (`CDungeonScene.UpdatePvpTurnPenalty`
   - `CStateBattle.PvpAttackTeamPenaltyDmg`, § 17.6) : première pénalité au
     tour `PVP_ATK_PENALTY_START_TURN` (10), puis tous les `…_LOOP_TURN` (5) tours.
     À chaque cycle : (a) chaque attaquant vivant subit
     `AddHP(−MulPermille(MaxHP, dmgRate))` — les DEUX équipes (§ 17.6) — avec
     `dmgRate` = 100 ‰ puis +30 ‰/cycle,
     **sans cap**, `bIgnoreUndead=true` (perce UNDEAD) ; (b) la réduction de soins de
     la scène (`[scene+0x100]`, lue par § 14.2) passe de **0** (avant le premier
     cycle, les soins PvP ne sont PAS réduits) à 500 ‰, puis +250 ‰/cycle,
     **cap 1000 ‰** (`min(x, 1000)`).
8. ~~`CBattleManager.ProcessDamageOverTime`~~ — **RÉSOLU pour l'essentiel**
   (24/08/2026, listings `CBattleManager_ProcessDamageOverTime` +
   `CCharacterBattle_GetDotDamageIncreaseBuffValue`) : la jump table des
   ticks par type, l'agrégation des ENHANCE (lus sur la cible, `ApplyRate`
   sur le taux), la stat lue AU TICK et le `× _nCount` sont désassemblés et
   rédigés en § 11 — quatre mesures in-game exactes (le Bleed de Francesca
   ET la triple mesure d'Eternal Bleeding, dont la discriminante sans EE).
   RÉSOLU aussi, le 26/08/2026 (C#) : l'appelant périodique est
   `CBuff.OnTurnStart` — `ProcessDamageOverTime(this, Value, 1, null)`,
   `_nCount = 1` toujours, `StackCount` passe par `Value` (§ 14.1). RESTE : le
   comportement exact d'une re-pose sur un buff existant (refresh vs incrément
   de `StackCount`) — dans `CCharacterBattle.AddBuff`, non lu.
9. ~~Contre-attaques~~ — **RÉSOLU côté lecture** (26/08/2026,
   [`CCharacterBattle_OnReturnFinishDefenderTeam.cs`](./damage-formula-cs/CCharacterBattle_OnReturnFinishDefenderTeam.cs)) :
   à la fin du tour ennemi, dans l'ordre — (1) un `BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER`
   dont `CheckProbabilityPermille(buff.Value)` passe lance le skill PASSIF ciblé ;
   (2) un `BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER` de même lance le S1 ; (3) sinon, si
   le défenseur a été touché ce tour (`SkillRecord.HitAttacker`) et que
   `CheckProbabilityPermille(CounterRate)` passe, il contre avec son **S1** contre
   l'acteur ennemi. Le hit de contre est un S1 ordinaire (§ 7/§ 8) — rien de
   spécifique à calculer.
10. ~~Caps de stat par scène~~ — **RÉSOLU** (26/08/2026, C#) : `CDungeonScene.m_StatCapDic`
    n'est rempli que par `ParseStatCapString(PVPRealTimeScheduleTemplet.TacticsLeaugeStatCap)`
    — la **Tactics League** (PvP temps réel), chaîne `STAT,valeur,STAT,valeur…` ;
    aucun contenu PvE ne cape les stats. Hors périmètre.
11. ~~`GetCriticalStatBuffValues`~~ — **RÉSOLU** (26/08/2026, C#) : les buffs de crit
    PASSIFS/ON_SPAWN entrent dans `CalcFinalStat` puis cap 1000, les ACTIFS
    s'appliquent APRÈS le cap (`ApplyRate(core + add, rate)`), re-cap après le plat
    PvP — § 16. Le moteur applique le cap 1000 sur la stat finale ; l'ordre
    passif/actif n'est pas distingué (aucune mesure ne le contraint : un scénario
    qui dépasserait 100 % de crit AVEC des buffs actifs le montrerait).
12. **`CBattleManager.ProcessDamage` / `ProcessDamageSimulator`** : l'orchestration
    autour de `CalcDamage` (ordre shield → HP, WG, événements on-damage) n'est pas
    lue — les formules qu'elle appelle le sont toutes (C# disponible dans
    `CBattleManager.cs`).
13. ~~`addRate` de `SetBaseValue`~~ — **RÉSOLU** (04/08/2026, scan exhaustif des
    stores `AddRateAtk`/`AddRateDef` du binaire + callers de `SetStatValue`) :
    la SEULE source combat est `CGuildRaidSpawnData.GetCharacterData` — le scaling du BOSS de guild raid en **overgrade**. Au-delà du
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
16. ~~Écart 1.4.9 → 1.4.14 (13/08/2026) — rédigé, PAS implémenté~~ — **RÉSOLU côté
    lecture** (26/08/2026, client Steam décompilé en C#). Les trois changements de
    comportement du patch 1.4.14 (§ 8.5, § 9.2, § 14.5) étaient rédigés depuis
    l'ASM avec trois inconnues ; le C# les tranche, chacune dans sa section :
    - **§ 9.2** — les 300 ‰ de `PUNISH_DMG_REDUCE_VALUE` sont des TERMES de la
      somme (un par `BT_DOT_PUNISH` du défenseur, +1 si l'attaquant en porte un),
      pas un plafond ;
    - **§ 8.5** — la quantité accumulée dans `CurrentSkillFactor` est le
      `DamageFactor` du hit, et l'accumulation est INCONDITIONNELLE : le garde ne
      gouverne que la limite par tour (la lecture ASM la plaçait sous le garde —
      corrigée) ;
    - **§ 14.5** — le « slot virtuel 0x198 » est `CCharacterBattle.SetDie()` ; la
      branche « peut tuer » des scènes exige la scène **ET** `owner.IsBoss` (l'ASM
      disait « ou » — corrigée) ; le garde INVINCIBLE d'entrée manquait.

    Les deux commentaires du moteur qui portaient les anciens numéros
    (`recovery.ts`, `types.ts`) sont corrigés le même jour.

    RESTE — de l'implémentation, plus de la lecture : le moteur TS n'implémente
    ni les termes DOT_PUNISH (§ 9.2 — le seul des trois qui pèse sur un hit de
    joueur, aucune mesure ne le contraint encore), ni l'exemption world boss
    (§ 8.5 — limite par tour d'un boss, hors périmètre), ni le reverse heal létal
    (§ 14.5 — perte de PV, hors périmètre dégâts).

17. **Poses multiples d'un DoT par un même skill — pas de cumul du tick,
    mécanisme non désassemblé.** Le S1 de Gnosis Beth porte DEUX lignes de
    pose d'Eternal Bleeding (2000092_1_1 + _1_2 `OWNER_ALONE`, coexistence
    permise par `isTypeOverlap`/`isIdOverlap`) — mais les 3 mesures du
    24/08/2026 (fixtures `gnosisbeth-*`, dont la discriminante SANS EE)
    montrent UN popup = tick unitaire × enhance, jamais × poses. Non
    tranché : la 2ᵉ pose est-elle écartée (`OWNER_ALONE` faux dans ces
    combats ?), fusionnée (refresh du même type ?), ou les deux buffs
    coexistent-ils avec un tick unique par type ? PARTIELLEMENT tranché le
    25/08/2026 (obs Sevih en jeu) : les instances d'un même DoT COEXISTENT —
    deux CASTS successifs du S1 = deux DoT simultanés qui tickent CHACUN au
    même montant (ni refresh ni cumul de popup, § 11). Reste ouvert : le sort
    de la 2ᵉ LIGNE (`_1_2`) d'un même cast. (`_nCount` est tranché par le C#
    le 26/08/2026 : 1 au tick périodique, tours restants à la détonation ;
    `StackCount` multiplie `Value`, § 14.1.) Le moteur garde une
    ligne de tick par (type, tooltip) — le tick d'UNE instance, le bon
    contrat vu la coexistence. Plusieurs poseurs du même type = plusieurs
    popups (confirmé Sevih 25/08). (L'entrée précédente de ce
    numéro — « débuffs passifs ENEMY_TEAM jamais posés » — était FAUSSE :
    artefact d'une ambiguïté numérique levée le jour même par la mesure sans
    EE ; ces débuffs sont posés et lus, cf. § 11.)
18. ~~`BT_DMG_TARGET_DEBUFF_LIMIT` (164, nouveau 1.4.15) — sémantique non
    désassemblée~~ — **RÉSOLU côté lecture** (26/08/2026, C# de
    `FindBuffAdditionalDamage`, § 9.1) : même contribution que
    `BT_DMG_TARGET_DEBUFF` (`Value × débuffs VISIBLES de la cible`), mais le
    cumul de toutes les instances d'un même `BuffID` est PLAFONNÉ à
    `BuffTemplet.LimitValue` (dictionnaire par ID, local à l'appel) ; jumeau
    `BT_DMG_TARGET_BUFF_LIMIT` (165) côté buffs. Donnée 1.4.15 : le trans_8 de
    Demiurge Saeran (`trancendent_8_2000129_2`) est la SEULE ligne de
    `BuffTemplet` à `LimitValue` non nul — `Value` 200, `LimitValue` 2000 :
    +20 % par débuff, plafond +200 % (10 débuffs). RESTE — l'implémentation :
    l'extracteur `datagen/damage/buffs.ts` n'exporte pas `LimitValue`, et le
    moteur signale encore l'entrée `unresolved` (contribution 0, gear.ts). À
    brancher : champ `limitValue` dans buffs.json, plafond par ID dans
    l'agrégation § 9.1 — et une fixture Saeran pour le prouver.

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

## 14. Soins, shields, reverse heal, WG — CBuff.OnCreate, CBuff.OnTurnStart & AddHP

Ces mécaniques ne sont pas dans `CFormula` : ce sont des **buffs**, résolus dans le
dispatch `CBuff.OnCreate` (à la pose) et `CBuff.OnTurnStart` (tick périodique — HoT,
reverse heal, DoT § 11), appliqués via `CCharacterBattle.AddHP`. Listings :
[`CBuff_OnCreate.cs`](./damage-formula-cs/CBuff_OnCreate.cs),
[`CBuff_OnTurnStart.cs`](./damage-formula-cs/CBuff_OnTurnStart.cs),
[`CCharacterBattle_AddHP.cs`](./damage-formula-cs/CCharacterBattle_AddHP.cs),
[`CBuff_get_Value.cs`](./damage-formula-cs/CBuff_get_Value.cs),
[`CBuff_CheckReverseHealCAP.cs`](./damage-formula-cs/CBuff_CheckReverseHealCAP.cs),
[`CCharacterBattle_SetShieldHP.cs`](./damage-formula-cs/CCharacterBattle_SetShieldHP.cs).

### 14.1 Valeur d'un buff et enhance

- `CBuff.Value` = `Templet.Value × StackCount` — **linéaire en stacks**, partout
  (dégâts § 9, soins, shields, taux des DoT § 11…).
- Buffs de stat `BT_STAT` (31) VISIBLES (`Templet.ToolTipID != 0`) : si le porteur a
  un `BT_STAT_BUFF_ENHANCE` (29 — pour un buff) ou `BT_STAT_DEBUFF_ENHANCE` (30 — pour
  un débuff), la valeur effective devient `InstanceValue = ApplyRate(Value, enhance.Value)`
  = `trunc(Value × (1000 + enhance) / 1000)`. Les autres familles de stat
  (`BT_STAT_PREMIUM` 32, `_TOWER_CONTENT`…) ne sont PAS enhancées.
- BT 33 STAT_OWNER_LOST_HP_RATE : `InstanceValue = owner.GetLostHPRateValue(Value)`.
- BT 34 …_HALF : `hpEff = clamp(2×HP − MaxHP, 0, MaxHP)` (calcul `long`) puis
  `InstanceValue = owner.GetLostHPRateValue(hpEff, Value)` — le bonus croît deux fois
  plus vite et sature quand HP ≤ 50 %.
- Un buff de stat sur `ST_HP` préserve le **ratio de PV** : porteur à PV pleins →
  `AddHP(MaxHP)` après `AddStatBuff` (reste plein) ; sinon
  `AddHP( (int)((long)MaxHP' × HP / MaxHP) − HP )` — `bIgnoreHealModifier = true` dans
  les deux cas (ce n'est pas un soin).

### 14.2 Soins directs (BT 14 HEAL_BASED_CASTER / 15 HEAL_BASED_TARGET)

```text
heal = value                                                // valeur plate
if Templet.StatType != ST_NONE:
  heal = source.Data.GetStatValuePermille(StatType, value)  // source = caster (14) ou porteur (15)
  if IsPvp ou IsPvpRealtime:
    heal = MulPermille(heal, 1000 − scene.PvpHealReduceRate) // 0 avant le 1er cycle de pénalité,
                                                            // puis 500/750/1000 ‰ (§ 12.7, § 17.6)
healEffectif = AddHP(owner, heal, bHeal = true)             // § 14.3
SkillRecord.Heal += healEffectif ; CTeam.AddTotalHeal(casterUID, healEffectif)
```

La réduction PvP ne touche que les soins PAR STAT — un soin plat (`StatType ==
ST_NONE`) n'est pas réduit (la lecture ASM la plaçait hors de la branche : corrigé le
26/08/2026). Les HoT sont ces mêmes buffs re-déclenchés à chaque `OnTurnStart`
(code identique).

### 14.3 AddHP(value, bHeal, bIgnoreUndead, bIgnoreHealModifier) — modificateurs

Pour `value > 0` (soin), si `!bIgnoreHealModifier` et que le porteur a un buff de
modification de soins reçus (`FindBuffeReceiveHeal()`) :

```text
if BT_SEALED_RECEIVE_HEAL (7):        return 0            // soin annulé
elif BT_INCREASE_RECEIVE_HEAL (8):    value += MulPermille(value, buff.Value)
elif BT_REDUCE_RECEIVE_HEAL (9):      value -= MulPermille(value, buff.Value)
// chaîne elif : INCREASE prime, un seul des deux s'applique
```

Puis, inconditionnellement pour les soins (toujours sous `!bIgnoreHealModifier`) :

```text
if IsPvpRealtime: value -= MulPermille(value, match.FieldSkillReduceReceiveHeal)
if porteur a BT_DOT_BLEED (57): value = MulPermille(value, 500)   // saignement : soins ÷ 2
```

Pour `value < 0` (dégâts) : le **shield absorbe d'abord**
(`shield > |value|` → `shield += value`, dégâts 0 ; sinon `value += shield`, shield = 0,
`RemoveBuffShield()`) ; un boss comptabilise `|value|` (`SetBossDamage`, `LoseHP` hors
rage). Enfin `HP = clamp(HP + value, 0, MaxHP)` ; si HP tombe à 0 et BT_UNDEAD (116)
présent (et `!bIgnoreUndead`) → HP = 1. **Retourne `value` ajusté** (modificateurs de
soin, absorption du shield) — PAS le delta de PV clampé : un soin de 500 sur 100 PV
manquants renvoie 500 (c'est cette valeur qui alimente `SkillRecord.Heal`). Le
paramètre `bHeal` n'est pas lu dans le corps (uniquement transmis par les appelants).

### 14.4 Shields (BT 21 SHIELD_BASED_CASTER / 22 SHIELD_BASED_TARGET)

```text
shield = (Templet.StatType != ST_NONE)
           ? source.Data.GetStatValuePermille(StatType, value)  // source = caster (21) ou porteur (22)
           : value
SetShieldHP(owner, shield)     // REMPLACE m_nShieldHP (aucun cumul) et pose m_nShieldMax pour la jauge
```

Pas de réduction PvP sur les shields. La consommation est dans AddHP (§ 14.3) ;
`RemoveBuffShield` retire le buff quand le shield tombe à 0.

### 14.5 Reverse heal (BT 16 …_CASTER / 17 …_TARGET, **18/19 `_ABLE_KILL`**, cap BT 20)

Listings : [`CBuff_OnCreate.cs`](./damage-formula-cs/CBuff_OnCreate.cs) (les deux
`case`, CASTER et TARGET, symétriques au choix de la source de stat près),
[`CBuff_TrySetDieByReverseHeal.cs`](./damage-formula-cs/CBuff_TrySetDieByReverseHeal.cs).

```text
if owner a un buff BT_INVINCIBLE:  effet SYS_BUFF_INVINCIBLE, rien d'autre   // garde d'entrée
v = value
if Templet.StatType != ST_NONE:
  v = source.Data.GetStatValuePermille(StatType, value)   // source = CASTER (16/18) ou OWNER (17/19)
v = CheckReverseHealCAP(v)     // min(v, plus petit BT_REVERSE_HEAL_CAP (20) dont la condition passe)
if HP + ShieldHP > v:
  AddHP(-v)                                    // passe par le shield (§ 14.3)
elif Type ∈ {18 CASTER_ABLE_KILL, 19 TARGET_ABLE_KILL}:      // ← 1.4.14
  AddHP(-v)
  TrySetDieByReverseHeal()                     // tue, PARTOUT, sans condition de scène
elif scène ∈ {GuildDungeon, EventChallenge, WorldBoss, MonadGateSingularity} ET owner.IsBoss:
  AddHP(-v)                                    // peut tuer
else:
  AddHP(-(HP + ShieldHP - 1))                  // laisse exactement 1 (PV+shield)
  v = HP_avant + ShieldHP - 1                  // montant AFFICHÉ
if v != 0: ShowDamage(caster, owner, |v|, crit=false)
```

Le reverse heal ignore défense, élément, crit et DMG_REDUCE — c'est une perte de PV
brute, pas un dégât. `AddHP` est appelé avec ses défauts (`_bHeal=false`,
`_bIgnoreUndead=false`, `_bIgnoreHealModifier=false`).

**Nouveauté 1.4.14 — le reverse heal peut tuer explicitement.** L'énumération gagne
`BT_REVERSE_HEAL_BASED_CASTER_ABLE_KILL` (18) et `…_TARGET_ABLE_KILL` (19). Pour ces
deux types la branche létale court-circuite entièrement la liste de scènes et appelle
`CBuff.TrySetDieByReverseHeal` :

```text
TrySetDieByReverseHeal():
  owner = buff.Owner
  if owner.HP != 0:      return          // le AddHP précédent ne l'a pas mis à 0
  if !owner.IsAlive:     return
  if owner.IsNotDie:     return
  owner.SetDie()                         // CCharacterBattle.SetDie(_bReturnEscape = false)
  if owner.TeamType != ENEMY: return
  if !owner.IsBoss:           return
  owner.GetTeam().BossKill()             // CTeam.BossKill — comptabilité de kill de boss
```

Le garde `IsNotDie` est le seul verrou : un porteur marqué « ne meurt pas » survit.
Le tour de comptabilité `BossKill` ne s'exécute que pour un boss de l'équipe ENNEMIE.

Deux corrections de la lecture ASM (26/08/2026) : la branche « peut tuer » des scènes
exige la scène **ET** `owner.IsBoss` (l'ASM disait « ou ») ; le « slot virtuel 0x198 »
est `SetDie()`. Le garde INVINCIBLE d'entrée n'était pas rédigé.

**Variante PÉRIODIQUE** (`CBuff.OnTurnStart`, le même buff aux tours suivants) : même
calcul, mais les branches létales diffèrent et sont ASYMÉTRIQUES — côté CASTER
(16/18) : `_ABLE_KILL` tue (`TrySetDieByReverseHeal`), sinon laisse toujours 1 PV,
sans aucune condition de scène ; côté TARGET (17/19) : `_ABLE_KILL` tue, sinon
`AddHP(−v)` (peut tuer) en GuildDungeon / EventChallenge et 1 PV ailleurs — sans
condition `IsBoss`, sans WorldBoss ni MonadGateSingularity.

### 14.6 Jauge de faiblesse et DOT immédiats

- BT 85 WG_HEAL : `wg += (ApplyingType == OAT_RATE) ? MulPermille(MaxWG, value) : value`.
- BT 86 WG_REVERSE_HEAL (la lecture ASM le nommait « WG_DMG », 89 : corrigé) : si
  `RageManager.CanReduceWG`, `wg −= CalcDamageWG(caster, owner, (OAT_RATE) ?
MulPermille(MaxWG, value) : value)` (§ 11) ; sinon le buff n'est pas créé.
- BT 63–69 IMMEDIATELY_<TYPE> — **détonation**, à la création du buff : `dot =
ConvertImmediatelyToDot(type)` ([`CBuff_ConvertImmediatelyToDot.cs`](./damage-formula-cs/CBuff_ConvertImmediatelyToDot.cs))
  ; pour chaque buff de ce type sur la cible :
  `ProcessDamageOverTime(dot, ApplyRate(dot.Value, Templet.Value), dot.RemainTurnCont, caster)`
  puis `dot.RemainTurnCont = 0` ; enfin `ClearBuffFinishDuration()`. Le tick complet
  (formule par type, enhance, caps IMMEDIATELY) est en § 11.

## 15. Passifs d'équipement (sets, options uniques, EE, artefacts…)

Deux canaux distincts, tous deux côté `CCharacterData` / `CSkillManager` :

1. **Stats chiffrées** (main stat, substats, bonus de set en %) : agrégées par
   `CCharacterData.CalcStat` (§ 17.1 — `SetItemOptionsValue(m_EquipDic)` +
   `SetSetItemValue(m_SetItemDic)` par stat) dans les paramètres
   `itemOptionValue`/`itemOptionValueRate` de `CalcFinalStat` (§ 3). Données :
   `ItemOptionTemplet.json` ; la croissance d'une option principale est en § 17.5.

2. **Passifs à effet** (procs de set, option unique d'une pièce, équipement
   exclusif, ooparts, artefacts…) : ce sont des **`CBuffTemplet` ordinaires**,
   chargés dans des listes dédiées de `CSkillManager` :
   - `InitializeItemUniqueBuff(Weapon, Accessory, Helmet, Armor, Gloves, Shoes,
Exclusive, Ooparts)` → `m_ItemBuffTempletList` ;
   - `CCharacterData.CreateBuffSetItem` → `InitializeItemSetBuff` →
     `m_ItemSetBuffTempletList` ;
   - `m_ArtifactBuffTempletList` et les listes de contenu : `m_GuildRaidBuffTempletList`,
     `m_PvpLeagueBuffTempletList`, `m_PVPRealTimeLeaderBuffTempletList`,
     `m_AwakeningNodeBuffTempletList` (nœuds d'éveil IOT_BUFF, § 17.4),
     `m_InfiltrateBuffTempletList`, `m_MonadGateBuffTempletList`,
     `m_DailyGiftBuffTempletList`.

   Le collecteur central `CSkillManager.GetBuffList(skillType, isPassiveSkill,
createType, ref list)` ([`CSkillManager_GetBuffList.cs`](./damage-formula-cs/CSkillManager_GetBuffList.cs))
   parcourt, dans cet ordre : les buffs des skills (`m_SkillList` entier si
   `SKT_ALL`, sinon le skill demandé), puis — si `isPassiveSkill` — ceux des skills
   passifs et du `SKT_UNIQUE_PASSIVE` (dédoublonnés), **puis toutes les listes
   ci-dessus**, chaque templet filtré par `IsBuffCreateType(createType)` (le moment,
   enum `BUFF_CREATE_TYPE` : 1–2 PASSIVE/PASSIVE2, 3–4 ON_SPAWN/ON_SPAWN2, 5 ON_TURN,
   6–11 SKILL_START…SKILL_FINISH_IMMEDIATELY, 12–15 ON_TURN_END_\*/ON_TURN_CHANGE,
   16 DAMAGE, 17 AVOID, 18 DIE, 19–24 CHAIN\_\*, 25 ON_BREAK, 26 ON_RESIST,
   27 ON_GOLDEN_CURSE_BUFF_REMOVE) et `IsCallerSkillType(skillType)`. Les wrappers
   `GetBuffListOn*` fixent juste le `BUFF_CREATE_TYPE`
   ([`CSkillManager_GetBuffListOnSpawn.cs`](./damage-formula-cs/CSkillManager_GetBuffListOnSpawn.cs) :
   `SKT_NONE`, passifs, ON_SPAWN puis ON_SPAWN2).

   **Exclusion structurelle** (C#, 26/08/2026) : dans les listes de skills,
   d'items, de nœuds d'éveil, d'infiltration, de Monad et de daily gift, un
   `BT_STAT_PREMIUM` visant `ME` n'est JAMAIS collecté comme buff de combat — il
   passe par `m_StatPremiumBuffList` (`SetBuffPremiumValue`, § 17.1), la voie qui le
   met dans la fiche (§ 16.1). Les listes de sets, d'artefacts, de guild raid et de
   PvP n'ont pas cette exclusion.

   **Conséquence pour le calculateur : un passif d'équipement instancié est un
   `CBuff` comme un autre** — il passe par les mêmes agrégations que les buffs de
   skills (§ 9, § 14) : un set qui donne du DMG Boost alimente `CheckDamageRate`,
   un proc de soin passe par § 14.2, etc. Aucune formule spécifique aux items.

   Particularité : les buffs d'équipement portant un `BuffCool` sont gardés par
   `m_EquipItemBuffCoolList` (dictionnaire par BuffID) — `CheckItemBuffCool`
   ([`CSkillManager_CheckItemBuffCool.cs`](./damage-formula-cs/CSkillManager_CheckItemBuffCool.cs))
   laisse passer un BuffID absent du dictionnaire, sinon exige `CCustomBuffCool.CanUse()`
   (vrai si `Cool == 0`, sinon si `CurrentCool ≥ Cool`) puis remet le compteur à zéro
   (`Zero()`) ; la cadence d'incrémentation de `CurrentCool` n'est pas lue.

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
> inactif. `BT_WG_*` → jauge de faiblesse, hors périmètre dégâts (agrégation lue
> § 11 / § 12.3) ; conditions non évaluables § 12.1 → non résolu, contribution 0.
>
> RÉALISÉ (23/08/2026) — **buffs d'ALLIÉS** : les MÊMES résolveurs (kit + EE)
> tournent en « mode allié » pour chaque membre déclaré (`gear.ts`,
> `makeCollector(allyReceiver)`) ; le receveur est l'attaquant du scénario.
> Règles, toutes tirées de la donnée :
>
> - Sélection de cible d'abord : `MY_TEAM`/`MY_TEAM_WITHOUT_ME` atteignent le
>   receveur ; `MY_TEAM_<CLASSE>` seulement si sa classe matche — la sémantique
>   « classe » (et non « membre en train d'agir ») est PROUVÉE par la desc
>   officielle du S2 d'Eris : « increases the damage of ally Strikers » =
>   `MY_TEAM_ATTACKER` (2000117_2_5), Striker = `CCT_ATTACKER`. Les sélections
>   SITUATIONNELLES (`LOWEST_HP_RATE`, `HIGHEST_ATK`, `ONE`…) ne sont pas
>   attribuables statiquement : signalées si damage-pertinentes. `ME` (buffs
>   de l'allié sur lui-même) : sans effet sur le hit calculé. Les auras
>   `ENEMY*` d'un allié suivent le classement défenseur normal.
> - `OWNER_CLASS` (le porteur du buff = le receveur) : évalué —
>   `BuffConditionValue` = enum `CLASS_ENUM` du binaire (même table que les
>   quirks `AAT_CLASS` ; corroboration : `BID_CEQUIP_2000117_2` porte cond 2 =
>   `CCT_ATTACKER` et sa desc dit « Strikers »).
> - `BT_STAT_PREMIUM` d'un ALLIÉ : PAS la doctrine fiche — le premium d'un
>   allié n'est pas dans la fiche saisie du receveur (fiche de VILLE, sans
>   équipe) ; il descend le canal buff normal (§ 16.4 : le premium EST une
>   part de `buffVal`/`buffRate`), sans défactorisation.
> - Créations DYNAMIQUES (`SKILL_FINISH`, `SKILL_START` — le proc part d'un
>   skill de l'ALLIÉ, pas d'une ligne du rapport) : jamais simulées d'office,
>   mais DÉCLARABLES côté attaquant — le scénario porte les stacks posés en
>   jeu (z `ab`, stepper du panneau Contexte, plafond = `StackCount` de la
>   ligne, valeur effective = value × stacks § 14.1). PROUVÉ in-game
>   23/08/2026 (2 captures Sevih, Francesca + Eris alliée vs Ars Nova) :
>   S2 crit 30658 EXACT (premiums d'équipe seuls) et S1 crit 25276 EXACT
>   avec 1 stack déclaré du +20 % Strikers — 1 S2 d'Eris = 1 stack de
>   `2000117_2_5`, additif § 9.1. La déclaration couvre AUSSI les procs du
>   PROPRE kit/EE/quirks de l'attaquant (demande Sevih 23/08 : « dire ce
>   perso a cette méca stackée N fois » — Eris attaquante porte son propre
>   +20 %, sa classe évaluée contre `MY_TEAM_ATTACKER`) ; seuls les procs à
>   VALEUR qui atteignent le porteur sont déclarables, les flags
>   (MARKING/GROUP) et cibles `ENEMY*` restent signalés non déclarables
>   (chips cible). Côté UI, un proc portant le tooltip d'une des 6 chips
>   génériques (`FX_CHIP_TOOLTIPS`) EST ce buff visible en jeu — mêmes
>   magnitudes sur la table entière, pas de cumul (`isTypeOverlap`) : il se
>   déclare par la CHIP, jamais par un stepper (sinon double compte —
>   recadrage Sevih 23/08) ; seules les mécaniques MASQUÉES (sans tooltip)
>   ou à effet distinct (tooltip propre au perso) ont un stepper. Passifs restreints par lanceur de l'allié
>   (`SKT_BACKUP_*`) : contribution 0, signalé. Conditions d'état
>   (`OWNER_HAS_BUFF`…) : entrées `stateful` cochables comme celles du
>   porteur.
> - ~~Stats propres de l'allié (main stat de talisman) : aucun consommateur~~
>   — **CORRIGÉ le 24/08/2026** (bloc suivant) : le sondage du 23/08 était mal
>   cadré (il cherchait les familles caster-stat) — la main d'un talisman est
>   un buff d'ÉQUIPE direct. Reste vrai : les STATS du porteur allié ne sont
>   pas capturées, les lignes qui en dépendent (`BT_DMG_CASTER_*`, ex.
>   `BID_CEQUIP_2000040` sur les PV perdus) sortent signalées, contribution 0.
>
> RÉALISÉ (24/08/2026) — **équipement d'ÉQUIPE** (talisman / arme /
> accessoire, porteur ET alliés — remarque Sevih : « les passifs
> d'arme/accessoire/set et les talismans de la team ») :
>
> - **Main stat de talisman = buff d'équipe**, PAS une stat d'item :
>   `BID_ITEM_STAT_OOPARTS_<STAT>_<rareté>` = `BT_STAT_PREMIUM` cible
>   `MY_TEAM`, permanent (`turnDuration: -1`, `isEquipBuff`), cumulable entre
>   porteurs (`isTypeOverlap`). 9 stats (ATK/DEF/HP/CRI/CRI_DMG/DMG_REDUCE/
>   DMG/BUFF_CHANCE/BUF_RESIST) × 3 raretés (suffixe 4/5/6) ; seul le 6★
>   porte les 11 niveaux d'enchant (ATK : L1 120 ‰ → L11 150 ‰), niveau de
>   ligne = enchant + 1 (`pickBuffRow` replie les paliers mono-niveau) — même
>   motif que la main « dégâts vs élément » des EE. Résolution slug → buffId
>   par les POOLS réels au palier le plus haut (`talismanMainBuffs`,
>   preset-gear.ts) ; saisie : z `tm`/`tml` (porteur), `al[2..3]` (alliés,
>   UI du 27/07 enfin consommée).
> - **Destination — MESURÉ (Sevih, 24/08/2026, en deux temps)** : « la stat
>   est appliquée de base sur la fiche du perso qui le porte ; celle d'un
>   autre membre n'apparaît pas » (Aer porte tal DCC → sa fiche montre le
>   total ; Eris porte tal ATK → la fiche d'Eris l'inclut, celle d'Aer non).
>   ET la main du porteur reste dans l'ASSIETTE que les buffs multiplient —
>   stat d'ITEM, PAS un premium défactorisé § 16.4 : l'expérience Sterope
>   +100 % EFF (fixture `gnosisbeth-scrapmetal-effbuff`) donne fiche × 2
>   TOUT ROND (190 → 380, tick 3990 EXACT) là où la défactorisation aurait
>   rendu 365. Donc : pour le PORTEUR, rien à collecter (la fiche saisie
>   suffit) ; pour un ALLIÉ, canal buff du receveur (doctrine premium
>   d'allié prouvée le 23/08). Les premiums skill_8/EE, eux, restent
>   défactorisés (preuve Caren 18/08 intacte — deux familles distinctes).
> - **NON-CUMUL par stat — MESURÉ (Sevih, 24/08/2026)** : les mains de
>   talisman ne se cumulent pas sur la même stat, la PLUS FORTE l'emporte
>   dans l'équipe. Le moteur (inputs.ts, bloc allyPassives) : le porteur
>   pose sa valeur (fiche saisie) ; une main d'allié ne verse que
>   l'EXCÉDENT sur le meilleur déjà retenu (delta additif — § 16.4), les
>   autres sont désactivées. Ne concerne QUE les mains OOPARTS — les autres
>   premiums d'équipe (EE, skill_8) se cumulent (crit dmg 3540 = fiche +
>   EE + skill_8, capture du 23/08).
> - **VALIDÉ IN-GAME le jour même** (2 captures Sevih, fixtures dorées) :
>   `francesca-eris-tal-dmg` — S1 crit 9907 EXACT (0,000 %), la main DMG
>   +10 d'Eris alliée (120 ‰ `ST_DMG_BOOST`) atteint Francesca par le canal
>   buff, avec une fiche saisie à dmg_boost 0 (prouve aussi le fix « stat
>   non saisie ») ; `francesca-tal-dmg-noncumul` — S1 crit 10141 EXACT,
>   deux alliés portent la MÊME main DMG (120 ‰ et 96 ‰) et seule la plus
>   forte compte (un cumul à 216 ‰ aurait calculé trop haut).
> - **Armes/accessoires d'ALLIÉS** : `resolveGearPassives` en mode allié
>   (z `al[6..9]` : arme, breakthrough, accessoire, breakthrough) — seules
>   les lignes qui ATTEIGNENT l'attaquant comptent. Recensement 1.4.14 des
>   lignes d'équipe damage-pertinentes : `BID_ITEM_UO_ACC_25` (+10 % vs boss
>   aux alliés, `MY_TEAM_WITHOUT_ME`), `BID_ITEM_UO_WEAPON_22` et
>   `BID_FESTIVAL_UO_WEAPON_2` (`BT_DMG_CASTER_STAT` 2,5 % de la DEF du
>   PORTEUR allié — dépend d'une stat non capturée : signalé, contribution 0) ; le reste est non-damage (DEF/heal/shield/stealth d'équipe).
> - **Sets : RIEN à faire côté alliés** — sondage complet des
>   `twoPiece`/`fourPiece` : AUCUN buff `MY_TEAM` en 1.4.14 ; le set d'un
>   allié n'atteint jamais l'attaquant (celui du porteur était déjà branché).
> - Niveaux des passifs d'armes/accessoires : exactement 5 lignes de buff
>   (`[1..5]`) mappées `tier 0..4` (breakthrough) — la saisie d'allié suit
>   la même règle que le porteur.
>
> Condition `TARGET_ELEMENT` PROUVÉE : `BuffConditionValue` =
> `CHARACTER_ELEMENT_TYPE` de la CIBLE (`CHARACTER_ELEMENT_TYPE.cs` : EARTH=0,
> WATER=1, FIRE=2, LIGHT=3, DARK=4 ; valeur absente = 0 = terre). Corroborations : la desc
> officielle de l'EE 2000019 (« damage dealt to Fire enemies ») porte la
> valeur 2 = CET_FIRE ; les mains d'EE `BID_CEQUIP_MAIN_DMG_<EL>` visent
> l'élément que le porteur BAT (feu → terre…), les armes de Singularité
> `Singularity_equip_dmg_<el>` l'élément qui les contre — les deux familles
> se déduisent de la même table sans exception.

## 16. Couches contextuelles au-dessus de CalcFinalStat — CStatValue (audit de couverture)

La stat lue en combat est `CStatValue.GetFinalValue`, pas la sortie brute de
`CalcFinalStat`. Listings : [`CStatValue_SetFinalValue.cs`](./damage-formula-cs/CStatValue_SetFinalValue.cs),
[`CStatValue_GetFinalValue.cs`](./damage-formula-cs/CStatValue_GetFinalValue.cs),
[`CCharacterData_GetCriticalStatBuffValues.cs`](./damage-formula-cs/CCharacterData_GetCriticalStatBuffValues.cs).
Chaîne exacte :

```text
SetFinalValue():                                    // au recalcul (dirty)
  if type == ST_CRITICAL_RATE (7):
    (addP, rateP) = owner.GetCriticalStatBuffValues(passifs = true)   // buffs de crit PASSIFS/ON_SPAWN
    core  = CalcFinalStat(…les 11 autres paramètres…, addP, rateP)    // les passifs DANS la formule (§ 3)
    core  = clamp(core, 0, 1000)                                       // CAP DUR : 100 % de taux critique
    (addA, rateA) = owner.GetCriticalStatBuffValues(passifs = false)  // buffs de crit ACTIFS (skills, procs…)
    final = max(0, ApplyRate(core + addA, rateA))                      // appliqués APRÈS le cap
  else:
    final = CalcFinalStat(les 13 paramètres)        // § 3
  m_nEquipIncrementValue = final − CalcFinalStat(base, spawn, évo, éveil, éveilRate, 0, 0, 0, 0, 0, 0, 0, 0)
                                                    // SORTIE : part monad/trans/archive/items/buffs (UI/CP)
  final += m_nPvpRealtimeFieldSkillValue            // field skills PvP temps réel : bonus PLAT additif
  if type == ST_CRITICAL_RATE: final = clamp(final, 0, 1000)   // re-cap après le plat PvP

GetFinalValue():
  if m_nTempMaxValue != -1: return m_nTempMaxValue  // OVERRIDE total (synchro de niveau)
  if dirty: SetFinalValue()
  if scene != null && scene.m_StatCapDic contient le type: return min(final, cap)   // § 12.10
  return final
```

`GetCriticalStatBuffValues(passifs)` (§ 12.11, LEVÉE le 26/08/2026) parcourt
`m_StatBuffList` (les `CBuff` de stat — `InstanceValue` si `IsUseInstanceValue`, sinon
`Value`) et `m_StatPremiumBuffList` (templets premium, `Value`) sur `ST_CRITICAL_RATE` ;
un buff est « passif » si `BuffCreateType ∈ {PASSIVE, PASSIVE2, ON_SPAWN, ON_SPAWN2}` ;
`OAT_ADD` alimente `add`, `OAT_RATE` alimente `rate`. Les taux de crit actifs d'un
buff de skill s'appliquent donc SUR une valeur déjà capée à 1000 — puis le total est
re-capé.

Sous-classes : `CCustomBossStatValue.GetFinalValue` renvoie la BASE brute pour `ST_HP`
([`CStatValue_GetFinalValue_ovr1.cs`](./damage-formula-cs/CStatValue_GetFinalValue_ovr1.cs),
§ 3.2) ; `CSkillDungeonStatValue.GetFinalValue` renvoie 0 pour `ST_SPEED`
([`CStatValue_GetFinalValue_ovr2.cs`](./damage-formula-cs/CStatValue_GetFinalValue_ovr2.cs)).

Vérifications de couverture par grep du C# (26/08/2026 — elles remplacent le scan
des `bl` du binaire du 13/08) :

- **`Accuracy` (ST_ACCURACY, 13) : ZÉRO consommateur** hors `CCharacterData` — la
  précision n'est lue par aucun code de combat (l'esquive ne roll que sur l'Avoid
  § 7 ; le « toucher » des effets, c'est BUFF_CHANCE/BUFF_RESIST § 5). Elle ne peut
  agir que si un buff dynamique la référence par StatType.
- `Avoid` : un seul consommateur, `CheckDamageRate` ✓ (couverture § 7 confirmée).
- `BuffChance`/`BuffResist` : `CheckResist` (§ 5) n'a qu'un appelant,
  `CBuff.Initialize` — le test se joue à la POSE du buff, et seulement si
  `!Templet.IsIgnoreResist` (un buff peut ignorer la résistance) ; le reste des
  usages est `CalcBattlePower`.
- `CounterRate` (ST_COUNTER_RATE, 22) : un appelant,
  `CCharacterBattle.OnReturnFinishDefenderTeam` (§ 12.9).
- `CalcDamage` : 2 appelants — `CBattleManager.ProcessDamage` et
  `ProcessDamageSimulator` (chemin « simulateur » identique, utilisé pour les
  prévisualisations/IA). `CheckDamageRate` : 3 appelants (`UseSkill` et le
  simulateur). `CalcFinalStat` : uniquement `CStatValue` (le pipeline ci-dessus est
  le seul).

Audit d'exhaustivité de la classe `CFormula` (`CFormula.cs`, 22 méthodes statiques +
une fonction locale) — toutes comptabilisées :

| Méthode                                                      | Statut                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| CalcStat                                                     | § 3.1                                                               |
| CalcFinalStat                                                | § 3                                                                 |
| CheckProbability / …Percent / …Permille                      | § 4                                                                 |
| CheckResist                                                  | § 5                                                                 |
| GetElementSuperiority / GetElementeryDamageRate              | § 6                                                                 |
| CheckDamageRate / AddCheckEnemyTeamDecreaseDamageRate        | § 7                                                                 |
| CalcDamage + fonction locale `CalcDamage(int)`               | § 8                                                                 |
| IsIgnoreTurnLimitDamage                                      | § 8.5                                                               |
| CalcDamageDOT / CalcDamageWG / CalcCharacterSharedDamage     | § 11                                                                |
| InitRandomSeed / GetRandomRange ×2 / GetBattleRandomRange ×2 | RNG — tirages injectés dans le moteur (§ 4)                         |
| Approximately                                                | comparaison float à tolérance, aucun appel dans les formules        |
| CalcBattlePower                                              | **hors périmètre** : calcul du CP affiché, ne touche pas aux dégâts |

Ce qui s'applique **hors combat vs en combat** :

- Permanents (partout, via CalcFinalStat) : évolution, éveil, monad, transcendance,
  archive, items ; les stats affichées hors combat = même pipeline sans `buffVal`/`buffRate`.
- Combat/contenu uniquement : buffs (§ 9/14/15), pénalités PvP (soins § 14.2, ATK
  § 12.7), field skills PvP temps réel (plat, ci-dessus), caps de stat de la Tactics
  League (§ 12.10), override synchro (`TempMaxValue`), avantage d'apparition
  (`spawnAdvantageRate`, monstres PvE), listes de buffs par contenu (§ 15).
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

**Ce que la fiche affichée contient** (corroboré in-game 27/07/2026, AMENDÉ
18/08/2026 — l'affinité n'apparaît PAS dans la fiche, mais les buffs PREMIUM,
si) :

| Couche                                        | Dans la fiche ?                      | Multipliée par `buffRate` en combat ?          |
| --------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| base, évolution, éveil, monad (plats)         | oui                                  | oui                                            |
| taux éveil/monad/transcendance/items          | oui                                  | oui                                            |
| plats d'équipement (`itemVal`)                | oui                                  | oui — mais PAS multipliés par `itemRate` (§ 3) |
| archive / **Codex**                           | oui                                  | **NON** (ajouté après le ×buffRate)            |
| `BT_STAT_PREMIUM` passifs inconditionnels     | **OUI** (canal `buffVal`/`buffRate`) | ils SONT (une part de) ce multiplicateur       |
| Trust / **Affinité**                          | **NON**                              | oui (canal `buffVal`)                          |
| autres buffs de combat, passifs d'équip. § 15 | non                                  | —                                              |

**Buffs PREMIUM dans la fiche (mesuré 18/08/2026, Caren 2000089)** : les
`BT_STAT_PREMIUM` passifs inconditionnels visant le porteur (`ME` comme
`MY_TEAM` — un buff d'équipe couvre son porteur) occupent le canal
`buffVal`/`buffRate` de CalcFinalStat en VILLE comme en combat. Sources :
passif de transcendance (Skill_8), option spéciale d'EE (Lv10 `_ADD`), nœuds
d'éveil IOT_BUFF, artefacts « ooparts ». Preuve à l'unité : fiche nue de Caren
lv120 T-max **2314 (+732)** = calcFinalStat(base 535, évo 247, éveil +800,
trans 300 ‰, codex 100 ‰, `buffRate` **100** = skill_8) — 2109 sans le taux ;
fiche équipée 5631 → sous-total 4291 avec `buffRate` **300** (skill_8 100 +
EE Lv10 200) ; DEF de combat **5891** = div1000((4291 + 200 trust) × 1300) +
53, la valeur que les 6 captures exigeaient (« +60 » = terme croisé
trust × premiums, uniforme sur deux cibles). L'affichage `X (+Y)` de la fiche
est `valeur (delta vs portion blanche)` — `Y` est INCLUS dans `X`.

**Nœuds de quirk MAÎTRES de classe (mesuré 24/08/2026, Francesca 2000015)** :
le nœud d'éveil 101 (« Increases Attack of Striker heroes », IOT_BUFF) est un
`BT_STAT_PREMIUM ST_ATK OAT_RATE` +15 ‰/niveau — un taux premium de PLUS dans
`buffRate`, comme skill_8/EE Lv10. Preuve par le protocole live (fixtures
`francesca-dot-scrapmetal[-atkbuff]`) : tick du Bleed 771 sans buff (identité
transparente, le taux est invisible sans buff de scénario) puis 1110 avec
ATK +30 % — qui n'est EXACT qu'en défactorisant la fiche 2034 par 150 ‰
(sub 1687, combat = div1000(1687 × 1450) + 94 = 2540) ; sans le taux déclaré,
2616 → +2,97 %. Conséquence UI : « déjà dans la fiche » ne veut PAS dire « à
ignorer » — ces nœuds sont sortis du filtre « hausses de stats
inconditionnelles » du réglage quirks (décision du 26/07 amendée). Seuls les
premiums `OAT_RATE` exigent la déclaration : la variante `OAT_ADD` (nœud 141,
Effectiveness des Rangers) vit dans `buffVal`, multipliée comme le reste de
`sub` (§ 3) — mathématiquement transparente, le collecteur l'ignore.

**Identité de reconstruction** (EXACTE quand la stat n'a aucun premium — les
troncatures s'annulent car `fiche = sub_sans_buffs + A`) : pour passer d'une
stat SAISIE depuis la fiche à la stat de combat, avec `Rp` = Σ taux premium
(‰) de la stat,

```text
A       = div1000(base × archiveRate)        // terme Codex (base = CalcStat § 3.1)
sub     = ceil((fiche − A) × 1000 / (1000 + Rp))   // défactorisation (Rp=0 : sub = fiche − A)
combat  = div1000((sub + buffVal) × (1000 + Rp + buffRate)) + A
```

avec `buffVal` incluant les paliers d'affinité. Le jeu garde `sub` en mémoire ;
la défactorisation le reconstruit avec une ambiguïté de ±1 (±2 sur la stat de
combat) quand `Rp > 0` — nulle quand `Rp = 0`. Le moteur a donc besoin de : la
fiche saisie, la stat de base recalculée, le niveau de Codex, le palier
d'affinité, les taux premium collectés (kit/EE/quirks/artefacts) et les buffs
du scénario. (Re-vérification du 27/07/2026 depuis l'ASM, puis du 26/08/2026 depuis
`CalcFinalStat.cs` — conforme, clamp et troncatures vers zéro compris.)

> RÉALISÉ (03/08/2026, amendé 18/08/2026) : `src/lib/damage/sheet.ts`
> (`sheetToCombatStat`, `archiveTerm`, `sheetToCombatStatAtLevel`) — l'identité
> Rp=0 est PROUVÉE par test de propriété (`sheet.test.ts` : 500 configurations
> de couches balayées, la reconstruction est EXACTEMENT `calcFinalStat`) ; la
> défactorisation Rp>0 par un second balayage (refactorisation identique sans
> buffs) et par le témoin Caren mesuré (5891). Les taux premium sont collectés
> par `gear.ts` (`GearPassivesInfo.premium`) sur les trois résolveurs.
> NB pour l'amont : le terme Codex exige la stat de BASE, donc le NIVEAU de
> l'attaquant — l'UI ne le demande pas encore (défaut 120 à prévoir).

### 16.2 Buff de guilde (event buff MAX_HP) — get_MaxHP, 04/08/2026

Signalé par Sevih (le « buff de guilde » n'est pas actif dans tous les modes) ;
chaîne ENTIÈRE lue — listings [`CBuffSystemManager_CheckMaxHPEvent.cs`](./damage-formula-cs/CBuffSystemManager_CheckMaxHPEvent.cs),
[`CCharacterData_get_MaxHP.cs`](./damage-formula-cs/CCharacterData_get_MaxHP.cs) :

```text
// Au CHARGEMENT du donjon (itérateur CDungeonScene.LoadResource), pour chaque
// perso de l'équipe utilisateur :
CharacterData.MaxHPRate = CBuffSystemManager.CheckMaxHPEvent(DungeonTemplet.DungeonMode,
                                                              DungeonTemplet.DungeonPlayMode,
                                                              DungeonTemplet.AreaID)
// remis à 1f en fin de combat ; recopié tel quel à la synchro de CCharacterData (CStateBattle)

CheckMaxHPEvent(mode, playMode, areaID):
  sum = Σ CEventBuffGroupData.CheckMaxHPEvent(mode, playMode, areaID)   // groupes de buff système ACTIFS
  titre = UserNickNameTemplet[CPlayer.SelectedUserTitleID]
  if titre.BuffSystemGroupID != 0 && playMode != DPM_PVP
     && BuffSystemTemplet[groupe].IsEnableDungeonMode(mode) && .BuffType == EBT_MAX_HP:
    sum += BuffValue                                                    // le buff du TITRE sélectionné
  return (float)(100 + sum) × 0.01f

CCharacterData.MaxHP (get):
  hp = StatDic[ST_HP].GetFinalValue()             // la stat § 16 / § 3
  if scene.IsWorldBoss && Templet.IsBoss(): hp = Hud.GetBossGauge().WorldBossMaxHP   // PV serveur du world boss
  return FloorToInt((float)hp × MaxHPRate)        // float 32 bits, exact tant que hp < 2^24
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
l'accorde : le C# lit bien le `BuffSystemGroupID` du TITRE SÉLECTIONNÉ
(`UserNickNameTemplet`), et 24 des 51 titres de 1.4.15 en portent un — mais AUCUN ne
référence le groupe 65 (vérifié dans la table, 26/08/2026). Le chemin existe côté
client pour un titre qui reste à accorder (vraisemblablement le pass Story License
premium, poussé par le serveur). Il se CUMULE avec le
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
(`BUFF_CONDITION_TYPE` 140–142 en 1.4.15) s'évaluent par `CheckElementWin(attaquant)`
([`CCharacterBattle_CheckElementWin.cs`](./damage-formula-cs/CCharacterBattle_CheckElementWin.cs)
— la supériorité FORCÉE par buff de l'attaquant compte, pas l'infériorité forcée)
→ `ELEMENT_SUPERIORITY_TYPE`, enum à TROIS valeurs (`ATTACKER_WIN`/`EQUAL`/
`ATTACKER_LOSE`) : **EQUAL est le « ni avantage ni désavantage »** (couvre
même-élément ET les hors-cycle type lumière vs terre), pas « même élément ».
C'est la MÊME relation que le taux élémentaire § 6 — corroboré par la desc du
passif (le monde y est partagé en « Fire / non-Fire » pour un boss terre).

**`TARGET_ELEMENT` (`BUFF_CONDITION_TYPE` 104)** — désassemblé le 24/08/2026, relu en
C# : le case appelle `CCharacterBattle.CheckElementEqual(ConditionValue)` sur la cible
([`CCharacterBattle_CheckElementEqual.cs`](./damage-formula-cs/CCharacterBattle_CheckElementEqual.cs))
= **égalité STRICTE** `cible.Data.Element == (CHARACTER_ELEMENT_TYPE)ConditionValue`
(3 = Lumière). La « cible » d'un buff porté par
un BOSS est l'ATTAQUANT. Preuve in-game (fixture `gnosisbeth-arsnova`) : le
passif d'Ars Nova « The Boy Who Dreamed of Becoming a Musician » (skill
monstre `132305`) porte `7` (+300 `ATTACKER_ELEMENT_EQUAL`) ET `9` (−450
`TARGET_ELEMENT` 3) — pour Gnosis Beth (lumière vs boss lumière) les DEUX sont
actifs, net −150 ‰ dans la somme § 9.2, S1 au raid EXACT (4571). Le tooltip
dit « light and dark » mais la donnée ne conditionne qu'à 3 (lumière) — un
attaquant TÉNÈBRES ne déclenche PAS cette ligne (égalité stricte) ; si une
mesure dark contredit un jour, chercher une ligne jumelle, pas élargir le case.
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
> (`unresolved`, contribution 0) : `BT_WG_DMG_REDUCE` (jauge de faiblesse, hors
> périmètre — agrégation lue § 11), conditions non élémentaires, `BT_STAT` sur le boss
> (canal défenseur non consommé — aucun cas statique en 1.4.9). Ignorés
> silencieusement (documenté) : `BT_DMG*` sortants du boss (le rapport ne
> calcule jamais les dégâts de la cible) et les soins/CP/boucliers. Côté UI,
> le preset porte `monsterId` (pont + resolvers) et la section buff/débuff
> affiche les chips AUTO « passif du boss » (nom localisé du skill, jamais
> togglables, état actif/inactif selon l'élément de l'attaquant courant).

## 17. Agrégation des couches — CCharacterData.CalcStat et satellites

Le mapping templet → 13 paramètres de CalcFinalStat, lu fonction par fonction
(listings `CCharacterData_*.cs`, `CStatValue_SetAwakeningNodeStatValue.cs`,
`CStatValue_SetMonadGateEnchantNodeStatValue.cs`, `CItem*.cs`).

### 17.1 Orchestration (CalcStat)

Listing : [`CCharacterData_CalcStat.cs`](./damage-formula-cs/CCharacterData_CalcStat.cs).

```text
CalcStat():
  CalcBasicStats()                        // § 17.2 — base par niveau, par stat
  si Type == CT_PC:
    CalcEvolutionStats()                  // § 17.3
    CalcTranscendentStarStats()           // taux HP/ATK/DEF de CharacterTranscendentTemplet
    CalcArchiveStats()                    // § 17.3
  CalcSetItem()                           // options d'items + sets (§ 15/17.5)
  pour chaque stat :
    SetItemOptionsValue(m_EquipDic)       // itemVal / itemRate
    SetSetItemValue(m_SetItemDic)
    SetBuffValue(m_StatBuffList)          // buffVal / buffRate (les CBuff de stat)
    SetBuffPremiumValue(m_StatPremiumBuffList)   // les BT_STAT_PREMIUM `ME` — la voie « fiche » (§ 15, § 16.1)
  CreateBuffSetItem()                     // buffs de sets (§ 15)
  CalcPvpRealtimeFieldSkillStats()        // bonus plat § 16
  CalcAwakeningNodeStats()                // § 17.4 — l'éveil passe EN DERNIER
```

Les nœuds MONAD ne sont pas dans cette chaîne : `CalcMonadGateEnchantNodeStats` est
appelé quand la liste est posée (`SetMonadGateEnchantNodeNodes`), ses valeurs restent
dans `CStatValue` et entrent dans `CalcFinalStat` au recalcul suivant.

### 17.2 CalcBasicStats — appels SetBaseValue par stat

Listings : [`CCharacterData_CalcBasicStats.cs`](./damage-formula-cs/CCharacterData_CalcBasicStats.cs),
[`CCharacterData_CalcBasicStatHp.cs`](./damage-formula-cs/CCharacterData_CalcBasicStatHp.cs).
Chaque stat reçoit `SetBaseValue(min, max, level, spawnAdv, addRate, this)` (§ 3.2)
avec les paires Min/Max du CharacterTemplet. Particularités :

- `spawnAdv` n'est passé que pour HP/ATK/DEF/SPEED, depuis les champs
  `SpawnAdvantageRate{HP,Atk,Def,Spd}` (remplis par les colonnes
  `SpawnAdvantageRate_*` des tables de contenu — monstres). Le HP passe par
  `CalcBasicStatHp()`, méthode `virtual` séparée — `CCustomBossData` la surcharge en
  `SetBaseValue(m_StartDamage, m_MaxDamage, level)` (sans spawnAdv ni addRate).
- `addRate` n'existe que pour ATK (`AddRateAtk`) et DEF (`AddRateDef`) — posés par
  `SetStatValue(ST_ATK|ST_DEF, v)`, dont la seule source combat est l'overgrade du
  boss de guild raid (§ 12.13, RÉSOLU) ; défaut 0.
- Toutes les stats ont une paire Min/Max dans le templet (WG, DMG_REDUCE_RATE, crit,
  pierce, vampiric, hit recovery, accuracy, avoid, buff chance/resist, AP, gold/exp,
  counter, avoid caps, DMG_BOOST, E_CRI_DMG_REDUCE) — une stat non renseignée vaut 0.

### 17.3 Évolution (cumulative) et archive

- `GetEvolutionStat(checkTotal = true, target = 0)`
  ([`CCharacterData_GetEvolutionStat.cs`](./damage-formula-cs/CCharacterData_GetEvolutionStat.cs)) :
  parcourt les lignes `CharacterEvolutionStatTemplet` du perso et **somme** les
  `RewardValue_1..3` (par `RewardStatType_1..3` non NONE) de TOUTES les lignes avec
  `EvolutionLevel ≤ niveau d'évolution courant` (`AddEvolutionStatToDictionary` :
  `dict[stat] += value`). Valeurs **plates**. (`checkTotal = false` : la seule ligne
  `== target`, usage UI.)
- `CalcArchiveStats` ([`CCharacterData_CalcArchiveStats.cs`](./damage-formula-cs/CCharacterData_CalcArchiveStats.cs)) :
  ligne `CharacterArchiveStatTemplet` d'ID `ArchiveStatID` → `SetArchiveStatValue`
  sur ATK (`Atk_Rate`), DEF (`Def_Rate`), HP (`HP_Rate`) — **taux**, ces trois stats
  seulement.
- `CalcTranscendentStarStats` ([`CCharacterData_CalcTranscendentStarStats.cs`](./damage-formula-cs/CCharacterData_CalcTranscendentStarStats.cs)) :
  ligne `GetCharacterTranscendent(Templet.BasicStar, Star, ID)` de
  `CharacterTranscendentTemplet` → taux `RewardHPRate`/`RewardAtkRate`/`RewardDefRate`
  sur HP/ATK/DEF — confirme § 3 (les autres stats → 0).
  [`CCharacterData_GetValueByLevel.cs`](./damage-formula-cs/CCharacterData_GetValueByLevel.cs)
  (UI : stat à un niveau donné) refait `CalcStat + MulPermille(·, taux de
transcendance)` pour ATK/HP/DEF seulement.

### 17.4 Éveil et Monad (mêmes règles, code identique au champ près)

`CalcAwakeningNodeStats` ([`CCharacterData_CalcAwakeningNodeStats.cs`](./damage-formula-cs/CCharacterData_CalcAwakeningNodeStats.cs))
parcourt `AwakeningNodeList` (les nœuds débloqués) :

- Les nœuds `AWAKENING_TYPE.UTILITY` (2 — enum : 0 ELEMENTAL, 1 JOB, 2 UTILITY,
  3 PVE, 4 PVP, 5 ADVENTURE_LICENSE) sont ignorés pour les stats.
- `CheckNodeApply` ([`CCharacterData_CheckNodeApply.cs`](./damage-formula-cs/CCharacterData_CheckNodeApply.cs))
  filtre : un nœud `PVE` dont le `LevelTemplet.ID` ∈ 198..201 ne s'applique qu'aux
  BOSS (`Type ≥ CT_BOSS_MONSTER`) ; sinon tout non-PC est refusé ; un nœud
  `ADVENTURE_LICENSE` exige `CDungeonScene.IsApplyAwakeningNodeAdventureLicense()`
  — **dépendant du contenu** ; enfin l'`AwakeningApplyType` compare
  `AwakeningApplyTypeValue` à l'élément (`AAT_ELEMENTAL`), la classe (`AAT_CLASS`) ou
  la sous-classe (`AAT_SUBCLASS`) du perso, tout autre type passe.
- `OptionType == IOT_BUFF` → chaque `BuffID` est résolu en `CBuffTemplet`
  **niveau 1** et rejoint `m_AwakeningNodeBuffTempletList` (§ 15 — appliqué comme un
  buff ordinaire, sauf les `BT_STAT_PREMIUM` `ME`, voie fiche).
- `OptionType == IOT_STAT` → groupé par `StatType`, puis
  `CStatValue.SetAwakeningNodeStatValue`
  ([`CStatValue_SetAwakeningNodeStatValue.cs`](./damage-formula-cs/CStatValue_SetAwakeningNodeStatValue.cs)) :
  remise à zéro puis, pour chaque templet du groupe, `OAT_ADD` → **somme plate**
  (`awakeningValue`), `OAT_RATE` → **somme de taux** (`awakeningValueRate`).

`CalcMonadGateEnchantNodeStats` / `SetMonadGateEnchantNodeStatValue`
([`CCharacterData_CalcMonadGateEnchantNodeStats.cs`](./damage-formula-cs/CCharacterData_CalcMonadGateEnchantNodeStats.cs),
[`CStatValue_SetMonadGateEnchantNodeStatValue.cs`](./damage-formula-cs/CStatValue_SetMonadGateEnchantNodeStatValue.cs)) :
même code, champs monad à la place — sans filtre `CheckNodeApply` ni branche IOT_BUFF,
et appelé à la pose de la liste (§ 17.1).

### 17.5 Options d'équipement — CItem (enchant, break limit, singularité)

`CItem.InitializeOptionData(mainOptions, subOptions, singularityOptionID)`
([`CItem_InitializeOptionData.cs`](./damage-formula-cs/CItem_InitializeOptionData.cs))
construit les options d'une pièce :

```text
enchantFactor     = Σ float UpgradeFactorforOP des lignes ItemEnchantTemplet du ItemSubType
                    dont 0 < EnchantLevel ≤ enchant (liste triée, arrêt au premier au-delà)   // GetEnchantFactor
breakLimitFactor  = Σ float FactorArr[0..breakCount-1] de BreakLimitTemplet(BasicStar, ItemGrade), 0 si breakCount = 0   // GetBreakLimitFactor
singularityFactor = 0 si SingularityStep = 0, sinon UpgradeFactorforOP(SET_ENCHANT)
                    + Σ UpgradeFactorforOP(SET_EQUIP_ENHANCE, SingularityLevel)                 // GetSingularityFactor

option PRINCIPALE (CItemMainOption.OptionValue, float 32 bits) :
  final = (int)( (float)OptionValue × (1f + enchantFactor + singularityFactor) × (1f + breakLimitFactor) )
  // évaluation gauche → droite en float : t = (1f + e) + s ; t = OptionValue × t ; t = t × (1f + b) ; trunc
```

Listings : [`CItem_GetEnchantFactor.cs`](./damage-formula-cs/CItem_GetEnchantFactor.cs),
[`CItem_GetBreakLimitFactor.cs`](./damage-formula-cs/CItem_GetBreakLimitFactor.cs),
[`CItem_GetSingularityFactor.cs`](./damage-formula-cs/CItem_GetSingularityFactor.cs),
[`CItemMainOption_ctor.cs`](./damage-formula-cs/CItemMainOption_ctor.cs) (les facteurs y
passent par `× 1000f / 1000f`, sans effet),
[`CItemMainOption_get_OptionValue.cs`](./damage-formula-cs/CItemMainOption_get_OptionValue.cs).

- Les **sub-options ne sont PAS multipliées** par ces facteurs (leurs valeurs sont
  stockées telles quelles — `CItemSubOptionData(optionID, baseLevel, level)` ; leur
  croissance passe par des re-tirages — hors calcul).
- Une pièce `ITS_EQUIP_EXCLUSIVE` (EE) enchantée porte en plus une option de stat
  exclusive (`m_ExclusiveStatOption` = première `ItemOptionTemplet` du groupe de
  l'item, au niveau `EnchantLevel`).
- Option principale de type **buff** (EE, etc.) : le `CBuffTemplet` est résolu au
  **niveau `enchantLevel + 1`** si la pièce est enchantable en spécial
  (`IsSpecialItemEnchantable`), niveau 1 sinon — c'est ainsi que l'effet unique d'un
  EE grandit avec l'enchant.
- Options uniques / de set (`ItemSpecialOptionTemplet`, `Templet.UniqueOptionIDList`) :
  niveau par défaut `1 + BreakLimitCount` (arme/accessoire : breakthrough + 1, la
  règle que § 15 appliquait) ; pour une pièce enchantable en spécial, le niveau est
  celui du templet, retenu seulement si `≤ max(enchant, 1)`, et une ligne
  `IsAdd = false` retire les niveaux inférieurs de son groupe, `IsAdd = true`
  s'ajoute.

### 17.6 Pénalités PvP (UpdatePvpTurnPenalty)

Listings : [`CDungeonScene_UpdatePvpTurnPenalty.cs`](./damage-formula-cs/CDungeonScene_UpdatePvpTurnPenalty.cs),
[`CStateBattle_PvpAttackTeamPenaltyDmg_MoveNext.cs`](./damage-formula-cs/CStateBattle_PvpAttackTeamPenaltyDmg_MoveNext.cs)
(la fonction locale `PlayDamage`, [`CStateBattle_PvpPenalty_PlayDamage.cs`](./damage-formula-cs/CStateBattle_PvpPenalty_PlayDamage.cs),
est la même sortie repliée).

Cycle : à l'init de la scène, `PvpPenaltyTurnCount = PVP_ATK_PENALTY_START_TURN` (10)
et `PvpPenaltyDmgRate = PVP_ATK_PENALTY_DMG_RATE` (100) ; à chaque cycle
(`PvpAttackTeamPenaltyDmg(dmgRate)` puis `UpdatePvpTurnPenalty()`) :

```text
PlayDamage(équipe UTILISATEUR) puis PlayDamage(équipe ENNEMIE) :   // les DEUX équipes
  pour chaque membre non nul :
    AddHP(−MulPermille(MaxHP, dmgRate), bHeal = false, bIgnoreUndead = TRUE)
    si HP == 0 && IsAlive : SetDie()
UpdatePvpTurnPenalty():
  PvpPenaltyLevel++
  PvpPenaltyTurnCount += PVP_ATK_PENALTY_LOOP_TURN (5)
  PvpPenaltyDmgRate   += PVP_ATK_PENALTY_DMG_ADD_RATE (30)                 // SANS cap
  PvpHealReduceRate    = (0 → PVP_HEAL_PENALTY_REDUCE_RATE (500)) sinon += PVP_HEAL_PENALTY_REDUCE_ADD_RATE (250)
  PvpHealReduceRate    = min(PvpHealReduceRate, 1000)                       // cap 100 %
```

Les « dégâts de pénalité » sont donc des pertes de PV directes (% des PV max,
passent par l'absorption de shield § 14.3, percent UNDEAD) — pas une baisse d'ATK —
et frappent les deux équipes (la lecture ASM disait « chaque attaquant vivant » :
corrigé). Avant le premier cycle, `PvpHealReduceRate = 0` : **les soins PvP ne sont
pas réduits en début de match**.
