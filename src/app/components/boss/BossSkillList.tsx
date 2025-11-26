'use client'

import Image from 'next/image'
import { useI18n } from '@/lib/contexts/I18nContext'
import { lRec } from '@/lib/localize'
import BuffDebuffDisplay from '../BuffDebuffDisplay'
import { SkillDescription } from '../SkillDescriptionParser'
import type { BossSkill } from '@/types/boss'

type Props = {
  skills: BossSkill[]
  compact?: boolean
}

export default function BossSkillList({ skills, compact = false }: Props) {
  const { lang } = useI18n()

  const filteredSkills = skills.filter((skill) => {
    const skillName = lRec(skill.name, lang)
    const skillDesc = lRec(skill.description, lang)
    return skillName.trim() !== '' && skillDesc.trim() !== ''
  })

  const iconSize = compact ? 32 : 40
  const iconClass = compact ? 'w-8 h-8' : 'w-10 h-10'
  const containerPadding = compact ? 'p-2' : 'p-2.5'
  const titleSize = compact ? 'text-sm' : 'text-base'
  const gap = compact ? 'space-y-1.5' : 'space-y-2'

  return (
    <div className={gap}>
      {filteredSkills.map((skill, index) => {
        const skillName = lRec(skill.name, lang)
        const rawDesc = lRec(skill.description, lang)
        const skillIcon = `/images/characters/boss/skill/${skill.icon}.webp`

        return (
          <div
            key={index}
            className={`bg-neutral-800/30 rounded-lg ${containerPadding} border border-neutral-700/30 hover:border-neutral-600/50 transition-colors`}
          >
            <div className="flex items-start gap-2">
              <div className={`relative ${iconClass} shrink-0`}>
                <Image
                  src={skillIcon}
                  alt={skillName}
                  fill
                  className="object-contain"
                  sizes={`${iconSize}px`}
                  onError={(e) => {
                    const img = e.currentTarget
                    img.onerror = null
                    img.src = skillIcon.replace('.webp', '.png')
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-${compact ? '1.5' : '2'} mb-${compact ? '0.5' : '1'} flex-wrap`}>
                  <div className={`font-bold text-white ${titleSize}`}>{skillName}</div>
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
  )
}