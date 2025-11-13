'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="Vlada Strategy Guide"
            introduction="Vlada is a powerful boss who inflicts deadly burn debuffs that can be detonated instantly. She gains permanent buff enhancement and only takes weakness damage from non-burning enemies."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                ⚠️ This guide also applies to stage S2 Hard 8-10 ⚠️
                            </div>
                            <BossDisplay
                                bossKey='Vlada'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                labelFilter='As You Wish, Your Excellency'
                                defaultBossId='4500174'
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Use characters with <EffectInlineTag name="BT_IMMUNE" type="buff" />.</li>
                                <li>Use <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /> to reduce <EffectInlineTag name="IG_Buff_Dot_Burn_Interruption_D" type="debuff" /> <EffectInlineTag name="BT_DOT_BURN" type="debuff" /> damage.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Dianne" /> <CharacterLinkCard name="Astei" /> <CharacterLinkCard name="Nella" />: for <EffectInlineTag name="BT_IMMUNE" type="buff" /></li>
                                <li><CharacterLinkCard name="Akari" /> <CharacterLinkCard name="Laplace" /> : <EffectInlineTag name="BT_STAT|ST_ATK" type="debuff" /></li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
