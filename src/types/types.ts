// src/types/types.ts
import type { WithLocalizedFields } from '@/types/common'
import type { RoleType } from '@/types/enums'

export type StatBlock = {
  atk: number
  def: number
  hp: number
  spd: number
  chc: number
  chd: number
  acc: number
  eva: number
  eff: number
  res: number
}

export type SubclassData = {
  description: string
  image: string
  [key: `stats${number}`]: StatBlock | undefined;
}

export type ClassData = {
  description: string
  image: string
  subclasses: {
    [subclassName: string]: SubclassData
  }
}

export type ClassDataMap = {
  [className: string]: ClassData
}

// ExclusiveEquipment is defined in @/types/character.ts (single source of truth)
// Import from there or from @/types/equipment.ts which re-exports it

type EffectType = 'buff' | 'debuff'

export type EffectData = {
  name: string
  label: string
  icon?: string
  type: EffectType | string
  description?: string
}

// src/types/types.ts
export type StatKey =
  | 'ATK' | 'DEF' | 'HP' | 'SPD'
  | 'CHC' | 'CHD' | 'ACC' | 'EVA'
  | 'EFF' | 'RES'
  | 'LS' | 'PEN' | 'PEN%' | 'ATK%' | 'DEF%' | 'HP%' | 'HH' | 'HH%';



export interface SkillLite {
  name: string
  buffs?: string[]
  debuffs?: string[]
  dual_buff?: string[]
  dual_debuff?: string[]
  [key: string]: string[] | string | undefined
}

// RoleType is defined in @/types/enums.ts (lowercase: 'dps' | 'support' | 'sustain')
// Import from there instead of redefining here

export type EffectsBySource = {
  SKT_FIRST: { buff: string[]; debuff: string[] }
  SKT_SECOND: { buff: string[]; debuff: string[] }
  SKT_ULTIMATE: { buff: string[]; debuff: string[] }
  SKT_CHAIN_PASSIVE: { buff: string[]; debuff: string[] }  // Chain skill passive effects
  DUAL_ATTACK: { buff: string[]; debuff: string[] }        // Dual attack effects
  EXCLUSIVE_EQUIP: { buff: string[]; debuff: string[] }
}

// Type de base pour CharacterLite (sans variantes localisées)
export interface CharacterLiteBase {
  ID: string
  Fullname: string
  Element: string
  Class: string
  SubClass?: string            // <- optionnel (l'API ne le renvoie pas)
  Rarity: number
  buff?: string[]
  debuff?: string[]
  Chain_Type?: string          // <- optionnel
  limited?: boolean            // <- boolean (aligné avec l'API)
  gift?: string                // <- string (OK pour tes filtres)

  // nouveaux champs
  role?: RoleType | string
  rank?: string | boolean
  rank_pvp?: string | boolean
  tags?: string[]
  effectsBySource?: EffectsBySource  // <- NEW: effects organized by source
}

// Type complet avec variantes localisées pour Fullname
export type CharacterLite = WithLocalizedFields<CharacterLiteBase, 'Fullname'>
