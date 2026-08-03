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

/** Buffs `BT_STAT` → canaux plat/taux PAR stat (`ST_*`). */
export function collectStatChannels(buffs: ActiveBuff[]): Record<string, StatChannel> {
  const channels: Record<string, StatChannel> = {};
  for (const b of buffs) {
    if (b.type !== 'BT_STAT' || !b.stat) continue;
    const ch = (channels[b.stat] ??= { value: 0, rate: 0 });
    if (b.applyingType === 'OAT_RATE') ch.rate += effectiveValue(b);
    else ch.value += effectiveValue(b);
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
}

export function findBuffDamageReduce(buffs: ActiveBuff[], ctx: DamageReduceContext): number {
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
      default:
        break;
    }
  }
  return sum;
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
