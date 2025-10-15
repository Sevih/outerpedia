import React from 'react'
import statsData from '@/data/stats.json'
import rangesData from '@/data/statRanges.json'
import Image from 'next/image'
import { TenantKey } from '@/tenants/config'
import { getServerI18n } from '@/lib/contexts/server-i18n' // ✅ chemin corrigé

interface StatInfo {
  icon: string
}

interface StatsData {
  [key: string]: StatInfo
}

interface StatRanges {
  [type: string]: {
    [stat: string]: {
      [rare: string]: number[]
    }
  }
}

const typedStatsData = statsData as StatsData
const typedRangesData = rangesData as StatRanges

interface ItemStatsBlockProps {
  stats: string[]
  substats?: string[]
  type: string
  rare: number
  lang: TenantKey
}

const getStatInfo = (code: string) => typedStatsData[code.toUpperCase()]

const getStatRange = (type: string, stat: string, rare: number): [number, number] | null => {
  const raw = typedRangesData[type]?.[stat]?.[String(rare)]
  return raw && raw.length === 2 ? [raw[0], raw[1]] : null
}

const SPECIAL_MAP: Record<string, string> = {
  'CR': 'SYS_STAT_CHC',
  'CRIT RATE': 'SYS_STAT_CHC',
  'CRIT DMG': 'SYS_STAT_CHD',
  'EFFECTIVENESS': 'SYS_STAT_EFF',
  'RESISTANCE': 'SYS_STAT_RES',
  'SPEED': 'SYS_STAT_SPD',
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

export default async function ItemStatsBlock({ stats, substats = [], type, rare, lang }: ItemStatsBlockProps) {
  const { t } = await getServerI18n(lang)

  const renderStatRow = (statCode: string) => {
    const upper = statCode.toUpperCase()
    const info = getStatInfo(upper)
    const range = getStatRange(type, upper, rare)
    if (!info) return null

    const sysKey = toSysKey(upper)
    const label = t(sysKey, { defaultValue: upper })

    return (
      <tr key={upper} className="border-t border-white/10">
        <td className="py-1 pr-4 w-1/2">
          <div className="flex items-center gap-2">
            <Image
              src={`/images/ui/effect/${info.icon}`}
              alt={label}
              width={20}
              height={20}
              style={{ width: 20, height: 20 }}
            />
            <span className="text-xs">{label}</span>
          </div>
        </td>
        <td className="py-1 px-2 text-center text-neutral-300 w-1/3">
          {range ? range[0] : t('items.na', { defaultValue: 'N/A' })}
        </td>
        <td className="py-1 px-2 text-center text-neutral-300 w-1/3">
          {range ? range[1] : t('items.na', { defaultValue: 'N/A' })}
        </td>
      </tr>
    )
  }

  const TableHeader = () => (
    <thead>
      <tr className="text-neutral-400 text-left">
        <th className="font-medium pb-1 w-1/3">{t('items.stat', { defaultValue: 'Stat' })}</th>
        <th className="font-medium pb-1 text-center w-1/3">
          {t('items.lv0', { defaultValue: 'Lv.0' })} {t('items.tier0', { defaultValue: 'Tier 0' })}
        </th>
        <th className="font-medium pb-1 text-center w-1/3">
          {t('items.lv10', { defaultValue: 'Lv.10' })} {t('items.tier4', { defaultValue: 'Tier 4' })}
        </th>
      </tr>
    </thead>
  )

  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl space-y-6">
      <div>
        <p className="font-semibold text-white mb-2">
          {t('items.mainstats', { defaultValue: 'Main Stats' })}
        </p>
        <table className="w-full table-fixed text-sm text-white">
          <TableHeader />
          <tbody>{stats.map(renderStatRow)}</tbody>
        </table>
      </div>

      {substats.length > 0 && (
        <div>
          <p className="font-semibold text-white mb-2">
            {t('items.secondMainstats', { defaultValue: 'Second Main Stats' })}
          </p>
          <table className="w-full table-fixed text-sm text-white">
            <TableHeader />
            <tbody>{substats.map(renderStatRow)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
