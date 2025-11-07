'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { marked } from 'marked'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import CharacterSelectorModal from './CharacterSelectorModal'
import ChainEffectIcons from './ChainEffectIcons'
import NotesEditor from '@/app/components/NotesEditor'
import _allCharacters from '@/data/_allCharacters.json'
import type { CharacterLite } from '@/types/types'
import { useI18n } from '@/lib/contexts/I18nContext'
import type { TeamSlot, TeamPlannerWrapperProps } from '@/types/team-planner'
import {
  isValidChainPosition,
  calculateCPPerTurn,
  encodeTeamToURL,
  decodeTeamFromURL
} from '@/utils/team-planner'

const characters = _allCharacters as CharacterLite[]

export default function TeamPlannerWrapper({ viewOnly = false }: TeamPlannerWrapperProps) {
  const { t } = useI18n()
  const searchParams = useSearchParams()

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
  const [shareSuccess, setShareSuccess] = useState(false)
  const [notes, setNotes] = useState('')

  // Parse Markdown notes to HTML for view-only mode
  const formattedNotes = useMemo(() => {
    if (!viewOnly || !notes) return ''
    return marked(notes, { breaks: true })
  }, [viewOnly, notes])

  // Charger l'équipe depuis l'URL au montage
  useEffect(() => {
    const loadTeam = async () => {
      const teamParam = searchParams.get('team')
      if (teamParam) {
        const decoded = await decodeTeamFromURL(teamParam)
        if (decoded) {
          setTeam(decoded.team)
          setChainOrder(decoded.chainOrder)
          setNotes(decoded.notes)
        }
      }
    }
    loadTeam()
  }, [searchParams])

  const handleOpenModal = (position: number) => {
    if (viewOnly) return
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

  const removeCharacter = (position: number) => {
    if (viewOnly) return

    setTeam(prevTeam =>
      prevTeam.map(slot =>
        slot.position === position
          ? { ...slot, characterId: null, characterName: null }
          : slot
      )
    )
  }

  const handleChainSlotClick = (chainIndex: number) => {
    if (viewOnly) return
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

  const handleShareTeam = async () => {
    const hasAnyCharacter = team.some(slot => slot.characterId !== null)
    if (!hasAnyCharacter) return

    // Créer l'URL avec les notes incluses, pointant vers la page view-only
    const encoded = await encodeTeamToURL(team, chainOrder, notes)
    const baseUrl = window.location.origin + '/team-planner/view'
    const shareUrl = `${baseUrl}?team=${encoded}`

    console.log('Sharing team with notes:', notes)
    console.log('Encoded URL:', shareUrl)

    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  // Calculer le CP par tour pour un personnage donné
  const getCharacterCPPerTurn = (characterId: string | null): number => {
    if (!characterId) return 0

    const character = characters.find(c => c.ID === characterId)
    if (!character?.Element) return 4

    const sameElementCount = team.filter(t => {
      if (!t.characterId) return false
      const char = characters.find(c => c.ID === t.characterId)
      return char?.Element === character.Element
    }).length

    return calculateCPPerTurn(sameElementCount)
  }

  // Calculer la moyenne des CP par tour de l'équipe
  const getAverageCPPerTurn = (): number => {
    const activeSlots = team.filter(t => t.characterId !== null)
    if (activeSlots.length === 0) return 0

    const totalCP = activeSlots.reduce((sum, slot) => {
      return sum + getCharacterCPPerTurn(slot.characterId)
    }, 0)

    return totalCP / activeSlots.length
  }

  const renderCharacterSlot = (position: number) => {
    const slot = team.find(s => s.position === position)
    if (!slot) return null

    // Trouver le personnage pour obtenir la rareté
    const character = slot.characterId
      ? characters.find(c => c.ID === slot.characterId)
      : null

    // Calculer le CP par tour basé sur le nombre de personnages du même élément
    const cpPerTurn = getCharacterCPPerTurn(slot.characterId)

    return (
      <div className={`relative flex-shrink-0 ${viewOnly ? '' : 'cursor-pointer group'}`}>
        <div onClick={() => handleOpenModal(slot.position)}>
          {slot.characterId && character ? (
            <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px]">
              <CharacterPortrait
                characterId={slot.characterId}
                characterName={slot.characterName || 'Unknown'}
                size={70}
                className={`rounded-lg border-2 border-gray-600 bg-gray-900 ${viewOnly ? '' : 'hover:border-cyan-500'} transition-colors sm:!w-[80px] sm:!h-[80px]`}
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
            <div className={`w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] flex items-center justify-center bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 ${viewOnly ? '' : 'hover:border-cyan-500'} transition-colors`}>
              <div className="text-center">
                <div className={`text-xl sm:text-2xl text-gray-600 ${viewOnly ? '' : 'group-hover:text-cyan-500'} transition-colors`}>
                  +
                </div>
              </div>
            </div>
          )}
          {/* Remove character button - only show when slot has a character */}
          {slot.characterId && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeCharacter(position)
              }}
              className="absolute -top-2 -left-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white border-2 border-gray-900 z-10 transition-colors cursor-pointer"
              title={`Remove character from position ${position}`}
            >
              ×
            </button>
          )}
        </div>

        {/* CP per turn display */}
        {slot.characterId && character && (
          <div className="mt-1 text-center text-[10px] sm:text-xs font-semibold text-gray-300">
            CP per turn: {cpPerTurn}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Configuration */}
      <section className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 lg:p-8 border border-gray-700">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t('teamPlanner.teamConfiguration')}</h2>

          {/* Share/Edit Button */}
          {team.some(slot => slot.characterId !== null) && (
            viewOnly ? (
              <Link
                href={`/team-planner?team=${searchParams.get('team')}`}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </Link>
            ) : (
              <button
                onClick={handleShareTeam}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                {shareSuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </>
                )}
              </button>
            )
          )}
        </div>

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

          {/* Average CP Display */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-sm sm:text-base font-semibold text-gray-400">Average CP/turn</div>
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400">
              {getAverageCPPerTurn().toFixed(1)}
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
                const isValidPosition = isValidChainPosition(character?.Chain_Type, chainIndex)

                return (
                  <div key={`chain-${chainIndex}-pos-${position}`} className="flex flex-col items-center gap-2 flex-shrink-0">
                    {/* Chain slot with mask - clickable */}
                    <div
                      className={`relative w-[50px] h-[150px] sm:w-[60px] sm:h-[180px] ${viewOnly ? '' : 'cursor-pointer hover:scale-102'} transition-all`}
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
                                transform: 'scale(1.7)',
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
                              isDisabled={!isValidPosition}
                            />
                          )}

                          {/* Chain Type Text */}
                          {character?.Chain_Type && (
                            <div className={`absolute bottom-0 left-0 right-0 z-20 px-0.5 py-0.5 sm:px-1 sm:py-1 rounded text-[8px] sm:text-[10px] font-semibold text-center leading-tight whitespace-pre-line ${
                              isValidPosition
                                ? 'bg-blue-600/80 text-white'
                                : 'bg-gray-700/80 text-gray-300'
                            }`}>
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

        {/* Formatted Notes in View-Only Mode */}
        {viewOnly && notes && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">Notes</h3>
            <div
              className="prose prose-invert prose-sm sm:prose-base max-w-none [&_a]:text-red-400 [&_a:hover]:text-red-200 [&_a]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: formattedNotes }}
            />
          </div>
        )}
      </section>

      {/* Notes Section - Hidden in View-Only Mode */}
      {!viewOnly && (
        <section className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-700">
          <NotesEditor
            notes={notes}
            onNotesChange={setNotes}
            viewOnly={viewOnly}
          />
        </section>
      )}

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
