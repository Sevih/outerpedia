'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/contexts/I18nContext'
import { lRec } from '@/lib/localize'
import { BossPortrait, BossHeader, BossImmunities, BossSkillList } from './boss'
import slugToCharJson from '@/data/_SlugToChar.json'
import type { BossData } from '@/types/boss'
import type { SlugToCharMap } from '@/types/pull'

const SLUG_TO_CHAR = slugToCharJson as SlugToCharMap

type Props = {
  bossKey: string
  modeKey: string | string[]
  defaultBossId?: string
  defaultModeKey?: string
  labelFilter?: string | string[] // Filter boss versions by label(s) (e.g., "An Unpleasant Reunion" or ["Label1", "Label2"])
  onModeChange?: (mode: string) => void // Callback when mode changes
  onBossChange?: (bossId: string) => void // Callback when boss version changes
}


export default function BossDisplay({ bossKey, modeKey, defaultBossId, defaultModeKey, labelFilter, onModeChange, onBossChange }: Props) {
  const { lang } = useI18n()
  const [data, setData] = useState<BossData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bossVersions, setBossVersions] = useState<{ id: string; label: string; localizedLabel: Record<string, string>; mode: string }[]>([])
  const [selectedBossId, setSelectedBossId] = useState<string>('')
  const [modeKeys] = useState<string[]>(Array.isArray(modeKey) ? modeKey : [modeKey])
  const [selectedModeKey, setSelectedModeKey] = useState<string>(
    defaultModeKey || (Array.isArray(modeKey) ? modeKey[0] : modeKey)
  )

  useEffect(() => {
    import('@/data/boss/index.json')
      .then((indexMod) => {
        const index = (indexMod.default || indexMod) as Record<string, Record<string, Array<{ id: string; label: Record<string, string> }>>>

        // Si labelFilter est spécifié, on collecte toutes les versions qui matchent ce label depuis tous les modes
        let allVersions: Array<{ id: string; label: string; localizedLabel: Record<string, string>; mode: string }> = []

        if (labelFilter) {
          // Parcourir tous les modes pour ce boss
          const bossEntry = index[bossKey]
          if (!bossEntry) {
            setError(`Boss not found: ${bossKey}`)
            return
          }

          // Normaliser labelFilter en tableau
          const labelFilters = Array.isArray(labelFilter) ? labelFilter : [labelFilter]

          // Collecter toutes les versions qui matchent un des labels
          for (const [mode, versions] of Object.entries(bossEntry)) {
            for (const version of versions) {
              // Vérifier si le label correspond à un des filtres (en anglais pour la comparaison)
              if (labelFilters.includes(version.label.en)) {
                allVersions.push({
                  id: version.id,
                  label: version.id,
                  localizedLabel: version.label,
                  mode
                })
              }
            }
          }

          if (allVersions.length === 0) {
            setError(`No boss found with label(s): ${labelFilters.join(', ')}`)
            return
          }
        } else {
          // Comportement original : utiliser le mode sélectionné
          const bossData = index[bossKey]?.[selectedModeKey]

          if (!bossData) {
            setError(`Boss not found: ${bossKey} - ${selectedModeKey}`)
            return
          }

          allVersions = bossData.map((data) => ({
            id: data.id,
            label: data.id,
            localizedLabel: data.label,
            mode: selectedModeKey
          }))
        }

        setBossVersions(allVersions)

        // Utiliser defaultBossId seulement pour le mode par défaut initial
        const isInitialMode = selectedModeKey === (defaultModeKey || (Array.isArray(modeKey) ? modeKey[0] : modeKey))
        const initialId = (isInitialMode && defaultBossId) ? defaultBossId : allVersions[0]?.id
        if (initialId) {
          setSelectedBossId(initialId)
          onBossChange?.(initialId)
        }
      })
      .catch((err) => {
        console.error('[BossDisplay] Error loading index.json', err)
        setError('Failed to load boss index')
      })
  }, [bossKey, selectedModeKey, defaultBossId, defaultModeKey, modeKey, labelFilter, onBossChange])

  useEffect(() => {
    if (!selectedBossId) return

    import(`@/data/boss/${selectedBossId}.json`)
      .then((mod) => {
        setData(mod.default || mod)
        setError(null)
      })
      .catch((err) => {
        console.error(`[BossDisplay] Error loading ${selectedBossId}.json`, err)
        setError(`Boss data not found: ${selectedBossId}`)
      })
  }, [selectedBossId])

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

  // Récupérer le nom complet du personnage depuis slugToChar si c'est un portrait de personnage
  const characterFullName = isCharacterPortrait && SLUG_TO_CHAR[data.icons]
    ? lRec(SLUG_TO_CHAR[data.icons].Fullname, lang)
    : bossName

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

        {/* Selector and Immunities below portrait */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {modeKeys.length > 1 && (
              <select
                value={selectedModeKey}
                onChange={(e) => {
                  setSelectedModeKey(e.target.value)
                  onModeChange?.(e.target.value)
                }}
                className="bg-neutral-800 border border-neutral-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {modeKeys.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            )}
            {!labelFilter && bossVersions.length > 1 && (
              <select
                value={selectedBossId}
                onChange={(e) => {
                  setSelectedBossId(e.target.value)
                  onBossChange?.(e.target.value)
                }}
                className="bg-neutral-800 border border-neutral-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {bossVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {lRec(version.localizedLabel, lang)}
                  </option>
                ))}
              </select>
            )}
          </div>
          {isStoryMode && (
            <div className="text-sm text-neutral-300">
              {lRec(data.location.area_id, lang)} - {lRec(data.location.dungeon, lang)}
            </div>
          )}
          <BossImmunities
            buffImmune={data.BuffImmune}
            statBuffImmune={data.StatBuffImmune}
          />
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-4">
        <BossSkillList skills={data.skills} />
      </div>
    </div>
  )
}
