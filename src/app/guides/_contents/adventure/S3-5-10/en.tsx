'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import EffectInlineTag from '@/app/components/EffectInlineTag'
import CharacterLinkCard from '@/app/components/CharacterLinkCard'
import ElementInlineTag from '@/app/components/ElementInline'

export default function ReginaGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="Regina Strategy Guide"
            introduction="Regina is an evasive boss whose damage scales with her evasion stat. She gains powerful buffs when dodging attacks and enrages every 10 enemy actions, gaining massive evasion boosts."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Regina'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500293'
                                labelFilter={"The Grand Escape Magic"}
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Hilde', labelFilter: 'The Grand Escape Magic' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Advice</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li>Bring <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" /> to counter <EffectInlineTag name="IG_Buff_Effect_2000067_Interruption" type="buff" />.</li>
                            </ul>
                            <h3 className="text-lg font-bold text-sky-300 border-l-4 border-sky-500 pl-3 mb-2 mt-6">Recommended Characters</h3>
                            <ul className="list-disc list-inside text-neutral-300 mb-4">
                                <li><CharacterLinkCard name="Maxwell" /> <CharacterLinkCard name="Demiurge Astei" /> : <ElementInlineTag element='dark' /> DPS with high penetration.</li>
                                <li><CharacterLinkCard name="Charlotte" /> <CharacterLinkCard name="Skadi" /> <CharacterLinkCard name="Sterope" />: for <EffectInlineTag name="BT_STAT|ST_ACCURACY" type="buff" />.</li>
                            </ul>
                        </>
                    ),
                },
            }}
        />
    )
}
