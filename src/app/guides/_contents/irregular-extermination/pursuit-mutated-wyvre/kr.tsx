'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MutatedWyvrePOTeamsData from './MutatedWyvrePO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MutatedWyvrePOTeams = MutatedWyvrePOTeamsData as Record<string, TeamData>

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="변이된 와이브르 추격 섬멸전 가이드"
            introduction="변이된 와이브르는 약화 효과에 대한 영구 면역을 가지고 있으며, 치명타가 아닌 공격을 받으면 WG를 50% 회복합니다. 또한 반격/복수/신속 대응 및 공격이 아닌 스킬을 사용하면 팀 전체가 스턴됩니다. 높은 치명 확률이 필요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Mutated Wyvre' modeKey='Pursuit Operation' defaultBossId='51202003' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "반격/복수/신속 대응 및 공격이 아닌 스킬을 사용하면 팀 전체가 1턴 동안 {D/BT_STUN} 상태가 됩니다.",
                                "{D/BT_FIXED_DAMAGE}는 5000이 상한입니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MutatedWyvrePOTeams.mutatedWyvrePO} defaultStage="One Run Kill" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="PCgNRKFlRGI" title="변이된 와이브르 - 추격 섬멸전 - 원킬" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
