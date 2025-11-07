'use client'

import React from 'react'
import Image from 'next/image'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import type { CharacterLite } from '@/types/types'

interface CharacterGridProps {
  characters: CharacterLite[]
  onSelectCharacter: (characterId: string, characterName: string) => void
}

export default function CharacterGrid({
  characters,
  onSelectCharacter
}: CharacterGridProps) {
  if (characters.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No characters found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
      {characters.map((char) => (
        <button
          key={char.ID}
          onClick={() => onSelectCharacter(char.ID, char.Fullname)}
          className="relative flex-shrink-0 text-center transition hover:scale-105"
        >
          <div className="relative">
            <CharacterPortrait
              characterId={char.ID}
              characterName={char.Fullname}
              size={80}
              className="rounded-lg border-2 border-gray-600 bg-gray-900 hover:border-cyan-500 transition-colors w-full h-auto"
              showIcons={true}
            />
            {/* Rarity Stars */}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center items-center -space-x-1">
              {Array(char.Rarity)
                .fill(0)
                .map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.webp"
                    alt="star"
                    width={17}
                    height={17}
                    className="w-[14px] h-[14px] sm:w-[17px] sm:h-[17px]"
                  />
                ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
