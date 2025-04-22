import Link from 'next/link'
import { toKebabCase } from '@/utils/formatText'
import fs from 'fs'
import path from 'path'

export default function CurrentlyPullable() {
  const pullableNames = ['K', 'Rhona']

  const characters = pullableNames.map((name) => {
    const slug = toKebabCase(name)
    const filePath = path.resolve(process.cwd(), 'src/data/char', `${slug}.json`)
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return { name, id: data.ID, slug }
  })

  return (
    <section className="flex flex-col items-end space-y-4">
  <h2 className="text-2xl font-extrabold tracking-wide text-white relative">
    <span className="z-10 relative">Currently Pullable</span>
    <span className="absolute left-0 -bottom-1 w-3/4 h-1 bg-cyan-600 opacity-70 rounded" />
  </h2>

  <div className="flex gap-10 justify-end">
    {characters.map(({ name, id, slug }) => (
      <Link key={name} href={`/characters/${slug}`}>
        <div className="bg-gray-800 hover:bg-gray-700 rounded-xl overflow-hidden shadow-lg cursor-pointer transition transform hover:scale-105">
          <img
            src={`/images/characters/portrait/CT_${id}.png`}
            alt={name}
            className="w-full h-48 object-cover"
          />
          <div className="text-center py-2 font-medium">{name}</div>
        </div>
      </Link>
    ))}
  </div>
</section>

  )
}
