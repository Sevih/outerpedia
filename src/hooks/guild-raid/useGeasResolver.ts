import { useMemo } from 'react'
import { Geas, Phase1Boss, parseGeasReference } from '@/schemas/guild-raid.schema'

/**
 * Hook to resolve geas references from string format to actual geas data
 * @param bosses - Array of Phase 1 bosses containing geas configurations
 * @returns Function to resolve geas references
 */
export function useGeasResolver(bosses: Phase1Boss[]) {
  return useMemo(() => {
    return (ref: string): Geas | null => {
      const parsed = parseGeasReference(ref)
      if (!parsed) return null

      const { bossIndex, level, type } = parsed
      const boss = bosses[bossIndex]

      if (!boss || !boss.geas[level as keyof typeof boss.geas]) {
        return null
      }

      const geasLevel = boss.geas[level as keyof typeof boss.geas]
      return geasLevel[type] || null
    }
  }, [bosses])
}
