'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ZiggsaronALTeamsData from './ZiggsaronAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ZiggsaronALTeams = ZiggsaronALTeamsData as Record<string, TeamData>

export default function RavenousWolfKingZiggsaronGuide() {
    return (
        <GuideTemplate
            title="Ravenous Wolf King, Ziggsaron Adventure License Guide"
            introduction="Weekly Conquest boss with permanent ATK reduction and Unbuffable at turn start. Reduced damage from non-Rangers, -50% WG from non-Water units. Enrage every 4 turns with lethal ultimate. Can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Ravenous Wolf King, Ziggsaron' modeKey='Adventure License' defaultBossId='51000034' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Permanent irremovable {D/BT_STAT|ST_ATK} on your team.",
                                "Inflicts {D/BT_SEALED} at the start of each turn for 1 turn.",
                                "Disables Counterattack, Revenge, and Agile Response.",
                                "Reduced damage taken from non-{C/Ranger} units."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ZiggsaronALTeams.ziggsaronAL} defaultStage="No Ranger" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Nlt72xRKMpo" title="Ziggsaron - Adventure License - Stage 10 - 1 run clear (Auto)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
