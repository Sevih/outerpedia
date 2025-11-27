'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosALTeamsData from './MeteosAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosALTeams = MeteosALTeamsData as Record<string, TeamData>

export default function BlazingKnightMeteosGuide() {
    return (
        <GuideTemplate
            title="화염기사 메테우스 모험 라이선스 가이드"
            introduction="화염기사 메테우스 모험 라이선스는 특별 의뢰 스테이지 12와 동일한 스킬을 가지고 있지만, 1차 격노 단계만 있습니다. 적절한 팀 구성으로 1~2회 시도로 안정적으로 클리어할 수 있습니다. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Adventure License' defaultBossId='51000012' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "{E/Water}가 아닌 적으로부터 받는 WG 데미지를 50% 감소시킵니다.",
                                    "보스는 {B/BT_SHIELD_BASED_CASTER}를 가진 대상에게 감소된 데미지를 입힙니다.",
                                    "{B/BT_REMOVE_DEBUFF}를 사용하여 {D/BT_SEALED}에 대응하세요."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosALTeams.meteosAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Do7Vyjz3odI"
                                title="화염기사 메테우스 - 모험 라이선스 - 스테이지 10 - 1회 클리어"
                                author="XuRenChao"
                                date="11/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
