// lib/team-planner/bossPresets.ts
//
// Preset engine: builds BossPreset objects from definitions.
// Preset DATA lives in bossPresetsData.ts — edit that file to add/modify presets.

import type { BossPreset, Rule } from '@/types/team-planner'
import { RULE_METADATA } from './ruleConfig'
import { PRESET_DEFINITIONS } from './bossPresetsData'
import type { RuleShorthand, PresetDefinition } from './bossPresetsData'

// ============================================================================
// Category derivation from boss mode string
// ============================================================================

function deriveCategoryFromMode(mode: string): BossPreset['category'] {
  if (mode.includes('Guild Raid')) return 'guild_raid'
  if (mode.includes('World Boss')) return 'world_boss'
  if (mode.includes('Special Request')) return 'special_request'
  if (mode.includes('Joint Challenge')) return 'joint_challenge'
  if (mode.includes('Adventure License') || mode.includes('Challenge')) return 'adventure_license'
  if (mode.includes('Pursuit Operation')) return 'irregular'
  if (mode.includes('Story')) return 'story'
  return 'custom'
}

// ============================================================================
// Helpers to create presets
// ============================================================================

function buildRules(id: string, rules: RuleShorthand[]): Rule[] {
  return rules.map((r, i): Rule => ({
    id: `${id}_rule_${i}`,
    type: r.type,
    category: RULE_METADATA[r.type].category,
    enabled: true,
    value: r.value,
  }))
}

/**
 * Create a preset linked to a boss JSON file.
 * Name, category, portrait, element and class are auto-derived from the JSON data.
 */
export function createBossPreset(
  bossData: PresetDefinition['boss'],
  rules: RuleShorthand[],
  opts?: {
    difficulty?: BossPreset['difficulty']
    category?: BossPreset['category']
    description?: string
  }
): BossPreset {
  const category = opts?.category ?? deriveCategoryFromMode(bossData.location.mode.en)
  const id = `boss_${bossData.id}`

  return {
    id,
    bossId: bossData.id,
    name: bossData.Name.en,
    bossName: bossData.Name as BossPreset['bossName'],
    category,
    difficulty: opts?.difficulty,
    description: opts?.description,
    element: bossData.element,
    bossClass: bossData.class,
    imageUrl: `/images/characters/boss/portrait/MT_${bossData.icons}.webp`,
    rules: buildRules(id, rules),
  }
}

/**
 * Create a custom preset without boss JSON (for manual/custom presets).
 */
export function createPreset(
  id: string,
  name: string,
  category: BossPreset['category'],
  rules: RuleShorthand[],
  opts?: { difficulty?: BossPreset['difficulty']; description?: string; imageUrl?: string }
): BossPreset {
  return {
    id,
    name,
    category,
    difficulty: opts?.difficulty,
    description: opts?.description,
    imageUrl: opts?.imageUrl,
    rules: buildRules(id, rules),
  }
}

// ============================================================================
// Build presets from definitions
// ============================================================================

export const BOSS_PRESETS: BossPreset[] = PRESET_DEFINITIONS.map(def =>
  createBossPreset(def.boss, def.rules, def.opts)
)

// ============================================================================
// Lookup functions
// ============================================================================

export function getPresetById(id: string): BossPreset | undefined {
  return BOSS_PRESETS.find(preset => preset.id === id)
}

export function getPresetsByCategory(category: BossPreset['category']): BossPreset[] {
  return BOSS_PRESETS.filter(preset => preset.category === category)
}

// ============================================================================
// Labels
// ============================================================================

export const BOSS_CATEGORY_LABELS: Record<string, string> = {
  skyward_tower: 'Skyward Tower',
  guild_raid: 'Guild Raid',
  world_boss: 'World Boss',
  irregular: 'Irregular',
  special_request: 'Special Request',
  joint_challenge: 'Joint Challenge',
  adventure_license: 'Adventure License',
  story: 'Story',
  custom: 'Custom',
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  normal: 'Normal',
  hard: 'Hard',
  very_hard: 'Very Hard',
  hell: 'Hell',
  nightmare: 'Nightmare',
}
