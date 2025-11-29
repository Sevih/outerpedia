'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DdrakhanALTeamsData from './DdrakhanAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import CombatFootage from '@/app/components/CombatFootage'
import { recommendedCharacters } from './recommendedCharacters'

const DdrakhanALTeams = DdrakhanALTeamsData as Record<string, TeamData>

export default function DdrakhanPromotionGuide() {
    return (
        <GuideTemplate
            title="Demiurge Drakhan Promotion Challenge Guide"
            introduction="First-Rate Adventurer Promotion Challenge featuring {P/Demiurge Drakhan} and {P/Vlada}. Going slow is the key (Invulnerability, Revival, or Resurrect). {I-T/Sage's Charm} is recommended to accumulate CP during {B/BT_INVINCIBLE_IR} phases."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000004' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000005' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Drakhan grants {B/BT_INVINCIBLE_IR} (3 turns) to all allies at battle start and when killing a unit.",
                                    "Avoid critical hits on Drakhan - resets his ultimate cooldown and increases his Priority by 35%.",
                                    "Drakhan's ultimate inflicts instant death if target HP is 30% or below."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DdrakhanALTeams.ddrakhanAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EW0F4F3_5YY"
                                title="First Rate Promotion vs DemiDrakhan Clear Guide!"
                                author="Adjen"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
