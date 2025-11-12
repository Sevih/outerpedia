'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import ElementInlineTag from '@/app/components/ElementInline'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="Betrayed Deshret Strategy Guide"
            introduction="Betrayed Deshret is an accuracy-focused boss that punishes teams with low accuracy. Fire element characters with accuracy buffs or debuffs are essential to overcome this challenge."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Betrayed Deshret'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4104005'
                            />

                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Use <ElementInlineTag element='fire' /> characters with either <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> or <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="debuff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="K" /> : for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="debuff" /></li>
                                <li><CharacterLinkCard name="Aer" /> <CharacterLinkCard name="Kanon" /> <CharacterLinkCard name="Lisha" /> <CharacterLinkCard name="Mero" /> : for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
