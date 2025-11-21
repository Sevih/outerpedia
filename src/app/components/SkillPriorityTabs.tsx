'use client'

import Image from 'next/image'

type SkillKey = 'Ultimate' | 'First' | 'Second'

type SkillPriority = {
    [key in SkillKey]?: {
        prio: number
    }
}

export default function SkillPriorityBlocks({
    priority,
    skillNames,
    skillIcons,
}: {
    priority: SkillPriority
    skillNames: {
        First?: string
        Second?: string
        Ultimate?: string
    }
    skillIcons: {
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
            </div>

            <div className="mb-6 px-4 py-3 rounded-md bg-yellow-900/30 border border-yellow-400/30 max-w-2xl mx-auto">
                <p className="mb-2 text-yellow-100/90 text-xs font-semibold">Skill up rule of thumb:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-100/90 text-xs ml-4">
                    <li>Level 2 for Weakness Gauge damage</li>
                    <li>Effect chance, effect duration & cooldown reductions.</li>
                    <li>Damage increases (DPS only)</li>
                </ul>
                <p className="mt-3 text-yellow-100/90 text-xs">
                    Chain passive can be left at level 2 until much later, the Weakness Gauge damage increase at level 5 is the only interesting part, so you can save skill manuals here until the more important skills are taken care of.
                </p>
            </div>

            <div className="flex justify-center w-full">
                <div className="flex flex-col items-center mt-4">
                    <div className="flex items-end gap-6">
                        {sortedSkills.map(([key]) => {
                            const skillIcon = skillIcons[key]
                            const skillName = skillNames[key] || key

                            return (
                                <div key={key} className="flex flex-col items-center gap-1">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={`/images/characters/skills/${skillIcon}.webp`}
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
