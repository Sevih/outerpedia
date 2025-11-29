'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import EvaALTeamsData from './EvaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const EvaALTeams = EvaALTeamsData as Record<string, TeamData>

export default function MonadEvaPromotionGuide() {
    return (
        <GuideTemplate
            title="모나드 에바 승급 챌린지 가이드"
            introduction="{P/Monad Eva}와 {P/K}가 등장하는 특급 모험가 승급 챌린지."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Eva' modeKey='Challenge' defaultBossId='50000008' />
                                <BossDisplay bossKey='K' modeKey='Challenge' defaultBossId='50000009' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "에바는 단일 공격 피격 시 WG 피해를 무효화하고 받는 피해를 감소시킨다. 광역 스킬을 사용할 것.",
                                    "{B/BT_CALL_BACKUP}의 피해가 매우 높으므로 버틸 수 있는 캐릭터나 부활 캐릭터를 편성할 것.",
                                    "두 보스 모두 속도 220이므로 모든 캐릭터를 최소 240 이상으로 맞출 것.",
                                    "보스에게 {D/BT_DOT_CURSE}와 {D/BT_FIXED_DAMAGE}가 유효하며 상한 없음."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={EvaALTeams.evaAL} defaultStage="Fixed Damage Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="AOhLXfgLUzM"
                                title="모나드 에바 - 승급 챌린지"
                                author="XuRenChao"
                                date="09/06/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
