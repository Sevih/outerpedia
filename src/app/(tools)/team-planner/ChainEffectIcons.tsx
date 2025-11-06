'use client'

import Image from 'next/image'
import buffs from '@/data/buffs.json'
import debuffs from '@/data/debuffs.json'

const effectsData: Effect[] = [
  ...buffs.map((e) => ({ ...e, type: 'buff' as const })),
  ...debuffs.map((e) => ({ ...e, type: 'debuff' as const }))
]

type ChainEffectIconsProps = {
  buffs?: string[]
  debuffs?: string[]
  maxIcons?: number
}

type Effect = {
  name: string
  label: string
  description: string
  icon: string
  type: 'buff' | 'debuff'
  group?: string
}

export default function ChainEffectIcons({
  buffs = [],
  debuffs = [],
  maxIcons = 2
}: ChainEffectIconsProps) {
  const getEffects = (names: string[], type: 'buff' | 'debuff') =>
    names
      .slice(0, maxIcons)
      .map((name) => {
        // Chercher l'effet
        const effect = effectsData.find((e: Effect) => e.name === name && e.type === type)

        if (!effect) return null

        // Si le nom se termine par _IR, utiliser l'icône du group
        if (name.endsWith('_IR') && effect.group) {
          const groupEffect = effectsData.find((e: Effect) => e.name === effect.group && e.type === type)
          if (groupEffect) {
            // Utiliser l'icône du group mais garder les autres infos de l'effet original
            return { ...effect, icon: groupEffect.icon }
          }
        }

        return effect
      })
      .filter((e): e is Effect => !!e)

  const buffList = getEffects(buffs, 'buff')
  const debuffList = getEffects(debuffs, 'debuff')

  const allEffects = [...buffList, ...debuffList]

  if (allEffects.length === 0) return null

  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex gap-0.5">
      {allEffects.map((effect, idx) => {
        const iconPath = `/images/ui/effect/${effect.icon}.webp`
        const bgImage = effect.type === 'buff'
          ? '/images/ui/teamBuilder/SC_Whole_Blue_Bg.webp'
          : '/images/ui/teamBuilder/SC_Whole_Red_Bg.webp'

        return (
          <div
            key={`${effect.type}-${effect.name}-${idx}`}
            className="relative w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] flex items-center justify-center"
          >
            {/* Background */}
            <Image
              src={bgImage}
              alt=""
              fill
              className="object-contain"
            />
            {/* Icon */}
            <div className="relative z-10">
              <Image
                src={iconPath}
                alt={effect.label}
                width={20}
                height={20}
                className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] object-contain"
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
