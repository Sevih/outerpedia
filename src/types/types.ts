// src/types/types.ts
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
    gift?:string
  }
