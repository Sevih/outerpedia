'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import CharacterSelectorModal from './CharacterSelectorModal'
import ChainEffectIcons from './ChainEffectIcons'
import _allCharacters from '@/data/_allCharacters.json'
import type { CharacterLite } from '@/types/types'
import { useI18n } from '@/lib/contexts/I18nContext'

const characters = _allCharacters as CharacterLite[]

interface TeamSlot {
  position: number
  characterId: string | null
  characterName: string | null
}

export default function TeamPlannerWrapper() {
  const { t } = useI18n()

  const [team, setTeam] = useState<TeamSlot[]>([
    { position: 1, characterId: null, characterName: null },
    { position: 2, characterId: null, characterName: null },
    { position: 3, characterId: null, characterName: null },
    { position: 4, characterId: null, characterName: null },
  ])

  // Ordre de la skill chain (indices des positions, pas les positions elles-mêmes)
  const [chainOrder, setChainOrder] = useState<number[]>([1, 2, 3, 4])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [selectedChainIndex, setSelectedChainIndex] = useState<number | null>(null)

  const handleOpenModal = (position: number) => {
    setSelectedPosition(position)
    setIsModalOpen(true)
  }

  const handleSelectCharacter = (characterId: string, characterName: string) => {
    if (selectedPosition === null) return

    setTeam(prevTeam =>
      prevTeam.map(slot =>
        slot.position === selectedPosition
          ? { ...slot, characterId, characterName }
          : slot
      )
    )
  }

  const handleChainSlotClick = (chainIndex: number) => {
    if (selectedChainIndex === null) {
      // Première sélection
      setSelectedChainIndex(chainIndex)
    } else {
      // Deuxième sélection : échanger les positions
      const newOrder = [...chainOrder]
      const temp = newOrder[selectedChainIndex]
      newOrder[selectedChainIndex] = newOrder[chainIndex]
      newOrder[chainIndex] = temp

      setChainOrder(newOrder)
      setSelectedChainIndex(null)
    }
  }

  const renderCharacterSlot = (position: number) => {
    const slot = team.find(s => s.position === position)
    if (!slot) return null

    // Trouver le personnage pour obtenir la rareté
    const character = slot.characterId
      ? characters.find(c => c.ID === slot.characterId)
      : null

    return (
      <div
        className="relative flex-shrink-0 cursor-pointer group"
        onClick={() => handleOpenModal(slot.position)}
      >
        {slot.characterId && character ? (
          <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
            <CharacterPortrait
              characterId={slot.characterId}
              characterName={slot.characterName || 'Unknown'}
              size={70}
              className="rounded-lg border-2 border-gray-600 bg-gray-900 hover:border-cyan-500 transition-colors sm:!w-[80px] sm:!h-[80px]"
              showIcons={false}
            />
            {/* Element Icon */}
            {character.Element && (
              <Image
                src={`/images/ui/elem/${character.Element.toLowerCase()}.webp`}
                alt={character.Element}
                width={24}
                height={24}
                className="absolute top-0 right-0 drop-shadow-md z-10 w-[20px] h-[20px] sm:w-[24px] sm:h-[24px]"
              />
            )}
            {/* Class Icon */}
            {character.Class && (
              <Image
                src={`/images/ui/class/${character.Class.toLowerCase()}.webp`}
                alt={character.Class}
                width={24}
                height={24}
                className="absolute top-[18px] right-0 drop-shadow-md z-10 w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] sm:top-[22px]"
              />
            )}
            {/* Rarity Stars */}
            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex justify-center items-center -space-x-1">
              {Array(character.Rarity)
                .fill(0)
                .map((_, i) => (
                  <Image
                    key={i}
                    src="/images/ui/star.webp"
                    alt="star"
                    width={15}
                    height={15}
                    className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]"
                  />
                ))}
            </div>
          </div>
        ) : (
          <div className="w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] flex items-center justify-center bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 hover:border-cyan-500 transition-colors">
            <div className="text-center">
              <div className="text-xl sm:text-2xl text-gray-600 group-hover:text-cyan-500 transition-colors">
                +
              </div>
            </div>
          </div>
        )}
        {/* Position number badge */}
        <div className="absolute -top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-cyan-600 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white border-2 border-gray-900 z-10">
          {position}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Configuration */}
      <section className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 lg:p-8 border border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-white">{t('teamPlanner.teamConfiguration')}</h2>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Left Side - Character positions in cross pattern */}
          <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] flex-shrink-0">
            {/* Position 1 - Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {renderCharacterSlot(1)}
            </div>

            {/* Position 2 - Top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              {renderCharacterSlot(2)}
            </div>

            {/* Position 3 - Bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              {renderCharacterSlot(3)}
            </div>

            {/* Position 4 - Left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              {renderCharacterSlot(4)}
            </div>

            {/* Center decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gray-900/30 border border-gray-700/50 flex items-center justify-center">
              <span className="text-xs text-gray-600">{t('teamPlanner.team')}</span>
            </div>
          </div>

          {/* Right Side - Chain Slots */}
          <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-400 text-center">{t('teamPlanner.skillChainOrder')}</h3>

            <div className="flex gap-2 sm:gap-3 justify-center ">
              {chainOrder.map((position, chainIndex) => {
                const slot = team.find(s => s.position === position)
                const character = slot?.characterId
                  ? characters.find(c => c.ID === slot.characterId)
                  : null

                const isSelected = selectedChainIndex === chainIndex

                return (
                  <div key={`chain-${chainIndex}-pos-${position}`} className="flex flex-col items-center gap-2 flex-shrink-0">
                    {/* Chain slot with mask - clickable */}
                    <div
                      className="relative w-[76px] h-[150px] sm:w-[88px] sm:h-[180px] cursor-pointer transition-all hover:scale-102"
                      onClick={() => handleChainSlotClick(chainIndex)}
                    >
                      {/* Background mask */}
                      <Image
                        src="/images/ui/teamBuilder/T_FX_SkillChain_Mask.png"
                        alt="Chain mask"
                        fill
                        className="object-contain opacity-20"
                      />

                      {/* Character portrait in slot */}
                      {slot?.characterId ? (
                        <>
                          <div className={`absolute inset-0 z-10 overflow-hidden rounded-lg ${
                            isSelected ? 'ring-2 ring-cyan-500' : ''
                          }`}>
                            <div
                              className="relative w-full h-full"
                              style={{
                                transform: 'scale(1.17)',
                                transformOrigin: 'center center'
                              }}
                            >
                              <Image
                                src={`/images/characters/portrait/CT_${slot.characterId}.webp`}
                                alt={slot.characterName || 'Character'}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>

                          {/* Chain Skill Effect Icons at top */}
                          {character?.effectsBySource?.SKT_CHAIN_PASSIVE && (
                            <ChainEffectIcons
                              buffs={character.effectsBySource.SKT_CHAIN_PASSIVE.buff}
                              debuffs={character.effectsBySource.SKT_CHAIN_PASSIVE.debuff}
                              maxIcons={2}
                            />
                          )}

                          {/* Chain Type Text */}
                          {character?.Chain_Type && (
                            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gray-900/80 px-1 py-1 rounded text-[10px] sm:text-[10px] font-semibold text-white text-center leading-tight whitespace-pre-line">
                              {character.Chain_Type === 'Start'
                                ? t('teamPlanner.starterExclusive')
                                : character.Chain_Type === 'Finish'
                                ? t('teamPlanner.finisherExclusive')
                                : t('teamPlanner.companion')}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                          <div className="text-xl sm:text-2xl text-gray-700">?</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Restrictions */}
      <section className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">{t('teamPlanner.rulesRestrictions')}</h2>
        <p className="text-gray-400">
          {t('teamPlanner.rulesPlaceholder')}
        </p>
      </section>

      {/* Validation Results */}
      <section className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">{t('teamPlanner.validationResults')}</h2>
        <p className="text-gray-400">
          {t('teamPlanner.validationPlaceholder')}
        </p>
      </section>

      {/* Character Selection Modal */}
      <CharacterSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectCharacter}
        characters={characters}
        selectedPosition={selectedPosition || 1}
        excludeCharacterIds={team
          .filter(slot => slot.characterId !== null && slot.position !== selectedPosition)
          .map(slot => slot.characterId as string)
        }
      />
    </div>
  )
}
