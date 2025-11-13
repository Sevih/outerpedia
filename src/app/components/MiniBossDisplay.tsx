'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'
import { lRec } from '@/lib/localize'
import { getT } from '@/i18n'
import ElementInlineTag from './ElementInline'
import ClassInlineTag from './ClassInlineTag'
import BuffDebuffDisplayMini from './BuffDebuffDisplayMini'
import BuffDebuffDisplay from './BuffDebuffDisplay'
import { CharacterPortrait } from './CharacterPortrait'
import slugToCharJson from '@/data/_SlugToChar.json'
import type { BossData } from '@/types/boss'
import type { SlugToCharMap } from '@/types/pull'

const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap

type MiniBossConfig = {
  bossKey: string
  defaultBossId?: string
  labelFilter?: string
}

type Props = {
  bosses: [MiniBossConfig] | [MiniBossConfig, MiniBossConfig] | [MiniBossConfig, MiniBossConfig, MiniBossConfig]
  modeKey: string | string[]
  defaultModeKey?: string
  controlledMode?: string // Mode contrôlé de l'extérieur (si fourni, désactive le sélecteur interne)
}

function formatColorTags(input: string) {
  return input
    .replace(/<color=#(.*?)>(.*?)<\/color>/g, (_m, color, text) => {
      return `<span style="color:#${color}">${text}</span>`
    })
    .replace(/\\n/g, '<br />')
    .replace(/\n/g, '<br />')
}

type MiniBossData = {
  config: MiniBossConfig
  data: BossData | null
  error: string | null
}

