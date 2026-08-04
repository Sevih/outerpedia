/**
 * Moteur de dégâts Outerplane — miroir fidèle de CFormula (libil2cpp 1.4.9).
 * Réf : docs/specs/damage-formula.md (pseudo-code + RVA + listings asm).
 *
 * Fidélité numérique :
 *  - Le binaire calcule en entiers 64 bits avec divisions tronquées vers zéro ;
 *    ici : BigInt (la division BigInt tronque vers zéro — sémantique identique).
 *  - Les résultats sont repris en 32 bits par le jeu ; le wrap int32 n'est PAS
 *    émulé (jamais atteint avec des valeurs réalistes — documenté spec § 12.6).
 *  - CheckResist et le HitRecovery passent par du float32 : émulé via Math.fround.
 *    C'est EXACT (pas d'artefact de double arrondi double→f32 pour /, +, × car
 *    53 ≥ 2×24+2) ; vérifié à 0 divergence sur diff ∈ [0, 20000] contre une
 *    référence float32 en rationnels — cf. test « float32 exact ».
 */

import type { TraceStep } from './harness';
import {
  DamageRateType,
  Element,
  ElementSuperiority,
  ELEMENT_INFERIOR_RATE_PERMILLE,
  ELEMENT_NEUTRAL_RATE_PERMILLE,
  ELEMENT_SUPERIOR_RATE_PERMILLE,
  MARKING_DAMAGE_RATE_PERMILLE,
  MIN_DAMAGE_RATE_PERMILLE,
  MISSED_DAMAGE_RATE_PERMILLE,
  type CalcDamageInput,
  type CalcDamageResult,
  type CheckDamageRateInput,
  type DamageCoreInput,
  type DamageDotInput,
  type DamageRateResult,
  type DamageWgInput,
  type FinalStatInput,
  type SharedDamageResult,
} from './types';

// ── Primitives entières (CCommonDefine) ─────────────────────────────────────

/** Division entière signée tronquée vers zéro par 1000 (magique 0x20C49BA5E353F7CF). */
const div1000 = (x: bigint): bigint => x / 1000n;

/** CCommonDefine.MulPermille — RVA 0x28D81C0 : trunc(v × p / 1000). */
export function mulPermille(value: number, permille: number): number {
  return Number(div1000(BigInt(value) * BigInt(permille)));
}

/** CCommonDefine.ApplyRate — RVA 0x28D18E4 : trunc(v × (1000 + r) / 1000). */
export function applyRate(value: number, rate: number): number {
  return Number(div1000(BigInt(value) * BigInt(1000 + rate)));
}

/** Mathf.FloorToInt (le quirk +∞ → int.MinValue du binaire n'est jamais atteint). */
const floorToInt = (x: number): number => Math.floor(x);

// ── CalcStat — RVA 0x2C59DB0 (stat de base par niveau) ──────────────────────

/**
 * Stat de base au niveau donné : interpolation linéaire entre la stat
 * niveau 1 (min) et niveau 100 (max), ÷99 tronqué vers zéro (division
 * magique 0xA57EB50295FAD40B du binaire). Alimente le baseValue de
 * calcFinalStat. Spec § 3.1.
 */
export function calcStatByLevel(minValue: number, maxValue: number, level: number): number {
  const n = BigInt(level - 1) * BigInt(maxValue - minValue);
  return minValue + Number(n / 99n);
}

/**
 * Miroir de CStatValue.SetBaseValue (0x28D16BC), spec § 3.2 : au-delà du
 * niveau 100 (personnages CT_PC uniquement), chaque niveau ajoute en plus
 * modifierAfter100 ‰ du pas linéaire (÷99000, magique 0x54BBC10777CC3339).
 * modifierAfter100 vient de CharacterMaxLevelTemplet (palier 1/2/3 →
 * 200/400/700 ‰) — passer 0 pour un monstre. addRate ≥ 1 multiplie la base.
 */
export function calcBaseStat(
  minValue: number,
  maxValue: number,
  level: number,
  modifierAfter100 = 0,
  addRate = 0,
): number {
  let base = calcStatByLevel(minValue, maxValue, level);
  if (level >= 101 && modifierAfter100 !== 0) {
    base += Number(
      (BigInt(level - 100) * BigInt(maxValue - minValue) * BigInt(modifierAfter100)) / 99000n,
    );
  }
  if (addRate >= 1) base = applyRate(base, addRate);
  return base;
}

// ── CalcFinalStat — RVA 0x2C59E48 ───────────────────────────────────────────

