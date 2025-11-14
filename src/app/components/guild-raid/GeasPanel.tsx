'use client'

import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'
import GeasCard from '@/app/components/GeasCard'
import { GeasConfig, Geas, GeasObject } from '@/schemas/guild-raid.schema'
import geasDataJson from '@/data/geas.json'

type Props = {
  geasConfig: GeasConfig
}

type GeasData = {
  IconName: string
  text: Record<string, string> | null
  ratio: string | null
  level: number
}

const geasData = geasDataJson as Record<string, GeasData>

/**
 * Convert a geas ID to a GeasObject by loading from geas.json
 */
function resolveGeas(geas: Geas, lang: string): GeasObject {
  // If it's already an object, return it as-is
  if (typeof geas === 'object') {
    return geas
  }

  // It's an ID, load from geas.json
  const geasEntry = geasData[geas.toString()]
  if (!geasEntry) {
    throw new Error(`Geas ID ${geas} not found in geas.json`)
  }

  // Extract icon name from "GD_Geis_Striker" -> "Striker"
  const iconName = geasEntry.IconName.replace('GD_Geis_', '')

  // Get localized text and convert \n and \\n to actual newlines (handle null text case)
  const localizedText = geasEntry.text
    ? (geasEntry.text[lang] || geasEntry.text['en'] || '')
        .replace(/\\n/g, '\n')  // Convert \\n to \n
        .replace(/\n/g, '\n')   // Keep actual \n as is
    : ''

  return {
    effect: localizedText,
    ratio: geasEntry.ratio || '',
    image: iconName,
    bg: geasEntry.level.toString() as '1' | '2' | '3',
  }
}

/**
 * Geas Panel Component
 * Displays all 5 geas levels with bonus/malus options
 */
export function GeasPanel({ geasConfig }: Props) {
  const { lang } = useI18n()
  const levels = ['1', '2', '3', '4', '5'] as const

  return (
    <div className="flex flex-col items-center gap-4 mt-4 w-full">
      {levels.map((level) => {
        const entry = geasConfig[level]
        const resolvedBonus = entry.bonus ? resolveGeas(entry.bonus, lang) : null
        const resolvedMalus = entry.malus ? resolveGeas(entry.malus, lang) : null

        return (
          <div key={level} className="flex flex-col items-center gap-2 w-full">
            {/* Level Badge */}
            <div className="relative w-[60px] h-[28px] mx-auto">
              <Image
                src="/images/ui/geas/CM_Facility_Frame.webp"
                alt={`Level ${level}`}
                width={60}
                height={28}
                style={{ width: 60, height: 28 }}
                className="object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                {level}
              </div>
            </div>

            {/* Geas Cards */}
            <div className="flex justify-center gap-2 flex-wrap">
              {resolvedBonus && <GeasCard geas={resolvedBonus} type="bonus" />}
              {resolvedMalus && <GeasCard geas={resolvedMalus} type="malus" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
