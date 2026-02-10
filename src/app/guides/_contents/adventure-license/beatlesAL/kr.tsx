'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
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
                                    "체인 스킬이 아닌 AoE 스킬을 사용하면 보스에게 {B/BT_STAT|ST_DEF}이 부여됩니다.",
                                    "캐릭터가 {D/BT_DOT_POISON}에 걸린 경우, 보스는 행동 직후 반격합니다.",
                                    "메인 보스(오른쪽)만 공격합니다. 왼쪽 보스는 지속적으로 {B/BT_STAT|ST_ATK}를 버프합니다.",
                                    "왼쪽 보스를 처치하면 메인 보스가 {B/BT_INVINCIBLE}과 {B/BT_STAT|ST_ATK}를 획득합니다.",
                                    "{D/BT_REMOVE_BUFF}이나 {D/BT_STEAL_BUFF}를 부여할 수 있는 캐릭터를 강력히 추천합니다.",
                                    "{B/BT_STAT|ST_DEF} 발동을 피하기 위해 단일 대상 DPS에 집중하세요."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}
