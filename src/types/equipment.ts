export type GearReference = {
  name: string
  mainStat: string
  usage?: string
}

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


export type WeaponMini = EquipmentBase
export type AmuletMini = EquipmentBase
