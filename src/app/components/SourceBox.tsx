import React from 'react'
import Link from 'next/link'
import { resolveItemSource } from '@/lib/resolveItemSource'
 import Image from 'next/image'

type Props = { itemname: string; source?: string; boss?: string; mode?: string }

export default function ItemSourceBox({ itemname, source, boss, mode }: Props) {
  if (!source && !boss && !mode) return null

  const { trueSource, trueBosses } = resolveItemSource({ itemname, source, boss })

  return (
    <div className="bg-black/30 border border-white/10 rounded-xl p-5 w-full max-w-3xl text-sm text-neutral-300">
      {trueSource && (
        <p className="mb-1">
          <span className="font-semibold">Source:</span> {trueSource}
        </p>
      )}
      {trueBosses.length > 0 && (
        <div className="mb-1">
          <div className="flex flex-wrap gap-3 mt-1">
            {source !== 'Event Shop' && (
              <p className="font-semibold">Boss:</p>
            )}
            {trueBosses.map(({ name, id, links }) => (
              <div key={name} className="flex items-center gap-2">               
                <Image
                  src={
                    (source === 'Special Request' || source === 'Irregular Extermination')
                      ? `/images/characters/boss/mini/IG_Turn_${id}.webp`
                      : `/images/characters/boss/mini/${id}.webp`
                  }
                  alt={name}
                  width={24}
                  height={24}
                  style={{ width: 24, height: 24 }}
                  className="rounded-full"
                />

                {links.map((link, i) => {
                  if (!link) return <span key={`${name}-${i}`} className="text-neutral-400">{name}</span>

                  let href = ''
                  switch (source) {
                    case 'Irregular Extermination':
                      href = `/guides/irregular-extermination/${link}`
                      break
                    case 'Special Request':
                      href = `/guides/special-request/${link}`
                      break
                    case 'Adventure License':
                      href = `/guides/adventure-license/`
                      break
                    default:
                      href = `/guides/${link}`
                      break
                  }

                  return (
                    <Link key={`${name}-${link}`} href={href} className="text-amber-300 hover:underline">
                      {name}{links.length > 1 ? ` (${i + 1})` : ''}
                    </Link>
                  )
                })}
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  )
}
