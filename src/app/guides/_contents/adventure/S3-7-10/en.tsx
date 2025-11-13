'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AbyssalCalamityApophisGuide() {
    return (
        <GuideTemplate
            title="Abyssal Calamity Apophis Strategy Guide"
            introduction="Abyssal Calamity Apophis is a dangerous boss that inflicts devastating poison and silence debuffs. Its mechanics punish debuffed targets with massive fixed damage and defense-ignoring attacks."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abyssal Calamity Apophis'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4184001'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <p className="text-neutral-300 mb-2">Two ways to handle this :</p>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Either bring <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="buff" /> to prevent being <EffectInlineTag name="BT_DOT_POISON_IR" type="debuff" />.</li>
                                <li>Or take advantage of the boss&apos;s weakness to <EffectInlineTag name="BT_COOL3_CHARGE" type="debuff" /> so it never uses its S3.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Lyla" /> <CharacterLinkCard name="Demiurge Delta" /> <CharacterLinkCard name="Leo" />: for <EffectInlineTag name="BT_STAT|ST_BUFF_RESIST" type="buff" />.</li>
                                <li><CharacterLinkCard name="Dianne" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" /> and <EffectInlineTag name="BT_EXTEND_BUFF" type="buff" />.</li>
                                <li><CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Nella" /> : for <EffectInlineTag name="BT_IMMUNE" type="buff" />.</li>
                                <li><CharacterLinkCard name="Demiurge Vlada" /> <CharacterLinkCard name="Gnosis Nella" /> <CharacterLinkCard name="Tamara" /> <CharacterLinkCard name="Tamamo-no-Mae" />: for <EffectInlineTag name="BT_COOL3_CHARGE" type="debuff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
