'use client'

import React from 'react'
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
          <CharacterPortrait
            characterId={char.ID}
            characterName={char.Fullname}
            size={80}
            className="rounded-lg border-2 border-gray-600 bg-gray-900 hover:border-cyan-500 transition-colors w-full h-auto"
            showIcons={true}
            showStars={true}
          />
        </button>
      ))}
    </div>
  )
}
