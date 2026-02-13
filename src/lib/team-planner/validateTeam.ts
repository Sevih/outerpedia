// lib/team-planner/validateTeam.ts
import type { Rule, RuleCategory, TeamSlot, RuleStatus } from '@/types/team-planner'
import type { CharacterLite } from '@/types/types'
import { RULE_METADATA } from './ruleConfig'
import { characterMatchesRule } from './ruleEffectMap'

// ============================================================================
// Severity mapping
// ============================================================================

function getSeverity(category: RuleCategory): 'error' | 'warning' | 'info' {
  switch (category) {
    case 'element_restrictions':
    case 'class_restrictions':
    case 'team_constraints':
      return 'error'
    case 'element_bonus':
      return 'info'
    default:
      return 'warning'
  }
}

// ============================================================================
// Team constraint validation
// ============================================================================

function validateConstraint(
  rule: Rule,
  teamChars: CharacterLite[]
): { passed: boolean; matchedBy: string[] } {
  switch (rule.type) {
    case 'max_same_element': {
      const limit = rule.value ?? 2
      const elementCounts = new Map<string, string[]>()
      for (const char of teamChars) {
        const ids = elementCounts.get(char.Element) || []
        ids.push(char.ID)
        elementCounts.set(char.Element, ids)
      }
      // Find violators (elements with too many characters)
      const violators: string[] = []
      for (const ids of elementCounts.values()) {
        if (ids.length > limit) violators.push(...ids)
      }
      return { passed: violators.length === 0, matchedBy: violators }
    }

    case 'max_same_class': {
      const limit = rule.value ?? 2
      const classCounts = new Map<string, string[]>()
      for (const char of teamChars) {
        const ids = classCounts.get(char.Class) || []
        ids.push(char.ID)
        classCounts.set(char.Class, ids)
      }
      const violators: string[] = []
      for (const ids of classCounts.values()) {
        if (ids.length > limit) violators.push(...ids)
      }
      return { passed: violators.length === 0, matchedBy: violators }
    }

    case 'min_different_elements': {
      const minElements = rule.value ?? 3
      const uniqueElements = new Set(teamChars.map(c => c.Element))
      return {
        passed: uniqueElements.size >= minElements,
        matchedBy: teamChars.map(c => c.ID),
      }
    }

    case 'require_mono_element': {
      const elements = new Set(teamChars.map(c => c.Element))
      return {
        passed: teamChars.length > 0 && elements.size === 1,
        matchedBy: teamChars.map(c => c.ID),
      }
    }

    default:
      return { passed: true, matchedBy: [] }
  }
}

// ============================================================================
// Core validation
// ============================================================================

/**
 * Validate a team against a set of rules.
 * Returns per-rule status with pass/fail, severity, and matched characters.
 */
export function validateTeam(
  team: TeamSlot[],
  rules: Rule[],
  allCharacters: CharacterLite[]
): RuleStatus[] {
  // Resolve team characters
  const teamChars: CharacterLite[] = team
    .filter(slot => slot.characterId)
    .map(slot => allCharacters.find(c => c.ID === slot.characterId))
    .filter((c): c is CharacterLite => c != null)

  return rules
    .filter(rule => rule.enabled)
    .map(rule => {
      const metadata = RULE_METADATA[rule.type]
      const severity = getSeverity(rule.category)

      // Team constraints have special logic
      if (rule.category === 'team_constraints') {
        const { passed, matchedBy } = validateConstraint(rule, teamChars)
        return { rule, passed, matchedBy, severity, metadata }
      }

      // For require_* rules: at least one team member must match
      if (rule.type.startsWith('require_')) {
        const matchedBy = teamChars
          .filter(char => characterMatchesRule(char, rule.type))
          .map(c => c.ID)
        return { rule, passed: matchedBy.length > 0, matchedBy, severity, metadata }
      }

      // For forbid_* rules: no team member should match (matchedBy = violators)
      if (rule.type.startsWith('forbid_')) {
        const violators = teamChars
          .filter(char => characterMatchesRule(char, rule.type))
          .map(c => c.ID)
        return { rule, passed: violators.length === 0, matchedBy: violators, severity, metadata }
      }

      // For bonus_* rules: informational - count who benefits
      if (rule.type.startsWith('bonus_')) {
        const beneficiaries = teamChars
          .filter(char => characterMatchesRule(char, rule.type))
          .map(c => c.ID)
        return { rule, passed: true, matchedBy: beneficiaries, severity: 'info', metadata }
      }

      return { rule, passed: true, matchedBy: [], severity, metadata }
    })
}
