/**
 * Soins, shields, reverse heal, WG — miroir de CBuff.OnCreate (0x22FC71C) et
 * CCharacterBattle.AddHP (0x26C5FD8), libil2cpp 1.4.9.
 * Réf : docs/specs/damage-formula.md § 14. Mêmes conventions que formula.ts
 * (entiers, troncature vers zéro, ‰).
 */

import {
  applyRate,
  calcDamageWG,
  getLostHPRateValue,
  getStatValuePermille,
  mulPermille,
} from './formula';
import { PVP_HEAL_PENALTY_REDUCE_RATE_PERMILLE, type DamageWgInput } from './types';

/** CBuff.get_Value — RVA 0x22F4B38 : Templet.Value × StackCount (linéaire en stacks). */
export function buffValue(templetValue: number, stackCount: number): number {
  return Math.imul(templetValue, stackCount);
}

/**
 * Valeur effective d'un buff de stat sous STAT_BUFF/DEBUFF_ENHANCE (BT 27/28) :
 * ApplyRate(value, enhance) = trunc(value × (1000 + enhance) / 1000).
 */
export function enhanceStatBuffValue(value: number, enhanceValue: number): number {
  return applyRate(value, enhanceValue);
}

/**
 * BT 32 STAT_OWNER_LOST_HP_RATE_HALF : PV effectifs = clamp(2×HP − MaxHP, 0, MaxHP),
 * puis GetLostHPRateValue — le bonus croît 2× plus vite et sature sous 50 % PV.
 */
export function lostHpRateHalfValue(maxHP: number, hp: number, value: number): number {
  const doubled = 2 * hp - maxHP;
  const hpEff = doubled < 0 ? 0 : doubled > maxHP ? maxHP : doubled;
  return getLostHPRateValue(maxHP, hpEff, value);
}

/**
 * Préservation du ratio de PV quand MaxHP change (buff de stat HP) :
 * HP' = trunc(MaxHP' × HP / MaxHP). Plein PV reste plein PV (cas géré à part
 * dans le binaire, même résultat).
 */
export function preserveHpRatio(oldMaxHP: number, newMaxHP: number, hp: number): number {
  if (oldMaxHP < 1) return hp;
  return Number((BigInt(newMaxHP) * BigInt(hp)) / BigInt(oldMaxHP));
}

/** Valeur stat-ou-plate commune aux soins/shields/reverse heal (§ 14.2/14.4/14.5). */
export function statOrFlatValue(value: number, sourceStatValue?: number): number {
  // StatType == 0 → valeur plate ; sinon trunc(stat × value / 1000).
  return sourceStatValue === undefined ? value : getStatValuePermille(sourceStatValue, value);
}

export interface HealInput {
  /** Valeur du buff (Templet.Value × stacks), ‰ si stat-basé, plate sinon. */
  value: number;
  /** Stat de la source (caster pour BT 14, porteur pour BT 15) si StatType != 0. */
  sourceStatValue?: number;
  /** Scène PvP (arène ou temps réel) : pénalité de soins. */
  isPvp?: boolean;
  /**
   * Réduction de soins de la scène (‰, [scene+0x100]) : 0 AVANT le premier cycle
   * de pénalité (tour 10), puis 500 → 750 → 1000 (cap). Spec § 17.6 ;
   * cf. pvpPenaltyRates pour la valeur par cycle. Défaut : 0.
   */
  pvpHealReducePermille?: number;
}

/** Soin brut d'un buff BT 14/15, AVANT les modificateurs de soins reçus (§ 14.2). */
export function calcHealValue(input: HealInput): number {
  let heal = statOrFlatValue(input.value, input.sourceStatValue);
  if (input.isPvp) {
    heal = mulPermille(heal, 1000 - (input.pvpHealReducePermille ?? 0));
  }
  return heal;
}

/**
 * Taux des pénalités PvP au cycle donné (UpdatePvpTurnPenalty, spec § 17.6).
 * cycle = 0 avant le premier déclenchement (tour PVP_ATK_PENALTY_START_TURN = 10),
 * puis 1, 2, … à chaque PVP_ATK_PENALTY_LOOP_TURN (5) tours. Les dégâts de
 * pénalité = mulPermille(MaxHP, dmgRatePermille), via AddHP (shield absorbe,
 * UNDEAD ignoré) ; la réduction de soins est celle lue par calcHealValue.
 */
export function pvpPenaltyRates(cycle: number): {
  dmgRatePermille: number;
  healReducePermille: number;
} {
  if (cycle < 1) return { dmgRatePermille: 0, healReducePermille: 0 };
  const heal = PVP_HEAL_PENALTY_REDUCE_RATE_PERMILLE + 250 * (cycle - 1);
  return {
    dmgRatePermille: 100 + 30 * (cycle - 1), // sans cap
    healReducePermille: heal > 1000 ? 1000 : heal, // cap 100 %
  };
}

export interface ReceiveHealModifiers {
  /** BT_SEALED_RECEIVE_HEAL (7) : soin annulé. */
  sealed?: boolean;
  /** BT_INCREASE_RECEIVE_HEAL (8), ‰ — PRIME sur reduce (un seul s'applique). */
  increasePermille?: number;
  /** BT_REDUCE_RECEIVE_HEAL (9), ‰ — ignoré si increase présent. */
  reducePermille?: number;
  /** PvP temps réel : FieldSkillReduceReceiveHeal du match (‰). */
  pvpRealtimeFieldReducePermille?: number;
  /** BT_DOT_BLEED (55) présent : soins reçus ÷ 2 (×500 ‰). */
  hasBleed?: boolean;
}

