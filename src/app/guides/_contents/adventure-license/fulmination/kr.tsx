'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import FulminationALTeamsData from './FulminationAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'

const FulminationALTeams = FulminationALTeamsData as Record<string, TeamData>

export default function FulminationALGuide() {
    return (
        <GuideTemplate
            title="블라다 어설트 슈트 어드벤처 라이선스 가이드"
            introduction="블라다 어설트 슈트는 반격과 복수 공격으로만 WG 피해를 받는 독특한 메커니즘을 가지고 있습니다. 적절한 팀 구성으로 일반적으로 1회 시도로 클리어할 수 있습니다. 이 전략은 스테이지 10까지 검증되었습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Vlada Assault Suit' modeKey='Adventure License' defaultBossId='51000029' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "반격과 복수 공격으로만 WG 피해를 받습니다.",
                                    "광역 공격의 피해를 크게 감소시킵니다.",
                                    "비{E/Earth} 유닛의 {D/BT_STAT|ST_CRITICAL_RATE_IR}를 감소시킵니다.",
                                    "S2는 버프가 없는 대상에게 크게 증가된 피해를 입힙니다.",
                                    "S3는 보스에게 {B/BT_STAT|ST_SPEED}를, 팀에게 {D/BT_STAT|ST_SPEED}를 부여하며 면역과 저항을 무시합니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={FulminationALTeams.fulminationAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lt4osbmszzY"
                                title="Ful.Mi.NATION Assault Suit - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="29/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
