/**
 * Types du moteur de dégâts — miroir fidèle de CFormula (libil2cpp 1.4.9).
 * Réf : docs/specs/damage-formula.md. Toutes les valeurs de taux sont en
 * pour-mille (‰) : 1000 = 100 %. Toutes les stats sont les stats FINALES
 * (buffs inclus), telles que renvoyées par les getters de CCharacterData.
 */

/** CHARACTER_ELEMENT_TYPE (dump.cs). */
export const Element = {
  Earth: 0,
  Water: 1,
  Fire: 2,
  Light: 3,
  Dark: 4,
} as const;
export type Element = (typeof Element)[keyof typeof Element];

/** ELEMENT_SUPERIORITY_TYPE. */
export const ElementSuperiority = {
  AttackerWin: 0,
  Equal: 1,
  AttackerLose: 2,
} as const;
export type ElementSuperiority = (typeof ElementSuperiority)[keyof typeof ElementSuperiority];

/** DAMAGE_RATE_TYPE — résultat d'un hit (CSkillRecord.DamageRateType). */
export const DamageRateType = {
  None: 0,
  Normal: 1,
  Critical: 2,
  Missed: 3,
  Invincible: 4,
} as const;
export type DamageRateType = (typeof DamageRateType)[keyof typeof DamageRateType];

/** MISSED_DAMAGE_RATE — GameConfig id 15 (GameConfigTemplet.json), version 1.4.9. */
export const MISSED_DAMAGE_RATE_PERMILLE = 500;

/**
 * PVP_HEAL_PENALTY_REDUCE_RATE (GameConfig) — réduction de base des soins en PvP.
 * La scène l'escalade via PVP_HEAL_PENALTY_REDUCE_ADD_RATE (250 ‰) — déclencheur
 * non extrait, cf. spec § 12.7.
 */
export const PVP_HEAL_PENALTY_REDUCE_RATE_PERMILLE = 500;

/** Plancher du taux de dégâts après tous les modificateurs (CheckDamageRate). */
export const MIN_DAMAGE_RATE_PERMILLE = 300;

/**
 * CCommonDefine.MAX_USER_TEAM_MEMBER — dump.cs, version 1.4.9 : taille d'une
 * équipe. Référence du décompte § 7 (`decreaseTargetCount = 4 − cibles
 * touchées`, BT_DMG_ENEMY_TEAM_DECREASE) — le code d'attaque qui calcule le
 * décompte n'est pas désassemblé, la référence est PROUVÉE par la fixture Noa
 * vs Rhona (10/08/2026) : 150 ‰ × 3 = +450 ‰ exacts sur une vague à 1 ennemi.
 */
export const MAX_USER_TEAM_MEMBER = 4;

/** Multiplicateur subi par une cible marquée (buff BT_MARKING, type 5). */
export const MARKING_DAMAGE_RATE_PERMILLE = 1150;

/** Taux élémentaires (GetElementeryDamageRate). */
export const ELEMENT_SUPERIOR_RATE_PERMILLE = 1200;
export const ELEMENT_INFERIOR_RATE_PERMILLE = 800;
export const ELEMENT_NEUTRAL_RATE_PERMILLE = 1000;

/** Entrées de CalcFinalStat (ordre exact de la signature du binaire). */
export interface FinalStatInput {
  /** Stat de base (templet perso au niveau courant). */
  baseValue: number;
  /** Taux d'avantage d'apparition (‰) — monstres/contenus. */
  spawnAdvantageRate: number;
  /** Bonus plat d'évolution. */
  evolutionValue: number;
  /** Bonus plat d'éveil. */
  awakeningValue: number;
  /** Taux d'éveil (‰). */
  awakeningValueRate: number;
  /** Bonus plat d'enchantement Monad. */
  monadEnchantValue: number;
  /** Taux Monad (‰). */
  monadEnchantValueRate: number;
  /** Taux de transcendance (‰). */
  transcendentStarValueRate: number;
  /** Taux d'archive (‰) — appliqué sur la base seule. */
  archiveStatValueRate: number;
  /** Bonus plat des items. */
  itemOptionValue: number;
  /** Taux des items (‰). */
  itemOptionValueRate: number;
  /** Bonus plat des buffs. */
  buffValue: number;
  /** Taux des buffs (‰) — multiplie tout le sous-total. */
  buffValueRate: number;
}

/** Snapshot attaquant pour CheckDamageRate. */
export interface AttackerRateStats {
  /** ST_CRITICAL_RATE (7), ‰. */
  criticalRate: number;
  /** ST_CRITICAL_DMG_RATE (8), ‰ (ex. 1500 = ×1,5). */
  criticalDmgRate: number;
  /** ST_DMG_BOOST (25), ‰. */
  dmgBoost: number;
}

/** Snapshot défenseur pour CheckDamageRate. */
export interface DefenderRateStats {
  /** ST_AVOID (14), ‰. */
  avoid: number;
  /** ST_DMG_REDUCE_RATE (6), ‰. */
  dmgReduceRate: number;
  /** ST_E_CRI_DMG_REDUCE (26), ‰ — soustrait du taux critique. */
  enemyCriticalDamageReduce: number;
  /** Le défenseur porte un buff BT_INVINCIBLE (3). */
  hasInvincibleBuff: boolean;
}

