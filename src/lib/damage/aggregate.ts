/**
 * AMONT du moteur — AGRÉGATION des buffs actifs vers les canaux des formules.
 * Réf : docs/specs/damage-formula.md § 9 (familles exactes du binaire),
 * § 14.1 (valeur effective = Value × stacks), § 10.1 (swap d'attaque).
 *
 * Entrée : les buffs ACTIFS du scénario sous leur forme brute (mêmes champs
 * que `data/generated/damage/buffs.json` — enums `BT_*`/`ST_*`/`OAT_*` non
 * traduits), chacun avec ses stacks COURANTS (choisis dans l'UI, ex. le
 * compteur de M.Ame). Sortie : les canaux consommés par `sheetToCombatStat`
 * (§ 16.1) et `checkDamageRate`/`calcDamageCore` (§ 7-8).
 *
 * Les familles dépendantes du contexte (PV perdus, stats, comptes de buffs,
 * break, boss, scène, branche) lisent un contexte EXPLICITE : ce que le
 * scénario ne fournit pas contribue 0 — jamais une valeur plausible.
 * `CheckAvailable` (conditions internes, § 12) n'est pas émulé : l'UI ne
 * propose que des buffs actifs, donc disponibles.
 */

import { getLostHPRateValue, getStatValuePermille } from './formula';
import { PUNISH_DMG_REDUCE_VALUE_PERMILLE } from './types';

/** Un buff ACTIF du scénario (forme brute de `buffs.json` + stacks courants). */
export interface ActiveBuff {
  /** Famille `BT_*` (colonne `Type` de BuffTemplet). */
  type: string;
  /** `ST_*` — BT_STAT, BT_SWAP_STAT_ATTACK, familles `*_STAT`. */
  stat?: string;
  /** `OAT_ADD` (plat) ou `OAT_RATE` (‰). */
  applyingType?: string;
  /** Valeur du niveau du buff (‰ ou plat selon la famille). */
  value?: number;
  /** Stacks COURANTS (défaut 1) — § 14.1 : valeur effective = value × stacks. */
  stacks?: number;
  /**
   * PV du POSEUR du buff quand il n'est pas l'attaquant (familles CASTER_*)
   * — absent : replié sur l'attaquant du contexte.
   */
  caster?: { maxHP: number; hp: number };
}

/** § 14.1 — CBuff.get_Value : valeur × stacks courants. */
export function effectiveValue(buff: ActiveBuff): number {
  return (buff.value ?? 0) * (buff.stacks ?? 1);
}

// ── Canaux de stats (CalcFinalStat § 3, consommés par sheetToCombatStat) ────

export interface StatChannel {
  /** Somme des plats (`OAT_ADD`) → `buffValue`. */
  value: number;
  /** Somme des taux ‰ (`OAT_RATE`) → `buffValueRate`. */
  rate: number;
}

/** Contexte des stats « PV perdus » (BT 33/34, § 14) — absent : contribution 0. */
export interface StatChannelContext {
  owner?: { maxHP: number; hp: number };
}

/** Buffs `BT_STAT` (+ familles « PV perdus » § 14 : BT 33 OWNER_LOST_HP_RATE,
 *  BT 34 `_HALF` — `InstanceValue = GetLostHPRateValue`) → canaux plat/taux
 *  PAR stat (`ST_*`). */
export function collectStatChannels(
  buffs: ActiveBuff[],
  ctx?: StatChannelContext,
): Record<string, StatChannel> {
  const channels: Record<string, StatChannel> = {};
  for (const b of buffs) {
    if (!b.stat) continue;
    let v: number;
    // BT_STAT_PREMIUM n'arrive ici QUE posé par un ALLIÉ (resolveAllyPassives) :
    // pas dans la fiche saisie du receveur, donc pas de défactorisation — le
    // premium EST le canal buffVal/buffRate (§ 16.4). Ceux du PORTEUR ne
    // deviennent jamais des buffs de scénario (doctrine fiche, gear.ts).
    if (b.type === 'BT_STAT' || b.type === 'BT_STAT_PREMIUM') v = effectiveValue(b);
    else if (
      b.type === 'BT_STAT_OWNER_LOST_HP_RATE' ||
      b.type === 'BT_STAT_OWNER_LOST_HP_RATE_HALF'
    ) {
      const owner = ctx?.owner;
      if (!owner) continue; // contexte absent → 0, jamais deviné
      // § 14 BT 32 : hpEff = clamp(2×HP − MaxHP, 0, MaxHP) — le bonus croît
      // deux fois plus vite et sature quand HP ≤ 50 %.
      const hp =
        b.type === 'BT_STAT_OWNER_LOST_HP_RATE_HALF'
          ? Math.min(Math.max(2 * owner.hp - owner.maxHP, 0), owner.maxHP)
          : owner.hp;
      v = getLostHPRateValue(owner.maxHP, hp, effectiveValue(b));
    } else continue;
    const ch = (channels[b.stat] ??= { value: 0, rate: 0 });
    if (b.applyingType === 'OAT_RATE') ch.rate += v;
    else ch.value += v;
  }
  return channels;
}

