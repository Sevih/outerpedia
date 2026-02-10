'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaTeamsData from './Ars-Nova.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaTeams = ArsNovaTeamsData as Record<string, TeamData>

export default function ArsNova13Guide() {
    return (
        <GuideTemplate
            title="아르스 노바 특수의뢰 공략 가이드"
            introduction="아르스 노바는 버프 관리와 AoE 데미지를 통한 코어 처리가 필요합니다. 보스는 {B/BT_STAT|ST_COUNTER_RATE} 버프를 획득하며, 제거하거나 탈취해야 합니다. 매 턴 고정 데미지가 증가하고, 체인 게이지가 150 이상이면 약점 게이지 데미지를 받지 않습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Ars Nova' modeKey='Special Request: Identification' defaultBossId='407600862' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Dark} 유닛만 풀 WG 데미지를 줄 수 있습니다. 어둠 속성이 아닌 유닛은 WG 데미지가 50% 감소합니다.",
                                "팀의 CP가 150 이상이면 보스는 WG 데미지를 받지 않습니다. CP를 이 임계값 아래로 유지하세요.",
                                "보스는 공격할 때마다 열등 코어를 소환합니다. 생존한 코어 하나당 보스의 고정 데미지가 1500 증가합니다.",
                                "코어를 처치하면 CP가 15씩 감소합니다.",
                                "HP 30%에서 3턴간 격노 상태에 돌입하고, 이후 칸타타로 치명적인 데미지를 줍니다. 발동 전에 처치하거나 브레이크하세요.",
                                "전투 시작 4턴 이내에 격노하면 팀이 CP 80을 획득합니다. 체인 스킬을 더 빨리 발동하는 데 활용할 수 있습니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaTeams.arsNovaSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="vsR7eGIbuFE" title="아르스 노바 13 – 클리어 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
