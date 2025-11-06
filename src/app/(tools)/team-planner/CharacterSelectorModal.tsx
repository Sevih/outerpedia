'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import type { CharacterLite } from '@/types/types'

interface CharacterSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (characterId: string, characterName: string) => void
  characters: CharacterLite[]
  selectedPosition: number
}

export default function CharacterSelectorModal({
  isOpen,
  onClose,
  onSelect,
  characters,
  selectedPosition,
}: CharacterSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setMounted(true)
    const element = document.getElementById('portal-root')
    setPortalElement(element)
    return () => setMounted(false)
  }, [])

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const filteredCharacters = useMemo(() => {
    if (!searchTerm) return characters

    const term = searchTerm.toLowerCase()
    return characters.filter(char =>
      char.Fullname.toLowerCase().includes(term) ||
      char.ID.toLowerCase().includes(term)
    )
  }, [characters, searchTerm])

  if (!isOpen || !mounted || !portalElement) return null

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[80vh] flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            Select Character for Position {selectedPosition}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {filteredCharacters.map((char) => (
              <button
                key={char.ID}
                onClick={() => {
                  onSelect(char.ID, char.Fullname)
                  onClose()
                }}
                className="relative flex-shrink-0 text-center transition hover:scale-105"
              >
                <div className="relative">
                  <CharacterPortrait
                    characterId={char.ID}
                    characterName={char.Fullname}
                    size={80}
                    className="rounded-lg border-2 border-gray-600 bg-gray-900 hover:border-cyan-500 transition-colors"
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
                        />
                      ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredCharacters.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No characters found
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, portalElement)
}
