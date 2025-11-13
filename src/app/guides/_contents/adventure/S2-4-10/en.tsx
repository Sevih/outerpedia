'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'

export default function AsteiGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="Astei Strategy Guide"
            introduction="Astei is a formidable support boss who heals allies, boosts attack, and resurrects her team upon enraging. Her companion Sterope punishes non-offensive skills by recovering the boss team's resources."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                ⚠️ This guide also applies to stage S2 Hard 5-9 ⚠️
                            </div>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500045'
                                labelFilter='An Unpleasant Reunion'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Sterope', defaultBossId: '4500046', labelFilter: 'An Unpleasant Reunion' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>The boss has no immunities, so bring <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" />.</li>
                                <li>Try to avoid using characters with non-offensive skills.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Demiurge Vlada" />, <CharacterLinkCard name="Sterope" />, <CharacterLinkCard name="Eternal" />: for <EffectInlineTag name="BT_SEALED_RECEIVE_HEAL" type="debuff" /></li>
                                <li><CharacterLinkCard name="Monad Eva" />, <CharacterLinkCard name="Dianne" /> : can heal without using non-offensive skills</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
