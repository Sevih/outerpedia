'use client'

import Image from 'next/image'
import Link from 'next/link'
import { findCharacter } from './CharacterCard'
import { toKebabCase } from '@/utils/formatText'
import { useTenant } from '@/lib/contexts/TenantContext'
import { l } from '@/lib/localize'
import parseText from '@/utils/parseText'

type Props = {
  order: { character: string; speed: number }[]
  note?: string
}

export default function TurnOrderDisplay({ order, note }: Props) {
  const { key: lang } = useTenant()

  return (
    <div className="mb-3">
      <div className="flex flex-wrap items-center justify-center gap-y-2">
        {order.map((entry, idx) => {
          const char = findCharacter(entry.character)
          const slug = char ? toKebabCase(char.Fullname) : ''
          const localizedName = char ? l(char, 'Fullname', lang) : entry.character
          const atbPath = char ? `/images/characters/atb/IG_Turn_${char.ID}.webp` : ''

          return (
            <div key={entry.character} className="flex items-center">
              {idx > 0 && (
                <span className="mx-2 text-neutral-500 text-lg select-none">&gt;</span>
              )}
              <div className="flex items-center gap-1.5">
                {char && (
                  <Link href={`/characters/${slug}`} className="relative w-8 h-8 shrink-0 rounded overflow-hidden">
                    <Image
                      src={atbPath}
                      alt={localizedName}
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </Link>
                )}
                <div className="flex flex-col items-start leading-tight">
                  {char ? (
                    <Link href={`/characters/${slug}`} className="text-sm text-sky-400 hover:text-sky-300 hover:underline underline-offset-2 transition-colors">
                      {localizedName}
                    </Link>
                  ) : (
                    <span className="text-sm text-red-500">{entry.character}</span>
                  )}
                  <span className="text-xs text-amber-400">{entry.speed} SPD</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {note && (
        <p className="mt-1.5 text-sm text-neutral-400 text-center">{parseText(note)}</p>
      )}
    </div>
  )
}
