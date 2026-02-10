'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosTeamsData from './Meteos.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosTeams = MeteosTeamsData as Record<string, TeamData>

export default function MeteosGuide() {
    return (
        <GuideTemplate
            title="작열의 기사 메테오스 특수의뢰 공략 가이드"
            introduction="메테오스의 기믹은 주로 {B/BT_SHIELD_BASED_CASTER} 버프와 관련이 있습니다. 5회 공격을 받으면 AoE 반격을 발동하는 특수 게이지를 가지며, 디버프가 있으면 데미지가 증가합니다. 회복 효과를 차단하므로 힐러는 무력합니다. {B/BT_SHIELD_BASED_CASTER}로 보호된 유닛에는 격노 중에도 데미지가 대폭 감소합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Special Request: Identification' defaultBossId='407600262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스는 5회 공격을 받으면 AoE 반격을 발동하는 특수 게이지를 가지고 있습니다. 듀얼 어택과 체인 어택을 추천합니다.",
                                "보스는 디버프가 있으면 데미지가 증가합니다. 디버프를 최대 2~3개로 유지하세요.",
                                "보스가 영구적인 {D/BT_SEALED_RECEIVE_HEAL}을 부여하므로 힐러는 무력합니다.",
                                "고난이도 스테이지에서 보스가 DPS 유닛에게 {D/BT_SEALED}을 부여합니다.",
                                "{B/BT_SHIELD_BASED_CASTER}로 보호된 유닛에는 보스의 데미지가 대폭 감소합니다.",
                                "{E/Water} 유닛만 WG 데미지를 줄 수 있습니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosTeams.meteosSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U2R6eEZgyuI" title="메테오스 전투 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
