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


export type WeaponMini = EquipmentBase
export type AmuletMini = EquipmentBase
