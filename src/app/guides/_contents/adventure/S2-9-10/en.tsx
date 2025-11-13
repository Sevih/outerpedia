'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function VladiMaxGuide() {
    return (
        <GuideTemplate
            title="Vladi Max Strategy Guide"
            introduction="Vladi Max is a dangerous boss who drains chain points and inflicts guaranteed stuns on defense-debuffed targets. His attacks bypass counter, revenge, and defender passives."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Vladi Max'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144004'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Use characters with <EffectInlineTag name="BT_IMMUNE" type="buff" />, <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Astei" />: for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
