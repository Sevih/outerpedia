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
            introduction="Meteos' gimmick is mainly related to the {B/BT_SHIELD_BASED_CASTER} buff. He has a special gauge that triggers an AoE counter every 5 actions, and he does more damage if he has debuffs. Healers are useless as he blocks healing effects. He does significantly less damage to units protected by {B/BT_SHIELD_BASED_CASTER}, even during Enrage."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Special Request: Identification' defaultBossId='407600262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss has a special gauge that triggers an AoE counter every 5 attack taken. Dual Attack and Chain Attack are recommended.",
                                "Boss does more damage if he has debuffs. Keep debuffs to 2-3 maximum for manageability.",
                                "Healers are useless as boss inflict permanent {D/BT_SEALED_RECEIVE_HEAL}.",
                                "Boss applies {D/BT_SEALED} on DPS units on higher stages.",
                                "Boss does significantly less damage to units protected by {B/BT_SHIELD_BASED_CASTER}.",
                                "Only takes WG damage from {E/Water} units."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosTeams.meteosSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U2R6eEZgyuI" title="Meteos Combat Footage" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
