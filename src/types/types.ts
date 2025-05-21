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
  
  
  
  export interface SkillLite {
    name: string
    buffs?: string[]
    debuffs?: string[]
    dual_buff?: string[]
    dual_debuff?: string[]
    [key: string]: string[] | string | undefined
  }  
  
  export type CharacterLite = {
    ID: string
    Fullname: string
    Element: string
    Class: string
    SubClass:string
    Rarity: number
    buff: string[]
    debuff: string[]
    Chain_Type:string
    limited?:string
  }
  