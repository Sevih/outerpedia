import type { RecommendedGearSet } from "@/types/equipment" // si nécessaire
import type { TenantKey } from "@/tenants/config"
import type { WithLocalizedFields } from "@/types/common"

// Type de base pour ExclusiveEquipment (sans variantes localisées)
export interface ExclusiveEquipmentBase {
  name: string
  mainStat: string
  effect: string
  effect10?: string
  icon_effect: string // icône de l'effet, pas de l'équipement
  rank?: string
  rank10?: string
  buff?: string[];   // Liste des buffs apportés par l'EE
  debuff?: string[]; // Liste des debuffs apportés par l'EE
}

// Type complet avec variantes localisées pour les champs qui en ont besoin
export type ExclusiveEquipment = WithLocalizedFields<
  WithLocalizedFields<
    WithLocalizedFields<
      WithLocalizedFields<ExclusiveEquipmentBase, 'name'>,
      'mainStat'
    >,
    'effect'
  >,
  'effect10'
>

// Type de base pour BurnEffect
interface BurnEffectBase {
  level: number
  cost: string
  effect: string
}

// BurnEffect avec localisation
type BurnEffect = WithLocalizedFields<BurnEffectBase, 'effect'>

// Type de base pour Skill (sans variantes localisées)
export interface SkillBase {
  name: string
  true_desc: string
  description: string
  cd: number | string
  wgr: number
  burnEffect?: BurnEffect[]
  enhancement?: Record<string, string>[]
  buff: string[]
  debuff: string[]
}

// Type complet avec variantes localisées
export type Skill = WithLocalizedFields<
  WithLocalizedFields<SkillBase, 'name'>,
  'true_desc'
>

type ExtendedSkill = Skill & {
  dual_debuff?: string | string[];
  dual_buff?: string[];
  wgr_dual?: number;
  enhancement?: Record<string, string[]>;
};

export type Lang = TenantKey;

export type LevelId =
  | '1' | '2' | '3'
  | '4' | '4_1' | '4_2'
  | '5' | '5_1' | '5_2' | '5_3'
  | '6';



// Map des transcends telle que générée par tes JSON (avec variantes pour toutes les langues)
export type TranscendMap = Partial<
  Record<LevelId | `${LevelId}_${Exclude<TenantKey, 'en'>}`, string | null>
>;



// Type de base pour Character (sans variantes localisées)
export interface CharacterBase {
  ID: string
  Fullname: string
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
  VoiceActor?: string
}

// Type complet avec variantes localisées pour Fullname et VoiceActor
export type Character = WithLocalizedFields<
  WithLocalizedFields<CharacterBase, 'Fullname'>,
  'VoiceActor'
>

export type CharacterLite = Omit<Character, 'skills'>