/**
 * Stat finale : (base+évo+éveil+monad) × (1000 + Σ taux)/1000, + plats item/buff,
 * le tout × (1000 + buffRate)/1000, + base × archiveRate/1000. Clamp ≥ 0.
 * Chaque division tronque vers zéro.
 */
export function calcFinalStat(s: FinalStatInput): number {
  const flat = BigInt(s.baseValue + s.evolutionValue + s.awakeningValue + s.monadEnchantValue);
  const rate = BigInt(
    1000 +
      s.spawnAdvantageRate +
      s.awakeningValueRate +
      s.monadEnchantValueRate +
      s.transcendentStarValueRate +
      s.itemOptionValueRate,
  );
  const sub = div1000(flat * rate) + BigInt(s.itemOptionValue) + BigInt(s.buffValue);
  const total =
    div1000(sub * BigInt(1000 + s.buffValueRate)) +
    div1000(BigInt(s.baseValue) * BigInt(s.archiveStatValueRate));
  return total < 0n ? 0 : Number(total);
}

// ── Probabilités — RVA 0x2C59DE8 / 0x2C59E30 / 0x2C59E3C ────────────────────

/**
 * CheckProbability : succès si roll ≤ value (roll = entier uniforme [0, max] inclus,
 * cf. GetBattleRandomRange / Random.Range(0, max+1)). false si value < 1.
 * Le tirage est injecté pour rester pur.
 */
export function checkProbability(value: number, max: number, roll: number): boolean {
  if (value < 1) return false;
  void max; // borne du tirage — conservée pour refléter la signature du binaire
  return roll <= value;
}

export function checkProbabilityPercent(value: number, roll: number): boolean {
  return checkProbability(value, 100, roll);
}

export function checkProbabilityPermille(value: number, roll: number): boolean {
  return checkProbability(value, 1000, roll);
}

// ── CheckResist — RVA 0x2C5A388 ─────────────────────────────────────────────

/**
 * Seuil de résistance (‰, à comparer à un tirage [0,1000]) :
 * FloorToInt(1000f / (100f / max(1, resist−chance) + 1f)) — arithmétique float32.
 * Retourne 0 si chance > resist (jamais de résistance).
 */
export function checkResistThreshold(
  attackerBuffChance: number,
  defenderBuffResist: number,
): number {
  const diff = defenderBuffResist - attackerBuffChance;
  if (diff < 0) return 0;
  const d = diff === 0 ? 1 : diff;
  const inv = Math.fround(100 / Math.fround(d)); // fdiv f32
  const denom = Math.fround(inv + 1);
  return floorToInt(Math.fround(1000 / denom));
}

/** CheckResist : résiste si le seuil ≥ 1 et roll ≤ seuil. Tirage injecté [0,1000]. */
export function checkResist(
  attackerBuffChance: number,
  defenderBuffResist: number,
  roll: number,
): boolean {
  const threshold = checkResistThreshold(attackerBuffChance, defenderBuffResist);
  if (threshold < 1) return false;
  return roll <= threshold;
}

// ── Élément — RVA 0x2C5AC64 / 0x2C5AB60 ─────────────────────────────────────

/**
 * Triangle Terre>Eau>Feu>Terre ((att+1) % 3 == def) ; Lumière/Ténèbres sont
 * mutuellement FORTS et neutres contre le triangle.
 */
export function getElementSuperiority(attacker: Element, defender: Element): ElementSuperiority {
  if (attacker <= Element.Fire && defender <= Element.Fire) {
    if ((attacker + 1) % 3 === defender) return ElementSuperiority.AttackerWin;
    if ((defender + 1) % 3 === attacker) return ElementSuperiority.AttackerLose;
    return ElementSuperiority.Equal;
  }
  if (attacker < Element.Light || defender < Element.Light) return ElementSuperiority.Equal;
  return attacker === defender ? ElementSuperiority.Equal : ElementSuperiority.AttackerWin;
}

export interface ElementRateInput {
  attackerElement: Element;
  defenderElement: Element;
  /** L'attaquant porte BT_DMG_ELEMENT_SUPERIORITY (94) : avantage forcé. */
  forcedSuperiority?: boolean;
  /** L'attaquant porte BT_DMG_ELEMENT_INFERIORITY (104) : désavantage forcé. */
  forcedInferiority?: boolean;
  /** Σ des buffs BT_DMG_ELEMENT_ENCHANT (95) de l'attaquant (‰) — ne joue que si avantage. */
  elementDamageRateBonus?: number;
}

