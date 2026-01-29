'use client'

import EquipmentInlineWrapper from './EquipmentInlineWrapper'
import sets from '@/data/sets.json'
import type { ArmorSet } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

type Props = {
  name: string
}

export default function SetInline({ name }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  // Support both "Attack" and "Attack Set" formats
  const set = (sets as ArmorSet[]).find(s => s.name === name || s.name === `${name} Set`)
  if (!set) return <span className="text-red-500">{name}</span>

  const label = l(set, 'name', lang)
  const effect2 = l(set, 'effect_2_4', lang)
  const effect4 = l(set, 'effect_4_4', lang)

  const bgPath = '/images/bg/CT_Slot_legendary.webp'
  const iconPath = `/images/equipment/TI_Equipment_Armor_${set.image_prefix}.webp`

  return (
    <EquipmentInlineWrapper
      iconPath={iconPath}
      bgPath={bgPath}
      label={label}
      tooltipContent={
        <div className="flex flex-col gap-1.5 text-white">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-400">{label}</span>
            <span className="text-xs text-gray-400">({t('items.tier4')})</span>
          </div>
          {effect2 && (
            <div className="text-xs">
              <span className="text-sky-300">{t('items.set.twoPiece')}: </span>
              <span className="leading-snug whitespace-pre-line">{effect2}</span>
            </div>
          )}
          {effect4 && (
            <div className="text-xs">
              <span className="text-sky-300">{t('items.set.fourPiece')}: </span>
              <span className="leading-snug whitespace-pre-line">{effect4}</span>
            </div>
          )}
        </div>
      }
    />
  )
}
