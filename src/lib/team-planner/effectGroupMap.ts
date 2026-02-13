// lib/team-planner/effectGroupMap.ts
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'
import type { EffectWithGroup } from '@/types/team-planner'

// Build effect group map once at module level (variant → parent)
let _effectGroupMap: Map<string, string> | null = null

export function getEffectGroupMap(): Map<string, string> {
  if (_effectGroupMap) return _effectGroupMap

  _effectGroupMap = new Map<string, string>()
  ;([...buffs, ...debuffs] as EffectWithGroup[]).forEach((effect) => {
    if (effect.group) {
      _effectGroupMap!.set(effect.name, effect.group)
    }
  })
  return _effectGroupMap
}

/**
 * Check if a character's effect list contains a target effect,
 * considering group variants (e.g. BT_IMMUNE_IR groups under BT_IMMUNE)
 */
export function hasEffect(charEffects: string[], targetEffect: string): boolean {
  const groupMap = getEffectGroupMap()

  for (const effect of charEffects) {
    // Direct match
    if (effect === targetEffect) return true
    // Group match: effect is a variant of the target
    const group = groupMap.get(effect)
    if (group && group === targetEffect) return true
  }
  return false
}

/**
 * Check if a character's effect list contains ANY of the target effects
 */
export function hasAnyEffect(charEffects: string[], targetEffects: string[]): boolean {
  return targetEffects.some(target => hasEffect(charEffects, target))
}
