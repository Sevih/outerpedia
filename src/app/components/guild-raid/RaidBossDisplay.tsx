'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'
import { lRec } from '@/lib/localize'
import { getT } from '@/i18n'
import BuffDebuffDisplayMini from '../BuffDebuffDisplayMini'
import BuffDebuffDisplay from '../BuffDebuffDisplay'
import { CharacterPortrait } from '../CharacterPortrait'
import { SkillDescription } from '../SkillDescriptionParser'
import slugToCharJson from '@/data/_SlugToChar.json'
import type { BossData } from '@/types/boss'
import type { SlugToCharMap } from '@/types/pull'
import ClassInlineTag from '../ClassInlineTag'
import ElementInlineTag from '../ElementInline'

const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap

type Props = {
  bossKey: string // Direct boss ID like "440400474-1-1"
  modeKey?: string | string[] // Not used for guild raid, kept for compatibility
  defaultBossId?: string // Not used for guild raid, kept for compatibility
  defaultModeKey?: string // Not used for guild raid, kept for compatibility
  labelFilter?: string | string[] // Not used for guild raid, kept for compatibility
  onModeChange?: (mode: string) => void // Not used for guild raid, kept for compatibility
  onBossChange?: (bossId: string) => void // Not used for guild raid, kept for compatibility
}

export default function RaidBossDisplay({ bossKey }: Props) {
  const { lang } = useI18n()
  const t = getT(lang)
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
  const portrait = `/images/characters/boss/portrait/MT_${data.icons}.webp`
  const isCharacterPortrait = data.icons.startsWith('2')

  // Récupérer le nom complet du personnage depuis slugToChar si c'est un portrait de personnage
  const characterFullName = isCharacterPortrait && SLUG_TO_CHAR[data.icons]
    ? lRec(SLUG_TO_CHAR[data.icons].Fullname, lang)
    : bossName

  // Fusionner BuffImmune et StatBuffImmune dans une seule liste
  const allImmunities = [
    ...(data.BuffImmune ? data.BuffImmune.split(',').map(s => s.trim()).filter(Boolean) : []),
    ...(data.StatBuffImmune ? data.StatBuffImmune.split(',').map(s => s.trim()).filter(Boolean) : [])
  ]

  // Vérifier si c'est un mode Story pour afficher la localisation
  const isStoryMode = data.location ? (() => {
    const mode = lRec(data.location.mode, lang);
    return mode === 'Story (Normal)' || mode === 'Story (Hard)';
  })() : false;

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Header with portrait and basic info */}
      <div className="relative bg-neutral-900/30 p-4 rounded-lg border border-neutral-700/30">
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0">
          {/* Portrait - spans 2 rows */}

          {isCharacterPortrait ? (
            <div className="row-span-2 relative w-20 h-20 rounded-lg overflow-hidden border-2 border-neutral-600">
              <CharacterPortrait
                characterId={data.icons}
                characterName={characterFullName}
                size={80}
              />
            </div>
          ) : (
            <div className="row-span-2 relative w-24 h-24 rounded-lg overflow-hidden border-2 border-neutral-600">
              <Image
                src={portrait}
                alt={bossName}
                fill
                className="object-cover"
                sizes="96px"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = portrait.replace('.webp', '.png')
                }}
              />
            </div>
          )}


          {/* Top row: surname, class, element, level */}
          <div className="flex flex-wrap gap-2 items-end text-sm">
            {bossSurname && <span className="text-neutral-400">{bossSurname}</span>}
            <span className="hidden sm:inline">
              <ClassInlineTag name={data.class} />
            </span>
            <span className="sm:hidden">
              <ClassInlineTag name={data.class} notext />
            </span>
            <span className="hidden sm:inline">
              <ElementInlineTag element={data.element.toLowerCase()} />
            </span>
            <span className="sm:hidden">
              <ElementInlineTag element={data.element.toLowerCase()} notext />
            </span>
            <span className="text-neutral-400">Level {data.level}</span>
          </div>

          {/* Bottom row: name */}
          <h3 className="text-2xl font-bold text-white self-end">{bossName}</h3>
        </div>

        {/* Immunities below portrait */}
        <div className="mt-3 flex flex-col gap-2">
          {isStoryMode && (
            <div className="text-sm text-neutral-300">
              {lRec(data.location.area_id, lang)} - {lRec(data.location.dungeon, lang)}
            </div>
          )}
          {allImmunities.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-xs text-neutral-400 font-semibold">{t('boss.immunities')}</div>
              <div className="flex flex-wrap gap-1">
                {allImmunities.map((effectKey, index) => {
                  // Si la clé commence par ST_, ajouter le préfixe BT_STAT|
                  const formattedKey = effectKey.startsWith('ST_') ? `BT_STAT|${effectKey}` : effectKey
                  return <BuffDebuffDisplayMini key={index} debuffs={[formattedKey]} />
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-4 space-y-2">
        {data.skills
          .filter((skill) => {
            const skillName = lRec(skill.name, lang)
            const skillDesc = lRec(skill.description, lang)
            // Skip skills with empty name or description
            return skillName.trim() !== '' && skillDesc.trim() !== ''
          })
          .map((skill, index) => {
            const skillName = lRec(skill.name, lang)
            const rawDesc = lRec(skill.description, lang)
            const skillIcon = `/images/characters/boss/skill/${skill.icon}.webp`

            return (
              <div
                key={index}
                className="bg-neutral-800/30 rounded-lg p-2.5 border border-neutral-700/30 hover:border-neutral-600/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="relative w-10 h-10 shrink-0">
                    <Image
                      src={skillIcon}
                      alt={skillName}
                      fill
                      className="object-contain"
                      sizes="40px"
                      onError={(e) => {
                        const img = e.currentTarget
                        img.onerror = null
                        img.src = skillIcon.replace('.webp', '.png')
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="font-bold text-white text-base">{skillName}</div>
                      {(skill.buff || skill.debuff) && (
                        <BuffDebuffDisplay
                          buffs={skill.buff}
                          debuffs={skill.debuff}
                        />
                      )}
                    </div>
                    <div className="text-neutral-300 text-xs leading-snug">
                      <SkillDescription text={rawDesc} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
