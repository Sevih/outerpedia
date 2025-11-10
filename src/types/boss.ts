import type { WithLocalizedFields } from "@/types/common"

// Type de base pour BossSkill (sans variantes localisées)
export interface BossSkillBase {
  name: string
  type: string
  description: string
  icon: string
  buff?:string[]
  debuff?:string[]
}

// Type complet avec variantes localisées pour name et description
export type BossSkill = WithLocalizedFields<
  WithLocalizedFields<BossSkillBase, 'name'>,
  'description'
>

// Type de base pour BossLocation (sans variantes localisées)
interface BossLocationBase {
  dungeon: string
  mode: string
  area_id: string
}

// Type complet avec variantes localisées pour dungeon et mode
type BossLocation = WithLocalizedFields<
  WithLocalizedFields<BossLocationBase, 'dungeon'>,
  'mode'
>

// Type de base pour BossData (sans variantes localisées)
export interface BossDataBase {
  id: string
  Name: string
  Surname: string
  IncludeSurname: boolean
  class: string
  element: string
  level: number
  skills: BossSkill[]
  location: BossLocation
  icons: string
  BuffImmune?: string
  StatBuffImmune?: string
}

// Type complet avec variantes localisées pour Name et Surname
export type BossData = WithLocalizedFields<
  WithLocalizedFields<BossDataBase, 'Name'>,
  'Surname'
>