/** GetElementeryDamageRate : 1200(+bonus) / 1000 / 800 (‰). */
export function getElementeryDamageRate(input: ElementRateInput): number {
  const bonus = input.elementDamageRateBonus ?? 0;
  if (input.forcedSuperiority) return ELEMENT_SUPERIOR_RATE_PERMILLE + bonus;
  if (input.forcedInferiority) return ELEMENT_INFERIOR_RATE_PERMILLE;
  const sup = getElementSuperiority(input.attackerElement, input.defenderElement);
  if (sup === ElementSuperiority.AttackerWin) return ELEMENT_SUPERIOR_RATE_PERMILLE + bonus;
  if (sup === ElementSuperiority.AttackerLose) return ELEMENT_INFERIOR_RATE_PERMILLE;
  return ELEMENT_NEUTRAL_RATE_PERMILLE;
}

// ── CheckDamageRate — RVA 0x2C5A448 ─────────────────────────────────────────

/** Libellés de trace par résultat de hit (harnais § 2 — dev only). */
const RATE_TYPE_LABEL: Record<DamageRateType, string> = {
  [DamageRateType.None]: 'aucun',
  [DamageRateType.Normal]: 'normal',
  [DamageRateType.Critical]: 'critique',
  [DamageRateType.Missed]: 'esquivé',
  [DamageRateType.Invincible]: 'invincible',
};

/**
 * Détermine le résultat du hit (normal / crit / miss / invincible) et son taux (‰).
 * Ordre exact du binaire : world boss finish → invincible → additive → esquive →
 * crit → overrides → modificateurs additifs → plancher 300 ‰.
 * `trace` (harnais § 2) : coût nul quand absent — les étapes suivent l'ordre
 * RÉEL d'exécution, valeurs brutes.
 */
export function checkDamageRate(
  input: CheckDamageRateInput,
  trace?: TraceStep[],
): DamageRateResult {
  const { attacker, defender, rolls } = input;

  if (input.worldBossFinishAttackByBoss) {
    trace?.push({
      ref: '§ 7.1',
      label: 'world boss finish : normal, taux fixe',
      in: {},
      out: 1000,
    });
    return { type: DamageRateType.Normal, rate: 1000 };
  }
  if (defender.hasInvincibleBuff) {
    trace?.push({ ref: '§ 7.2', label: 'défenseur invincible : taux nul', in: {}, out: 0 });
    return { type: DamageRateType.Invincible, rate: 0 };
  }

  let type: DamageRateType;
  let rate: number;

  const critRate = () => {
    let r = attacker.criticalDmgRate;
    if (defender.enemyCriticalDamageReduce !== 0) r -= defender.enemyCriticalDamageReduce;
    return r;
  };

  if (input.previousResult !== undefined && input.previousResult !== DamageRateType.None) {
    // Attaque additive : le résultat précédent est conservé, seul le taux est refait.
    type = input.previousResult;
    rate = type === DamageRateType.Critical ? critRate() : 1000;
  } else {
    if (defender.avoid >= 1 && rolls.avoid <= defender.avoid) {
      type = DamageRateType.Missed;
      rate = 1000; // la pénalité ×0,5 s'applique dans calcDamageCore
    } else if (attacker.criticalRate >= 1 && rolls.critical <= attacker.criticalRate) {
      type = DamageRateType.Critical;
      rate = critRate();
    } else {
      type = DamageRateType.Normal;
      rate = 1000;
    }
    if (input.forceNormalOverride) {
      type = DamageRateType.Normal;
      rate = 1000;
    }
  }
  trace?.push({
    ref: '§ 7',
    label: `résultat « ${RATE_TYPE_LABEL[type]} » : taux de base`,
    in:
      type === DamageRateType.Critical
        ? {
            criticalDmgRate: attacker.criticalDmgRate,
            enemyCriticalDamageReduce: defender.enemyCriticalDamageReduce,
          }
        : {},
    out: rate,
  });

  rate += input.additionalDamageRate ?? 0;
  rate -= input.damageReduceRate ?? 0;
  rate += attacker.dmgBoost;
  rate -= defender.dmgReduceRate;
  trace?.push({
    ref: '§ 7.6',
    label: 'modificateurs additifs du taux',
    in: {
      additionalDamageRate: input.additionalDamageRate ?? 0,
      damageReduceRate: input.damageReduceRate ?? 0,
      dmgBoost: attacker.dmgBoost,
      defenderDmgReduceRate: defender.dmgReduceRate,
    },
    out: rate,
  });

  if (rate <= MIN_DAMAGE_RATE_PERMILLE - 1) {
    rate = MIN_DAMAGE_RATE_PERMILLE;
    trace?.push({ ref: '§ 7.7', label: 'plancher du taux', in: {}, out: rate });
  }
  return { type, rate };
}

