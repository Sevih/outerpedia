'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import weapons from '@/data/weapon.json'
import type { Weapon } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import formatEffectText from '@/utils/formatText'

type Props = {
    name: string
    triggerStyle?: CSSProperties
    showLabel?: boolean
    size?: number
}

export default function WeaponInlineTag({
    name,
    triggerStyle,
    showLabel = true,
    size = 24,
}: Props) {
    const { key } = useTenant()
    const lang: 'en' | 'jp' | 'kr' = key === 'jp' ? 'jp' : key === 'kr' ? 'kr' : 'en'

    const weapon = (weapons as Weapon[]).find(w => w.name === name)
    if (!weapon) return <span className="text-red-500">{name}</span>

    const pick = (base: string, jp?: string, kr?: string) =>
        lang === 'jp' ? (jp ?? base) : lang === 'kr' ? (kr ?? base) : base

    const label = pick(weapon.name, weapon.name_jp, weapon.name_kr)
    const effectLv4 = pick(
        weapon.effect_desc4 || weapon.effect_desc1,
        weapon.effect_desc4_jp,
        weapon.effect_desc4_kr
    )

    const rarity = (weapon.rarity || 'Legendary').toLowerCase()
    const bgPath = `/images/bg/CT_Slot_${rarity}.webp`

    const defaultAlignClass = triggerStyle?.verticalAlign ? '' : 'align-bottom'
    const sizePx = `${size}px`

   //console.log(effectLv4)

    return (
        <HoverCard.Root openDelay={0} closeDelay={0}>
            <HoverCard.Trigger asChild>
                <button
                    type="button"
                    className={`inline-flex items-end gap-1 ${defaultAlignClass}`}
                    style={triggerStyle}
                >
                    <div
                        className="rounded shadow-md shrink-0"
                        style={{
                            width: size,
                            height: size,
                            backgroundImage: `url(${bgPath})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="relative w-full h-full">
                            <Image
                                src={`/images/equipment/${weapon.image}`}
                                alt={label}
                                fill
                                className="object-contain"
                                sizes={sizePx}
                            />
                        </div>
                    </div>
                    {showLabel && <span className="underline text-amber-400">{label}</span>}
                </button>
            </HoverCard.Trigger>

            <HoverCard.Portal>
                <HoverCard.Content
                    side="top"
                    align="center"
                    sideOffset={8}
                    className="z-50 px-3 py-2 rounded shadow-lg max-w-[280px] bg-[#1a1a1a] border border-white/10 flex items-start gap-2"
                >
                    <div className="flex flex-col gap-0.5 text-white">
                        <span className="text-xs text-sky-300">{weapon.effect_name}</span>

                        <span className="text-xs leading-snug whitespace-pre-line">
                            {formatEffectText(effectLv4)}
                        </span>
                    </div>
                    <HoverCard.Arrow className="fill-[#333]" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    )
}
