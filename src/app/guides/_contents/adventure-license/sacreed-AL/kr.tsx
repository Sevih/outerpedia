'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SacreedALTeamsData from './SacreedAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SacreedALTeams = SacreedALTeamsData as Record<string, TeamData>

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="세이크리드 가디언 모험 라이선스 가이드"
            introduction="세이크리드 가디언 모험 라이선스는 스페셜 리퀘스트 스테이지 12와 동일한 스킬을 가지고 있습니다. 보스는 턴 종료 시 강화 효과가 있으면 무적을 획득하므로, {D/BT_REMOVE_BUFF} 또는 {D/BT_STUN} 잠금이 필수입니다. 적절한 팀 구성으로 1~2회 클리어가 가능합니다. 스테이지 10까지 검증되었습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Sacreed Guardian' modeKey='Adventure License' defaultBossId='51000021' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000022' labelFilter={"Weekly Conquest - Sacreed Guardian"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "보스가 턴 종료 시 강화 효과를 보유하고 있으면, {C/Healer}를 제외한 모든 유닛에게 {D/BT_STUN}을 부여하고 {B/BT_INVINCIBLE}을 획득합니다. {D/BT_REMOVE_BUFF} 또는 {D/BT_STUN}으로 방지하세요.",
                                    "보스는 4턴마다 광폭화하여 해제 불가능한 공격력 증가 및 피해 감소 버프를 획득합니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedALTeams.sacreedAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="1ui7TcwD7po"
                                title="세이크리드 가디언 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)"
                                author="XuRenChao"
                                date="06/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
