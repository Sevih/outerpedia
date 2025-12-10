'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AncientFoeGuide() {
    return (
        <GuideTemplate
            title="Ancient Foe Strategy Guide"
            introduction="Ancient Foe is a dangerous boss that inflicts curse debuffs and can freeze targets below 70% HP while ignoring immunity. It gains powerful buffs during enrage phases every 10 enemy actions and applies irremovable curse interruption effects."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Frozen Dragon of Phantasm Harshna'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4286026'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Bring {D/BT_SEALED} to prevent the boss getting {B/BT_STAT|ST_BUFF_CHANCE}.",
                                "Bring {B/BT_IMMUNE} and {B/BT_REMOVE_DEBUFF} to deal with {D/BT_DOT_CURSE} and {D/BT_FREEZE}."
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
