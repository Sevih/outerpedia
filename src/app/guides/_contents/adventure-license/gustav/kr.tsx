'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GustavALTeamsData from './GustavAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GustavALTeams = GustavALTeamsData as Record<string, TeamData>

export default function GustavGuide() {
    return (
        <GuideTemplate
            title="구스타프 모험 라이선스 가이드"
            introduction="고정 피해 메커니즘을 가진 오브 관리 챌린지. 1~2회 시도로 클리어 가능. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Gustav' modeKey='Adventure License' defaultBossId='51000013' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "오브는 공격 시 {D/BT_FIXED_DAMAGE}를 가한다.",
                                "{B/BT_REMOVE_DEBUFF} 또는 {B/BT_IMMUNE}를 가진 유닛을 사용.",
                                "보스는 오브가 처치될 때 받는 피해가 감소한다.",
                                "오브의 반격을 최소화하기 위해 단일 대상 피해에 집중."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GustavALTeams.gustavAL} defaultStage="Standard Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U29t5k0bDfY" title="구스타프 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