/**
 * Modificateurs de soins reçus d'AddHP (§ 14.3), dans l'ordre exact du binaire.
 * Retourne le soin effectif (celui qui alimente SkillRecord.Heal).
 */
export function applyReceiveHealModifiers(heal: number, mods: ReceiveHealModifiers): number {
  let value = heal;
  // Chaîne elif du binaire : sealed > increase > reduce.
  if (mods.sealed) return 0;
  if (mods.increasePermille !== undefined) {
    value += mulPermille(value, mods.increasePermille);
  } else if (mods.reducePermille !== undefined) {
    value -= mulPermille(value, mods.reducePermille);
  }
  if (mods.pvpRealtimeFieldReducePermille !== undefined) {
    value -= mulPermille(value, mods.pvpRealtimeFieldReducePermille);
  }
  if (mods.hasBleed) value = mulPermille(value, 500);
  return value;
}

/**
 * Absorption du shield sur des dégâts (chemin value < 0 d'AddHP, § 14.3).
 * Le shield encaisse d'abord ; s'il casse, le reste passe aux PV.
 */
export function shieldAbsorb(
  shieldHP: number,
  damage: number,
): { remainingShield: number; remainingDamage: number } {
  if (shieldHP < 1 || damage < 1) return { remainingShield: shieldHP, remainingDamage: damage };
  if (shieldHP > damage) return { remainingShield: shieldHP - damage, remainingDamage: 0 };
  return { remainingShield: 0, remainingDamage: damage - shieldHP };
}

/**
 * Application finale d'un delta de PV (fin d'AddHP) : clamp [0, MaxHP], puis
 * BT_UNDEAD (111) maintient à 1 PV si le coup serait mortel.
 */
export function applyHpDelta(
  hp: number,
  maxHP: number,
  delta: number,
  opts?: { undead?: boolean; ignoreUndead?: boolean },
): number {
  const raw = hp + delta;
  let next = raw > maxHP ? maxHP : raw;
  if (raw < 0) next = 0;
  if (next === 0 && opts?.undead && !opts.ignoreUndead) next = 1;
  return next;
}

export interface ShieldInput {
  /** Valeur du buff (Templet.Value × stacks). */
  value: number;
  /** Stat de la source (caster pour BT 19, porteur pour BT 20) si StatType != 0. */
  sourceStatValue?: number;
}

/**
 * Valeur d'un shield BT 19/20 (§ 14.4). SetShieldHP REMPLACE le shield courant —
 * aucun cumul, même si le nouveau est plus petit. Pas de pénalité PvP.
 */
export function calcShieldValue(input: ShieldInput): number {
  return statOrFlatValue(input.value, input.sourceStatValue);
}

export interface ReverseHealInput {
  /** Valeur du buff (Templet.Value × stacks). */
  value: number;
  /** Stat de la source (caster pour BT 16, porteur pour BT 17) si StatType != 0. */
  sourceStatValue?: number;
  /** Plus petit cap BT_REVERSE_HEAL_CAP (20) actif (valeur × stacks), s'il existe. */
  capValue?: number;
  /** PV courants et shield du porteur (protection létale). */
  hp: number;
  shieldHP: number;
  /** Contenu « létal » (guild dungeon, event challenge, world boss, singularité Monad) ou cible boss. */
  canKill?: boolean;
}

/**
 * Perte de PV effective d'un reverse heal (§ 14.5) : stat-ou-plat, cappé par le
 * plus petit BT 18, et hors contenu létal la cible reste à 1 (PV + shield).
 * Ignore défense/élément/crit/DMG_REDUCE ; passe par le shield (cf. shieldAbsorb).
 */
export function calcReverseHealValue(input: ReverseHealInput): number {
  let v = statOrFlatValue(input.value, input.sourceStatValue);
  if (input.capValue !== undefined && input.capValue < v) v = input.capValue;
  const total = input.hp + input.shieldHP;
  if (total > v || input.canKill) return v;
  return total - 1; // AddHP(1 − (HP+shield)) : laisse exactement 1
}

/** BT 80 WG_HEAL / BT 84 WG_DMG : valeur ‰ de MaxWG si ApplyingType == 2, plate sinon. */
export function wgBuffValue(value: number, maxWG: number, isPermilleOfMaxWG: boolean): number {
  return isPermilleOfMaxWG ? mulPermille(maxWG, value) : value;
}

/** Dégâts de jauge d'un buff BT 84 (passe par CalcDamageWG avec la valeur en custom). */
export function calcWgBuffDamage(
  value: number,
  maxWG: number,
  isPermilleOfMaxWG: boolean,
  wg: Omit<DamageWgInput, 'customValue' | 'skillWgReduce'>,
): number {
  return calcDamageWG({
    ...wg,
    skillWgReduce: 0,
    customValue: wgBuffValue(value, maxWG, isPermilleOfMaxWG),
  });
}

/**
 * Tick immédiat d'un DOT (BT 60–65, § 14.6) : chaque DOT du type visé déjà posé
 * tick à ApplyRate(dotValue, immediateValue) = dot × (1000 + v)/1000, puis passe
 * par CalcDamageDOT (formula.ts).
 */
export function immediateDotValue(dotValue: number, immediateValue: number): number {
  return applyRate(dotValue, immediateValue);
}
