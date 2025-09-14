import fs from 'fs'
import path from 'path'
import { toKebabCase } from '@/utils/formatText'
import CurrentlyPullableClient from './CurrentlyPullableClient'

type BannerEntry = {
  name: string
  start: string
  end: string
}

function toUkResetIso(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toISOString()
}

function isBannerActive(start: string, end: string): boolean {
  const now = new Date()
  const startDate = new Date(toUkResetIso(start))
  const endDate = new Date(toUkResetIso(end))
  return now >= startDate && now < endDate
}

export default function CurrentlyPullable() {
  const bannerPath = path.resolve(process.cwd(), 'src/data/banner.json')
  const bannerData: BannerEntry[] = JSON.parse(fs.readFileSync(bannerPath, 'utf8'))

  const activeCharacters = bannerData.filter(entry =>
    isBannerActive(entry.start, entry.end)
  )

  const characters = activeCharacters.map(({ name, end }) => {
    const slug = toKebabCase(name)
    const filePath = path.resolve(process.cwd(), 'src/data/char', `${slug}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    return {
      name,
      id: data.ID,
      rarity: data.Rarity,
      limited: data.limited,
      slug,
      endDate: toUkResetIso(end),
      element: data.Element.toLowerCase(),
      class: data.Class.toLowerCase(),
      special: false,
    }
  })

  return <CurrentlyPullableClient characters={characters} />
}
