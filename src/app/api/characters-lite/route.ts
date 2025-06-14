import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import eeRaw from '@/data/ee.json'
import type { ExclusiveEquipment } from '@/types/character'
import type { Character } from '@/types/character' // <= On utilise ton vrai type complet

const eeData: Record<string, ExclusiveEquipment> = eeRaw

function normalizeEffect(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') return raw ? [raw] : []
  return []
}

function extractBuffsAndDebuffs(character: Character) {
  const buffs: Set<string> = new Set()
  const debuffs: Set<string> = new Set()

  if (character.skills) {
    for (const skill of Object.values(character.skills)) {
      if (!skill) continue

      for (const [key, targetSet] of [
        ['buff', buffs],
        ['debuff', debuffs],
        ['dual_buff', buffs],
        ['dual_debuff', debuffs],
      ] as const) {
        if (key in skill && skill[key as keyof typeof skill]) {
          normalizeEffect(skill[key as keyof typeof skill]).forEach((e) => targetSet.add(e))
        }
      }
    }
  }

  const slug = character.Fullname?.toLowerCase().replace(/ /g, '-')
  const ee = eeData[slug]
  if (ee) {
    normalizeEffect(ee.buff).forEach(b => buffs.add(b))
    normalizeEffect(ee.debuff).forEach(d => debuffs.add(d))
  }

  return {
    buff: Array.from(buffs),
    debuff: Array.from(debuffs),
  }
}



export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), 'src/data/char')
    const files = await fs.readdir(dirPath)

    const charactersLite = await Promise.all(
      files.filter(f => f.endsWith('.json')).map(async (file) => {
        const content = await fs.readFile(path.join(dirPath, file), 'utf-8')
        const character = JSON.parse(content) as Character

        const { buff, debuff } = extractBuffsAndDebuffs(character)

        return {
          ID: character.ID,
          Fullname: character.Fullname,
          Class: character.Class,
          Element: character.Element,
          Rarity: character.Rarity,
          limited: character.limited ?? false,
          gift: character.gift ?? false,
          Chain_Type: character.Chain_Type,
          buff,
          debuff,
        }
      })
    )

    return NextResponse.json(charactersLite)
  } catch (err) {
    console.error('Error loading characters-lite:', err)
    return NextResponse.json({ error: 'Failed to load characters' }, { status: 500 })
  }
}