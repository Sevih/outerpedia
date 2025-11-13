'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function GrandCalamariGuide() {
    return (
        <GuideTemplate
            title="Grand Calamari Strategy Guide"
            introduction="Grand Calamari is a challenging boss that specializes in stunning the highest-attack hero and extending debuff durations. Managing the enrage phase is crucial to avoid its devastating ultimate."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Grand Calamari'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4134003'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Stack chain points before Enrage. This way, you can burst it down and skip the ultimate.</li>
                                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> and/or <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> to negate the <EffectInlineTag name="BT_STUN" type="debuff" /> mechanic.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Astei" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                                <li><CharacterLinkCard name="Saeran" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Tio" /> : for <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                                <li><CharacterLinkCard name="Demiurge Stella" /> as a main DPS since she is immune to <EffectInlineTag name="BT_STUN" type="debuff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
