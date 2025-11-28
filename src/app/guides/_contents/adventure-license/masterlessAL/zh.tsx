'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import masterlessALTeamsData from './masterlessAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const masterlessALTeams = masterlessALTeamsData as Record<string, TeamData>

export default function MasterlessGuardianGuide() {
    return (
        <GuideTemplate
            title="无主守卫者 冒险执照攻略"
            introduction="技能与特殊委托第12关相同。1-2次通关。已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Adventure License' defaultBossId='51000001' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "若未附带弱化效果，Boss不会受到WG伤害。",
                                "小守卫者攻击时会提升Boss行动值并移除2个弱化效果。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={masterlessALTeams.masterlessAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="MZ39RaAYiv0" title="无主守卫者 - 冒险执照 - 第10关 - 1次通关 (自动)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
