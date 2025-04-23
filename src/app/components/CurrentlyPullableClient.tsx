'use client'

import Link from 'next/link'
import Image from 'next/image'
import Countdown from './Countdown'

type Character = {
  name: string
  id: string
  slug: string
  endDate: string
  element: string
  class: string
}

export default function CurrentlyPullableClient({ characters }: { characters: Character[] }) {
  return (
    <section className="flex flex-col items-end space-y-4">
      <h2 className="text-2xl font-extrabold tracking-wide text-white relative">
        <span className="z-10 relative">Currently Pullable</span>
        <span className="absolute left-0 -bottom-1 w-3/4 h-1 bg-cyan-600 opacity-70 rounded" />
      </h2>

      <div className="flex gap-10 justify-end">
        {characters.map(({ name, id, slug, endDate, element, class: charClass }) => (
          <Link key={name} href={`/characters/${slug}`}>
            <div className="bg-gray-800 hover:bg-gray-700 rounded-xl overflow-hidden shadow-lg cursor-pointer transition transform hover:scale-105 w-[120px]">
              <div className="relative w-full h-48">
                <Image
                  src={`/images/characters/portrait/CT_${id}.png`}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
              <div className="flex items-center justify-center gap-2 py-2 font-medium text-white">
                <Image
                  src={`/images/ui/elem/${element}.png`}
                  alt={element}
                  width={20}
                  height={20}
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                  unoptimized
                />
                <span>{name}</span>
                <Image
                  src={`/images/ui/class/${charClass}.png`}
                  alt={charClass}
                  width={20}
                  height={20}
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                  unoptimized
                />
              </div>
              <div className="text-center pb-2">
                <Countdown endDate={endDate} element={element} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
