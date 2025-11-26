'use client'

import { getT } from '@/i18n'
import { useI18n } from '@/lib/contexts/I18nContext'
import BuffDebuffDisplayMini from '../BuffDebuffDisplayMini'
import debuffs from '@/data/debuffs.json'

type Props = {
  buffImmune?: string
  statBuffImmune?: string
}

export default function BossImmunities({ buffImmune, statBuffImmune }: Props) {
  const { lang } = useI18n()
  const t = getT(lang)

  const allImmunities = [
    ...(buffImmune ? buffImmune.split(',').map(s => s.trim()).filter(Boolean) : []),
    ...(statBuffImmune ? statBuffImmune.split(',').map(s => s.trim()).filter(Boolean) : [])
  ]

  // Deduplicate by group: keep only one effect per group
  const deduplicatedImmunities = allImmunities.reduce<string[]>((acc, effectKey) => {
    const formattedKey = effectKey.startsWith('ST_') ? `BT_STAT|${effectKey}` : effectKey
    const effect = debuffs.find((d: { name: string; group?: string }) => d.name === formattedKey)
    const groupKey = effect?.group || formattedKey

    // Check if we already have an effect from this group
    const hasGroupAlready = acc.some(key => {
      const existingEffect = debuffs.find((d: { name: string; group?: string }) => d.name === key)
      const existingGroup = existingEffect?.group || key
      return existingGroup === groupKey || key === groupKey
    })

    if (!hasGroupAlready) {
      acc.push(formattedKey)
    }
    return acc
  }, [])

  if (deduplicatedImmunities.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-neutral-400 font-semibold">{t('boss.immunities')}</div>
      <div className="flex flex-wrap gap-1">
        {deduplicatedImmunities.map((effectKey, index) => (
          <BuffDebuffDisplayMini key={index} debuffs={[effectKey]} />
        ))}
      </div>
    </div>
  )
}