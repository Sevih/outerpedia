'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="Sacreed Guardian Strategy Guide"
            introduction="Sacreed Guardian is a deadly boss that executes the highest-attack hero with its S3 and enrages every 5 turns. The boss only takes weakness damage while enraged, making timing and crowd control crucial."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "The boss has no immunities so bring hard CC like {D/BT_STUN} {D/BT_FREEZE} {D/BT_STONE} {D/BT_COOL_CHARGE} {D/BT_SILENCE}.",
                                "Bringing {B/BT_RESURRECTION} can help too.",
                                "{D/BT_ACTION_GAUGE} {B/BT_ACTION_GAUGE} {D/BT_STAT|ST_SPEED} {B/BT_STAT|ST_SPEED} can prevent the boss taking too many turns and enraging.",
                                "Save chains until the boss enrages.",
                                "You can try to burn it down with {D/BT_FIXED_DAMAGE} chain attack."
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
