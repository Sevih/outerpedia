'use client'

import Image from 'next/image'
import EquipmentInlineWrapper from './EquipmentInlineWrapper'
import amuletsRaw from '@/data/amulet.json'
import type { Accessory } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import formatEffectText from '@/utils/formatText'

type Props = {
  name: string
}

export default function AmuletInline({ name }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  const amulets = amuletsRaw as Accessory[]
  const amulet = amulets.find(a => a.name === name)
  if (!amulet) return <span className="text-red-500">{name}</span>

  const label = l(amulet, 'name', lang)
  const effectDesc4 = l(amulet, 'effect_desc4', lang)
  const effectDesc1 = l(amulet, 'effect_desc1', lang)
  const effectText = effectDesc4 || effectDesc1
  const effectName = l(amulet, 'effect_name', lang)

  const rarity = (amulet.rarity || 'legendary').toLowerCase()
  const bgPath = `/images/bg/CT_Slot_${rarity}.webp`
  const iconPath = `/images/equipment/${amulet.image}.webp`
  const classIcon = amulet.class ? `/images/ui/class/${amulet.class.toLowerCase()}.webp` : null
  const className = amulet.class ? t(`SYS_CLASS_${amulet.class.toUpperCase()}`, { defaultValue: amulet.class }) : null

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
                <Image src={classIcon} alt={amulet.class!} fill sizes="16px" className="object-contain" />
              </span>
              <span className="text-xs text-orange-400">{className}</span>
            </div>
          )}
          {effectName && <span className="text-xs text-sky-300">{effectName}</span>}
          {effectText && (
            <span className="text-xs leading-snug whitespace-pre-line">
              {formatEffectText(effectText)}
            </span>
          )}
        </div>
      }
    />
  )
}
