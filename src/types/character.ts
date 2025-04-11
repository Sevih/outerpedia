import type { RecommendedGearSet } from "@/types/equipment" // si nécessaire

export interface ExclusiveEquipment {
    name: string
    mainStat: string
    effect: string
    effect10?: string
    icon_effect: string // icône de l'effet, pas de l'équipement
    rank?: string
  }
  
  export interface Skill {
    name: string
    description: string
    cooldown: number | string
    wgr: number
    burnEffect?: {
      level: number
      cost: string
      effect: string
    }[]
    enhancement?: Record<string, string>[]
    buffs: string[]
    debuffs: string[]
  }
  
  export interface Character {
    id: string
    name: string
    rarity: number
    element: string
    class: string
    subclass: string
    video?: string
    type_chain?: string
    chain_wgr?: number
    chain_effect?: string
    chain_buffs?: string[]
    chain_debuffs?: string[]
    dual_wgr?: number
    dual_effect?: string
    dual_buffs?: string[]
    dual_debuffs?: string[]
    dual_enhancement?: Record<string, string>[]
    skills?: Skill[]
    exclusifEquip?: ExclusiveEquipment[]
    recommendedGearPVE?: RecommendedGearSet
    recommendedGearPVP?: RecommendedGearSet
    transcend?: Record<string, string | null>[];
    rank?: string
  }
  