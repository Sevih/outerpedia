// app/(tools)/team-planner/index.ts

/**
 * Index file pour faciliter les imports
 */

// Types
export type {
  RuleType,
  RuleCategory,
  Rule,
  BossPreset,
  TeamConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  RuleMetadata,
} from '@/types/team-planner'

// Configuration des règles
export {
  RULE_METADATA,
  RULES_BY_CATEGORY,
  CATEGORY_LABELS,
} from './ruleConfig'

// Presets de boss
export {
  BOSS_PRESETS,
  getPresetById,
  getPresetsByCategory,
  BOSS_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from './bossPresets'

// JSON-LD
export type { JsonLdObject } from './jsonld'
export {
  websiteLd,
  breadcrumbLd,
  webPageLd,
  softwareApplicationLd,
} from './jsonld'
