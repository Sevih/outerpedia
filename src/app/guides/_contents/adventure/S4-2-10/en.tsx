'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="Mutated Wyvre Strategy Guide"
            introduction="The Mutated Wyvre revolves around buffs: the more it has, the more damage it deals and the less damage it takes. Focus on removing its buffs to weaken it."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Mutated Wyvre'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4314003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                'The boss is vulnerable to Irregular Hunters (like {P/Caren} and {P/Rey}).',
                                '{D/BT_REMOVE_BUFF} and {B/BT_IMMUNE} is the way to deal with it.'
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