// ── § 9.1 FindBuffAdditionalDamage — buffs de l'ATTAQUANT, somme (‰) ────────

export interface AdditionalDamageContext {
  /** Branche du rapport — BT_DMG_NOT_CRITICAL ne compte que hors critique. */
  branch: 'normal' | 'critical' | 'miss';
  attacker?: { maxHP: number; hp: number };
  defender?: { maxHP: number; hp: number };
  /** Stats FINALES par `ST_*` (familles OWNER_STAT/CASTER_STAT). */
  attackerStat?: (stat: string) => number;
  /** Stats FINALES du défenseur (famille TARGET_STAT). */
  defenderStat?: (stat: string) => number;
  attackerBuffCount?: number;
  attackerDebuffCount?: number;
  defenderBuffCount?: number;
  defenderDebuffCount?: number;
  /** Σ buffs positifs de l'équipe du poseur (OWNER_TEAM_BUFF). */
  casterTeamBuffCount?: number;
  /** Alliés VIVANTS de l'équipe du poseur (1..4) — MY_TEAM_DECREASE. */
  casterAliveAllies?: number;
  targetIsBreak?: boolean;
  targetIsBoss?: boolean;
  scene?: 'pve' | 'pvp' | 'monad_gate' | 'tower';
}

/** Cap des familles `*_STAT` : min(GetStatValuePermille, 1000) — § 9.1. */
function statFamily(statOf: ((s: string) => number) | undefined, b: ActiveBuff): number {
  if (!statOf || !b.stat) return 0;
  const v = getStatValuePermille(statOf(b.stat), effectiveValue(b));
  return v < 1000 ? v : 1000;
}

function lostHpFamily(c: { maxHP: number; hp: number } | undefined, value: number): number {
  return c ? getLostHPRateValue(c.maxHP, c.hp, value) : 0;
}

export function findBuffAdditionalDamage(
  buffs: ActiveBuff[],
  ctx: AdditionalDamageContext,
): number {
  let sum = 0;
  for (const b of buffs) {
    const v = effectiveValue(b);
    switch (b.type) {
      case 'BT_DMG':
        sum += v;
        break;
      case 'BT_DMG_OWNER_LOST_HP_RATE':
        sum += lostHpFamily(ctx.attacker, v);
        break;
      case 'BT_DMG_TARGET_LOST_HP_RATE':
        sum += lostHpFamily(ctx.defender, v);
        break;
      case 'BT_DMG_CASTER_LOST_HP_RATE':
        sum += lostHpFamily(b.caster ?? ctx.attacker, v);
        break;
      case 'BT_DMG_OWNER_STAT':
      case 'BT_DMG_CASTER_STAT':
        sum += statFamily(ctx.attackerStat, b);
        break;
      case 'BT_DMG_TARGET_STAT':
        sum += statFamily(ctx.defenderStat, b);
        break;
      case 'BT_DMG_OWNER_BUFF':
        sum += v * (ctx.attackerBuffCount ?? 0);
        break;
      case 'BT_DMG_OWNER_DEBUFF':
        sum += v * (ctx.attackerDebuffCount ?? 0);
        break;
      case 'BT_DMG_TARGET_BUFF':
        sum += v * (ctx.defenderBuffCount ?? 0);
        break;
      case 'BT_DMG_TARGET_DEBUFF':
        sum += v * (ctx.defenderDebuffCount ?? 0);
        break;
      case 'BT_DMG_OWNER_TEAM_BUFF':
        sum += v * (ctx.casterTeamBuffCount ?? 0);
        break;
      case 'BT_DMG_MY_TEAM_DECREASE':
        sum += ctx.casterAliveAllies !== undefined ? v * (4 - ctx.casterAliveAllies) : 0;
        break;
      case 'BT_DMG_TARGET_BREAK':
        if (ctx.targetIsBreak) sum += v;
        break;
      case 'BT_DMG_TO_BOSS':
        if (ctx.targetIsBoss) sum += v;
        break;
      case 'BT_DMG_KILL_COUNT_STACK':
        sum += v; // stacks portés par l'instance (compteur UI)
        break;
      case 'BT_DMG_NOT_CRITICAL':
        if (ctx.branch !== 'critical') sum += v;
        break;
      case 'BT_DMG_PVP_CONTENT':
        if (ctx.scene === 'pvp') sum += v;
        break;
      case 'BT_DMG_MONADGATE_CONTENT':
        if (ctx.scene === 'monad_gate') sum += v;
        break;
      case 'BT_DMG_TOWER_CONTENT':
        if (ctx.scene === 'tower') sum += v;
        break;
      default:
        break;
    }
  }
  return sum;
}

