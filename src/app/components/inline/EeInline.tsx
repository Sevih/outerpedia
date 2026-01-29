'use client'

import EquipmentInlineWrapper from './EquipmentInlineWrapper'
import eeRaw from '@/data/ee.json'
import allCharacters from '@/data/_allCharacters.json'
import type { ExclusiveEquipment } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import { toKebabCase } from '@/utils/formatText'
import formatEffectText from '@/utils/formatText'

type Props = {
  name: string
}

export default function EeInline({ name }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  const eeData = eeRaw as Record<string, ExclusiveEquipment>
  const entry = Object.entries(eeData).find(([, e]) => e.name === name)
  if (!entry) return <span className="text-red-500">{name}</span>

  const [slug, ee] = entry
  const label = l(ee, 'name', lang)
  const effectDesc = l(ee, 'effect', lang)
  const effectDesc10 = l(ee, 'effect10', lang)

  // Find character by slug
  const char = allCharacters.find(c => toKebabCase(c.Fullname) === slug)
  const charName = char ? l(char, 'Fullname', lang) : null
  const eeTitle = charName ? t('exclusive_equipment_title', { name: charName }) : null

  const bgPath = '/images/bg/CT_Slot_legendary.webp'
  const iconPath = `/images/characters/ex/${slug}.webp`

  return (
    <EquipmentInlineWrapper
      iconPath={iconPath}
      bgPath={bgPath}
      label={label}
      color="text-red-400"
      tooltipContent={
        <div className="flex flex-col gap-1 text-white">
          <span className="font-semibold text-red-400">{label}</span>
          {eeTitle && <span className="text-xs text-gray-400">{eeTitle}</span>}
          {effectDesc && (
            <span className="text-xs leading-snug whitespace-pre-line">
              {formatEffectText(effectDesc)}
            </span>
          )}
          {effectDesc10 && (
            <span className="text-xs leading-snug whitespace-pre-line text-amber-300 italic">
              {t('effect_lv10_label')} {formatEffectText(effectDesc10)}
            </span>
          )}
        </div>
      }
    />
  )
}
