'use client'

import React from 'react'
import Image from 'next/image'
import type { EffectCategory, GroupedEffects, EffectData } from '@/types/team-planner'

interface EffectFilterDropdownProps {
  isOpen: boolean
  groupedEffects: GroupedEffects
  selectedEffects: {name: string; type: 'buff' | 'debuff'}[]
  effectCategories: {
    buff: EffectCategory
    debuff: EffectCategory
  }
  onToggleEffect: (effectName: string, effectType: 'buff' | 'debuff') => void
  onClose: () => void
}

export default function EffectFilterDropdown({
  isOpen,
  groupedEffects,
  selectedEffects,
  effectCategories,
  onToggleEffect,
  onClose
}: EffectFilterDropdownProps) {
  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-600 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
      {/* BUFFS Section */}
      {Object.keys(groupedEffects.buffs).length > 0 && (
        <>
          <div className="px-2 py-1.5 text-[10px] font-semibold text-blue-400 uppercase tracking-wide bg-blue-900 sticky top-0 z-10">
            Buffs
          </div>
          {Object.entries(groupedEffects.buffs).map(([category, effects]) => {
            const categoryLabel = (effectCategories.buff as EffectCategory)[category]?.label || category
            return (
              <div key={`buff-${category}`}>
                <div className="px-3 py-1 text-[9px] text-gray-400 uppercase tracking-wide bg-gray-800/50">
                  {categoryLabel}
                </div>
                {effects.map((effect: EffectData) => {
                  const isSelected = selectedEffects.some(e => e.name === effect.name && e.type === 'buff')
                  return (
                    <button
                      key={effect.name}
                      type="button"
                      onClick={() => {
                        onToggleEffect(effect.name, 'buff')
                        onClose()
                      }}
                      disabled={isSelected}
                      className={`w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                        isSelected ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={`/images/ui/effect/${effect.icon}.webp`}
                          alt={effect.label}
                          width={16}
                          height={16}
                          className="w-4 h-4"
                          style={{
                            filter: 'brightness(0) saturate(100%) invert(47%) sepia(98%) saturate(1288%) hue-rotate(186deg) brightness(101%) contrast(101%)'
                          }}
                        />
                      </div>
                      <span className="text-white">
                        {effect.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </>
      )}

      {/* DEBUFFS Section */}
      {Object.keys(groupedEffects.debuffs).length > 0 && (
        <>
          <div className="px-2 py-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wide bg-red-900 sticky top-0 z-10 mt-1">
            Debuffs
          </div>
          {Object.entries(groupedEffects.debuffs).map(([category, effects]) => {
            const categoryLabel = (effectCategories.debuff as EffectCategory)[category]?.label || category
            return (
              <div key={`debuff-${category}`}>
                <div className="px-3 py-1 text-[9px] text-gray-400 uppercase tracking-wide bg-gray-800/50">
                  {categoryLabel}
                </div>
                {effects.map((effect: EffectData) => {
                  const isSelected = selectedEffects.some(e => e.name === effect.name && e.type === 'debuff')
                  return (
                    <button
                      key={effect.name}
                      type="button"
                      onClick={() => {
                        onToggleEffect(effect.name, 'debuff')
                        onClose()
                      }}
                      disabled={isSelected}
                      className={`w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-2 hover:bg-gray-800 transition-colors ${
                        isSelected ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={`/images/ui/effect/${effect.icon}.webp`}
                          alt={effect.label}
                          width={16}
                          height={16}
                          className="w-4 h-4"
                          style={{
                            filter: 'brightness(0) saturate(100%) invert(32%) sepia(98%) saturate(2618%) hue-rotate(344deg) brightness(92%) contrast(96%)'
                          }}
                        />
                      </div>
                      <span className="text-white">
                        {effect.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
