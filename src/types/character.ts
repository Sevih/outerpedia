import type { RecommendedGearSet } from "@/types/equipment" // si nécessaire

export interface ExclusiveEquipment {
    name: string
    mainStat: string
    effect: string
    effect10?: string
    icon_effect: string // icône de l'effet, pas de l'équipement
    rank?: string
    buff?: string[];   // Liste des buffs apportés par l'EE
    debuff?: string[]; // Liste des debuffs apportés par l'EE
  }
  
  export interface Skill {
    name: string
    true_desc: string
    description: string
    cd: number | string
    wgr: number
    burnEffect?: {
      level: number
      cost: string
      effect: string
    }[]
    enhancement?: Record<string, string>[]
    buff: string[]
    debuff: string[]
  }

  type ExtendedSkill = Skill & {
    dual_debuff?: string | string[];
    dual_buff?: string[];
    wgr_dual?: number;
    enhancement?: Record<string, string[]>;
  };
  
  
  export interface Character {
    ID: string
    Fullname: string
    Rarity: number
    Element: string
    Class: string
    SubClass: string
    video?: string
    Chain_Type: string
    dual_enhancement?: Record<string, string>[]
    skills: {
      SKT_FIRST?: Skill;
      SKT_SECOND?: Skill;
      SKT_ULTIMATE?: Skill;
      SKT_CHAIN_PASSIVE?: ExtendedSkill;
    };
    exclusifEquip?: ExclusiveEquipment[]
    recommendedGearPVE?: RecommendedGearSet
    recommendedGearPVP?: RecommendedGearSet
    transcend?: Record<string, string | null>
    rank?: string
    role?: string
  }
  