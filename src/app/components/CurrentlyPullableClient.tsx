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
    <section className="flex flex-col items-center space-y-4">
      {/* Titre centré */}
      <h2 className="text-2xl font-extrabold tracking-wide text-white relative text-center">
        <span className="z-10 relative">Currently Pullable</span>
        <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-3/4 h-1 bg-cyan-600 opacity-70 rounded" />
      </h2>

      {/* Cartes */}
      <div className="flex gap-5 justify-center flex-wrap">
        {/* Cartes personnages */}
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
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={`/images/ui/elem/${element}.png`}
                    alt={element}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                
                {/* Protection du nom */}
                <div className="max-w-[60px] overflow-hidden text-ellipsis whitespace-nowrap text-sm text-center">
                  {name}
                </div>
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={`/images/ui/class/${charClass}.png`}
                    alt={charClass}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <div className="text-center pb-2">
                <Countdown endDate={endDate} element={element} />
              </div>
            </div>
          </Link>
        ))}

        {/* Carte spéciale Discord toujours présente */}
        <Link key="discord" href="https://discord.gg/keGhVQWsHv" target="_blank" rel="noopener noreferrer">
          <div className="flex flex-col items-center gap-2">
            
            <div className="bg-[#5865F2] hover:bg-[#4752c4] transition-all duration-300 transform hover:scale-105 rounded-xl overflow-hidden shadow-md w-[120px] h-[260px] flex flex-col items-center p-2 group">
            <div className="text-sm font-semibold text-white">Join Us!</div>
              <div className="relative w-full h-48 flex flex-col items-center justify-center">
                <div className="relative">
                  <Image
                    src="https://cdn.discordapp.com/icons/1264787916660670605/a_11616731e482ae93422c8761ab9a3169.gif"
                    alt="EvaMains Discord Icon"
                    width={72}
                    height={72}
                    className="rounded-full shadow-md transition-all duration-300 group-hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.5)]"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-2 font-bold text-white text-sm">
                EvaMains <br /> Discord
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
