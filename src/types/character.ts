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
  name_jp?: string;
  name_kr?: string;
  true_desc_jp?: string;
  true_desc_kr?: string;
  true_desc: string
  description: string
  cd: number | string
  wgr: number
  burnEffect?: {
    level: number
    cost: string
    effect: string
    effect_jp?: string;
    effect_kr?: string;
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

export type Lang = 'en' | 'jp' | 'kr';

export type LevelId =
  | '1' | '2' | '3'
  | '4' | '4_1' | '4_2'
  | '5' | '5_1' | '5_2' | '5_3'
  | '6';



// Map des transcends telle que générée par tes JSON (avec variantes jp/kr)
export type TranscendMap = Partial<
  Record<LevelId | `${LevelId}_jp` | `${LevelId}_kr`, string | null>
>;



export interface Character {
  ID: string
  Fullname: string
  Fullname_jp?: string;
  Fullname_kr?: string;
  Rarity: number
  Element: string
  Class: string
  SubClass: string
  video?: string
  gift: string
  tags?: string[]
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
  transcend?: TranscendMap
  rank?: string
  rank_pvp?: string
  role?: string
  limited: boolean
  skill_priority?: {
    [key: string]: {
      prio: number;
    };
  };
}

export type CharacterLite = Omit<Character, 'skills'>