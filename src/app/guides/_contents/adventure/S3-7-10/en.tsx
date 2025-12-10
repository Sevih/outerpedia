'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbyssalCalamityApophisGuide() {
    return (
        <GuideTemplate
            title="Abyssal Calamity Apophis Strategy Guide"
            introduction="Abyssal Calamity Apophis is a dangerous boss that inflicts devastating poison and silence debuffs. Its mechanics punish debuffed targets with massive fixed damage and defense-ignoring attacks."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abyssal Calamity Apophis'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4184001'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Either bring {B/BT_IMMUNE} and {B/BT_STAT|ST_BUFF_RESIST} to prevent being {D/BT_DOT_POISON_IR}.",
                                "Or take advantage of the boss's weakness to {D/BT_COOL3_CHARGE} so it never uses its S3."
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