// ── § 9.2 FindBuffDamageReduce — buffs du DÉFENSEUR, somme (‰) ──────────────

export interface DamageReduceContext {
  /** Le skill de l'attaquant est mono-cible (`SkillRangeType == 1`). */
  attackerSkillMonoTarget?: boolean;
  /** Alliés VIVANTS de l'équipe du poseur — REDUCE_MY_TEAM_INCREASE. */
  casterAliveAllies?: number;
  /** L'ATTAQUANT porte un BT_DOT_PUNISH (`FindBuffByType`) : +300 ‰ hors boucle. */
  attackerHasDotPunish?: boolean;
  /** GameConfig PUNISH_DMG_REDUCE_VALUE — défaut 300 (1.4.15). */
  punishReducePermille?: number;
}

export function findBuffDamageReduce(buffs: ActiveBuff[], ctx: DamageReduceContext): number {
  const punish = ctx.punishReducePermille ?? PUNISH_DMG_REDUCE_VALUE_PERMILLE;
  let sum = 0;
  for (const b of buffs) {
    const v = effectiveValue(b);
    switch (b.type) {
      case 'BT_DMG_REDUCE':
        // Binaire : seul `ApplyingType == 2` (OAT_RATE) contribue.
        if (b.applyingType === 'OAT_RATE') sum += v;
        break;
      case 'BT_STEALTHED':
        if (ctx.attackerSkillMonoTarget === false) sum += v;
        break;
      case 'BT_DMG_REDUCE_MY_TEAM_INCREASE':
        sum += ctx.casterAliveAllies !== undefined ? v * (ctx.casterAliveAllies - 1) : 0;
        break;
      case 'BT_DOT_PUNISH':
        // Un TERME de la somme par buff punish du défenseur (C#, 26/08/2026 —
        // l'ASM le laissait lire comme un plafond) : la valeur de config, pas
        // celle du buff (ni ses stacks).
        sum += punish;
        break;
      default:
        break;
    }
  }
  // Hors boucle : l'attaquant lui-même sous punish → le même terme, une fois.
  if (ctx.attackerHasDotPunish) sum += punish;
  return sum;
}

// ── § 11 FindBuffWGDamageReduce — jauge de faiblesse (BT 88/89) ─────────────

/**
 * Modificateurs de dégâts de jauge (CalcDamageWG § 11 ; § 12.3 levée le
 * 26/08/2026) : chaque `BT_WG_DMG` (89) de l'ATTAQUANT AJOUTE sa valeur au plat
 * (`OAT_ADD`) ou au taux ‰ (`OAT_RATE`) ; chaque `BT_WG_DMG_REDUCE` (88) du
 * DÉFENSEUR la RETRANCHE de même. `CheckAvailable` n'est pas émulé (buffs actifs
 * = disponibles, cf. en-tête).
 */
export function findBuffWGDamageReduce(
  attackerBuffs: ActiveBuff[],
  defenderBuffs: ActiveBuff[],
): { flat: number; rate: number } {
  let flat = 0;
  let rate = 0;
  for (const b of attackerBuffs) {
    if (b.type !== 'BT_WG_DMG') continue;
    if (b.applyingType === 'OAT_RATE') rate += effectiveValue(b);
    else flat += effectiveValue(b);
  }
  for (const b of defenderBuffs) {
    if (b.type !== 'BT_WG_DMG_REDUCE') continue;
    if (b.applyingType === 'OAT_RATE') rate -= effectiveValue(b);
    else flat -= effectiveValue(b);
  }
  return { flat, rate };
}

