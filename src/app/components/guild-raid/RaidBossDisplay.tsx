'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'
import { lRec } from '@/lib/localize'
import { BossPortrait, BossHeader, BossImmunities, BossSkillList } from '../boss'
import slugToCharJson from '@/data/_SlugToChar.json'
import type { BossData } from '@/types/boss'
import type { SlugToCharMap } from '@/types/pull'

const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap

type Props = {
  bossKey: string // Direct boss ID like "440400474-1-1"
}

export default function RaidBossDisplay({ bossKey }: Props) {
  const { lang } = useI18n()
  const [data, setData] = useState<BossData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Directly load the boss data file using the bossKey as the filename
    import(`@/data/boss/${bossKey}.json`)
      .then((mod) => {
        setData(mod.default || mod)
        setError(null)
      })
      .catch((err) => {
        console.error(`[RaidBossDisplay] Error loading ${bossKey}.json`, err)
        setError(`Boss data not found: ${bossKey}`)
      })
  }, [bossKey])

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-neutral-800 rounded-lg p-4 animate-pulse">
        <div className="h-8 bg-neutral-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
      </div>
    )
  }

  const bossName = lRec(data.Name, lang)
  const bossSurname = lRec(data.Surname, lang)
  const isCharacterPortrait = data.icons.startsWith('2')

  const characterFullName = isCharacterPortrait && SLUG_TO_CHAR[data.icons]
    ? lRec(SLUG_TO_CHAR[data.icons].Fullname, lang)
    : bossName

  return (
    <div className="rounded-lg overflow-hidden">
      <div className="relative bg-neutral-900/30 p-4 rounded-lg border border-neutral-700/30">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0">
          <div className="row-span-2">
            <BossPortrait
              icons={data.icons}
              bossName={bossName}
              characterFullName={characterFullName}
              size={isCharacterPortrait ? 'md' : 'lg'}
            />
          </div>

          <BossHeader
            bossName={bossName}
            bossSurname={bossSurname}
            className={data.class}
            element={data.element}
            level={data.level}
          />
        </div>

        <div className="mt-3">
          <BossImmunities
            buffImmune={data.BuffImmune}
            statBuffImmune={data.StatBuffImmune}
          />
        </div>
      </div>

      <div className="mt-4">
        <BossSkillList skills={data.skills} />
      </div>
    </div>
  )
}