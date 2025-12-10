'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

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
                                This guide also applies to stage S2 Hard 8-10
                            </div>
                            <BossDisplay
                                bossKey='Vlada'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                labelFilter='As You Wish, Your Excellency'
                                defaultBossId='4500174'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Use characters with {B/BT_IMMUNE}.",
                                "Use {D/BT_STAT|ST_ATK} to reduce {D/IG_Buff_Dot_Burn_Interruption_D} {D/BT_DOT_BURN} damage."
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
