// src/types/characters-extra.ts
import type { CharacterLite } from '@/types/types'
import type { RoleType } from '@/types/enums'

export type CharacterLiteExt = CharacterLite & {
  role?: RoleType
  tags?: string[] // ex: ["innate-penetration", "anti-revive"]
}
