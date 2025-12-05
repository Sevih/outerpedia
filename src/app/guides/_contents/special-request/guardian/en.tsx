'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import guardianTeamsData from './Guardian.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const guardianTeams = guardianTeamsData as Record<string, TeamData>

export default function MasterlessGuide() {
    return (
        <GuideTemplate
            title="Masterless Guardian Special Request Guide"
            introduction="This boss is all about applying debuffs and managing his minions. When he has no debuffs, his weakness gauge cannot be reduced."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Special Request: Ecology Study' defaultBossId='404400162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "When boss has zero debuffs, weakness gauge cannot be reduced and Ultimate damage is massively increased.",
                                "Boss spawns minions with S1 and S2. Each minion that moves gives boss 20% {B/BT_ACTION_GAUGE}.",
                                "Bring AoE skills to clear minions quickly.",
                                "Stage 12: Boss applies {D/BT_STAT|ST_CRITICAL_RATE_IR} on {E/Earth} and {E/Fire} units.",
                                "Stage 13: Boss applies {D/BT_STAT|ST_CRITICAL_RATE_IR} on all units."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={guardianTeams.guardianSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="jAJOiJgASCU" title="Masterless Guardian Combat Footage" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}