'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SchattenmeisterSchwartzALTeamsData from './SchattenmeisterSchwartzAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SchattenmeisterSchwartzALTeams = SchattenmeisterSchwartzALTeamsData as Record<string, TeamData>

export default function SchattenmeisterSchwartzGuide() {
    return (
        <GuideTemplate
            title="샤텐 마이스터 슈바르츠 모험 라이선스 가이드"
            introduction="샤텐 마이스터 슈바르츠는 해제 불가 {D/IG_Buff_Effect_Sealed_Interruption_D}를 부여하고 섀도우 비스트를 소환합니다. 보스는 혼자일 때 낮은 피해를 입히지만, 섀도우 비스트가 살아있는 동안 피해가 증가합니다. 광역 공격으로 쫄을 빠르게 처리하세요. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Schattenmeister Schwartz' modeKey='Adventure License' defaultBossId='51000019' />
                                <BossDisplay bossKey='Shadow Beast Fire-Breather' modeKey='Adventure License' defaultBossId='51000020' labelFilter={"Weekly Conquest - Schattenmeister Schwartz"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "적 전체에게 해제 불가 {D/IG_Buff_Effect_Sealed_Interruption_D}를 항상 부여.",
                                    "광역 공격으로 섀도우 비스트를 빠르게 처리하세요."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SchattenmeisterSchwartzALTeams.schattenmeisterSchwartzAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="glWpGZRH4xc"
                                title="샤텐 마이스터 슈바르츠 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)"
                                author="XuRenChao"
                                date="01/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
