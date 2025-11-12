'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function LeoGuide() {
    return (
        <GuideTemplate
            title="Leo Strategy Guide"
            introduction="Leo is a defensive boss who gains powerful shields and increases damage based on defense. His S3 can deal devastating AoE damage when buffed, making buff control essential."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Leo'
                                modeKey='Story (Hard)'
                                defaultBossId='400401111'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Alpha moveset</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><strong>S1</strong>: Single, 40% chances to <EffectInlineTag name="BT_STAT|ST_DEF" type="debuff" /> 2 turns.</li>
                                <li><strong>S2</strong>: AoE, 70% chances to <EffectInlineTag name="BT_STAT|ST_AVOID" type="debuff" /> 2 turns.</li>
                                <li><strong>S3</strong>: AoE, 50% chances to <EffectInlineTag name="BT_STUN" type="debuff" /> 1 turn.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Bring <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /> and/or <EffectInlineTag name="BT_IMMUNE" type="buff" /> to negates Alpha.</li>
                                <li>Bring <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /> <EffectInlineTag name="BT_SEALED" type="debuff" /> <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /> to prevent Leo to buff himself.</li>
                                <li>Whichever the one you use, be sure that Leo isn&apos;t buffed when he is going for S3.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Akari" />, <CharacterLinkCard name="Gnosis Nella" /> <CharacterLinkCard name="Luna" /> : for <EffectInlineTag name="BT_SEALED" type="debuff" /></li>
                                <li><CharacterLinkCard name="Caren" />, <CharacterLinkCard name="Poolside Trickster Regina" />, <CharacterLinkCard name="Stella" /> : for <EffectInlineTag name="BT_STEAL_BUFF" type="debuff" /></li>
                                <li><CharacterLinkCard name="Regina" />, <CharacterLinkCard name="Kappa" />, <CharacterLinkCard name="Aer" /> : for <EffectInlineTag name="BT_REMOVE_BUFF" type="debuff" /></li>
                                <li><CharacterLinkCard name="Astei" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                                <li><CharacterLinkCard name="Saeran" />, <CharacterLinkCard name="Dianne" />, <CharacterLinkCard name="Tio" /> : for <EffectInlineTag name="BT_REMOVE_DEBUFF" type="buff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
