'use client'

import InlineWrapper from './InlineWrapper'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l } from '@/lib/localize'
import formatEffectText from '@/utils/formatText'
import type { BuffName, DebuffName } from '@/types/effect-names'
import type { WithLocalizedFields } from '@/types/common'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'

type Props =
  | { name: BuffName; type: 'buff' }
  | { name: DebuffName; type: 'debuff' }

type BaseEffect = {
  name: string
  type: 'buff' | 'debuff'
  label: string
  description: string
  icon: string
}

type Effect = WithLocalizedFields<WithLocalizedFields<BaseEffect, 'label'>, 'description'>

export default function EffectInline({ name, type }: Props) {
  const { key: lang } = useTenant()

  const effects: Effect[] = (type === 'buff' ? buffs : debuffs).map(e => ({ ...e, type }))
  const effect = effects.find(e => e.name === name)

  if (!effect) {
    return <span className="text-red-500">{name}</span>
  }

  const label = l(effect, 'label', lang)
  const description = l(effect, 'description', lang)
  const iconPath = `/images/ui/effect/${effect.icon}.webp`

  const color = type === 'buff' ? 'text-sky-400' : 'text-red-400'
  const tooltipBg = type === 'buff' ? 'bg-[#1a4a6e]' : 'bg-[#6e2a27]'
  const arrowFill = type === 'buff' ? 'fill-[#1a4a6e]' : 'fill-[#6e2a27]'

  // Check if irremovable for icon styling
  const isIrremovable = effect.description.toLowerCase().includes('cannot be removed')
  const imageFilter = isIrremovable ? '' : type

  return (
    <InlineWrapper
      icon={iconPath}
      label={label}
      color={color}
      underline
      imageClassName={imageFilter}
      tooltip
      tooltipBg={tooltipBg}
      arrowFill={arrowFill}
      tooltipContent={
        <div className="flex flex-col gap-1 text-white">
          <span className="font-bold text-sm leading-tight">{label}</span>
          <span className="text-xs leading-snug whitespace-pre-line">{formatEffectText(description)}</span>
        </div>
      }
    />
  )
}
