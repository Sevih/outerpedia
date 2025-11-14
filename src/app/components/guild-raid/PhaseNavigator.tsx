'use client'

import { useEffect, useRef } from 'react'

type Props = {
  currentPhase: 'phase1' | 'phase2'
  onPhaseChange: (phase: 'phase1' | 'phase2') => void
  phase2BossName: string
}

/**
 * Phase Navigation Tabs
 * Animated tab selector for Phase 1 and Phase 2
 */
export function PhaseNavigator({ currentPhase, onPhaseChange, phase2BossName }: Props) {
  const tabRef = useRef<HTMLButtonElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (tabRef.current && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = tabRef.current
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`
      indicatorRef.current.style.width = `${offsetWidth}px`
    }
  }, [currentPhase])

  const phases = [
    { key: 'phase1' as const, label: 'Phase 1 : Geas Bosses' },
    ...(phase2BossName ? [{ key: 'phase2' as const, label: `Phase 2 : ${phase2BossName}` }] : []),
  ]

  return (
    <div className="flex justify-center mb-6 mt-4">
      <div className="relative bg-[#1c1f26] rounded-full flex p-1 min-w-[240px]">
        <div
          ref={indicatorRef}
          className="absolute top-0 left-0 h-full rounded-full bg-sky-500 transition-all duration-300 z-0"
        />
        {phases.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onPhaseChange(key)}
            ref={(el) => {
              if (currentPhase === key) tabRef.current = el
            }}
            className={`relative z-10 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
              ${currentPhase === key ? 'text-white' : 'text-white/70'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
