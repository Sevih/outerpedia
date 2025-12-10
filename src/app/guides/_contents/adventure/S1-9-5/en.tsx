'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'


export default function LeoGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

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
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Alpha', defaultBossId: '400401011' }
                                ]}
                                modeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Bring {B/BT_REMOVE_DEBUFF} and/or {B/BT_IMMUNE} to negates Alpha.",
                                "Bring {D/BT_STEAL_BUFF} {D/BT_SEALED} {D/BT_REMOVE_BUFF}   to prevent Leo to buff himself.",
                                "Whichever the one you use, be sure that Leo isn't buffed when he is going for S3."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                        </>
                    ),
                },
            }}
        />
    )
}
