'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BlockbusterPOTeamsData from './BlockbusterPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BlockbusterPOTeams = BlockbusterPOTeamsData as Record<string, TeamData>

export default function BlockbusterPOGuide() {
    return (
        <GuideTemplate
            title="블록버스터 추격 섬멸전 가이드"
            introduction="블록버스터는 매 턴 시작 시 무작위 강화 효과를 획득하며, 치명타 피격 시 받는 피해가 크게 감소하고 WG를 50% 회복합니다. {B/HEAVY_STRIKE}를 사용하는 비치명 팀이나 WG 메커니즘을 무시할 수 있는 강력한 DPS가 가장 효과적입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Blockbuster' modeKey='Pursuit Operation' defaultBossId='51202002' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "매 턴 시작 시 무작위 강화 효과를 획득한다.",
                                "치명타 피격 시 받는 피해가 크게 감소하고 WG를 50% 회복한다.",
                                "{B/HEAVY_STRIKE} 캐릭터를 사용하여 치명 페널티를 회피.",
                                "{D/BT_SEALED}로 보스의 강화를 방지."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BlockbusterPOTeams.blockbusterPO} defaultStage="Non-Crit Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="pgWkc6X6VNE" title="블록버스터 - 추격 섬멸전 - 1회 클리어" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
