// lib/team-planner/characterRelevance.ts
import type { CharacterLite } from '@/types/types'
import type { RuleStatus, CharacterRelevanceMap } from '@/types/team-planner'
import { characterMatchesRule, getRuleElement, getRuleClass } from './ruleEffectMap'

/**
 * Compute which characters from the roster would help meet unfulfilled rules.
 * Also marks characters that violate forbidden rules.
 *
 * Characters already in the team are excluded.
 */
export function computeCharacterRelevance(
  allCharacters: CharacterLite[],
  ruleStatuses: RuleStatus[],
  excludeCharacterIds: string[]
): CharacterRelevanceMap {
  const relevanceMap: CharacterRelevanceMap = new Map()

  // Unfulfilled require_* rules (character can help)
  const unfulfilledRequires = ruleStatuses.filter(
    rs => !rs.passed && rs.rule.type.startsWith('require_')
  )

  // Active forbid_* rules (character would violate)
  const activeForbids = ruleStatuses.filter(
    rs => rs.rule.type.startsWith('forbid_') && rs.rule.enabled
  )

  // Active bonus_* rules (character would benefit)
  const activeBonuses = ruleStatuses.filter(
    rs => rs.severity === 'info' && rs.rule.enabled
  )

  if (unfulfilledRequires.length === 0 && activeForbids.length === 0 && activeBonuses.length === 0) {
    return relevanceMap
  }

  const excludeSet = new Set(excludeCharacterIds)

  for (const char of allCharacters) {
    if (excludeSet.has(char.ID)) continue

    const satisfiesRules: RuleStatus['rule']['type'][] = []
    let isForbidden = false

    // Check which unfulfilled requirements this character helps with
    for (const rs of unfulfilledRequires) {
      if (characterMatchesRule(char, rs.rule.type)) {
        satisfiesRules.push(rs.rule.type)
      }
    }

    // Check if character violates any forbid rules
    for (const rs of activeForbids) {
      const element = getRuleElement(rs.rule.type)
      if (element && char.Element === element) {
        isForbidden = true
        break
      }
      const cls = getRuleClass(rs.rule.type)
      if (cls && char.Class === cls) {
        isForbidden = true
        break
      }
    }

    // Check if character benefits from bonus rules
    let hasBonus = false
    for (const rs of activeBonuses) {
      const element = getRuleElement(rs.rule.type)
      if (element && char.Element === element) {
        hasBonus = true
        break
      }
    }

    if (satisfiesRules.length > 0 || isForbidden || hasBonus) {
      // Score: positive for satisfying rules + bonus, negative for forbidden
      const score = isForbidden ? -1 : satisfiesRules.length + (hasBonus ? 0.5 : 0)
      relevanceMap.set(char.ID, {
        satisfiesRules,
        score,
      })
    }
  }

  return relevanceMap
}
