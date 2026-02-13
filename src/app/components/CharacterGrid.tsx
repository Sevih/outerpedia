'use client'

import React from 'react'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import type { CharacterLite } from '@/types/types'
import type { CharacterRelevanceMap } from '@/types/team-planner'

interface CharacterGridProps {
  characters: CharacterLite[]
  onSelectCharacter: (characterId: string, characterName: string) => void
  relevanceMap?: CharacterRelevanceMap
}

export default function CharacterGrid({
  characters,
  onSelectCharacter,
  relevanceMap,
}: CharacterGridProps) {
  if (characters.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No characters found
      </div>
    )
  }

  // Sort: relevant characters first (by score desc), forbidden last
  const sortedCharacters = relevanceMap && relevanceMap.size > 0
    ? [...characters].sort((a, b) => {
        const ra = relevanceMap.get(a.ID)
        const rb = relevanceMap.get(b.ID)
        const sa = ra?.score ?? 0
        const sb = rb?.score ?? 0
        // Forbidden (negative score) goes to the end
        if (sa < 0 && sb >= 0) return 1
        if (sb < 0 && sa >= 0) return -1
        // Higher score first
        return sb - sa
      })
    : characters

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
      {sortedCharacters.map((char) => {
        const relevance = relevanceMap?.get(char.ID)
        const isForbidden = relevance && relevance.score < 0
        const isRelevant = relevance && relevance.score > 0

        return (
          <button
            key={char.ID}
            onClick={() => onSelectCharacter(char.ID, char.Fullname)}
            className={`relative flex-shrink-0 text-center transition hover:scale-105 ${
              isForbidden ? 'opacity-40' : ''
            }`}
          >
            <CharacterPortrait
              characterId={char.ID}
              characterName={char.Fullname}
              size={80}
              className={`rounded-lg border-2 bg-gray-900 transition-colors w-full h-auto ${
                isForbidden
                  ? 'border-red-500/50 grayscale'
                  : isRelevant
                    ? 'border-green-500 hover:border-green-400'
                    : 'border-gray-600 hover:border-cyan-500'
              }`}
              showIcons={true}
              showStars={true}
            />
            {/* Relevance badge — only show count when satisfying require_* rules */}
            {isRelevant && relevance.satisfiesRules.length > 0 && (
              <span className="absolute -top-1 -right-1 z-10 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-green-600 rounded-full border border-gray-900">
                {relevance.satisfiesRules.length}
              </span>
            )}
            {/* Forbidden indicator */}
            {isForbidden && (
              <span className="absolute -top-1 -right-1 z-10 w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full border border-gray-900">
                ✕
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