/** Tirages injectés (uniformes ENTIERS sur [0, 1000] inclus — cf. GetBattleRandomRange). */
export interface DamageRateRolls {
  /** Tirage d'esquive (comparé à Avoid du défenseur). */
  avoid: number;
  /** Tirage de critique (comparé à CriticalRate de l'attaquant). */
  critical: number;
}

export interface CheckDamageRateInput {
  attacker: AttackerRateStats;
  defender: DefenderRateStats;
  /** Somme FindBuffAdditionalDamage (‰) — cf. spec § 9.1. */
  additionalDamageRate?: number;
  /** Somme FindBuffDamageReduce (‰) — cf. spec § 9.2. */
  damageReduceRate?: number;
  /**
   * Attaque additive : réutilise le résultat du hit précédent
   * (Attacker.SkillRecord.IsAdditiveAction && résultat précédent != None).
   */
  previousResult?: DamageRateType;
  /** World boss « finish attack » lancé par le boss : NORMAL, taux 1000, sans modif. */
  worldBossFinishAttackByBoss?: boolean;
  /** Overrides de contenu (world boss special / infiltrate satellite) : force NORMAL 1000. */
  forceNormalOverride?: boolean;
  rolls: DamageRateRolls;
}

export interface DamageRateResult {
  type: DamageRateType;
  /** Taux final (‰) à passer à calcDamage. 0 si invincible. */
  rate: number;
}

/** Entrées du cœur du calcul (<CalcDamage>g__CalcDamage|17_0). */
export interface DamageCoreInput {
  /** GetAttackStat() — ST_ATK final (ou stat swappée par BT_SWAP_STAT_ATTACK). */
  attackStat: number;
  /** GetSkillFactor() — DamageFactor du SkillLevelTemplet du skill courant (‰). */
  skillFactor: number;
  /** ST_PIERCE_POWER_RATE (10) de l'attaquant, ‰. */
  piercePowerRate: number;
  /** ST_PIERCE_POWER (9) de l'attaquant, plat. */
  piercePower: number;
  /** ST_DEF (5) du défenseur. */
  defense: number;
  /** DamageFactor du CDamageTemplet du hit (‰ du total de la compétence). */
  damageFactor: number;
  /** Taux issu de checkDamageRate (‰). */
  damageRate: number;
  /** Le défenseur porte un buff BT_MARKING (5) → ×1150/1000. */
  defenderMarked?: boolean;
  /** Taux élémentaire (‰) — getElementeryDamageRate. */
  elementalRate: number;
  /** Le hit est un MISS (DamageRateType.Missed) → ×MISSED_DAMAGE_RATE/1000. */
  isMissed?: boolean;
  /** GameConfig MISSED_DAMAGE_RATE ; défaut 500 (version 1.4.9). */
  missedDamageRatePermille?: number;
  /** GetBuffDamgeFinalReduce — MAX des buffs 119/120/121 (‰), cf. spec § 9.3. */
  finalReduceRate?: number;
}

export interface CalcDamageInput extends DamageCoreInput {
  /** ST_VAMPIRIC (11) de l'attaquant, ‰. */
  vampiric?: number;
  /** ST_HIT_HP_RECOVERY (12) du défenseur, ‰. */
  hitHpRecovery?: number;
}

export interface CalcDamageResult {
  damage: number;
  /** Soin de l'attaquant : MulPermille(damage, vampiric). */
  vampiric: number;
  /** Récup du défenseur : FloorToInt(float32(hitHpRecovery × damage) × 0.001f). */
  hitRecovery: number;
}

/** Entrées de CalcDamageDOT. */
export interface DamageDotInput {
  /** ST_PIERCE_POWER_RATE de l'attaquant, ‰. */
  piercePowerRate: number;
  /** ST_PIERCE_POWER de l'attaquant, plat. */
  piercePower: number;
  /** ST_DEF du défenseur. */
  defense: number;
  /** ST_DMG_REDUCE_RATE du défenseur, ‰ (cappé à 900 dans la formule). */
  dmgReduceRate: number;
  /** Taux du DOT (‰) — templet du buff. */
  attackRate: number;
  /** Stat de référence capturée (ex. ATK du poseur). */
  statValue: number;
}

/** Entrées de CalcDamageWG (jauge de faiblesse). */
export interface DamageWgInput {
  /** Le défenseur porte BT_WG_INVINCIBLE (82) → 0. */
  defenderWgInvincible?: boolean;
  /** Valeur custom ; si 0, on prend le WGReduce du skill courant. */
  customValue?: number;
  /** WGReduce (byte) du SkillLevelTemplet du skill courant de l'attaquant. */
  skillWgReduce: number;
  /** Sortie flat de FindBuffWGDamageReduce (BT 83/84). */
  wgReduceFlat?: number;
  /** Sortie taux (‰) de FindBuffWGDamageReduce. */
  wgReduceRate?: number;
}

/** Résultat de calcCharacterSharedDamage. */
export interface SharedDamageResult {
  /** Dégâts restant sur la cible après partages. */
  remaining: number;
  /** Parts prises par les porteurs de BT_SHARE_DMG_MULTI (même ordre que l'entrée). */
  multiShared: number[];
  /** Part du porteur unique de BT_SHARE_DMG (0 si absent). */
  singleShared: number;
}
