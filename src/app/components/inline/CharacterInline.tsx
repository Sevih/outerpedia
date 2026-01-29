'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import Link from 'next/link'
import { CharacterPortrait } from '@/app/components/CharacterPortrait'
import allCharacters from '@/data/_allCharacters.json'
import { toKebabCase } from '@/utils/formatText'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

// Alias mapping
const characterNameMap: Record<string, string> = {
  Meva: 'Monad Eva',
  DStella: 'Demiurge Stella',
  Dstella: 'Demiurge Stella',
  Val: 'Valentine',
}

type Props = {
  name: string
  icon?: boolean
}

export default function CharacterInline({ name, icon = false }: Props) {
  const { key: lang } = useTenant()
  const { t } = useI18n()

  const fullName = characterNameMap[name] ?? name
  const char = allCharacters.find(c => c.Fullname === fullName)

  if (!char) return <span className="text-red-500">{name}</span>

  const localizedName = l(char, 'Fullname', lang)
  const slug = toKebabCase(char.Fullname)

  const linkContent = (
    <Link
      href={`/characters/${slug}`}
      className={`text-sky-400 hover:text-sky-300 underline-offset-2 hover:underline transition-colors${icon ? ' ml-0.5' : ''}`}
    >
      {localizedName}
    </Link>
  )

  const elementIconPath = `/images/ui/elem/${char.Element.toLowerCase()}.webp`
  const classIconPath = `/images/ui/class/${char.Class.toLowerCase()}.webp`
  const rarityStars = '★'.repeat(char.Rarity)

  const elementName = t(`SYS_ELEMENT_NAME_${char.Element.toUpperCase()}`)
  const className = t(`SYS_CLASS_${char.Class.toUpperCase()}`, { defaultValue: char.Class })
  const subClassName = char.SubClass
    ? t(`SYS_CLASS_NAME_${char.SubClass.toUpperCase()}`, { defaultValue: char.SubClass })
    : null

  const elementColors: Record<string, string> = {
    Fire: 'text-red-400',
    Water: 'text-blue-400',
    Earth: 'text-amber-400',
    Light: 'text-yellow-300',
    Dark: 'text-purple-400',
  }

  const tooltipContent = (
    <div className="flex gap-3">
      {/* Portrait simple */}
      <div className="shrink-0 rounded overflow-hidden">
        <CharacterPortrait
          characterId={char.ID}
          characterName={localizedName}
          size={72}
        />
      </div>

      {/* Info à droite */}
      <div className="flex flex-col gap-1 text-white min-w-0">
        {/* Nom */}
        <span className="font-bold text-sm leading-tight">{localizedName}</span>

        {/* Rarity */}
        <span className="text-xs text-yellow-400">{rarityStars}</span>

        {/* Element */}
        <div className="flex items-center gap-1">
          <span className="relative w-4 h-4 shrink-0">
            <Image src={elementIconPath} alt={char.Element} fill sizes="16px" className="object-contain" />
          </span>
          <span className={`text-xs ${elementColors[char.Element] || 'text-white'}`}>
            {elementName}
          </span>
        </div>

        {/* Class/Subclass */}
        <div className="flex items-center gap-1">
          <span className="relative w-4 h-4 shrink-0">
            <Image src={classIconPath} alt={char.Class} fill sizes="16px" className="object-contain" />
          </span>
          <span className="text-xs text-orange-400">
            {subClassName ? `${className} / ${subClassName}` : className}
          </span>
        </div>
      </div>
    </div>
  )

  // Avec icône inline (optionnel)
  if (icon) {
    const atbPath = `/images/characters/atb/IG_Turn_${char.ID}.webp`
    return (
      <HoverCard.Root openDelay={0} closeDelay={0}>
        <HoverCard.Trigger asChild>
          <span>
            <Link
              href={`/characters/${slug}`}
              className="inline-block relative align-middle rounded overflow-hidden"
              style={{ width: 18, height: 18 }}
            >
              <Image
                src={atbPath}
                alt={localizedName}
                fill
                sizes="18px"
                className="object-contain"
              />
            </Link>
            {linkContent}
          </span>
        </HoverCard.Trigger>

        <HoverCard.Portal>
          <HoverCard.Content
            side="top"
            align="center"
            sideOffset={6}
            className="z-50 px-3 py-2 rounded shadow-lg bg-neutral-800 border border-white/10"
          >
            {tooltipContent}
            <HoverCard.Arrow className="fill-neutral-800" />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    )
  }

  // Sans icône: juste le nom avec hover
  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger asChild>
        <span>
          {linkContent}
        </span>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 px-3 py-2 rounded shadow-lg bg-neutral-800 border border-white/10"
        >
          {tooltipContent}
          <HoverCard.Arrow className="fill-neutral-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
