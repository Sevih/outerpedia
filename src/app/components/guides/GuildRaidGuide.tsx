'use client'

import { useState, useEffect, useRef } from 'react'
import VersionSelector from '@/app/components/VersionSelector'
import parseText from '@/utils/parseText'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'
import Image from 'next/image'
import RecommendedTeam from '@/app/components/RecommendedTeamCarousel'
import GeasCard, { Geas } from '@/app/components/GeasCard'
import TeamTabSelectorWithGeas from '@/app/components/TeamTabSelectorWithGeas'

type CharacterRef = {
  name: string
  comment?: string
}

type Phase1Boss = {
  id: string
  name: string
  geas: Record<string, { bonus: Geas; malus: Geas }>
  notes: string[]
  recommended: CharacterRef[]
  team: string[][]
  video?: { id: string; title: string }
}

type Phase2Team = {
  label: string
  icon: string
  setup: string[][]
  note?: ({ type: 'p'; string: string } | { type: 'ul'; items: string[] })[]
  'geas-active'?: string[]
  video?: {
    id: string
    title: string
  }
}

export type GuildRaidGuideVersion = {
  label: string
  date: string
  phase1: {
    bosses: Phase1Boss[]
  }
  phase2: {
    bossName: string
    overview: string[]
    teams: Record<string, Phase2Team>
    video?: {
      id: string
      title: string
    }
  }
}

type Props = {
  guideData: Record<string, GuildRaidGuideVersion>
}

export default function GuildRaidGuide({ guideData }: Props) {
  const versionKeys = Object.keys(guideData)
  const [selected, setSelected] = useState(versionKeys[0])
  const version = guideData[selected]

  const [tab, setTab] = useState<'phase1' | 'phase2'>('phase1')
  const [activeBossIdx, setActiveBossIdx] = useState(0)

  const tabRef = useRef<HTMLButtonElement | null>(null)
  const indicatorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (tabRef.current && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = tabRef.current
      indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`
      indicatorRef.current.style.width = `${offsetWidth}px`
    }
  }, [tab])

  const boss = version.phase1.bosses[activeBossIdx]
  const boss2 = version.phase2.bossName

  return (
    <div>
      <VersionSelector
        versions={Object.fromEntries(
          versionKeys.map((key) => [key, { label: guideData[key].label }])
        )}
        selected={selected}
        onSelect={setSelected}
      />

      {/* Tabs */}
      <div className="flex justify-center mb-6 mt-4">
        <div className="relative bg-[#1c1f26] rounded-full flex p-1 min-w-[240px]">
          <div
            ref={indicatorRef}
            className="absolute top-0 left-0 h-full rounded-full bg-sky-500 transition-all duration-300 z-0"
          />
          {(['phase1', ...(version.phase2?.bossName ? ['phase2'] as const : [])] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              ref={(el) => {
                if (tab === key) tabRef.current = el
              }}
              className={`relative z-10 px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200
        ${tab === key ? 'text-white' : 'text-white/70'}`}
            >
              {key === 'phase1' ? 'Phase 1 : Geas Bosses' : `Phase 2 : ${boss2}`}
            </button>
          ))}
        </div>
      </div>


      {/* PHASE 1 */}
      {tab === 'phase1' && (
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center md:items-start w-full md:max-w-[280px] shrink-0">
            <div className="text-white text-lg font-bold mb-2 text-center w-full">
              {boss.name}
            </div>

            <div className="flex gap-4 mb-4">
              {version.phase1.bosses.map((b, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => setActiveBossIdx(idx)}
                >
                  <div
                    className={`rounded-lg overflow-hidden border ${idx === activeBossIdx
                      ? 'border-sky-400'
                      : 'border-neutral-700 opacity-40 grayscale'
                      }`}
                  >
                    <Image
                      src={`/images/guides/guild-raid/T_Raid_SubBoss_${b.id}.png`}
                      alt={b.name}
                      width={130}
                      height={250}
                      priority
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 mt-4 w-full">
              {Object.entries(boss.geas).map(([level, entry]) => (
                <div key={level} className="flex flex-col items-center gap-2 w-full">
                  <div className="relative w-[60px] h-[28px] mx-auto">
                    <Image
                      src="/images/ui/geas/CM_Facility_Frame.webp"
                      alt={`Level ${level}`}
                      width={60}
                      height={28}
                      style={{ width: 60, height: 28 }}
                      className="object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                      {level}
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 flex-wrap">
                    {entry.bonus && <GeasCard geas={entry.bonus} type="bonus" />}
                    {entry.malus && <GeasCard geas={entry.malus} type="malus" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full">
            <ul className="list-disc list-inside text-neutral-300">
              {boss.notes.map((n, i) => (
                <li key={i}>{parseText(n)}</li>
              ))}
            </ul>

            <div>
              <p className="mb-1 font-semibold text-sky-300">Recommended Units:</p>
              <ul className="list-disc list-inside text-neutral-300">
                {boss.recommended.map((char, i) => (
                  <li key={i}>
                    <CharacterLinkCard name={char.name} />
                    {char.comment && (
                      <>
                        &nbsp;: {parseText(char.comment)}
                      </>
                    )}
                  </li>
                ))}
              </ul>

            </div>

            <RecommendedTeam team={boss.team} />

            {boss.video && (
              <>
                <h4 className="text-base font-semibold text-sky-200 mt-4 mb-1">Video</h4>
                <YoutubeEmbed videoId={boss.video.id} title={boss.video.title} />
              </>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2 */}
      {tab === 'phase2' && (
        <div>
          <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-3">
            Phase 2 — Overview
          </h3>

          <ul className="list-disc list-inside text-neutral-300 mb-4">
            {version.phase2.overview.map((line, i) => (
              <li key={i}>{parseText(line)}</li>
            ))}
          </ul>

          <TeamTabSelectorWithGeas
            teams={version.phase2.teams}
            bosses={version.phase1.bosses}
          />
        </div>
      )}
    </div>
  )
}
