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
  