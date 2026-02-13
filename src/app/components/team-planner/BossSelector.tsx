'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import type { BossPreset } from '@/types/team-planner'
import { BOSS_CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/team-planner/bossPresets'

interface BossSelectorProps {
  selectedPresetId: string | null
  onSelectPreset: (preset: BossPreset | null) => void
  presets: BossPreset[]
}

export default function BossSelector({
  selectedPresetId,
  onSelectPreset,
  presets,
}: BossSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const selectedPreset = presets.find(p => p.id === selectedPresetId)

  // Group presets by category
  const groupedPresets = presets.reduce<Record<string, BossPreset[]>>((acc, preset) => {
    if (!acc[preset.category]) acc[preset.category] = []
    acc[preset.category].push(preset)
    return acc
  }, {})

  // Filter by search
  const filteredGroups = Object.entries(groupedPresets)
    .map(([category, categoryPresets]) => ({
      category,
      presets: search
        ? categoryPresets.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        : categoryPresets,
    }))
    .filter(g => g.presets.length > 0)

  return (
    <div ref={containerRef} className="relative mb-4">
      {/* Selected display / trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-left hover:border-gray-500 transition-colors"
      >
        <span className={selectedPreset ? 'text-white' : 'text-gray-500'}>
          {selectedPreset ? (
            <span className="flex items-center gap-2">
              {selectedPreset.imageUrl && (
                <span className="relative w-7 h-7 flex-shrink-0">
                  <Image
                    src={selectedPreset.imageUrl}
                    alt=""
                    fill
                    sizes="28px"
                    className="object-contain rounded"
                  />
                </span>
              )}
              {selectedPreset.element && (
                <span className="relative w-5 h-5 flex-shrink-0">
                  <Image
                    src={`/images/ui/elem/${selectedPreset.element.toLowerCase()}.webp`}
                    alt={selectedPreset.element}
                    fill
                    sizes="20px"
                    className="object-contain"
                  />
                </span>
              )}
              <span>{selectedPreset.name}</span>
              {selectedPreset.difficulty && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-300">
                  {DIFFICULTY_LABELS[selectedPreset.difficulty] ?? selectedPreset.difficulty}
                </span>
              )}
            </span>
          ) : (
            'Select a boss preset...'
          )}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Clear button */}
      {selectedPreset && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelectPreset(null)
            setIsOpen(false)
          }}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          title="Clear"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Search */}
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* Grouped presets */}
          {filteredGroups.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No presets found</div>
          ) : (
            filteredGroups.map(({ category, presets: categoryPresets }) => (
              <div key={category}>
                {/* Category header */}
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-400 bg-gray-800/50 sticky top-0">
                  {BOSS_CATEGORY_LABELS[category] ?? category}
                </div>
                {/* Preset items */}
                {categoryPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectPreset(preset)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                      preset.id === selectedPresetId ? 'bg-cyan-900/20 text-cyan-300' : 'text-gray-300'
                    }`}
                  >
                    {preset.imageUrl && (
                      <span className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={preset.imageUrl}
                          alt=""
                          fill
                          sizes="24px"
                          className="object-contain rounded"
                        />
                      </span>
                    )}
                    {preset.element && (
                      <span className="relative w-4 h-4 flex-shrink-0">
                        <Image
                          src={`/images/ui/elem/${preset.element.toLowerCase()}.webp`}
                          alt={preset.element}
                          fill
                          sizes="16px"
                          className="object-contain"
                        />
                      </span>
                    )}
                    <span className="flex-1 truncate">{preset.name}</span>
                    {preset.difficulty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">
                        {DIFFICULTY_LABELS[preset.difficulty] ?? preset.difficulty}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
