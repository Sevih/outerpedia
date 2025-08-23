// src/types/characters-extra.ts
import type { CharacterLite } from '@/types/types'

export type RoleType = 'DPS' | 'Support' | 'Sustain'

export type CharacterLiteExt = CharacterLite & {
  role?: RoleType
  tags?: string[] // ex: ["innate-penetration", "anti-revive"]
}
