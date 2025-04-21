import fs from 'fs/promises'
import path from 'path'
import { notFound } from 'next/navigation'

export default async function Head({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name).toLowerCase()
  const filePath = path.join(process.cwd(), 'src/data/char', `${name}.json`)

  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const character = JSON.parse(raw)

    return (
      <>
        <title>{character.Fullname} - Outerpedia</title>
        <meta name="description" content={`Discover ${character.Fullname}, a ${character.Class} in Outerplane.`} />
        <meta property="og:title" content={`${character.Fullname} - Outerpedia`} />
        <meta property="og:description" content={`Learn more about ${character.Fullname} in Outerplane.`} />
        <meta property="og:image" content={`https://outerpedia.com/images/characters/atb/IG_Turn_${character.ID}.png`} />
      </>
    )
  } catch {
    return notFound()
  }
}
