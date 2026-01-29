'use client'

import EquipmentInlineWrapper from './EquipmentInlineWrapper'
import talismansRaw from '@/data/talisman.json'
import type { Talisman } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import formatEffectText from '@/utils/formatText'

type Props = {
  name: string
}

export default function TalismanInline({ name }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  const talismans = talismansRaw as Talisman[]
  const talisman = talismans.find(t => t.name === name)
  if (!talisman) return <span className="text-red-500">{name}</span>

  const label = l(talisman, 'name', lang)
  const effectDesc1 = l(talisman, 'effect_desc1', lang)
  const effectDesc4 = l(talisman, 'effect_desc4', lang)
  const effectName = l(talisman, 'effect_name', lang)

  const rarity = (talisman.rarity || 'legendary').toLowerCase()
  const bgPath = `/images/bg/CT_Slot_${rarity}.webp`
  const iconPath = `/images/equipment/${talisman.image}.webp`

  return (
    <EquipmentInlineWrapper
      iconPath={iconPath}
      bgPath={bgPath}
      label={label}
      tooltipContent={
        <div className="flex flex-col gap-1.5 text-white">
          <span className="font-medium text-amber-400">{label}</span>
          {effectName && <span className="text-xs text-sky-300">{effectName}</span>}
          {effectDesc1 && (
            <div className="text-xs">
              <span className="text-gray-400">{t('items.lv0')}: </span>
              <span className="leading-snug whitespace-pre-line">
                {formatEffectText(effectDesc1)}
              </span>
            </div>
          )}
          {effectDesc4 && (
            <div className="text-xs">
              <span className="text-amber-400">{t('items.lv10')}: </span>
              <span className="leading-snug whitespace-pre-line">
                {formatEffectText(effectDesc4)}
              </span>
            </div>
          )}
        </div>
      }
    />
  )
}
