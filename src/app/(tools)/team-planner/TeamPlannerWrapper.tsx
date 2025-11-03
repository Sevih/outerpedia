'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'

interface TeamSlot {
  position: number
  characterId: string | null
  characterName: string | null
}

export default function TeamPlannerWrapper() {
  const [team, /**setTeam*/ ] = useState<TeamSlot[]>([
    { position: 1, characterId: null, characterName: null },
    { position: 2, characterId: null, characterName: null },
    { position: 3, characterId: null, characterName: null },
    { position: 4, characterId: null, characterName: null },
  ])

  const renderCharacterSlot = (position: number) => {
    const slot = team.find(s => s.position === position)
    if (!slot) return null

    return (
      <div
        className="relative w-[120px] h-[120px] bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 hover:border-cyan-500 transition-colors cursor-pointer flex items-center justify-center group"
        onClick={() => {
          // TODO: Ouvrir le modal de sélection
          console.log(`Select character for position ${slot.position}`)
        }}
      >
        {slot.characterId ? (
          <CharacterPortrait
            characterId={slot.characterId}
            characterName={slot.characterName || 'Unknown'}
            size={120}
            className="rounded-lg"
          />
        ) : (
          <div className="text-center">
            <div className="text-3xl text-gray-600 group-hover:text-cyan-500 transition-colors mb-1">
              +
            </div>
            <div className="text-xs text-gray-500 group-hover:text-cyan-400 transition-colors">
              Add
            </div>
          </div>
        )}
        {/* Position number badge */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-900">
          {position}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Configuration */}
      <section className="bg-gray-800 rounded-lg shadow-md p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-8 text-white">Team Configuration</h2>

        <div className="flex items-center justify-center gap-16">
          {/* Left Side - Character positions in cross pattern */}
          <div className="relative" style={{ width: '360px', height: '360px' }}>
            {/* Position 1 - Left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              {renderCharacterSlot(1)}
            </div>

            {/* Position 2 - Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              {renderCharacterSlot(2)}
            </div>

            {/* Position 3 - Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {renderCharacterSlot(3)}
            </div>

            {/* Position 4 - Bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {renderCharacterSlot(4)}
            </div>

            {/* Center decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gray-900/30 border border-gray-700/50 flex items-center justify-center">
              <span className="text-xs text-gray-600">Team</span>
            </div>
          </div>

          {/* Right Side - Chain Slots */}
          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-gray-400 text-center">Skill Chain Order</h3>

            <div className="flex gap-3">
              {team.map((slot, index) => (
                <div key={slot.position} className="flex flex-col items-center gap-2">
                  {/* Chain position label */}
                  <div className="text-xs text-gray-500">
                    {index === 0 ? 'Start' : index === 3 ? 'Finish' : `${index + 1}`}
                  </div>

                  {/* Chain slot with mask */}
                  <div className="relative w-[80px] h-[180px] flex items-center justify-center">
                    {/* Background mask */}
                    <Image
                      src="/images/ui/teamBuilder/T_FX_SkillChain_Mask.png"
                      alt="Chain mask"
                      fill
                      className="object-contain opacity-20"
                    />

                    {/* Character portrait in slot */}
                    {slot.characterId ? (
                      <div className="relative z-10">
                        <CharacterPortrait
                          characterId={slot.characterId}
                          characterName={slot.characterName || 'Unknown'}
                          size={70}
                          className="rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="relative z-10 text-center">
                        <div className="text-2xl text-gray-700">?</div>
                      </div>
                    )}
                  </div>

                  {/* Chain label badge */}
                  {index === 0 && (
                    <Image
                      src="/images/ui/teamBuilder/IG_TextImg_SkillChain_Start.png"
                      alt="Start"
                      width={50}
                      height={16}
                      className="h-4 w-auto object-contain"
                    />
                  )}
                  {index === 3 && (
                    <Image
                      src="/images/ui/teamBuilder/IG_TextImg_SkillChain_Finish.png"
                      alt="Finish"
                      width={60}
                      height={16}
                      className="h-4 w-auto object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Restrictions */}
      <section className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Rules & Restrictions</h2>
        <p className="text-gray-400">
          Rule configuration interface will be implemented here.
        </p>
      </section>

      {/* Validation Results */}
      <section className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Validation Results</h2>
        <p className="text-gray-400">
          Team validation results will be displayed here.
        </p>
      </section>
    </div>
  )
}
