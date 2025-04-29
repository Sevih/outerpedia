export type GearReference = {
  name: string
  mainStat: string
  usage?: string
}

export type ExclusiveEquipment = {
  name: string;
  mainStat: string;
  effect: string;
  effect10?: string;
  icon_effect?: string;
  rank?: string;
  buff?: string[];   // Liste des buffs apportés par l'EE
  debuff?: string[]; // Liste des debuffs apportés par l'EE
};


export type RecommendedGearSet = {
  Weapon?: GearReference[]
  Amulet?: GearReference[]
  Set?: MiniSet[][]
  SubstatPrio?: string
  Note?: string
}

export interface EquipmentBase {
  name: string
  image: string
  rarity: string
  effect_icon: string
  class: string
  forcedMainStat: string
  usage?: string
  source: string
  boss: string | null
  mode?: string
  effect_name: string
  effect_desc1: string
  effect_desc4: string
  mainStats?: string[];
}

export type ArmorSet = {
  name: string
  piece_count: number
  effect_2_4?: string
  effect_4_4?: string
  image_prefix: string
  icon_effect?: string
}


export type MiniSet = {
  name: string
  count: number
}

export type Talisman = {
  name: string
  type: string
  icon: string
  icon_item: string
  effect_name: string
  effect: string
  effect10?: string
  icon_effect?: string
  source?: string | null // ← autoriser null
  boss?: string | null
  mode?: string | null
}

export interface Accessory {
  name: string;
  type: string;
  rarity: string;
  image: string;
  mainStats: string[];
  effect_name: string;
  effect_desc1: string;
  effect_desc4: string;
  effect_icon: string;
  class: string | null;
  source: string;
  boss: string | null;
  mode?: string | null;
}

export interface Weapon {
  name: string;
  type: string;
  rarity: string;
  image: string;
  effect_name: string;
  effect_desc1: string;
  effect_desc4: string;
  effect_icon: string;
  class: string | null;
  source: string;
  boss: string | null;
  mode?: string | null;
}

export type WeaponMini = EquipmentBase
export type AmuletMini = EquipmentBase
