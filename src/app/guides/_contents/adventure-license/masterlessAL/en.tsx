'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import masterlessALTeamsData from './masterlessAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const masterlessALTeams = masterlessALTeamsData as Record<string, TeamData>

export default function MasterlessGuardianGuide() {
    return (
        <GuideTemplate
            title="Masterless Guardian Adventure License Guide"
            introduction="Same skills as Special Request Stage 12. Can be cleared in 1-2 attempts. Verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Adventure License' defaultBossId='51000001' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Dungeon Guardian Spear-Wielder', defaultBossId: '51000002' },
                                    { bossKey: 'Mini Guardian', defaultBossId: '51000003' }
                                ]}
                                modeKey={['Weekly Conquest - Masterless Guardian']}
                                defaultModeKey='Weekly Conquest - Masterless Guardian'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss takes no WG damage if not inflicted with a debuff.",
                                "Mini Guardians increase boss Priority and remove 2 debuffs when attacking."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={masterlessALTeams.masterlessAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="MZ39RaAYiv0" title="Masterless Guardian - Adventure License - Stage 10 - 1 run clear (Auto)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
