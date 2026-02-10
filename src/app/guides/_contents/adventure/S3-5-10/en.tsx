'use client'

import { useState } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function ReginaGuide() {
    const [selectedMode, setSelectedMode] = useState('Story (Hard)')

    return (
        <GuideTemplate
            title="Regina Strategy Guide"
            introduction="Regina is a boss that deals significantly more damage when she lands critical hits. She enrages every 10 enemy actions, gaining powerful buffs."
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
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Bring {B/BT_STAT|ST_BUFF_CHANCE} to counter {B/IG_Buff_Effect_2000067_Interruption}."
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
