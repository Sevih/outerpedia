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
            title="주인 없는 수호자 모험 면허 가이드"
            introduction="특별 의뢰 12단계와 동일한 스킬. 1~2회 시도로 클리어 가능. 10단계까지 확인됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Adventure License' defaultBossId='51000001' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스는 약화 효과가 없으면 WG 피해를 받지 않습니다.",
                                "미니 가디언은 공격 시 보스의 행동 게이지를 증가시키고 약화 효과 2개를 제거합니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={masterlessALTeams.masterlessAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="MZ39RaAYiv0" title="주인 없는 수호자 - 모험 면허 - 10단계 - 1회 클리어 (자동)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