// ── § 9.3 GetBuffDamgeFinalReduce — défenseur, MAX (‰), pas somme ───────────

export interface FinalReduceContext {
  /** Le skill de l'attaquant est le S1 (`SkillType == 0`) — exclut BT 116. */
  isFirstSkill?: boolean;
  casterAliveAllies?: number;
}

export function getBuffDamageFinalReduce(buffs: ActiveBuff[], ctx: FinalReduceContext): number {
  let max = 0;
  for (const b of buffs) {
    let v = 0;
    switch (b.type) {
      case 'BT_DMG_REDUCE_FINAL':
        v = effectiveValue(b);
        break;
      case 'BT_DMG_REDUCE_FINAL_MY_TEAM_INCREASE':
        v =
          ctx.casterAliveAllies !== undefined ? effectiveValue(b) * (ctx.casterAliveAllies - 1) : 0;
        break;
      case 'BT_DMG_REDUCE_FINAL_WITH_OUT_FIRST_SKILL':
        v = ctx.isFirstSkill ? 0 : effectiveValue(b);
        break;
      default:
        break;
    }
    if (v > max) max = v;
  }
  return max;
}

// ── Drapeaux et canaux annexes (§ 6-8, § 10.1, § 11) ────────────────────────

export interface CombatFlags {
  /** BT_MARKING (défenseur) → ×1150/1000 dans le cœur § 8.2. */
  defenderMarked: boolean;
  /** BT_INVINCIBLE (défenseur) → branche invincible § 7. */
  defenderInvincible: boolean;
  /** BT_WG_INVINCIBLE (défenseur) → dégâts de jauge nuls § 11. */
  defenderWgInvincible: boolean;
  /** BT_DMG_ELEMENT_SUPERIORITY (attaquant) — avantage élémentaire forcé § 6. */
  forcedSuperiority: boolean;
  /** BT_DMG_ELEMENT_INFERIORITY (attaquant) — désavantage forcé § 6. */
  forcedInferiority: boolean;
  /** Σ BT_DMG_ELEMENT_ENCHANT (‰) — ne joue que si avantage § 6. */
  elementDamageRateBonus: number;
  /** Σ BT_DMG_ENEMY_TEAM_DECREASE (‰ par cible) → helper § 7. */
  enemyTeamDecreaseValue: number;
  /** BT_SWAP_STAT_ATTACK (§ 10.1) — premier buff disponible. */
  swapAttack?: { stat: string; applyingType: string; value: number };
}

/** Drapeaux du scénario — `attackerBuffs` et `defenderBuffs` séparés. */
export function collectCombatFlags(
  attackerBuffs: ActiveBuff[],
  defenderBuffs: ActiveBuff[],
): CombatFlags {
  const flags: CombatFlags = {
    defenderMarked: false,
    defenderInvincible: false,
    defenderWgInvincible: false,
    forcedSuperiority: false,
    forcedInferiority: false,
    elementDamageRateBonus: 0,
    enemyTeamDecreaseValue: 0,
  };
  for (const b of defenderBuffs) {
    if (b.type === 'BT_MARKING') flags.defenderMarked = true;
    if (b.type === 'BT_INVINCIBLE') flags.defenderInvincible = true;
    if (b.type === 'BT_WG_INVINCIBLE') flags.defenderWgInvincible = true;
  }
  for (const b of attackerBuffs) {
    if (b.type === 'BT_DMG_ELEMENT_SUPERIORITY') flags.forcedSuperiority = true;
    if (b.type === 'BT_DMG_ELEMENT_INFERIORITY') flags.forcedInferiority = true;
    if (b.type === 'BT_DMG_ELEMENT_ENCHANT') flags.elementDamageRateBonus += effectiveValue(b);
    if (b.type === 'BT_DMG_ENEMY_TEAM_DECREASE') flags.enemyTeamDecreaseValue += effectiveValue(b);
    if (!flags.swapAttack && b.type === 'BT_SWAP_STAT_ATTACK' && b.stat) {
      flags.swapAttack = {
        stat: b.stat,
        applyingType: b.applyingType ?? 'OAT_ADD',
        value: effectiveValue(b),
      };
    }
  }
  return flags;
}
