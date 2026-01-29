'use client'

import InlineWrapper from './InlineWrapper'
import { useI18n } from '@/lib/contexts/I18nContext'

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-red-400',
  water: 'text-blue-400',
  earth: 'text-emerald-400',
  light: 'text-yellow-300',
  dark: 'text-purple-400',
}

type Props = {
  element: string
}

export default function ElementInline({ element }: Props) {
  const key = element.toLowerCase()
  const { t } = useI18n()

  const translationKey = `SYS_ELEMENT_NAME_${key.toUpperCase()}`
  const label = t(translationKey, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1) })
  const color = ELEMENT_COLORS[key] || 'text-neutral-300'
  const iconPath = `/images/ui/elem/${key}.webp`

  return (
    <InlineWrapper
      icon={iconPath}
      label={label}
      color={color}
    />
  )
}
