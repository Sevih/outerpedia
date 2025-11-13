'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AbominationHunterBelialGuide() {
    return (
        <GuideTemplate
            title="Abomination Hunter Belial Strategy Guide"
            introduction="Abomination Hunter Belial is a devastating boss who detonates burn debuffs for massive damage. He starts the battle with an instant burn detonation, inflicts burn on non-Defenders each turn, and executes the entire team during enrage."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abomination Hunter Belial'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114005'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Bring <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" /> and/or <EffectInlineTag name="BT_INVINCIBLE" type="buff" /> to deal with <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> (make sure to apply those at the end of the second battle).</li>
                                <li>Bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> to block <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> after the first <EffectInlineTag name="BT_IMMEDIATELY_2000092" type="debuff" />.</li>
                                <li>Bring <EffectInlineTag name="BT_RESURRECTION" type="buff" /> to recover from any deaths after the first <EffectInlineTag name="BT_IMMEDIATELY_2000092" type="debuff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Leo" /> <CharacterLinkCard name="Monad Eva" /> : for <EffectInlineTag name="BT_INVINCIBLE" type="buff" />.</li>
                                <li><CharacterLinkCard name="Leo" /> <CharacterLinkCard name="Lyla" /> <CharacterLinkCard name="Demiurge Drakhan" /> <CharacterLinkCard name="Luna" /> <CharacterLinkCard name="Omega Nadja" /> <CharacterLinkCard name="Liselotte" />: for <EffectInlineTag name="BT_SHIELD_BASED_CASTER" type="buff" />.</li>
                                <li><CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_RESURRECTION" type="buff" />.</li>
                                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Nella" /> <CharacterLinkCard name="Astei" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" />.</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
