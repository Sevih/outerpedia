import { notFound } from 'next/navigation'
import characters from '@/data/characters.json'
import Image from 'next/image'
import type { Metadata } from 'next'

export default async function CharacterDetailPage(params: { params: { name: string } }) {
  const name = params.params.name.toLowerCase()
  const character = characters.find((c) => c.name.toLowerCase() === name)

  if (!character) return notFound()

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">{character.name}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative rounded overflow-hidden shadow">
          <Image
            src={character.fullArt}
            alt={character.name}
            width={400}
            height={600}
            className="object-contain"
          />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <Image
              src={`/images/ui/elem/${character.element.toLowerCase()}.png`}
              alt={character.element}
              width={24}
              height={24}
            />
            <Image
              src={`/images/ui/class/${character.class.toLowerCase()}.png`}
              alt={character.class}
              width={24}
              height={24}
            />
            <Image
              src={`/images/ui/class/${character.subclass.toLowerCase()}.png`}
              alt={character.subclass}
              width={24}
              height={24}
            />
            <span className="text-lg">{character.element} • {character.class} • {character.subclass}</span>
          </div>

          <div>
            <strong>Rarity:</strong>{' '}
            {[...Array(character.rarity)].map((_, i) => (
              <Image
                key={i}
                src="/images/ui/star.png"
                alt="star"
                width={20}
                height={20}
                className="inline-block -ml-1 first:ml-0"
              />
            ))}
          </div>

          {character.buffs?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mt-4 mb-1">Buffs</h2>
              <ul className="list-disc list-inside">
                {character.buffs.map((buff, i) => (
                  <li key={i}>{typeof buff === 'string' ? buff : buff.label}</li>
                ))}
              </ul>
            </div>
          )}

          {character.debuffs?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mt-4 mb-1">Debuffs</h2>
              <ul className="list-disc list-inside">
                {character.debuffs.map((debuff, i) => (
                  <li key={i}>{typeof debuff === 'string' ? debuff : debuff.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata(
    { params }: { params: { name: string } }
  ): Promise<Metadata> {
    const name = params.name.toLowerCase()
    const character = characters.find((c) => c.name.toLowerCase() === name)
  
    if (!character) {
      return { title: 'Outerpedia' }
    }
  
    return {
      title: `Outerpedia : ${character.name}`
    }
  }
  