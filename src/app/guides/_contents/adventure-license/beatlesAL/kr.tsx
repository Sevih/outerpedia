'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BeatlesALTeamsData from './BeatlesAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BeatlesALTeams = BeatlesALTeamsData as Record<string, TeamData>

export default function DekrilMekrilGuide() {
    return (
        <GuideTemplate
            title="데그릴 & 메그릴 모험가 라이센스 공략 가이드"
            introduction="데그릴 & 메그릴 모험가 라이센스는 스페셜 리퀘스트 스테이지 12와 동일한 스킬을 가지고 있습니다. 이 형제 듀오는 적절한 팀 구성으로 1회 시도로 안정적으로 클리어할 수 있습니다. 이 공략은 스테이지 9까지 검증되었습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey="Dek'Ril" modeKey='Adventure License' defaultBossId='51000007' />
                                <BossDisplay bossKey="Mek'Ril" modeKey='Adventure License' defaultBossId='51000008' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "스페셜 리퀘스트 스테이지 12와 동일한 스킬입니다.",
                                    "{E/Fire} 유닛만 전체 피해를 입힙니다. 화속성이 아닌 유닛은 피해가 감소하고 두 보스 모두에게 받는 피해가 증가합니다.",
                                    "메그릴이 살아있는 동안 모든 받는 피해가 크게 감소합니다. 이 보호를 해제하려면 메그릴을 먼저 처치하세요.",
                                    "메그릴이 사망하면 데그릴이 1턴 동안 {B/BT_INVINCIBLE}과 {B/BT_STAT|ST_ATK}를 획득합니다. 버스트 타이밍을 조절하세요.",
                                    "데그릴은 전체 공격을 받으면 {B/BT_STAT|ST_AVOID}를 획득합니다. 체인이 아닌 전체 스킬 사용은 피하세요.",
                                    "데그릴이 회피하면 WG 피해를 받지 않고 아틀라스(전체 공격 + {D/BT_DOT_POISON} + 배리어)로 반격합니다.",
                                    "HP 70%에서 데그릴은 4턴 동안 광폭화합니다. 광폭화 종료 시 악타이온으로 높은 단일 대상 피해를 입히고 모든 적에게 해제 불가 {D/BT_SEALED_RECEIVE_HEAL}를 부여합니다.",
                                    "전투 시작 2턴 이내에 데그릴이 광폭화하면 팀이 80 CP를 획득합니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="mx8ml6X_RZI"
                                title="Dek'ril & Mek'ril - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="19/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
