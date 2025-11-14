import { useMemo } from 'react'
import { GuildRaidData, safeValidateGuildRaidData } from '@/schemas/guild-raid.schema'

/**
 * Hook to load and validate raid data
 * @param data - Raw raid data (from JSON import)
 * @returns Validated raid data or null if invalid
 */
export function useRaidData(data: unknown) {
  return useMemo(() => {
    const result = safeValidateGuildRaidData(data)

    if (!result.success) {
      console.error('Invalid raid data:', result.error)
      return null
    }

    return result.data
  }, [data])
}

/**
 * Hook to get available versions from raid data
 */
export function useRaidVersions(data: GuildRaidData | null) {
  return useMemo(() => {
    if (!data) return []
    return Object.keys(data)
  }, [data])
}

/**
 * Hook to get the default version (first version)
 */
export function useDefaultVersion(data: GuildRaidData | null): string | null {
  return useMemo(() => {
    if (!data) return null
    const versions = Object.keys(data)
    return versions.length > 0 ? versions[0] : null
  }, [data])
}
