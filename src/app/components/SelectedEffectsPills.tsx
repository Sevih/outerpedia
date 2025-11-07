'use client'

import React from 'react'
import Image from 'next/image'
import type { EffectData, GroupedEffects } from '@/types/team-planner'

interface SelectedEffectsPillsProps {
  selectedEffects: string[]
  groupedEffects: GroupedEffects
  onRemoveEffect: (effectName: string) => void
}

export default function SelectedEffectsPills({
  selectedEffects,
  groupedEffects,
  onRemoveEffect
}: SelectedEffectsPillsProps) {
  if (selectedEffects.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {selectedEffects.map(effectName => {
        // Find the effect in buffs or debuffs
        let effect: EffectData | null = null
        for (const effects of Object.values(groupedEffects.buffs)) {
          effect = effects.find((e: EffectData) => e.name === effectName) || null
          if (effect) break
        }
        if (!effect) {
          for (const effects of Object.values(groupedEffects.debuffs)) {
            effect = effects.find((e: EffectData) => e.name === effectName) || null
            if (effect) break
          }
        }
        if (!effect) return null

        return (
          <div
            key={effectName}
            className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] rounded border ${
              effect.type === 'buff'
                ? 'bg-blue-900/30 border-blue-600 text-blue-300'
                : 'bg-red-900/30 border-red-600 text-red-300'
            }`}
          >
            <Image
              src={`/images/ui/effect/${effect.icon}.webp`}
              alt={effect.label}
              width={12}
              height={12}
              className="w-3 h-3"
            />
            <span className="text-[9px] font-medium">{effect.label}</span>
            <button
              type="button"
              onClick={() => onRemoveEffect(effectName)}
              className="ml-0.5 text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
