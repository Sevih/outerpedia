'use client'

import Image from 'next/image'
import stats from '@/data/stats.json'
import { useI18n } from '@/lib/contexts/I18nContext'

type Props = {
  name: keyof typeof stats
  color?: string
  abbr?: boolean
}

export default function StatInlineTag({ name, color = 'text-amber-400', abbr = false }: Props) {
  const stat = stats[name]
  const { t } = useI18n()

  if (!stat) return <span className="text-red-500">{name}</span>

  const iconPath = `/images/ui/effect/${stat.icon}`
  const sysKey = toSysKey(String(name))

  let label = t(sysKey)
  if (!label || label === sysKey) label = stat.label

  return (
    <span className="inline-flex items-end gap-1 align-bottom">
      <span className="inline-block w-[24px] h-[24px] relative align-bottom">
        <Image
          src={iconPath}
          alt={label}
          fill
          sizes="24px"
          className="object-contain"
        />
      </span>
      <span className={color}>
        {abbr ? String(name).toUpperCase() : label}
      </span>
    </span>
  )
}

/* ---------------- Helpers ---------------- */

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
