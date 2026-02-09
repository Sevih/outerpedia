'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import IrregularQueenPOTeamsData from './IrregularQueenPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const IrregularQueenPOTeams = IrregularQueenPOTeamsData as Record<string, TeamData>

export default function IrregularQueenGuide() {
    return (
        <GuideTemplate
            title="Irregular Queen Strategy Guide"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Irregular Queen' modeKey='Pursuit Operation' defaultBossId='51202004' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Takes no Weakness Gauge damage unless debuffed but counters with S2 when inflicted with a debuff.",
                                "Damage from {D/BT_DOT_CURSE} and Fixed Damage does not exceed 10,000.",
                                "S2 removes {D/BT_REMOVE_BUFF}, inflicts {D/BT_AGGRO} for 3 turns, and {B/BT_REMOVE_DEBUFF} from the boss if it crits.",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IrregularQueenPOTeams.irregularQueenPO} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videos={[
                                { videoId: "bPwKu7gjGWg", title: "1 run public", author: "Sevih", date: "01/10/2025" },
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