/**
 * AddCheckEnemyTeamDecreaseDamageRate — RVA 0x2C5ACF8 :
 * rate + (Σ buffs BT_DMG_ENEMY_TEAM_DECREASE de l'attaquant) × nb de cibles décomptées.
 */
export function addCheckEnemyTeamDecreaseDamageRate(
  rate: number,
  enemyTeamDecreaseBuffValue: number,
  decreaseTargetCount: number,
): number {
  return rate + enemyTeamDecreaseBuffValue * decreaseTargetCount;
}

// ── Terme de défense partagé (cœur + DOT) ───────────────────────────────────

/** max(def × max(0, 1000 − ppRate) − pp × 1000, −999000) — en ×1000. */
function defenseTerm(defense: number, piercePowerRate: number, piercePower: number): bigint {
  const kept = piercePowerRate < 1000 ? 1000 - piercePowerRate : 0;
  const term = BigInt(defense) * BigInt(kept) - BigInt(piercePower) * 1000n;
  return term < -999000n ? -999000n : term;
}

// ── CalcDamage — RVA 0x2C5AD30 (helper 0x2C5B4DC) ───────────────────────────

/**
 * Cœur du calcul d'un hit (<CalcDamage>g__CalcDamage|17_0). Chaque étape tronque
 * vers zéro, dans l'ordre exact du binaire. Minimum 1.
 * `trace` (harnais § 2) : coût nul quand absent — une étape par troncature,
 * dans l'ordre RÉEL, valeurs brutes (les étapes conditionnelles n'apparaissent
 * que si le binaire les exécute).
 */
export function calcDamageCore(input: DamageCoreInput, trace?: TraceStep[]): number {
  const defTerm = defenseTerm(input.defense, input.piercePowerRate, input.piercePower);

  let d = div1000(
    BigInt(input.attackStat) * BigInt(input.damageFactor) * BigInt(input.skillFactor),
  );
  trace?.push({
    ref: '§ 8.2',
    label: 'atk × facteur du hit × facteur du skill (÷1000)',
    in: {
      attackStat: input.attackStat,
      damageFactor: input.damageFactor,
      skillFactor: input.skillFactor,
    },
    out: Number(d),
  });
  d = (d * 1_000_000n) / (1_000_000n + defTerm);
  trace?.push({
    ref: '§ 8.2',
    label: 'mitigation défense (pénétration incluse)',
    in: {
      defense: input.defense,
      piercePowerRate: input.piercePowerRate,
      piercePower: input.piercePower,
      defTerm: Number(defTerm),
    },
    out: Number(d),
  });
  d = div1000(d * BigInt(input.damageRate));
  trace?.push({
    ref: '§ 8.2',
    label: 'taux du hit (§ 7)',
    in: { damageRate: input.damageRate },
    out: Number(d),
  });
  if (input.defenderMarked) {
    d = div1000(d * BigInt(MARKING_DAMAGE_RATE_PERMILLE));
    trace?.push({
      ref: '§ 8.2',
      label: 'cible marquée (BT_MARKING)',
      in: { markingRate: MARKING_DAMAGE_RATE_PERMILLE },
      out: Number(d),
    });
  }
  d = div1000(d * BigInt(input.elementalRate));
  trace?.push({
    ref: '§ 8.2',
    label: 'taux élémentaire (§ 6)',
    in: { elementalRate: input.elementalRate },
    out: Number(d),
  });
  if (input.isMissed) {
    const missedRate = input.missedDamageRatePermille ?? MISSED_DAMAGE_RATE_PERMILLE;
    d = div1000(d * BigInt(missedRate));
    trace?.push({
      ref: '§ 8.2',
      label: 'pénalité de MISS',
      in: { missedDamageRate: missedRate },
      out: Number(d),
    });
  }
  d = (d * BigInt(1000 - (input.finalReduceRate ?? 0))) / 1_000_000n;
  trace?.push({
    ref: '§ 8.2',
    label: "réduction finale (§ 9.3) et retombée d'échelle (÷1e6)",
    in: { finalReduceRate: input.finalReduceRate ?? 0 },
    out: Number(d),
  });
  if (d < 1n) {
    trace?.push({ ref: '§ 8.2', label: 'minimum 1 par hit', in: {}, out: 1 });
    return 1;
  }
  return Number(d);
}

/**
 * CalcDamage : cœur + sorties annexes (vampirisme, récup au coup).
 * Si damageRate ou damageFactor vaut 0 (invincible / templet sans dégâts),
 * les trois sorties sont nulles — comme le binaire.
 */
