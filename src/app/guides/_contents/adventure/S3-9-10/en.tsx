'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AbyssalCalamityApophisGuide() {
    return (
        <GuideTemplate
            title="Nella Strategy Guide"
            introduction="Nella is an extremely challenging boss that requires high penetration to damage. It applies irremovable debuff enhancement and sealed interruption effects, and executes the entire team during enrage every 30 actions."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Nella'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500352'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Units with innate Penetration and Penetration-based builds are required.</li>
                                <li>Also <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> will be needed to get rid of <EffectInlineTag name="BT_STAT|ST_PIERCE_POWER_RATE" type="debuff" /> right when the boss is on the verge of breaking.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Regina" /> <CharacterLinkCard name="Gnosis Beth" /> <CharacterLinkCard name="Demiurge Luna" /> <CharacterLinkCard name="Gnosis Dahlia" /> <CharacterLinkCard name="Demiurge Astei" /> <CharacterLinkCard name="Ame" />: as DPS unit.</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
