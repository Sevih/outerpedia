import { toKebabCase } from '@/utils/formatText'
import fs from 'fs'
import path from 'path'
import CurrentlyPullableClient from './CurrentlyPullableClient'

const pullableCharacters = [
  { name: 'Luna', endDate: getEndDateAtUkReset('2025-05-07') },
  { name: 'Hilde', endDate: getEndDateAtUkReset('2025-05-07') },
]

function getEndDateAtUkReset(dateStr: string): string {
  const baseDate = new Date(`${dateStr}T00:00:00Z`)
  baseDate.setUTCDate(baseDate.getUTCDate() + 1)
  return baseDate.toISOString()
}

export default function CurrentlyPullable() {
  const characters = pullableCharacters.map(({ name, endDate }) => {

    const slug = toKebabCase(name)
    const filePath = path.resolve(process.cwd(), 'src/data/char', `${slug}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

    return {
      name,
      id: data.ID,
      slug,
      endDate,
      element: data.Element.toLowerCase(),
      class: data.Class.toLowerCase(),
      special: false,
    }
  })

  return <CurrentlyPullableClient characters={characters} />
}
