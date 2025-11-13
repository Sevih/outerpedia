'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ClassInlineTag from '@/app/components/ClassInlineTag'

export default function SphinxGuardianGuide() {
    return (
        <GuideTemplate
            title="Sphinx Guardian Strategy Guide"
            introduction="Sphinx Guardian is a challenging boss that requires at least one Ranger in your team to take turns. It executes Rangers with its S1 and punishes teams without Rangers by reducing speed to 0."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sphinx Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144008'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>At least one <ClassInlineTag name="Ranger" /> is required to get turns.</li>
                                <li>Avoid using <EffectInlineTag name="BT_COOL_CHARGE" type="debuff" />.</li>
                                <li>The boss is vulnerable to <EffectInlineTag name="BT_AGGRO" type="debuff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Ember" /> : Self inflicts <EffectInlineTag name="BT_MARKING" type="debuff" /> or inflicts <EffectInlineTag name="BT_AGGRO" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Veronica" /> : <EffectInlineTag name="BT_AGGRO" type="debuff" />.</li>
                                <li><CharacterLinkCard name="Fatal" /> : <EffectInlineTag name="BT_STEALTHED" type="buff" />.</li>
                                <li>Any <ClassInlineTag name="Ranger" />.</li>
                                <li><CharacterLinkCard name="Nella" /><CharacterLinkCard name="Mene" /> : for <EffectInlineTag name="BT_RESURRECTION" type="buff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
