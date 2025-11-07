// app/(tools)/team-planner/types.ts

import type { CharacterLite } from '@/types/types'
import type { SkillKey } from '@/types/enums'

// ============================================================================
// Team Types
// ============================================================================

export interface TeamSlot {
  position: number
  characterId: string | null
  characterName: string | null
}

export interface TeamPlannerWrapperProps {
  viewOnly?: boolean
}

// ============================================================================
// Effect Types
// ============================================================================

export interface Effect {
  name: string
  label: string
  description: string
  icon: string
  type: 'buff' | 'debuff'
  group?: string
  category?: string
}

export interface EffectWithGroup {
  name: string
  group?: string
  category?: string
  label: string
  icon: string
}

export interface EffectCategory {
  [key: string]: {
    label?: string
    [key: string]: unknown
  }
}

export interface GroupDataEntry {
  label: string
  icon: string
  type: 'buff' | 'debuff'
  category: string
}

// ============================================================================
// Filter Types
// ============================================================================

export type EffectsLogic = 'OR' | 'AND'

export interface CharacterFilters {
  searchTerm: string
  selectedElements: string[]
  selectedClasses: string[]
  selectedRarities: number[]
  selectedChainTypes: string[]
  selectedEffects: string[]
  selectedSources: SkillKey[]
  effectsLogic: EffectsLogic
}

// ============================================================================
// Effect Data Structures
// ============================================================================

export interface EffectData {
  name: string
  label: string
  icon: string
  type: 'buff' | 'debuff'
  category: string
}

export interface GroupedEffects {
  buffs: Record<string, EffectData[]> | Map<string, EffectData[]>
  debuffs: Record<string, EffectData[]> | Map<string, EffectData[]>
}

// ============================================================================
// Component Props
// ============================================================================

export interface CharacterSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (characterId: string, characterName: string) => void
  characters: CharacterLite[]
  selectedPosition: number
  excludeCharacterIds?: string[]
}

export interface ChainEffectIconsProps {
  buffs?: string[]
  debuffs?: string[]
  maxIcons?: number
  isDisabled?: boolean
}

// ============================================================================
// URL Encoding Types
// ============================================================================

export interface EncodedTeamData {
  team: TeamSlot[]
  chainOrder: number[]
  notes: string
}

// ============================================================================
// Validation Types (Future Implementation)
// ============================================================================

export type ChainType = 'Start' | 'Join' | 'Finish'

export function isValidChainType(type: string | undefined): type is ChainType {
  return type === 'Start' || type === 'Join' || type === 'Finish'
}

/**
 * Types de règles disponibles pour le Team Planner
 */
export type RuleType =
  // Buffs requis
  | 'require_attack_buff'
  | 'require_defense_buff'
  | 'require_crit_rate_buff'
  | 'require_crit_damage_buff'
  | 'require_speed_buff'

  // Debuffs requis
  | 'require_attack_break'
  | 'require_defense_break'
  | 'require_crit_resist_down'
  | 'require_speed_down'

  // Rôles requis
  | 'require_dps'
  | 'require_tank'
  | 'require_healer'
  | 'require_support'
  | 'require_sub_dps'

  // Utilitaires requis
  | 'require_dispel'
  | 'require_immunity'
  | 'require_cleanse'
  | 'require_revive'
  | 'require_shield'

  // Restrictions d'élément
  | 'forbid_fire'
  | 'forbid_water'
  | 'forbid_earth'
  | 'forbid_light'
  | 'forbid_dark'

  // Bonus d'élément
  | 'bonus_fire'
  | 'bonus_water'
  | 'bonus_earth'
  | 'bonus_light'
  | 'bonus_dark'

  // Restrictions de classe
  | 'forbid_attacker'
  | 'forbid_defender'
  | 'forbid_ranger'
  | 'forbid_supporter'

  // Contraintes d'équipe
  | 'max_same_element'
  | 'max_same_class'
  | 'min_different_elements'
  | 'require_mono_element'

/**
 * Catégories de règles pour l'UI
 */
export type RuleCategory =
  | 'buffs'
  | 'debuffs'
  | 'roles'
  | 'utility'
  | 'element_restrictions'
  | 'element_bonus'
  | 'class_restrictions'
  | 'team_constraints'

/**
 * Définition d'une règle
 */
export interface Rule {
  id: string
  type: RuleType
  category: RuleCategory
  enabled: boolean
  value?: number // Pour les règles avec valeur (ex: max_same_element: 2)
}

/**
 * Configuration d'un preset de boss/contenu
 */
export interface BossPreset {
  id: string
  name: string
  category: 'skyward_tower' | 'guild_raid' | 'world_boss' | 'irregular' | 'special_request' | 'story' | 'custom'
  difficulty?: 'normal' | 'hard' | 'very_hard' | 'hell' | 'nightmare'
  description?: string
  rules: Rule[]
  imageUrl?: string
}

/**
 * Configuration d'une équipe
 */
export interface TeamConfig {
  id: string
  name: string
  characters: (string | null)[] // Character IDs, null = slot vide
  rules: Rule[]
  presetId?: string // Lien vers un preset de boss
  createdAt: number
  updatedAt: number
}

/**
 * Résultat de validation d'une équipe
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
}

export interface ValidationError {
  ruleId: string
  ruleType: RuleType
  message: string
  severity: 'error'
}

export interface ValidationWarning {
  ruleId: string
  ruleType: RuleType
  message: string
  severity: 'warning'
}

export interface ValidationSuggestion {
  message: string
  characterIds?: string[]
  severity: 'info'
}

/**
 * Métadonnées de règle pour l'affichage
 */
export interface RuleMetadata {
  type: RuleType
  category: RuleCategory
  label: string
  description: string
  icon?: string
  requiresValue?: boolean
  defaultValue?: number
  minValue?: number
  maxValue?: number
}
