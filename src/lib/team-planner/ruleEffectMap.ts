// lib/team-planner/ruleEffectMap.ts
import type { RuleType } from '@/types/team-planner'
import type { CharacterLite } from '@/types/types'
import { hasAnyEffect } from './effectGroupMap'

// ============================================================================
// Buff rules → effect names in char.buff[]
// ============================================================================

const BUFF_RULES: Partial<Record<RuleType, string[]>> = {
  require_attack_buff:      ['BT_STAT|ST_ATK'],
  require_defense_buff:     ['BT_STAT|ST_DEF'],
  require_crit_rate_buff:   ['BT_STAT|ST_CRITICAL_RATE'],
  require_crit_damage_buff: ['BT_STAT|ST_CRITICAL_DMG_RATE'],
  require_speed_buff:       ['BT_STAT|ST_SPEED'],
}

// ============================================================================
// Debuff rules → effect names in char.debuff[]
// ============================================================================

const DEBUFF_RULES: Partial<Record<RuleType, string[]>> = {
  require_attack_break:     ['BT_STAT|ST_ATK'],
  require_defense_break:    ['BT_STAT|ST_DEF'],
  require_crit_resist_down: ['BT_STAT|ST_CRITICAL_RATE'],
  require_speed_down:       ['BT_STAT|ST_SPEED'],
}

// ============================================================================
// Utility rules → buff names the character provides (to allies)
// ============================================================================

const UTILITY_BUFF_RULES: Partial<Record<RuleType, string[]>> = {
  require_immunity: ['BT_IMMUNE'],
  require_cleanse:  ['BT_REMOVE_DEBUFF'],
  require_revive:   ['BT_RESURRECTION', 'BT_REVIVAL'],
  require_shield:   ['BT_SHIELD_BASED_CASTER', 'BT_INVINCIBLE'],
}

// Utility rules → debuff names the character applies (to enemies)
const UTILITY_DEBUFF_RULES: Partial<Record<RuleType, string[]>> = {
  require_dispel: ['BT_REMOVE_BUFF'],
}

// ============================================================================
// Element mapping
// ============================================================================

const ELEMENT_MAP: Partial<Record<RuleType, string>> = {
  forbid_fire: 'Fire', forbid_water: 'Water', forbid_earth: 'Earth',
  forbid_light: 'Light', forbid_dark: 'Dark',
  bonus_fire: 'Fire', bonus_water: 'Water', bonus_earth: 'Earth',
  bonus_light: 'Light', bonus_dark: 'Dark',
}

// ============================================================================
// Class mapping
// ============================================================================

const CLASS_MAP: Partial<Record<RuleType, string>> = {
  forbid_striker: 'Striker', forbid_defender: 'Defender',
  forbid_ranger: 'Ranger', forbid_healer: 'Healer', forbid_mage: 'Mage',
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if a single character satisfies a rule requirement.
 * For "require_*" rules: returns true if the character provides what's needed.
 * For "forbid_*" rules: returns true if the character VIOLATES the restriction.
 * For "bonus_*" rules: returns true if the character benefits from the bonus.
 */
export function characterMatchesRule(char: CharacterLite, ruleType: RuleType): boolean {
  // Buff requirements: check char.buff[]
  const buffEffects = BUFF_RULES[ruleType]
  if (buffEffects) {
    return hasAnyEffect(char.buff || [], buffEffects)
  }

  // Debuff requirements: check char.debuff[]
  const debuffEffects = DEBUFF_RULES[ruleType]
  if (debuffEffects) {
    return hasAnyEffect(char.debuff || [], debuffEffects)
  }

  // Utility buff rules: check char.buff[]
  const utilityBuffEffects = UTILITY_BUFF_RULES[ruleType]
  if (utilityBuffEffects) {
    return hasAnyEffect(char.buff || [], utilityBuffEffects)
  }

  // Utility debuff rules: check char.debuff[]
  const utilityDebuffEffects = UTILITY_DEBUFF_RULES[ruleType]
  if (utilityDebuffEffects) {
    return hasAnyEffect(char.debuff || [], utilityDebuffEffects)
  }

  // Element rules (forbid + bonus): check char.Element
  const element = ELEMENT_MAP[ruleType]
  if (element) {
    return char.Element === element
  }

  // Class rules (forbid): check char.Class
  const cls = CLASS_MAP[ruleType]
  if (cls) {
    return char.Class === cls
  }

  // Role requirements
  switch (ruleType) {
    case 'require_dps':
      return char.role === 'dps'
    case 'require_tank':
      return char.role === 'sustain' && char.Class === 'Defender'
    case 'require_healer':
      return char.role === 'sustain' && char.Class === 'Healer'
    case 'require_support':
      return char.role === 'support'
    case 'require_sub_dps':
      // Sub-DPS: support role with offensive capabilities, or secondary DPS
      return char.role === 'dps' || (char.role === 'support' && (char.Class === 'Striker' || char.Class === 'Ranger' || char.Class === 'Mage'))
  }

  // Team constraints are not character-level checks
  return false
}

/**
 * Get the element string for an element-related rule (forbid or bonus).
 */
export function getRuleElement(ruleType: RuleType): string | undefined {
  return ELEMENT_MAP[ruleType]
}

/**
 * Get the class string for a class restriction rule.
 */
export function getRuleClass(ruleType: RuleType): string | undefined {
  return CLASS_MAP[ruleType]
}
