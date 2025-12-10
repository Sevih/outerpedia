'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function GrandCalamariGuide() {
    return (
        <GuideTemplate
            title="Grand Calamari Strategy Guide"
            introduction="Grand Calamari is a challenging boss that specializes in stunning the highest-attack hero and extending debuff durations. Managing the enrage phase is crucial to avoid its devastating ultimate."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Grand Calamari'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4134003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Stack chain points before Enrage. This way, you can burst it down and skip the ultimate.",
                                "Bring {B/BT_IMMUNE} and/or {B/BT_REMOVE_DEBUFF} to negate the {D/BT_STUN} mechanic."
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