export default function MiniBossDisplay({ bosses, modeKey, defaultModeKey, controlledMode }: Props) {
  const { lang } = useI18n()
  const t = getT(lang)
  const [modeKeys] = useState<string[]>(Array.isArray(modeKey) ? modeKey : [modeKey])
  const [internalSelectedMode, setInternalSelectedMode] = useState<string>(
    defaultModeKey || (Array.isArray(modeKey) ? modeKey[0] : modeKey)
  )

  // Utiliser le mode contrôlé s'il est fourni, sinon utiliser le mode interne
  const selectedModeKey = controlledMode || internalSelectedMode

  const [miniBossesData, setMiniBossesData] = useState<MiniBossData[]>(
    bosses.map(config => ({ config, data: null, error: null }))
  )

  useEffect(() => {
    const loadBossData = async (config: MiniBossConfig, index: number) => {
      try {
        const indexMod = await import('@/data/boss/index.json')
        const indexData = (indexMod.default || indexMod) as Record<string, Record<string, Array<{ id: string; label: Record<string, string> }>>>

        let bossId: string | undefined

        // Si labelFilter est spécifié, chercher l'ID correspondant
        if (config.labelFilter) {
          const bossEntry = indexData[config.bossKey]?.[selectedModeKey]
          if (bossEntry) {
            const version = bossEntry.find(v => v.label.en === config.labelFilter)
            if (version) {
              bossId = version.id
            }
          }
        }

        // Si toujours pas d'ID, utiliser defaultBossId pour le mode par défaut initial
        const isInitialMode = selectedModeKey === (defaultModeKey || (Array.isArray(modeKey) ? modeKey[0] : modeKey))
        if (!bossId && isInitialMode && config.defaultBossId) {
          bossId = config.defaultBossId
        }

        // Si toujours pas d'ID, prendre le premier disponible
        if (!bossId) {
          const bossEntry = indexData[config.bossKey]?.[selectedModeKey]
          if (bossEntry && bossEntry.length > 0) {
            bossId = bossEntry[0].id
          }
        }

        if (!bossId) {
          setMiniBossesData(prev => {
            const newData = [...prev]
            newData[index] = { config, data: null, error: `Boss not found: ${config.bossKey}` }
            return newData
          })
          return
        }

        // Charger les données du boss
        const bossMod = await import(`@/data/boss/${bossId}.json`)
        const bossData = bossMod.default || bossMod

        setMiniBossesData(prev => {
          const newData = [...prev]
          newData[index] = { config, data: bossData, error: null }
          return newData
        })
      } catch (err) {
        console.error(`[MiniBossDisplay] Error loading boss ${config.bossKey}`, err)
        setMiniBossesData(prev => {
          const newData = [...prev]
          newData[index] = { config, data: null, error: `Failed to load boss: ${config.bossKey}` }
          return newData
        })
      }
    }

    bosses.forEach((config, index) => {
      loadBossData(config, index)
    })
  }, [bosses, selectedModeKey, defaultModeKey, modeKey])

  const gridCols = bosses.length === 1 ? 'grid-cols-1' : bosses.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="space-y-3">
      {/* Mode selector - Only show if not controlled externally */}
      {!controlledMode && modeKeys.length > 1 && (
        <div className="flex justify-start">
          <select
            value={selectedModeKey}
            onChange={(e) => setInternalSelectedMode(e.target.value)}
            className="bg-neutral-800 border border-neutral-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {modeKeys.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Grid of mini bosses */}
      <div className={`grid ${gridCols} gap-4`}>
        {miniBossesData.map((miniBoss, idx) => {
        if (miniBoss.error) {
          return (
            <div key={idx} className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
              {miniBoss.error}
            </div>
          )
        }

        if (!miniBoss.data) {
          return (
            <div key={idx} className="bg-neutral-800 rounded-lg p-4 animate-pulse">
              <div className="h-8 bg-neutral-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
            </div>
          )
        }

        const data = miniBoss.data
        const bossName = lRec(data.Name, lang)
        const bossSurname = lRec(data.Surname, lang)
        const miniPortrait = `/images/characters/boss/mini/IG_Turn_${data.icons}_E.webp`
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


        return (
          <div key={idx} className="rounded-lg overflow-hidden">
            {/* Header with mini portrait and basic info */}
            <div className="relative bg-neutral-900/30 p-3 rounded-lg border border-neutral-700/30">
              <div className="flex flex-col gap-2">
                {/* Portrait and name section */}
                <div className="flex items-center gap-3">
                  {isCharacterPortrait ? (
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-600">
                      <CharacterPortrait
                        characterId={data.icons}
                        characterName={characterFullName}
                        size={64}
                      />
                    </div>
                  ) : (
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 border-neutral-600">
                      <Image
                        src={miniPortrait}
                        alt={bossName}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          const img = e.currentTarget
                          img.onerror = null
                          img.src = miniPortrait.replace('.webp', '.png')
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{bossName}</h3>
                    {bossSurname && <div className="text-xs text-neutral-400 truncate">{bossSurname}</div>}
                  </div>
                </div>

                {/* Class, Element, Level */}
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <ClassInlineTag name={data.class} notext />
                  <ElementInlineTag element={data.element.toLowerCase()} notext />
                  <span className="text-neutral-400">Lvl {data.level}</span>
                </div>

                {/* Immunities */}
                {allImmunities.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-neutral-400 font-semibold">{t('boss.immunities')}</div>
                    <div className="flex flex-wrap gap-1">
                      {allImmunities.map((effectKey, index) => {
                        const formattedKey = effectKey.startsWith('ST_') ? `BT_STAT|${effectKey}` : effectKey
                        return <BuffDebuffDisplayMini key={index} debuffs={[formattedKey]} />
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section - Compact version */}
            <div className="mt-2 space-y-1.5">
              {data.skills
                .filter((skill) => {
                  const skillName = lRec(skill.name, lang)
                  const skillDesc = lRec(skill.description, lang)
                  return skillName.trim() !== '' && skillDesc.trim() !== ''
                })
                .map((skill, index) => {
                  const skillName = lRec(skill.name, lang)
                  const skillDesc = formatColorTags(lRec(skill.description, lang))
                  const skillIcon = `/images/characters/boss/skill/${skill.icon}.webp`

                  return (
                    <div
                      key={index}
                      className="bg-neutral-800/30 rounded-lg p-2 border border-neutral-700/30 hover:border-neutral-600/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="relative w-8 h-8 shrink-0">
                          <Image
                            src={skillIcon}
                            alt={skillName}
                            fill
                            className="object-contain"
                            sizes="32px"
                            onError={(e) => {
                              const img = e.currentTarget
                              img.onerror = null
                              img.src = skillIcon.replace('.webp', '.png')
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <div className="font-bold text-white text-sm">{skillName}</div>
                            {(skill.buff || skill.debuff) && (
                              <BuffDebuffDisplay
                                buffs={skill.buff}
                                debuffs={skill.debuff}
                              />
                            )}
                          </div>
                          <div
                            className="text-neutral-300 text-xs leading-snug"
                            dangerouslySetInnerHTML={{ __html: skillDesc }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )
      })}
      </div>
    </div>
  )
}
