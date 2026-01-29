'use client'

import InlineWrapper from './InlineWrapper'
import stats from '@/data/stats.json'
import { useI18n } from '@/lib/contexts/I18nContext'

type Props = {
  name: keyof typeof stats
}

const SPECIAL_MAP: Record<string, string> = {
  CR: 'SYS_STAT_CHC',
  'CRIT RATE': 'SYS_STAT_CHC',
  'CRIT DMG': 'SYS_STAT_CHD',
  EFFECTIVENESS: 'SYS_STAT_EFF',
  RESISTANCE: 'SYS_STAT_RES',
  SPEED: 'SYS_STAT_SPD',
}

function toSysKey(codeRaw: string): string {
  const code = (codeRaw || '').trim().toUpperCase()
  if (SPECIAL_MAP[code]) return SPECIAL_MAP[code]
  return 'SYS_STAT_' + code
    .replace(/%/g, '_PERCENT')
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '')
    .toUpperCase()
}

export default function StatInline({ name }: Props) {
  const stat = stats[name]
  const { t } = useI18n()

  if (!stat) return <span className="text-red-500">{name}</span>

  const sysKey = toSysKey(String(name))
  let label = t(sysKey)
  if (!label || label === sysKey) label = stat.label

  const iconPath = `/images/ui/effect/${stat.icon}`

  return (
    <InlineWrapper
      icon={iconPath}
      label={label}
      color="text-amber-400"
    />
  )
}
