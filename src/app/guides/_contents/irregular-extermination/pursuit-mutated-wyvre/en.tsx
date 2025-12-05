'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MutatedWyvrePOTeamsData from './MutatedWyvrePO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MutatedWyvrePOTeams = MutatedWyvrePOTeamsData as Record<string, TeamData>

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="Mutated Wyvre Pursuit Operation Guide"
            introduction="The Mutated Wyvre has permanent Immunity to debuffs and punishes non-critical hits by recovering 50% Weakness Gauge. This boss also stuns your team when using Counterattack, Revenge, Agile Response, or non-attack skills. Requires high Critical Hit Chance teams."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Mutated Wyvre' modeKey='Pursuit Operation' defaultBossId='51202003' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Using Counterattack, Revenge, Agile Response, or non-attack skills will {D/BT_STUN} your entire team for 1 turn.",
                                "{D/BT_FIXED_DAMAGE} is capped at 5000."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MutatedWyvrePOTeams.mutatedWyvrePO} defaultStage="One Run Kill" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="PCgNRKFlRGI" title="Mutated Wyvre - Pursuit Operation - 1 run kill" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
