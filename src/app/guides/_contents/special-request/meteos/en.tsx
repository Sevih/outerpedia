'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosTeamsData from './Meteos.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosTeams = MeteosTeamsData as Record<string, TeamData>

export default function MeteosGuide() {
    return (
        <GuideTemplate
            title="Blazing Knight Meteos Special Request Guide"
            introduction="Meteos' gimmick is mainly related to the {D/BT_SHIELD_BASED_CASTER} buff. He has a special gauge that triggers an AoE counter every 5 actions, and he does more damage if he has debuffs. Healers are useless as he blocks healing effects. He does significantly less damage to units protected by {D/BT_SHIELD_BASED_CASTER}, even during Enrage. Can be cleared in 1-2 attempts per stage with proper barrier management."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Special Request: Identification' defaultBossId='407600262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss has a special gauge that triggers an AoE counter every 5 actions. Dual Attack and Chain Attack are recommended.",
                                "Boss does more damage if he has debuffs. Keep debuffs to 2-3 maximum for manageability.",
                                "If boss kills one of your teammates, he uses an instant kill move that removes all buffs first, deals damage, and blocks revival.",
                                "Healers are useless as boss blocks healing effects.",
                                "Boss's enrage is a powerful AoE attack.",
                                "Boss applies {D/BT_SEALED} on DPS units on higher stages.",
                                "Boss does significantly less damage to units protected by {D/BT_SHIELD_BASED_CASTER}, even during Enrage (except for the instant kill move).",
                                "Only takes WG damage from {E/Fire} units.",
                                "Stage 11+: Boss deals more damage when fewer allies are alive.",
                                "Stage 13: Boss gains {D/BT_CONTINU_HEAL} and heals after attacking."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosTeams.meteosSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U2R6eEZgyuI" title="Meteos Combat Footage" author="Community" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
