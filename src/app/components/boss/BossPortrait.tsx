'use client'

import Image from 'next/image'
import { CharacterPortrait } from '../CharacterPortrait'

type Props = {
  icons: string
  bossName: string
  characterFullName: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { px: 64, className: 'w-16 h-16' },
  md: { px: 80, className: 'w-20 h-20' },
  lg: { px: 96, className: 'w-24 h-24' },
}

export default function BossPortrait({ icons, bossName, characterFullName, size = 'md' }: Props) {
  const isCharacterPortrait = icons.startsWith('2')
  const portrait = `/images/characters/boss/portrait/MT_${icons}.webp`
  const { px, className } = sizeConfig[size]

  if (isCharacterPortrait) {
    return (
      <div className={`relative ${className} rounded-lg overflow-hidden border-2 border-neutral-600`}>
        <CharacterPortrait
          characterId={icons}
          characterName={characterFullName}
          size={px}
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className} rounded-lg overflow-hidden border-2 border-neutral-600`}>
      <Image
        src={portrait}
        alt={bossName}
        fill
        className="object-cover"
        sizes={`${px}px`}
        onError={(e) => {
          const img = e.currentTarget
          img.onerror = null
          img.src = portrait.replace('.webp', '.png')
        }}
      />
    </div>
  )
}