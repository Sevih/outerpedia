// src/types/types.ts
export type SubclassData = {
    description: string
    image: string
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
  
  export interface ExclusiveEquipment {
    name: string
    mainStat: string
    effect: string
    effect10?: string
    icon_effect: string // icône de l'effet, pas de l'équipement
    rank?: string
  }
  

  type EffectType = 'buff' | 'debuff'

  export type EffectData = {
    name: string
    label: string
    icon?: string
    type: EffectType | string
    description?: string
  }
  
  
  
  export type SkillLite = {
    buffs?: string[]
    debuffs?: string[]
  }
  
  export type CharacterLite = {
    id: string
    name: string
    element: string
    class: string
    rarity: number
    skills?: SkillLite[]
    chain_buffs?: string[]
    chain_debuffs?: string[]
    dual_buffs?: string[]
    dual_debuffs?: string[]
  }
  