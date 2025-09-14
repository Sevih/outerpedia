'use client'

import Image from 'next/image'
import * as HoverCard from '@radix-ui/react-hover-card'

type SkillKey = 'Ultimate' | 'First' | 'Second'

type SkillPriority = {
    [key in SkillKey]?: {
        prio: number
    }
}

export default function SkillPriorityBlocks({
    priority,
    characterId,
    skillNames,
}: {
    priority: SkillPriority
    characterId: string
    skillNames: {
        First?: string
        Second?: string
        Ultimate?: string
    }
}) {
    const sortedSkills = Object.entries(priority)
        .sort(([, a], [, b]) => a.prio - b.prio) as [SkillKey, { prio: number; pve: number }][]

    return (
        <div className="w-full mt-6 text-white">
            <div className="mt-8 mb-4 flex items-center justify-center gap-2">
                <h2 className="text-white text-xl font-bold tracking-wide uppercase">
                    Skill Upgrade Priority
                </h2>

                <HoverCard.Root openDelay={0} closeDelay={0}>
                    <HoverCard.Trigger asChild>
                        <button type="button" className="w-5 h-5 cursor-pointer">
                            <Image
                                src="/images/ui/CM_icon_top_help.webp"
                                alt="Help"
                                width={20}
                                height={20}
                                className="object-contain opacity-80 hover:opacity-100"
                            />
                        </button>
                    </HoverCard.Trigger>

                    <HoverCard.Portal>
                        <HoverCard.Content
                            side="top"
                            align="start"
                            sideOffset={8}
                            className="z-50 px-3 py-2 rounded-md shadow-lg max-w-[300px] bg-yellow-900/95 border border-yellow-400 text-yellow-100 text-xs leading-relaxed outline-none focus:outline-none"
                        >
                            <p className="mb-1 font-bold text-yellow-300">General skill upgrade priority:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Level 2</strong> first (for Weakness Gauge bonus)</li>
                                <li>Then <strong>important effects</strong> (buffs/debuffs)</li>
                                <li>Then <strong>duration</strong> and <strong>CD reduction</strong></li>
                                <li><strong>Damage</strong> last, unless it&apos;s your main DPS skill</li>
                                <li><strong>Chain Passive</strong> can usually stay at level 2</li>
                            </ul>
                            <HoverCard.Arrow className="fill-yellow-400" />
                        </HoverCard.Content>
                    </HoverCard.Portal>
                </HoverCard.Root>
            </div>



            <div className="flex justify-center w-full">
                <div className="flex flex-col items-center mt-4">
                    <div className="flex items-end gap-6">
                        {sortedSkills.map(([key]) => {
                            const iconKey = key
                            const skillIcon = `/images/characters/skills/Skill_${iconKey}_${characterId}.webp`
                            const skillName = skillNames[key] || key

                            return (
                                <div key={key} className="flex flex-col items-center gap-1">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={skillIcon}
                                            alt={key}
                                            fill
                                            sizes="48px"
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="text-xs text-white text-center">{skillName}</span>
                                </div>
                            )
                        }).flatMap((element, index, arr) => {
                            if (index === arr.length - 1) return [element]
                            return [
                                element,
                                <div
                                    key={`sep-${index}`}
                                    className="relative w-8 h-8 self-center -translate-y-2 rotate-180 opacity-70"
                                >
                                    <Image
                                        src="/images/ui/CM_TopMenu_Back.webp"
                                        alt="separator"
                                        fill
                                        sizes="30px"
                                        className="object-contain"
                                    />
                                </div>
                            ]

                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
