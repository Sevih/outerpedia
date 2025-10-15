export type GearReference = {
  name: string
  mainStat: string
  usage?: string
}

export type ExclusiveEquipment = {
  name: string;
  name_jp?: string;
  name_kr?: string;
  mainStat: string;
  mainStat_jp?: string;
  mainStat_kr?: string;
  effect: string;
  effect10?: string;
  effect_jp?: string;
  effect10_jp?: string;
  effect_kr?: string;
  effect10_kr?: string;
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
  mainStats?: string[]
  level: number
}

export interface ArmorSet {
  // noms
  name: string;
  name_jp?: string;
  name_kr?: string;

  // visuels
  image_prefix: string;
  set_icon: string;

  // méta
  rarity?:  number | string         // "legendary" dans tes exemples
  class?: string | null;

  // effets EN
  effect_2_1?: string | null;
  effect_4_1?: string | null;
  effect_2_4?: string | null;
  effect_4_4?: string | null;

  // effets JP
  effect_2_1_jp?: string | null;
  effect_4_1_jp?: string | null;
  effect_2_4_jp?: string | null;
  effect_4_4_jp?: string | null;

  // effets KR
  effect_2_1_kr?: string | null;
  effect_4_1_kr?: string | null;
  effect_2_4_kr?: string | null;
  effect_4_4_kr?: string | null;

  // provenance (nullable autorisé)
  source?: string | null;
  boss?: string | null;
  mode?: string | null;
}


export type Set = {
  name: string;
  image_prefix: string;
  set_icon: string;
  class?: string | null;
  effect_2_1?: string | null;
  effect_4_1?: string | null;
  effect_2_4?: string | null;
  effect_4_4?: string | null;
  source?: string | null // ← autoriser null
  boss?: string | null
  mode?: string | null
}


export type MiniSet = {
  name: string
  count: number
}


export interface Talisman {
  name: string;
  name_jp: string;
  name_kr: string;

  type: string;
  rarity?: string;             // présent dans ton exemple, pas toujours émis → optionnel
  image: string;               // ex: "TI_Equipment_Talisman_03"

  effect_name: string;
  effect_name_jp: string;
  effect_name_kr: string;

  effect_desc1: string;
  effect_desc1_jp: string;
  effect_desc1_kr: string;

  effect_desc4: string | null;
  effect_desc4_jp: string | null;
  effect_desc4_kr: string | null;

  effect_icon: string;         // ex: "TI_Icon_UO_Talisman_03"

  level?: string | number | null; // ton exemple a "6" (string) → on tolère string/number/null en optionnel
  source: string | null;
  boss: string | null;
  mode: string | null;
}


export interface Accessory {
  name: string;
  name_jp?: string;
  name_kr?: string;

  type: string;                  // "CP |  AP"
  rarity: string;                
  image: string;                 

  mainStats: string[];

  effect_name: string;
  effect_name_jp?: string;
  effect_name_kr?: string;

  effect_desc1: string;
  effect_desc1_jp?: string;
  effect_desc1_kr?: string;

  effect_desc4: string;
  effect_desc4_jp?: string;
  effect_desc4_kr?: string;

  effect_icon: string;

  class: string | null;
  source: string;
  source_jp?: string;
  source_kr?: string;

  boss: string | null;
  mode?: string | null;
  level: number;
}


export interface Weapon {
  name: string
  name_jp?: string
  name_kr?: string

  type: string
  rarity: string
  image: string

  effect_name: string
  effect_name_jp?: string
  effect_name_kr?: string

  effect_desc1: string
  effect_desc1_jp?: string
  effect_desc1_kr?: string

  effect_desc4: string
  effect_desc4_jp?: string
  effect_desc4_kr?: string

  effect_icon: string

  class: string | null
  source: string
  boss: string | null
  mode?: string | null
  level: number
}


export type WeaponMini = EquipmentBase
export type AmuletMini = EquipmentBase
