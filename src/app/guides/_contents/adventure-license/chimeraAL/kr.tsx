'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ChimeraALTeamsData from './ChimeraAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ChimeraALTeams = ChimeraALTeamsData as Record<string, TeamData>

export default function UnidentifiedChimeraGuide() {
    return (
        <GuideTemplate
            title="미확인 키메라 모험 라이선스 가이드"
            introduction="미확인 키메라 모험 라이선스는 스페셜 리퀘스트 스테이지 12와 동일한 스킬을 가지고 있습니다. 적절한 팀 구성으로 1회 시도로 클리어 가능. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Adventure License' defaultBossId='51000006' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "보스는 매 턴 약화 효과 2개를 해제하므로 약화 효과에만 의존하지 마세요.",
                                    "모든 유닛의 치명 피해가 85% 감소합니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ChimeraALTeams.chimeraAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lil6XEE0VUE"
                                title="미확인 키메라 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)"
                                author="XuRenChao"
                                date="25/11/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
