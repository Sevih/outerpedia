'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysTeamsData from './Glicys.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysTeams = GlicysTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
    return (
        <GuideTemplate
            title="글리시스 특수의뢰 공략 가이드"
            introduction="글리시스의 핵심 메커니즘은 소환 몹과 {D/BT_FREEZE} 디버프를 중심으로 전개됩니다. 신중하게 관리해야 할 쫄을 소환하며, 쫄을 처치하기 전까지 보스에 대한 단일 대상 공격은 약점 게이지를 회복시킵니다. HP 50%에서 격노 페이즈에 돌입하며 메커니즘이 강화됩니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Glicys' modeKey='Special Request: Identification' defaultBossId='407600162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스는 오른쪽에 작은 몹을 소환합니다. 단일 대상 스킬로 공격하면 몹과 보스의 방어력이 모두 감소합니다.",
                                "오른쪽 몹은 공격 시 {D/BT_FREEZE}를 부여합니다.",
                                "쫄을 처치하기 전까지 보스에 대한 단일 대상 공격은 WG를 회복시킵니다. 초반에는 피하세요.",
                                "보스는 빙결된 적에게 증가된 데미지를 줍니다 (특히 스테이지 13).",
                                "HP 50%에서 보스는 격노 상태에 돌입하고 왼쪽에 큰 몹을 소환합니다.",
                                "왼쪽 몹을 원킬하지 못하면 팀이 {D/BT_FREEZE}를 받습니다.",
                                "격노 중 보스는 {B/BT_INVINCIBLE_IR}을 획득합니다. 버스트 타이밍을 계획하세요.",
                                "팀은 글리시스보다 느린 것이 이상적입니다. 스피드 상호작용 페널티를 피하기 위해서입니다.",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GlicysTeams.glicysSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="NikwWwstygo" title="글리시스 전투 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
