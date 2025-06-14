'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import * as HoverCard from '@radix-ui/react-hover-card'
import abbrev from '@/data/abbrev.json'

type Props = {
    character: string
    skill: 'S1' | 'S2' | 'S3' | 'Passive' | 'Chain'
    text?: boolean
    skupDisplay?: boolean
}

function toKebabCase(str: string) {
    return str
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .toLowerCase()
}

const skillMap: Record<Props['skill'], string> = {
    S1: 'SKT_FIRST',
    S2: 'SKT_SECOND',
    S3: 'SKT_ULTIMATE',
    Passive: 'SKT_CHAIN_PASSIVE',
    Chain: 'SKT_CHAIN_PASSIVE',
}

function formatColorTags(input: string) {
    return input.replace(/<color=#(.*?)>(.*?)<\/color>/g, (_match, color, text) => {
        return `<span style="color:#${color}">${text}</span>`
    }).replace(/\\n/g, '<br />')
}

export default function SkillInline({ character, skill, text = true, skupDisplay = false }: Props) {
    const [data, setData] = useState<null | {
        name: string
        desc: string
        icon: string
        cd?: string | number
        wgr?: number
        enhancement?: Record<string, string[]>
        portrait: string
    }>(null)

    const slug = toKebabCase(character)
    const skillKey = skillMap[skill]

    useEffect(() => {
        import(`@/data/char/${slug}.json`)
            .then((mod) => {
                const rawSkill = mod.skills?.[skillKey]
                if (!rawSkill) return

                const isChainOrPassive = skill === 'Chain' || skill === 'Passive'

                const icon = isChainOrPassive
                    ? `/images/characters/chain/Skill_ChainPassive_${mod.Element}_${mod.Chain_Type}.webp`
                    : `/images/characters/skills/${rawSkill.IconName}.webp`

                const portrait = `/images/characters/atb/IG_Turn_${mod.ID}.webp`

                let rawDesc = rawSkill.true_desc || '—'
                if (isChainOrPassive) {
                    const parts = rawDesc.split('\\n\\n')
                    rawDesc = skill === 'Chain' ? parts[0] : parts[1] || parts[0]
                }

                const desc = formatColorTags(rawDesc)

                setData({
                    name: rawSkill.name,
                    desc,
                    icon,
                    cd: rawSkill.cd ?? undefined,
                    wgr: rawSkill.wgr ?? undefined,
                    enhancement: rawSkill.enhancement ?? undefined,
                    portrait,
                })
            })
            .catch((err) => {
                console.error(`[SkillInline] Erreur chargement de ${slug}.json`, err)
            })
    }, [slug, skillKey, skill])

    if (!data) return <span className="text-red-500">[Skill non trouvé]</span>

    const fallbackIcon = data.icon.replace('.webp', '.png')
    const abbr = (abbrev as Record<string, string>)[character] ?? character;

    return (
        <HoverCard.Root openDelay={0} closeDelay={0}>
            <HoverCard.Trigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 px-1 py-0.5 text-white cursor-help focus:outline-none align-middle"
                >
                    <span className="relative w-[24px] h-[24px] rounded shrink-0">
                        <Image
                            src={data.icon}
                            alt={data.name}
                            fill
                            className="object-contain"
                            sizes="24px"
                            onError={(e) => {
                                const img = e.currentTarget
                                img.onerror = null
                                img.src = fallbackIcon
                            }}
                        />
                    </span>
                    {text && (
                        <span className="leading-none align-middle mb-0.5 underline cursor-help">{data.name}</span>
                    )}
                </button>
            </HoverCard.Trigger>

            <HoverCard.Portal>
                <HoverCard.Content
                    side="top"
                    align="center"
                    sideOffset={8}
                    className="z-50 px-3 py-2 rounded shadow-lg max-w-[300px] flex items-start gap-2 outline-none focus:outline-none bg-neutral-800 relative"
                >


                    {/* Icône de skill à gauche */}
                    <div className="relative flex flex-col text-white text-xs space-y-1 w-full">


                        {/* Haut : skill icon + texte central + portrait en absolute */}
                        <div className="flex items-center justify-between w-full">
                            {/* Icone skill */}
                            <span className="relative w-[40px] h-[40px]">
                                <Image
                                    src={data.icon}
                                    alt={data.name}
                                    fill
                                    className="object-contain"
                                    sizes="40px"
                                    onError={(e) => {
                                        const img = e.currentTarget
                                        img.onerror = null
                                        img.src = fallbackIcon
                                    }}
                                />
                            </span>

                            {/* Texte central (nom + CD/WGR) */}
                            <div className="flex-1 px-2">
                                <div className="font-bold text-sm">{data.name}</div>
                                {(data.cd || data.wgr !== undefined) && (
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-300">
                                        {data.cd && <span>⏱️ CD: {data.cd}</span>}
                                        {data.wgr !== undefined && <span>🗡️ WGR: +{data.wgr}</span>}
                                        {/* note quel skill */}
                                    </div>
                                )}
                            </div>
                            {/* Portrait en haut à droite */}
                            <span className="absolute top-0 right-2 w-12 h-12 rounded">
                                <Image
                                    src={data.portrait}
                                    alt="portrait"
                                    fill
                                    className="object-cover"
                                />
                            </span>
                        </div>
                        <div className="flex justify-end w-full text-neutral-300 font-semibold text-[11px] mt-1">
  {abbr} {skill}
</div>

                        {/* Description */}
                        <span
                            className="whitespace-pre-line text-xs leading-snug mt-2"
                            dangerouslySetInnerHTML={{ __html: data.desc }}
                        />


                        {/* Enhancements (comme corrigé précédemment) */}
                        {data.enhancement && skupDisplay && (
                            <div className="pt-1">
                                <span className="text-neutral-300 font-semibold block mb-1">🔧 Enhancements:</span>
                                <div className="font-mono space-y-1">
                                    {Object.entries(data.enhancement).map(([level, lines]) => (
                                        <div key={level} className="flex items-start gap-2">
                                            <div className="text-white font-semibold w-10 shrink-0">+{level}:</div>
                                            <div className="flex flex-col space-y-0.5">
                                                {lines.map((line, i) => (
                                                    <div key={i}>{line}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    <HoverCard.Arrow className="w-3 h-2 fill-current text-black" />
                </HoverCard.Content>
            </HoverCard.Portal>
        </HoverCard.Root>
    )
}
