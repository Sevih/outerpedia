'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ForestKingALTeamsData from './ForestKingAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ForestKingALTeams = ForestKingALTeamsData as Record<string, TeamData>

export default function ForestKingGuide() {
    return (
        <GuideTemplate
            title="숲의 왕 모험 라이선스 가이드"
            introduction="숲의 왕 모험 라이선스는 디버프 중심의 공격을 가진 간단한 메커니즘이 특징입니다. 적절한 팀 구성으로 1회 시도로 안정적으로 클리어할 수 있습니다. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Forest King' modeKey='Adventure License' defaultBossId='51000017' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "궁극기로 {D/BT_STUN} 상태의 대상에게 증가된 데미지를 입힙니다.",
                                    "공격받을 때 모든 적의 버프 지속 시간을 1턴 감소시킵니다.",
                                    "{C/Striker} 적으로부터 받는 데미지를 크게 감소시키지만, {C/Mage}와 {C/Ranger} 적으로부터 받는 데미지가 증가합니다.",
                                    "{E/Dark} 유닛은 {D/BT_STAT|ST_CRITICAL_RATE_IR}이 감소합니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ForestKingALTeams.forestKingAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="o3-ytts1Kos"
                                title="숲의 왕 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)"
                                author="XuRenChao"
                                date="26/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
