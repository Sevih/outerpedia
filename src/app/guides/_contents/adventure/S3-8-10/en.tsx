'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbominationHunterBelialGuide() {
    return (
        <GuideTemplate
            title="Abomination Hunter Belial Strategy Guide"
            introduction="Abomination Hunter Belial is a devastating boss who detonates burn debuffs for massive damage. He starts the battle with an instant burn detonation, inflicts burn on non-Defenders each turn, and executes the entire team during enrage."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abomination Hunter Belial'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114005'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Bring {B/BT_SHIELD_BASED_CASTER} and/or {B/BT_INVINCIBLE} to deal with {D/BT_DOT_BURN} (make sure to apply those at the end of the second battle).",
                                "Bring {B/BT_IMMUNE} to block {D/BT_DOT_BURN} after the first {D/BT_IMMEDIATELY_2000092}.",
                                "Bring {B/BT_RESURRECTION} to recover from any deaths after the first {D/BT_IMMEDIATELY_2000092}."
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