export function calcDamage(input: CalcDamageInput): CalcDamageResult {
  if (input.damageRate === 0 || input.damageFactor === 0) {
    return { damage: 0, vampiric: 0, hitRecovery: 0 };
  }
  const damage = calcDamageCore(input);
  const vampiric = mulPermille(damage, input.vampiric ?? 0);
  // mul 32 bits puis conversion float32 et ×0.001f (constante f32 du binaire), floor.
  const product = Math.imul(input.hitHpRecovery ?? 0, damage);
  const hitRecovery = floorToInt(Math.fround(Math.fround(product) * Math.fround(0.001)));
  return { damage, vampiric, hitRecovery };
}

/**
 * Rattrapage d'arrondi du DERNIER hit d'un skill multi-hit (spec § 8.3) :
 * si le total de la compétence dépasse accumulé + hit courant, le hit courant
 * est rehaussé à (total − accumulé). Jamais corrigé à la baisse.
 */
export function adjustLastHitDamage(
  totalSkillDamage: number,
  accumulatedDamage: number,
  currentHitDamage: number,
): number {
  if (totalSkillDamage > accumulatedDamage + currentHitDamage) {
    return totalSkillDamage - accumulatedDamage;
  }
  return currentHitDamage;
}

// ── CalcDamageDOT — RVA 0x2C5BC6C ───────────────────────────────────────────

/**
 * Dégâts sur la durée : défense (avec pénétration) + DMG_REDUCE cappé à 900 ‰.
 * Ignore élément, crit et taux de hit. Pas de minimum 1.
 */
export function calcDamageDOT(input: DamageDotInput): number {
  const defTerm = defenseTerm(input.defense, input.piercePowerRate, input.piercePower);
  const reduce = input.dmgReduceRate < 900 ? input.dmgReduceRate : 900;
  let d =
    (BigInt(input.attackRate) * BigInt(input.statValue) * 1_000_000n) / (1_000_000n + defTerm);
  d = (d * BigInt(1000 - reduce)) / 1_000_000n;
  return Number(d);
}

// ── CalcDamageWG — RVA 0x2C5BDBC ────────────────────────────────────────────

/** Dégâts de jauge de faiblesse : ApplyRate(flat + wg, rate), clamp ≥ 0. */
export function calcDamageWG(input: DamageWgInput): number {
  if (input.defenderWgInvincible) return 0;
  const custom = input.customValue ?? 0;
  const wg = custom !== 0 ? custom : input.skillWgReduce & 0xff;
  const result = applyRate((input.wgReduceFlat ?? 0) + wg, input.wgReduceRate ?? 0);
  return result < 0 ? 0 : result;
}

// ── CalcCharacterSharedDamage — RVA 0x2C5B778 ───────────────────────────────

/**
 * Partage de dégâts : chaque porteur de BT_SHARE_DMG_MULTI (137) prend
 * MulPermille(dégâts ORIGINAUX, valeur) ; puis le porteur unique de
 * BT_SHARE_DMG (136) prend MulPermille(restant, valeur).
 */
export function calcCharacterSharedDamage(
  damage: number,
  multiShareValues: number[],
  singleShareValue?: number,
): SharedDamageResult {
  let remaining = damage;
  const multiShared = multiShareValues.map((value) => {
    const part = mulPermille(damage, value);
    const next = remaining - part;
    remaining = next < 0 ? 0 : next;
    return part;
  });
  let singleShared = 0;
  if (singleShareValue !== undefined) {
    singleShared = mulPermille(remaining, singleShareValue);
    remaining -= singleShared;
  }
  return { remaining, multiShared, singleShared };
}

// ── Helpers d'agrégats de buffs (formules exactes, spec § 9) ────────────────

/** GetLostHPRateValue — RVA 0x26C6CBC : trunc((maxHP − hp) × value / maxHP). */
export function getLostHPRateValue(maxHP: number, hp: number, value: number): number {
  if (maxHP < 1) return 0;
  return Number((BigInt(maxHP - hp) * BigInt(value)) / BigInt(maxHP));
}

/**
 * GetStatValuePermille — RVA 0x27E14B8 : trunc(statValue × permille / 1000),
 * saturé à INT32_MAX (garde d'overflow du binaire). Les buffs BT_DMG_*_STAT
 * cappent ensuite le résultat à 1000 ‰ (fait ici par l'appelant).
 */
export function getStatValuePermille(statValue: number, permille: number): number {
  const product = BigInt(statValue) * BigInt(permille);
  if (product > 0x1f3ffffffffn) return 0x7fffffff;
  return Number(div1000(product));
}
