'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function FatalGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')
    return (
        <GuideTemplate
            title="Fatal Strategy Guide"
            introduction="Fatal is a deadly assassin boss who becomes nearly invincible while stealthed, dealing massive damage and resurrecting allies. She silences Fire heroes and extends all ally buffs after each action."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Fatal'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500266'
                                onModeChange={setSelectedMode}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: "Sand Soldier Khopesh", defaultBossId: '4102201' },
                                    { bossKey: "Sand Soldier Khopesh", defaultBossId: '4102201' }
                                ]}
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                controlledMode={selectedMode}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Avoid using {E/Fire} heroes.",
                                "Bring a speedy hero to apply {D/BT_SEALED} on foes before Fatal moves (around 270 speed).",
                                "Bring a hero with either {D/BT_STEAL_BUFF} or {D/BT_REMOVE_BUFF} to remove {B/BT_STEALTHED}.",
                                "{P/Caren} is the MVP here since her S2 will still target Fatal while {B/BT_STEALTHED}."
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
