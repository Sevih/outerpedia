'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BlockbusterPOTeamsData from './BlockbusterPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BlockbusterPOTeams = BlockbusterPOTeamsData as Record<string, TeamData>

export default function BlockbusterPOGuide() {
    return (
        <GuideTemplate
            title="Blockbuster Pursuit Operation Guide"
            introduction="Blockbuster gains random buffs every turn and punishes critical hits by taking reduced damage and recovering 50% WG. Non-crit teams using {B/HEAVY_STRIKE} or strong DPS that can ignore the WG mechanic work best."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Blockbuster' modeKey='Pursuit Operation' defaultBossId='51202002' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Gains a random buff at the start of each turn.",
                                "Upon taking a critical hit, greatly reduces damage taken and recovers WG by 50%.",
                                "Use {B/HEAVY_STRIKE} characters to avoid triggering the crit penalty.",
                                "Prevent the boss from buffing with {D/BT_SEALED}."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BlockbusterPOTeams.blockbusterPO} defaultStage="Non-Crit Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="pgWkc6X6VNE" title="Blockbuster - Pursuit Operation - 1 run kill" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
