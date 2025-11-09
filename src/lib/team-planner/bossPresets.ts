// lib/team-planner/bossPresets.ts
import type { BossPreset } from '@/types/team-planner'

/**
 * Presets pour différents boss et contenus du jeu
 * Ces presets peuvent être étendus au fil du temps
 */
export const BOSS_PRESETS: BossPreset[] = [
  // ===== SKYWARD TOWER =====
  {
    id: 'skyward_tower_example_1',
    name: 'Skyward Tower - Example Floor',
    category: 'skyward_tower',
    difficulty: 'very_hard',
    description: 'Example configuration for a Skyward Tower floor',
    rules: [
      {
        id: 'rule_1',
        type: 'require_defense_break',
        category: 'debuffs',
        enabled: true,
      },
      {
        id: 'rule_2',
        type: 'require_crit_rate_buff',
        category: 'buffs',
        enabled: true,
      },
      {
        id: 'rule_3',
        type: 'require_dps',
        category: 'roles',
        enabled: true,
      },
      {
        id: 'rule_4',
        type: 'forbid_earth',
        category: 'element_restrictions',
        enabled: true,
      },
    ],
  },

  // ===== GUILD RAID =====
  {
    id: 'guild_raid_example',
    name: 'Guild Raid - Example Boss',
    category: 'guild_raid',
    difficulty: 'hard',
    description: 'Example Guild Raid boss configuration',
    rules: [
      {
        id: 'rule_1',
        type: 'require_defense_break',
        category: 'debuffs',
        enabled: true,
      },
      {
        id: 'rule_2',
        type: 'require_attack_buff',
        category: 'buffs',
        enabled: true,
      },
      {
        id: 'rule_3',
        type: 'require_dispel',
        category: 'utility',
        enabled: true,
      },
      {
        id: 'rule_4',
        type: 'require_healer',
        category: 'roles',
        enabled: true,
      },
      {
        id: 'rule_5',
        type: 'bonus_fire',
        category: 'element_bonus',
        enabled: true,
      },
    ],
  },

  // ===== WORLD BOSS =====
  {
    id: 'world_boss_example',
    name: 'World Boss - Example',
    category: 'world_boss',
    difficulty: 'nightmare',
    description: 'Example World Boss configuration',
    rules: [
      {
        id: 'rule_1',
        type: 'require_defense_break',
        category: 'debuffs',
        enabled: true,
      },
      {
        id: 'rule_2',
        type: 'require_attack_break',
        category: 'debuffs',
        enabled: true,
      },
      {
        id: 'rule_3',
        type: 'require_crit_damage_buff',
        category: 'buffs',
        enabled: true,
      },
      {
        id: 'rule_4',
        type: 'require_tank',
        category: 'roles',
        enabled: true,
      },
      {
        id: 'rule_5',
        type: 'require_healer',
        category: 'roles',
        enabled: true,
      },
      {
        id: 'rule_6',
        type: 'require_cleanse',
        category: 'utility',
        enabled: true,
      },
    ],
  },

  // ===== IRREGULAR =====
  {
    id: 'irregular_example',
    name: 'Irregular - Example',
    category: 'irregular',
    description: 'Example Irregular boss configuration',
    rules: [
      {
        id: 'rule_1',
        type: 'require_defense_break',
        category: 'debuffs',
        enabled: true,
      },
      {
        id: 'rule_2',
        type: 'require_immunity',
        category: 'utility',
        enabled: true,
      },
      {
        id: 'rule_3',
        type: 'forbid_water',
        category: 'element_restrictions',
        enabled: true,
      },
      {
        id: 'rule_4',
        type: 'max_same_element',
        category: 'team_constraints',
        enabled: true,
        value: 2,
      },
    ],
  },

  // ===== SPECIAL REQUEST =====
  {
    id: 'special_request_example',
    name: 'Special Request - Example',
    category: 'special_request',
    description: 'Example Special Request configuration',
    rules: [
      {
        id: 'rule_1',
        type: 'require_attack_buff',
        category: 'buffs',
        enabled: true,
      },
      {
        id: 'rule_2',
        type: 'require_defense_break',
        category: 'debuffs',
        enabled: true,
      },
      {
        id: 'rule_3',
        type: 'forbid_light',
        category: 'element_restrictions',
        enabled: true,
      },
      {
        id: 'rule_4',
        type: 'forbid_dark',
        category: 'element_restrictions',
        enabled: true,
      },
    ],
  },

  // ===== CUSTOM (template vide) =====
  {
    id: 'custom_template',
    name: 'Custom Rules',
    category: 'custom',
    description: 'Create your own custom rule set',
    rules: [],
  },
]

/**
 * Récupère un preset par son ID
 */
export function getPresetById(id: string): BossPreset | undefined {
  return BOSS_PRESETS.find(preset => preset.id === id)
}

/**
 * Récupère tous les presets d'une catégorie
 */
export function getPresetsByCategory(category: BossPreset['category']): BossPreset[] {
  return BOSS_PRESETS.filter(preset => preset.category === category)
}

/**
 * Labels pour les catégories de boss
 */
export const BOSS_CATEGORY_LABELS = {
  skyward_tower: 'Skyward Tower',
  guild_raid: 'Guild Raid',
  world_boss: 'World Boss',
  irregular: 'Irregular',
  special_request: 'Special Request',
  story: 'Story',
  custom: 'Custom',
}

/**
 * Labels pour les difficultés
 */
export const DIFFICULTY_LABELS = {
  normal: 'Normal',
  hard: 'Hard',
  very_hard: 'Very Hard',
  hell: 'Hell',
  nightmare: 'Nightmare',
}
