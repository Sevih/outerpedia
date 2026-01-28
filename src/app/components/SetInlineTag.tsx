'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import Image from 'next/image'
import type { CSSProperties } from 'react'
import sets from '@/data/sets.json'
import type { ArmorSet } from '@/types/equipment'
import { useTenant } from '@/lib/contexts/TenantContext'
import { useI18n } from '@/lib/contexts/I18nContext'
import { l } from '@/lib/localize'

type Props = {
    name: string
    triggerStyle?: CSSProperties
    showLabel?: boolean
    size?: number
}

export default function SetInlineTag({
    name,
    triggerStyle,
    showLabel = true,
    size = 24,
}: Props) {
    const { key: lang } = useTenant()
    const { t } = useI18n()

    // Support both "Attack" and "Attack Set" formats
    const set = (sets as ArmorSet[]).find(s => s.name === name || s.name === `${name} Set`)
    if (!set) return <span className="text-red-500">{name}</span>

    const label = l(set, 'name', lang)
    const effect2 = l(set, 'effect_2_4', lang)
    const effect4 = l(set, 'effect_4_4', lang)

    const bgPath = '/images/bg/CT_Slot_legendary.webp'
    const armorImage = `/images/equipment/TI_Equipment_Armor_${set.image_prefix}.webp`

    const defaultAlignClass = triggerStyle?.verticalAlign ? '' : 'align-bottom'
    const sizePx = `${size}px`

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
                                src={armorImage}
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
                    className="z-50 px-3 py-2 rounded shadow-lg max-w-[320px] bg-[#1a1a1a] border border-white/10"
                >
                    <div className="flex flex-col gap-1.5 text-white">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-amber-400">{label}</span>
                            <span className="text-xs text-gray-400">({t('items.tier4')})</span>
                        </div>

                        {effect2 && (
                            <div className="text-xs">
                                <span className="text-sky-300">{t('items.set.twoPiece')}: </span>
                                <span className="leading-snug whitespace-pre-line">{effect2}</span>
                            </div>
                        )}

                        {effect4 && (
                            <div className="text-xs">
                                <span className="text-sky-300">{t('items.set.fourPiece')}: </span>
                                <span className="leading-snug whitespace-pre-line">{effect4}</span>
                            </div>
                        )}
                    </div>
                    <HoverCard.Arrow className="fill-[#333]" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    )
}
