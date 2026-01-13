'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

export default function NellaGuide() {
    return (
        <GuideTemplate
            title="Three Cries Strategy Guide"
            introduction="Three Cries is a defensive boss that becomes nearly invincible without debuffs applied. Your team must maintain constant buffs to prevent irremovable {D/BT_DOT_BURN_IR}, while applying {D/BT_FREEZE} is essential to bypass its damage reduction and land your Chain Attack burst. The boss gains action gauge rapidly when hit and cleanses debuffs every turn, making precise timing critical."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Three Cries'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114006'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Accumulate as many Chain Points as possible before unleashing it all on the Boss",
                                "Have a Buff prepared before its S2/S3 attack to prevent {D/BT_DOT_BURN_IR}",
                                "{D/BT_FREEZE} it before you initiate all of the Chain Attacks and break it",
                                "Tune your team's speed so all units reach 100% Priority before starting Chain Attacks. This prevents the boss from cutting in despite gaining action gauge from hits (it gains 25% per hit)",
                                "{I-T/Sage's Charm} +10 increases Chain Attack damage by 50% if worn by the last unit in the chain",
                                "Avoid using {E/Light} and {E/Dark} units to prevent the boss from cleansing itself"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="i2ok2KIpvsQ"
                                title="Three Cries - Story Hard 4-1-10 clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="13/01/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
