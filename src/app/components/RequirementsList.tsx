'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'
import { findCharacter } from './CharacterCard'
import { CharacterPortrait } from './CharacterPortrait'
import { toKebabCase } from '@/utils/formatText'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'
import parseText from '@/utils/parseText'
import type { RequirementsData, RequirementEntry, RequirementStats, RequirementEquipment } from '@/types/team'

type Props = {
  data: RequirementsData
}

/** Extract short text from inline tags like {S/SPD} → SPD, {AS/Revenge} → Revenge */
function inlineToShort(text: string): string {
  return text.replace(/\{[A-Z-]+\/([^}]+)\}/g, '$1')
}

const SPECIAL_MAP: Record<string, string> = {
  CR: 'SYS_STAT_CHC',
  'CRIT RATE': 'SYS_STAT_CHC',
  'CRIT DMG': 'SYS_STAT_CHD',
  EFFECTIVENESS: 'SYS_STAT_EFF',
  RESISTANCE: 'SYS_STAT_RES',
  SPEED: 'SYS_STAT_SPD',
  TRANS: 'tier.ui.filter.transcend',
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

const STAT_ORDER: (keyof RequirementStats)[] = ['spd', 'eff', 'atk', 'def', 'hp', 'chc', 'chd', 'trans']

function hasStats(s: RequirementStats | undefined): s is RequirementStats {
  if (!s) return false
  return STAT_ORDER.some(k => s[k] !== undefined)
}

function getSpd(entry: RequirementEntry): number | null {
  if (!entry.stats?.spd) return null
  const parsed = parseFloat(entry.stats.spd)
  return isNaN(parsed) ? null : parsed
}

const EQUIP_I18N: Record<keyof RequirementEquipment, string> = {
  weapon: 'weapons',
  amulet: 'equipments_tabs.accessory',
  talisman: 'talisman',
  set: 'sets',
  ee: 'equipments_tabs.exclusive',
}

const EQUIP_ORDER: (keyof RequirementEquipment)[] = ['weapon', 'amulet', 'talisman', 'set', 'ee']

function hasEquipment(eq: RequirementEquipment | undefined): eq is RequirementEquipment {
  if (!eq) return false
  return EQUIP_ORDER.some(k => eq[k] && eq[k].length > 0)
}

function resolveNotes(entry: RequirementEntry, lang: string): string[] | undefined {
  if (lang !== 'en') {
    const localizedKey = `notes_${lang}` as keyof RequirementEntry
    const localized = entry[localizedKey] as string[] | undefined
    if (localized && localized.length > 0) return localized
  }
  return entry.notes
}

function resolveFooterNote(data: RequirementsData, lang: string): string | undefined {
  if (lang !== 'en') {
    const localizedKey = `note_${lang}` as keyof RequirementsData
    const localized = data[localizedKey] as string | undefined
    if (localized) return localized
  }
  return data.note
}

export default function RequirementsList({ data }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  const entries = data.entries
  const note = resolveFooterNote(data, lang)

  const sorted = useMemo(() => {
    const hasAnySpd = entries.some((e: RequirementEntry) => getSpd(e) !== null)
    if (!hasAnySpd) return entries
    return [...entries].sort((a: RequirementEntry, b: RequirementEntry) => {
      const sa = getSpd(a)
      const sb = getSpd(b)
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return 1
      return sb - sa
    })
  }, [entries])

  const renderStats = (stats: RequirementStats, size: 'desktop' | 'mobile') => {
    const gapClass = size === 'desktop' ? 'gap-x-4 gap-y-1' : 'gap-x-3 gap-y-0.5'
    const gapInner = size === 'desktop' ? 'gap-1.5' : 'gap-1'
    const tracking = size === 'desktop' ? ' tracking-wide' : ''

    return (
      <div className={`flex flex-wrap ${gapClass}`}>
        {STAT_ORDER.map(key => {
          const value = stats[key]
          if (value === undefined) return null
          return (
            <span key={key} className={`inline-flex items-center ${gapInner} text-sm`}>
              <span className={`text-xs font-semibold text-sky-400/80 uppercase${tracking}`}>{t(toSysKey(key))}</span>
              <span className="text-neutral-200">{parseText(value)}</span>
            </span>
          )
        })}
      </div>
    )
  }

  const renderEquipment = (eq: RequirementEquipment, size: 'desktop' | 'mobile') => {
    const gapInner = size === 'desktop' ? 'gap-1.5' : 'gap-1'
    const tracking = size === 'desktop' ? ' tracking-wide' : ''

    return (
      <div className="space-y-0.5">
        {EQUIP_ORDER.map(key => {
          const items = eq[key]
          if (!items || items.length === 0) return null
          return (
            <div key={key} className={`flex items-center ${gapInner} text-sm`}>
              <span className={`text-xs font-semibold text-sky-400/80 uppercase${tracking} shrink-0`}>{t(EQUIP_I18N[key])}</span>
              <span className="text-neutral-200">
                {items.map((v, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    {parseText(v)}
                  </span>
                ))}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mb-3 rounded-lg border border-neutral-700/50 overflow-hidden">
      <div className="px-4 py-2 bg-neutral-800/60 border-b border-neutral-700/50 text-center">
        <span className="text-sm font-semibold text-neutral-200 uppercase tracking-wide">{t('requirements.title')}</span>
      </div>

      {/* Desktop - 2 columns grid */}
      <div className="hidden md:grid md:grid-cols-2">
        {sorted.map((entry, idx) => {
          const char = findCharacter(entry.character)
          const slug = char ? toKebabCase(char.Fullname) : ''
          const localizedName = char ? l(char, 'Fullname', lang) : entry.character
          const entryNotes = resolveNotes(entry, lang)
          const hasStructured = hasStats(entry.stats) || hasEquipment(entry.equipment) || entry.prio || entryNotes

          return (
            <div
              key={entry.character}
              className={`flex items-center gap-3 px-3 py-2.5 border-neutral-600/60${idx >= 2 ? ' border-t' : ''}${idx % 2 === 1 ? ' border-l' : ''}`}
            >
              <Link href={`/characters/${slug}`} className="flex flex-col items-center gap-1 shrink-0 w-[80px]">
                {char && (
                  <div className="rounded overflow-hidden">
                    <CharacterPortrait
                      characterId={char.ID}
                      characterName={localizedName}
                      size={64}
                    />
                  </div>
                )}
                {char ? (
                  <span className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors whitespace-nowrap">
                    {localizedName}
                  </span>
                ) : (
                  <span className="text-sm text-red-500">{entry.character}</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                {hasStructured ? (
                  <div className="space-y-1.5">
                    {hasStats(entry.stats) && renderStats(entry.stats, 'desktop')}
                    {entry.prio && entry.prio.length > 0 && (
                      <div className="text-sm text-neutral-300 inline-flex items-center gap-1">
                        <span className="text-xs font-semibold text-sky-400/80 uppercase tracking-wide">{t('requirements.prio')}</span>
                        {entry.prio.map((s: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1">
                            {i > 0 && <span className="text-neutral-600">&gt;</span>}
                            {parseText(s)}
                          </span>
                        ))}
                      </div>
                    )}
                    {hasEquipment(entry.equipment) && renderEquipment(entry.equipment, 'desktop')}
                    {entryNotes && entryNotes.length > 0 && (
                      <div className="space-y-0.5">
                        {entryNotes.map((n: string, i: number) => (
                          <div key={i} className="text-sm text-neutral-200 flex gap-1.5">
                            <span className="text-neutral-600 shrink-0">-</span>
                            <span>{parseText(n)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-0.5 marker:text-neutral-500">
                    {entry.items?.map((item, i) => (
                      <li key={i} className="text-sm text-neutral-300">{parseText(item)}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-neutral-600/60">
        {sorted.map((entry) => {
          const char = findCharacter(entry.character)
          const slug = char ? toKebabCase(char.Fullname) : ''
          const localizedName = char ? l(char, 'Fullname', lang) : entry.character
          const atbPath = char ? `/images/characters/atb/IG_Turn_${char.ID}.webp` : ''
          const entryNotes = resolveNotes(entry, lang)
          const hasStructured = hasStats(entry.stats) || hasEquipment(entry.equipment) || entry.prio || entryNotes

          return (
            <div key={entry.character} className="px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                {char && (
                  <Link href={`/characters/${slug}`} className="relative w-7 h-7 shrink-0 rounded overflow-hidden">
                    <Image
                      src={atbPath}
                      alt={localizedName}
                      fill
                      sizes="28px"
                      className="object-contain"
                    />
                  </Link>
                )}
                {char ? (
                  <Link href={`/characters/${slug}`} className="text-sm font-medium text-sky-400 hover:text-sky-300 hover:underline underline-offset-2 transition-colors">
                    {localizedName}
                  </Link>
                ) : (
                  <span className="text-sm text-red-500">{entry.character}</span>
                )}
              </div>
              {hasStructured ? (
                <div className="ml-1 space-y-1">
                  {hasStats(entry.stats) && renderStats(entry.stats, 'mobile')}
                  {entry.prio && entry.prio.length > 0 && (
                    <div className="text-sm text-neutral-300 inline-flex items-center gap-1">
                      <span className="text-xs font-semibold text-sky-400/80 uppercase">Prio</span>
                      {entry.prio.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          {i > 0 && <span className="text-neutral-600">&gt;</span>}
                          {inlineToShort(s)}
                        </span>
                      ))}
                    </div>
                  )}
                  {hasEquipment(entry.equipment) && renderEquipment(entry.equipment, 'mobile')}
                  {entryNotes && entryNotes.length > 0 && (
                    <div className="space-y-0.5">
                      {entryNotes.map((n: string, i: number) => (
                        <div key={i} className="text-sm text-neutral-200 flex gap-1.5">
                          <span className="text-neutral-600 shrink-0">-</span>
                          <span>{parseText(n)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 ml-1 marker:text-neutral-500">
                  {entry.items?.map((item, i) => (
                    <li key={i} className="text-sm text-neutral-300">{parseText(item)}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {note && (
        <div className="px-4 py-2 bg-neutral-800/40 border-t border-neutral-700/50 text-center">
          <p className="text-sm text-neutral-400">{parseText(note)}</p>
        </div>
      )}
    </div>
  )
}
