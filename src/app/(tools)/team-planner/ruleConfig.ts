// app/(tools)/team-planner/ruleConfig.ts
import type { RuleMetadata, RuleType } from './types'

/**
 * Configuration et métadonnées de toutes les règles disponibles
 */
export const RULE_METADATA: Record<RuleType, RuleMetadata> = {
  // ===== BUFFS =====
  require_attack_buff: {
    type: 'require_attack_buff',
    category: 'buffs',
    label: 'Attack Buff',
    description: 'Team must have at least one character that can provide Attack buff',
    icon: 'buff/attack',
  },
  require_defense_buff: {
    type: 'require_defense_buff',
    category: 'buffs',
    label: 'Defense Buff',
    description: 'Team must have at least one character that can provide Defense buff',
    icon: 'buff/defense',
  },
  require_crit_rate_buff: {
    type: 'require_crit_rate_buff',
    category: 'buffs',
    label: 'Crit Rate Buff',
    description: 'Team must have at least one character that can provide Crit Rate buff',
    icon: 'buff/crit_rate',
  },
  require_crit_damage_buff: {
    type: 'require_crit_damage_buff',
    category: 'buffs',
    label: 'Crit Damage Buff',
    description: 'Team must have at least one character that can provide Crit Damage buff',
    icon: 'buff/crit_damage',
  },
  require_speed_buff: {
    type: 'require_speed_buff',
    category: 'buffs',
    label: 'Speed Buff',
    description: 'Team must have at least one character that can provide Speed buff',
    icon: 'buff/speed',
  },

  // ===== DEBUFFS =====
  require_attack_break: {
    type: 'require_attack_break',
    category: 'debuffs',
    label: 'Attack Break',
    description: 'Team must have at least one character that can apply Attack break',
    icon: 'debuff/attack_break',
  },
  require_defense_break: {
    type: 'require_defense_break',
    category: 'debuffs',
    label: 'Defense Break',
    description: 'Team must have at least one character that can apply Defense break',
    icon: 'debuff/defense_break',
  },
  require_crit_resist_down: {
    type: 'require_crit_resist_down',
    category: 'debuffs',
    label: 'Crit Resist Down',
    description: 'Team must have at least one character that can apply Crit Resist down',
    icon: 'debuff/crit_resist',
  },
  require_speed_down: {
    type: 'require_speed_down',
    category: 'debuffs',
    label: 'Speed Down',
    description: 'Team must have at least one character that can apply Speed down',
    icon: 'debuff/speed_down',
  },

  // ===== ROLES =====
  require_dps: {
    type: 'require_dps',
    category: 'roles',
    label: 'DPS',
    description: 'Team must have at least one main DPS character',
    icon: 'role/dps',
  },
  require_tank: {
    type: 'require_tank',
    category: 'roles',
    label: 'Tank',
    description: 'Team must have at least one tank character',
    icon: 'role/tank',
  },
  require_healer: {
    type: 'require_healer',
    category: 'roles',
    label: 'Healer',
    description: 'Team must have at least one healer character',
    icon: 'role/healer',
  },
  require_support: {
    type: 'require_support',
    category: 'roles',
    label: 'Support',
    description: 'Team must have at least one support character',
    icon: 'role/support',
  },
  require_sub_dps: {
    type: 'require_sub_dps',
    category: 'roles',
    label: 'Sub DPS',
    description: 'Team must have at least one sub-DPS character',
    icon: 'role/sub_dps',
  },

  // ===== UTILITY =====
  require_dispel: {
    type: 'require_dispel',
    category: 'utility',
    label: 'Dispel',
    description: 'Team must have at least one character that can dispel enemy buffs',
    icon: 'utility/dispel',
  },
  require_immunity: {
    type: 'require_immunity',
    category: 'utility',
    label: 'Immunity',
    description: 'Team must have at least one character that can provide immunity',
    icon: 'utility/immunity',
  },
  require_cleanse: {
    type: 'require_cleanse',
    category: 'utility',
    label: 'Cleanse',
    description: 'Team must have at least one character that can cleanse debuffs',
    icon: 'utility/cleanse',
  },
  require_revive: {
    type: 'require_revive',
    category: 'utility',
    label: 'Revive',
    description: 'Team must have at least one character that can revive fallen allies',
    icon: 'utility/revive',
  },
  require_shield: {
    type: 'require_shield',
    category: 'utility',
    label: 'Shield',
    description: 'Team must have at least one character that can provide shields',
    icon: 'utility/shield',
  },

  // ===== ELEMENT RESTRICTIONS =====
  forbid_fire: {
    type: 'forbid_fire',
    category: 'element_restrictions',
    label: 'No Fire',
    description: 'Fire element characters are forbidden',
    icon: 'element/fire',
  },
  forbid_water: {
    type: 'forbid_water',
    category: 'element_restrictions',
    label: 'No Water',
    description: 'Water element characters are forbidden',
    icon: 'element/water',
  },
  forbid_earth: {
    type: 'forbid_earth',
    category: 'element_restrictions',
    label: 'No Earth',
    description: 'Earth element characters are forbidden',
    icon: 'element/earth',
  },
  forbid_light: {
    type: 'forbid_light',
    category: 'element_restrictions',
    label: 'No Light',
    description: 'Light element characters are forbidden',
    icon: 'element/light',
  },
  forbid_dark: {
    type: 'forbid_dark',
    category: 'element_restrictions',
    label: 'No Dark',
    description: 'Dark element characters are forbidden',
    icon: 'element/dark',
  },

  // ===== ELEMENT BONUS =====
  bonus_fire: {
    type: 'bonus_fire',
    category: 'element_bonus',
    label: 'Fire Bonus',
    description: 'Fire element characters receive bonus stats',
    icon: 'element/fire',
  },
  bonus_water: {
    type: 'bonus_water',
    category: 'element_bonus',
    label: 'Water Bonus',
    description: 'Water element characters receive bonus stats',
    icon: 'element/water',
  },
  bonus_earth: {
    type: 'bonus_earth',
    category: 'element_bonus',
    label: 'Earth Bonus',
    description: 'Earth element characters receive bonus stats',
    icon: 'element/earth',
  },
  bonus_light: {
    type: 'bonus_light',
    category: 'element_bonus',
    label: 'Light Bonus',
    description: 'Light element characters receive bonus stats',
    icon: 'element/light',
  },
  bonus_dark: {
    type: 'bonus_dark',
    category: 'element_bonus',
    label: 'Dark Bonus',
    description: 'Dark element characters receive bonus stats',
    icon: 'element/dark',
  },

  // ===== CLASS RESTRICTIONS =====
  forbid_attacker: {
    type: 'forbid_attacker',
    category: 'class_restrictions',
    label: 'No Attacker',
    description: 'Attacker class characters are forbidden',
    icon: 'class/attacker',
  },
  forbid_defender: {
    type: 'forbid_defender',
    category: 'class_restrictions',
    label: 'No Defender',
    description: 'Defender class characters are forbidden',
    icon: 'class/defender',
  },
  forbid_ranger: {
    type: 'forbid_ranger',
    category: 'class_restrictions',
    label: 'No Ranger',
    description: 'Ranger class characters are forbidden',
    icon: 'class/ranger',
  },
  forbid_supporter: {
    type: 'forbid_supporter',
    category: 'class_restrictions',
    label: 'No Supporter',
    description: 'Supporter class characters are forbidden',
    icon: 'class/supporter',
  },

  // ===== TEAM CONSTRAINTS =====
  max_same_element: {
    type: 'max_same_element',
    category: 'team_constraints',
    label: 'Max Same Element',
    description: 'Maximum number of characters of the same element',
    requiresValue: true,
    defaultValue: 2,
    minValue: 1,
    maxValue: 4,
  },
  max_same_class: {
    type: 'max_same_class',
    category: 'team_constraints',
    label: 'Max Same Class',
    description: 'Maximum number of characters of the same class',
    requiresValue: true,
    defaultValue: 2,
    minValue: 1,
    maxValue: 4,
  },
  min_different_elements: {
    type: 'min_different_elements',
    category: 'team_constraints',
    label: 'Min Different Elements',
    description: 'Minimum number of different elements in the team',
    requiresValue: true,
    defaultValue: 3,
    minValue: 2,
    maxValue: 5,
  },
  require_mono_element: {
    type: 'require_mono_element',
    category: 'team_constraints',
    label: 'Mono Element',
    description: 'All characters must be of the same element',
  },
}

