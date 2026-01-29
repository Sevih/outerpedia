'use client'

import Image from 'next/image'
import EquipmentInlineWrapper from './EquipmentInlineWrapper'
import weapons from '@/data/weapon.json'
import type { Weapon } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import formatEffectText from '@/utils/formatText'

type Props = {
  name: string
}

export default function WeaponInline({ name }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  const weapon = (weapons as Weapon[]).find(w => w.name === name)
  if (!weapon) return <span className="text-red-500">{name}</span>

  const label = l(weapon, 'name', lang)
  const effectName = l(weapon, 'effect_name', lang)
  const effectDesc4 = l(weapon, 'effect_desc4', lang)
  const effectDesc1 = l(weapon, 'effect_desc1', lang)
  const effectLv4 = effectDesc4 || effectDesc1

  const rarity = (weapon.rarity || 'legendary').toLowerCase()
  const bgPath = `/images/bg/CT_Slot_${rarity}.webp`
  const iconPath = `/images/equipment/${weapon.image}.webp`
  const classIcon = weapon.class ? `/images/ui/class/${weapon.class.toLowerCase()}.webp` : null
  const className = weapon.class ? t(`SYS_CLASS_${weapon.class.toUpperCase()}`, { defaultValue: weapon.class }) : null

  return (
    <EquipmentInlineWrapper
      iconPath={iconPath}
      bgPath={bgPath}
      label={label}
      tooltipContent={
        <div className="flex flex-col gap-1 text-white">
          <div className="flex items-center gap-2">
            <span className="font-medium text-amber-400">{label}</span>
            <span className="text-xs text-gray-400">({t('items.tier4')})</span>
          </div>
          {classIcon && className && (
            <div className="flex items-center gap-1">
              <span className="relative w-4 h-4 shrink-0">
                <Image src={classIcon} alt={weapon.class!} fill sizes="16px" className="object-contain" />
              </span>
              <span className="text-xs text-orange-400">{className}</span>
            </div>
          )}
          {effectName && <span className="text-xs text-sky-300">{effectName}</span>}
          {effectLv4 && (
            <span className="text-xs leading-snug whitespace-pre-line">
              {formatEffectText(effectLv4)}
            </span>
          )}
        </div>
      }
    />
  )
}
