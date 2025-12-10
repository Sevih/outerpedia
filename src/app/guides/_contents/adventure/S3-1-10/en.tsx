'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SphinxGuardianGuide() {
    return (
        <GuideTemplate
            title="Sphinx Guardian Strategy Guide"
            introduction="Sphinx Guardian is a challenging boss that requires at least one Ranger in your team to take turns. It executes Rangers with its S1 and punishes teams without Rangers by reducing speed to 0."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sphinx Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144008'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Use at least one {C/Ranger}.",
                                "Avoid using {D/BT_COOL_CHARGE}.",
                                "The boss is vulnerable to {D/BT_AGGRO}."
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
