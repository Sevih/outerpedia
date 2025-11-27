'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusALTeamsData from './AmadeusAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'

const AmadeusALTeams = AmadeusALTeamsData as Record<string, TeamData>

export default function AmadeusALGuide() {
    return (
        <GuideTemplate
            title="아마데우스 모험가 라이센스 공략 가이드"
            introduction="아마데우스 모험가 라이센스는 특수 의뢰 스테이지 12와 동일한 스킬이 특징입니다. 적절한 팀 구성으로 보통 1~2회 시도로 클리어할 수 있습니다. 이 전략은 스테이지 10까지 검증되었습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Adventure License' defaultBossId='51000026' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "격노 메커니즘이 발동하기 전에 충분한 {D/BT_WG_REVERSE_HEAL}를 주기 위해 디버프를 계속 적용하세요.",
                                    "보스는 면역을 무시하는 랜덤 디버프를 부여합니다. 디버프가 적용된 후 정화가 중요합니다.",
                                    "보스는 매 라운드 파티 디버프를 1턴 연장합니다. 정화를 계획적으로 사용하세요.",
                                    "비공격 스킬을 가진 캐릭터는 사용하지 마세요. 보스에게 영구적인 크리티컬 히트 버프를 줍니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusALTeams.amadeusAL} defaultStage="Recommended Team" replace={{ lead: "", mid: "", tail: "" }} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EJNnAhVZPkY"
                                title="Amadeus - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="08/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
