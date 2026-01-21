'use client'

import Image from 'next/image'
import Link from 'next/link'
import { toKebabCase } from '@/utils/formatText'
import { getRecruitBadge } from '@/utils/getRecruitBadge'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l } from '@/lib/localize'
import allCharacters from '@/data/_allCharacters.json'
import type { ElementType, ClassType } from '@/types/enums'
import { CharacterNameDisplay } from './CharacterNameDisplay'
import { ElementIcon } from './ElementIcon'
import { ClassIcon } from './ClassIcon'

type CharacterData = (typeof allCharacters)[number]

type Size = 'md' | 'lg'

type Props = {
  /** Character name (Fullname in English) */
  name: string
  /** Card size variant: md (100x192), lg (120x231) */
  size?: Size
  /** Responsive mode: md on mobile, lg on desktop (lg: breakpoint) */
  responsive?: boolean
  /** Show element/class icons */
  showIcons?: boolean
  /** Show rarity stars */
  showStars?: boolean
  /** Override the number of stars displayed (e.g., for transcend level) */
  starsOverride?: number
  /** Show recruit badge (limited, collab, etc.) */
  showLimited?: boolean
  /** Additional className for the container */
  className?: string
  /** Priority loading for images */
  priority?: boolean
  /** Render without Link wrapper (for carousel) */
  asContent?: boolean
}

export function findCharacter(name: string): CharacterData | undefined {
  return allCharacters.find((c) => c.Fullname === name)
}

// Size class mappings
const SIZE_CLASSES = {
  md: 'w-[100px] h-[192px]',
  lg: 'w-[120px] h-[231px]',
} as const

const BADGE_CLASSES = {
  md: 'absolute w-[60px] h-[24px] top-1.5 left-0.5 z-30 object-contain',
  lg: 'absolute w-[75px] h-[30px] top-2 left-1 z-30 object-contain',
} as const

const STARS_CLASSES = {
  md: 'absolute top-4 right-1 z-30 flex flex-col items-end -space-y-1',
  lg: 'absolute top-5 right-1 z-30 flex flex-col items-end -space-y-1',
} as const

const CLASS_ICON_CLASSES = {
  md: 'absolute z-30 drop-shadow-md bottom-5 right-0.5',
  lg: 'absolute z-30 drop-shadow-md bottom-5 right-1.5',
} as const

const ELEMENT_ICON_CLASSES = {
  md: 'absolute z-30 drop-shadow-md bottom-12 right-0.5',
  lg: 'absolute z-30 drop-shadow-md bottom-14 right-1.5',
} as const

const STAR_SIZES = { md: 18, lg: 18 } as const
const IMAGE_SIZES = { md: '100px', lg: '120px' } as const

export default function CharacterCard({
  name,
  size = 'md',
  responsive = false,
  showIcons = true,
  showStars = true,
  starsOverride,
  showLimited = true,
  className = '',
  priority = false,
  asContent = false,
}: Props) {
  const { key: lang } = useTenant()

  const char = findCharacter(name)
  if (!char) {
    const fallbackClass = responsive
      ? 'w-[100px] h-[192px] lg:w-[120px] lg:h-[231px]'
      : SIZE_CLASSES[size]
    return (
      <div className={`bg-gray-800 rounded flex items-center justify-center text-red-400 text-xs ${fallbackClass} ${className}`}>
        {name} not found
      </div>
    )
  }

  const localizedName = l(char, 'Fullname', lang)
  const slug = toKebabCase(char.Fullname)

  const element = char.Element.toLowerCase() as ElementType
  const charClass = char.Class.toLowerCase() as ClassType

  // Classes based on size/responsive
  const sizeClasses = responsive
    ? 'w-[100px] h-[192px] lg:w-[120px] lg:h-[231px]'
    : SIZE_CLASSES[size]

  const badgeClasses = responsive
    ? 'absolute w-[60px] h-[24px] top-1.5 left-0.5 lg:w-[75px] lg:h-[30px] lg:top-2 lg:left-1 z-30 object-contain'
    : BADGE_CLASSES[size]

  const starsClasses = responsive
    ? 'absolute top-4 right-1 lg:top-5 z-30 flex flex-col items-end -space-y-1'
    : STARS_CLASSES[size]

  const classIconClasses = responsive
    ? 'absolute z-30 drop-shadow-md bottom-5 right-0.5 lg:right-1.5 h-6 w-6'
    : CLASS_ICON_CLASSES[size]

  const elementIconClasses = responsive
    ? 'absolute z-30 drop-shadow-md bottom-12 right-0.5 lg:bottom-14 lg:right-1.5  h-6 w-6'
    : ELEMENT_ICON_CLASSES[size]

  const starSize = STAR_SIZES[size]
  const imageSize = responsive ? '(min-width: 1024px) 120px, 100px' : IMAGE_SIZES[size]
  const badgeSize = responsive ? '(min-width: 1024px) 75px, 60px' : size === 'md' ? '60px' : '75px'

  const content = (
    <>
      {/* Recruit badge */}
      {showLimited && (() => {
        const badge = getRecruitBadge(char)
        if (!badge) return null
        return (
          <Image
            src={badge.src}
            alt={badge.altKey}
            width={0}
            height={0}
            sizes={badgeSize}
            className={badgeClasses}
          />
        )
      })()}

      {/* Character portrait */}
      <Image
        src={`/images/characters/portrait/CT_${char.ID}.webp`}
        alt={localizedName}
        width={0}
        height={0}
        sizes={imageSize}
        className="w-full h-full object-cover rounded"
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        unoptimized
      />

      {/* Rarity stars */}
      {showStars && (
        <div className={starsClasses}>
          {[...Array(starsOverride ?? char.Rarity)].map((_, i) => (
            <Image
              key={i}
              src="/images/ui/star.webp"
              alt="star"
              width={starSize}
              height={starSize}
              style={{ width: starSize, height: starSize }}
            />
          ))}
        </div>
      )}

      {/* Class & Element icons */}
      {showIcons && (
        <>
          <div className={classIconClasses}>
            <ClassIcon className={charClass} size={24} />
          </div>
          <div className={elementIconClasses}>
            <ElementIcon element={element} />
          </div>
        </>
      )}

      {/* Character name */}
      <CharacterNameDisplay fullname={localizedName} />
    </>
  )

  // asContent mode: return content with overlay link (for use in carousels)
  if (asContent) {
    return (
      <div className={`relative ${sizeClasses} ${className}`}>
        <Link
          href={`/characters/${slug}`}
          prefetch={false}
          className="absolute inset-0 z-40"
        >
          <span className="sr-only">{char.Fullname}</span>
        </Link>
        {content}
      </div>
    )
  }

  // Normal mode: Link wrapper
  return (
    <Link
      href={`/characters/${slug}`}
      prefetch={false}
      className={`relative block text-center shadow hover:shadow-lg transition overflow-hidden rounded ${sizeClasses} ${className}`}
    >
      {content}
    </Link>
  )
}

// Re-export for convenience with additional data
export function useCharacterData(name: string) {
  return allCharacters.find((c) => c.Fullname === name)
}