/**
 * Groupement des règles par catégorie pour l'affichage
 */
export const RULES_BY_CATEGORY = {
  buffs: [
    'require_attack_buff',
    'require_defense_buff',
    'require_crit_rate_buff',
    'require_crit_damage_buff',
    'require_speed_buff',
  ] as RuleType[],
  debuffs: [
    'require_attack_break',
    'require_defense_break',
    'require_crit_resist_down',
    'require_speed_down',
  ] as RuleType[],
  roles: [
    'require_dps',
    'require_tank',
    'require_healer',
    'require_support',
    'require_sub_dps',
  ] as RuleType[],
  utility: [
    'require_dispel',
    'require_immunity',
    'require_cleanse',
    'require_revive',
    'require_shield',
  ] as RuleType[],
  element_restrictions: [
    'forbid_fire',
    'forbid_water',
    'forbid_earth',
    'forbid_light',
    'forbid_dark',
  ] as RuleType[],
  element_bonus: [
    'bonus_fire',
    'bonus_water',
    'bonus_earth',
    'bonus_light',
    'bonus_dark',
  ] as RuleType[],
  class_restrictions: [
    'forbid_attacker',
    'forbid_defender',
    'forbid_ranger',
    'forbid_supporter',
  ] as RuleType[],
  team_constraints: [
    'max_same_element',
    'max_same_class',
    'min_different_elements',
    'require_mono_element',
  ] as RuleType[],
}

/**
 * Labels pour les catégories
 */
export const CATEGORY_LABELS = {
  buffs: 'Buffs',
  debuffs: 'Debuffs',
  roles: 'Roles',
  utility: 'Utility',
  element_restrictions: 'Element Restrictions',
  element_bonus: 'Element Bonus',
  class_restrictions: 'Class Restrictions',
  team_constraints: 'Team Constraints',
}
