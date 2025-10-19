'use client'

import Link from 'next/link'
import Image from 'next/image'
import Countdown from './Countdown'

import type { ElementType, ClassType } from '@/types/enums';
import { CharacterNameDisplay } from '@/app/components/CharacterNameDisplay'
import { ElementIcon } from '@/app/components/ElementIcon'
import { ClassIcon } from '@/app/components/ClassIcon'
import { useI18n } from '@/lib/contexts/I18nContext'

type Character = {
  name: string
  id: string
  rarity: number
  limited: boolean
  slug: string
  endDate: string
  element: string
  class: string
}

export default function CurrentlyPullableClient({ characters }: { characters: Character[]}) {
  const {t} = useI18n()
  return (
    <section className="flex flex-col items-center space-y-4">
      {/* Titre centré */}
      <h2 className="text-2xl font-extrabold tracking-wide text-white relative text-center">
        <span className="z-10 relative">{t('titles.main.pull')}</span>
        <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-3/4 h-1 bg-cyan-600 opacity-70 rounded" />
      </h2>

      {/* Cartes */}
      <div className="flex gap-5 justify-center flex-wrap">
        {/* Cartes personnages */}
        {characters.map(({ name, id, limited, rarity, slug, endDate, element, class: charClass }) => (
          <div key={id} className="flex flex-col items-center space-y-1">
            <Link
              href={`/characters/${slug}`}
              prefetch={false}
              className="relative w-[120px] h-[231px] text-center shadow hover:shadow-lg transition overflow-hidden rounded"
            >
              {limited && (
                <Image
                  src="/images/ui/CM_Shop_Tag_Limited.webp"
                  alt="Limited"
                  width={75}
                  height={30}
                  className="absolute top-1 left-1 z-30 object-contain"
                  style={{ width: 75, height: 30 }}
                />
              )}

              {/* Image du personnage */}
              <Image
                src={`/images/characters/portrait/CT_${id}.webp`}
                alt={name}
                width={120}
                height={231}
                style={{ width: 120, height: 231 }}
                className="object-cover rounded"
                priority
                unoptimized
              />

              {/* Étoiles fictives (remplace par ta logique réelle si tu veux) */}
              <div className="absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1">
                {[...Array(rarity)].map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.webp"
                    alt="star"
                    width={20}
                    height={20}
                    style={{ width: 20, height: 20 }}
                  />
                ))}
              </div>

              {/* Icône de classe */}
              <div className="absolute bottom-12.5 right-2 z-30">
                <ClassIcon className={charClass as ClassType} />
              </div>

              <div className="absolute bottom-5.5 right-1.5 z-30">
                <ElementIcon element={element as ElementType} />
              </div>

              {/* Nom du personnage en overlay bas */}
              <CharacterNameDisplay fullname={name} />

            </Link>

            {/* Countdown en dessous de la carte */}
            <Countdown endDate={endDate} element={element} />
          </div>
        ))}


        {/* Carte spéciale Discord toujours présente */}
        <div className="flex flex-col items-center space-y-1">
          <Link key="discord" href="https://discord.com/invite/keGhVQWsHv" target="_blank" rel="noopener noreferrer">
            <div className="bg-[#5865F2] hover:bg-[#4752c4] transition-all duration-300 transform hover:scale-105 rounded-xl overflow-hidden shadow-md w-[120px] h-[231px] flex flex-col items-center p-2 group">
              <div className="text-sm font-semibold text-white">Join Us!</div>
              <div className="relative w-full flex-1 flex flex-col items-center justify-center">
                <div className="relative w-[72px] h-[72px]">
                  <Image
                    src="/images/discord_icon.webp"
                    alt="EvaMains Discord Icon"
                    width={72}
                    height={72}
                    className="object-contain rounded-full shadow-md transition-all duration-300 group-hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.5)]"
                    sizes="72px"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-2 font-bold text-white text-sm">
                EvaMains <br /> Discord
              </div>
            </div>
          </Link>
        </div>

      </div>
    </section>
  )
}
