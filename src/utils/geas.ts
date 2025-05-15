// src/utils/geas.ts
import { Geas } from '@/app/components/GeasCard'

export function resolveGeasRef(
  ref: string,
  bosses: {
    id: string
    geas: Record<string, {
      bonus: Geas
      malus: Geas
    }>
  }[]
): Geas | null {
  // ref ex: "1-2B" => boss 1, geas level 2, Bonus
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

  return {
    ...baseGeas
  }
}