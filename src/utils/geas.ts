// src/utils/geas.ts
import { Geas } from '@/app/components/GeasCard'
import geasDataJson from '@/data/geas.json'

type GeasData = {
  IconName: string
  text: Record<string, string>
  ratio: string
  level: number
}

const geasData = geasDataJson as Record<string, GeasData>

/**
 * Resolve a geas reference to a Geas object
 * @param ref - Either a string reference like "1-2B" or a numeric ID
 * @param bosses - Array of bosses (only used for string references)
 * @param lang - Language code (only used for numeric ID references)
 * @returns Geas object or null if invalid
 */
export function resolveGeasRef(
  ref: string | number,
  bosses: {
    bossId?: string
    id?: string
    geas: Record<string, {
      bonus: Geas | number
      malus: Geas | number
    }>
  }[],
  lang: string = 'en'
): Geas | null {
  // If it's a numeric ID, load from geas.json
  if (typeof ref === 'number') {
    const geasEntry = geasData[ref.toString()]
    if (!geasEntry) return null

    // Extract icon name from "GD_Geis_Striker" -> "Striker"
    const iconName = geasEntry.IconName.replace('GD_Geis_', '')

    // Get localized text (handle null text case)
    const localizedText = geasEntry.text
      ? (geasEntry.text[lang] || geasEntry.text['en']).replace(/\\n/g, '\n')
      : ''

    return {
      effect: localizedText,
      ratio: geasEntry.ratio || '',
      image: iconName,
      bg: geasEntry.level.toString() as '1' | '2' | '3',
    }
  }

  // Otherwise it's a string reference like "1-2B"
  const match = ref.match(/^(\d+)-(\d+)([BM])$/i)
  if (!match) return null

  const [, bossIndexStr, levelStr, typeLetter] = match
  const bossIndex = parseInt(bossIndexStr, 10) - 1
  const level = levelStr
  const type = typeLetter.toUpperCase() === 'B' ? 'bonus' : 'malus'

  const boss = bosses[bossIndex]
  if (!boss || !boss.geas[level]) return null

  const baseGeas = boss.geas[level][type]
  if (!baseGeas) return null

  // If baseGeas is a number, resolve it
  if (typeof baseGeas === 'number') {
    return resolveGeasRef(baseGeas, bosses, lang)
  }

  return {
    ...baseGeas
  }
}