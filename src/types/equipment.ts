import type { WithLocalizedFields } from './common'

export type GearReference = {
  name: string
  mainStat: string
  usage?: string
}

type BaseExclusiveEquipment = {
  name: string
  mainStat: string
  effect: string
  effect10?: string
  icon_effect?: string
  rank?: string
  buff?: string[]
  debuff?: string[]
}

export type ExclusiveEquipment = WithLocalizedFields<
  WithLocalizedFields<
    WithLocalizedFields<
      WithLocalizedFields<BaseExclusiveEquipment, 'name'>,
      'mainStat'
    >,
    'effect'
  >,
  'effect10'
>


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

type BaseArmorSet = {
  name: string
  image_prefix: string
  set_icon: string
  rarity?: number | string
  class?: string | null
  effect_2_1?: string | null
  effect_4_1?: string | null
  effect_2_4?: string | null
  effect_4_4?: string | null
  source?: string | null
  boss?: string | null
  mode?: string | null
}

export type ArmorSet = WithLocalizedFields<
  WithLocalizedFields<
    WithLocalizedFields<
      WithLocalizedFields<
        WithLocalizedFields<BaseArmorSet, 'name'>,
        'effect_2_1'
      >,
      'effect_4_1'
    >,
    'effect_2_4'
  >,
  'effect_4_4'
>


export type Set = {
  name: string
  image_prefix: string
  set_icon: string
  class?: string | null
  effect_2_1?: string | null
  effect_4_1?: string | null
  effect_2_4?: string | null
  effect_4_4?: string | null
  source?: string | null
  boss?: string | null
  mode?: string | null
}


export type MiniSet = {
  name: string
  count: number
}


type BaseTalisman = {
  name: string
  type: string
  rarity?: string
  image: string
  effect_name: string
  effect_desc1: string
  effect_desc4: string | null
  effect_icon: string
  level?: string | number | null
  source: string | null
  boss: string | null
  mode: string | null
}

export type Talisman = WithLocalizedFields<
  WithLocalizedFields<
    WithLocalizedFields<
      WithLocalizedFields<BaseTalisman, 'name'>,
      'effect_name'
    >,
    'effect_desc1'
  >,
  'effect_desc4'
>


type BaseAccessory = {
  name: string
  type: string
  rarity: string
  image: string
  mainStats: string[] | null
  effect_name: string | null
  effect_desc1: string | null
  effect_desc4: string | null
  effect_icon: string | null
  class: string | null
  source?: string | null
  boss?: string | null
  mode?: string | null
  level: number
}

export type Accessory = WithLocalizedFields<
  WithLocalizedFields<
    WithLocalizedFields<
      WithLocalizedFields<
        WithLocalizedFields<BaseAccessory, 'name'>,
        'effect_name'
      >,
      'effect_desc1'
    >,
    'effect_desc4'
  >,
  'source'
>


type BaseWeapon = {
  name: string
  type: string
  rarity: string
  image: string
  effect_name: string | null
  effect_desc1: string | null
  effect_desc4: string | null
  effect_icon: string | null
  class?: string | null
  source?: string | null
  boss?: string | null
  mode?: string | null
  level: number
}

export type Weapon = WithLocalizedFields<
  WithLocalizedFields<
    WithLocalizedFields<
      WithLocalizedFields<BaseWeapon, 'name'>,
      'effect_name'
    >,
    'effect_desc1'
  >,
  'effect_desc4'
>


export type WeaponMini = EquipmentBase
export type AmuletMini = EquipmentBase
