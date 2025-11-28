'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import KsaiALTeamsData from './KsaiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const KsaiALTeams = KsaiALTeamsData as Record<string, TeamData>

export default function KsaiGuide() {
    return (
        <GuideTemplate
            title="Ksai Adventure License Guide"
            introduction="Ksai is a Fire Ranger boss that heavily favors Water units. Non-Water units suffer Attack and Defense penalties, while the entire team receives Debuff Enhancement. The DoT cap makes Curse and fixed damage strategies less effective, limiting damage to 5k per tick. This boss can be cleared in a single run with proper Water-focused team composition."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Ksai' modeKey='Adventure License' defaultBossId='51000028' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Non-{E/Water} units suffer {D/BT_STAT|ST_ATK_IR} and {D/BT_STAT|ST_DEF_IR} penalties.",
                                "Team receives {D/BT_SYS_BUFF_ENHANCE_DEBUFF_UP}, boss has {B/BT_SYS_BUFF_ENHANCE_IR}.",
                                "Boss is immune to {D/BT_WG_REVERSE_HEAL} until HP drops below 70%."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={KsaiALTeams.ksaiAL} defaultStage="Team 1 – Reliable Clear" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="-jEcneW-N3Y" title="Ksai - Adventure License - Stage 10 - 1 run clear (Auto)" author="XuRenChao" date="15/09/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
