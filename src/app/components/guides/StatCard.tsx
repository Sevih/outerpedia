'use client'

import { useState } from 'react'
import Image from 'next/image'
import stats from '@/data/stats.json'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import type { BuffName, DebuffName } from '@/types/effect-names'

type StatKey = keyof typeof stats

type StatCardProps = {
  abbr: StatKey
  desc: string
  details?: React.ReactNode
  effect?: {
    buff?: BuffName[]
    debuff?: DebuffName[]
  }
}

export default function StatCard({ abbr, desc, details, effect }: StatCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const stat = stats[abbr]

  if (!stat) return null

  const hasDetails = details || (effect?.buff && effect.buff.length > 0) || (effect?.debuff && effect.debuff.length > 0)

  return (
    <div className="group">
      <button
        onClick={() => hasDetails && setIsOpen(!isOpen)}
        disabled={!hasDetails}
        className={`w-full text-left transition-all duration-200 ${hasDetails ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className={`
          flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
          bg-gradient-to-r from-slate-800/80 to-slate-900/50
          ${hasDetails ? 'hover:from-slate-700/80 hover:to-slate-800/50 hover:border-slate-500' : ''}
          ${isOpen ? 'border-sky-500/50 from-slate-700/80 to-slate-800/50' : 'border-slate-700/50'}
        `}>
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 relative rounded-lg bg-slate-900/80 p-2 border border-slate-600/50">
            <Image
              src={`/images/ui/effect/${stat.icon}`}
              alt={stat.label}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-amber-400">{stat.label}</span>
              <span className="text-sm text-slate-400 font-mono">({abbr})</span>
            </div>
            <p className="text-sm text-slate-300 line-clamp-2">{desc}</p>
          </div>

          {/* Badges & Arrow */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Effect badges */}
            {effect && (
              <div className="hidden sm:flex items-center gap-1">
                {effect.buff && effect.buff.length > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-sky-900/50 text-sky-300 border border-sky-700/50">
                    +Buff
                  </span>
                )}
                {effect.debuff && effect.debuff.length > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-900/50 text-red-300 border border-red-700/50">
                    -Debuff
                  </span>
                )}
              </div>
            )}

            {/* Arrow */}
            {hasDetails && (
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && hasDetails && (
        <div className="mt-2 ml-4 pl-4 border-l-2 border-sky-500/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Associated effects */}
          {effect && (
            <div className="flex flex-wrap gap-4 py-2">
              {effect.buff && effect.buff.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-sky-400 uppercase tracking-wider">Associated Buffs</span>
                  <div className="flex flex-wrap gap-1">
                    {effect.buff.map((e) => (
                      <EffectInlineTag key={e} name={e} type="buff" />
                    ))}
                  </div>
                </div>
              )}
              {effect.debuff && effect.debuff.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-red-400 uppercase tracking-wider">Associated Debuffs</span>
                  <div className="flex flex-wrap gap-1">
                    {effect.debuff.map((e) => (
                      <EffectInlineTag key={e} name={e} type="debuff" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details */}
          {details && (
            <div className="text-sm text-slate-300 space-y-2 pb-2">
              {details}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Group wrapper component
type StatGroupProps = {
  title: string
  color: 'red' | 'blue' | 'green' | 'purple' | 'amber'
  children: React.ReactNode
}

const colorConfig = {
  red: {
    border: 'border-red-500',
    bg: 'from-red-950/30 to-transparent',
    text: 'text-red-400',
    glow: 'shadow-red-500/20'
  },
  blue: {
    border: 'border-blue-500',
    bg: 'from-blue-950/30 to-transparent',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  green: {
    border: 'border-green-500',
    bg: 'from-green-950/30 to-transparent',
    text: 'text-green-400',
    glow: 'shadow-green-500/20'
  },
  purple: {
    border: 'border-purple-500',
    bg: 'from-purple-950/30 to-transparent',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/20'
  },
  amber: {
    border: 'border-amber-500',
    bg: 'from-amber-950/30 to-transparent',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  }
}

export function StatGroup({ title, color, children }: StatGroupProps) {
  const c = colorConfig[color]

  return (
    <div className={`rounded-xl border-l-4 ${c.border} bg-gradient-to-r ${c.bg} p-4 shadow-lg ${c.glow}`}>
      <h3 className={`text-xl font-bold ${c.text} mb-4 flex items-center gap-2`}>
        <span className={`w-2 h-2 rounded-full bg-current`} />
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}
