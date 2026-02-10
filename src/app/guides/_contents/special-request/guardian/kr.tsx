'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import guardianTeamsData from './Guardian.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const guardianTeams = guardianTeamsData as Record<string, TeamData>

export default function MasterlessGuide() {
    return (
        <GuideTemplate
            title="주인 없는 수호자 특수의뢰 공략 가이드"
            introduction="이 보스는 디버프 부여와 미니언 관리가 핵심입니다. 디버프가 없는 상태에서는 약점 게이지를 줄일 수 없습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Special Request: Ecology Study' defaultBossId='404400162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스에게 디버프가 없으면 약점 게이지를 줄일 수 없고, 궁극기 데미지가 대폭 증가합니다.",
                                "보스는 S1과 S2로 미니언을 소환합니다. 각 미니언이 행동하면 보스의 {B/BT_ACTION_GAUGE}가 20% 증가합니다.",
                                "AoE 스킬을 가져가서 미니언을 빠르게 처리하세요.",
                                "스테이지 12: 보스가 {E/Earth}와 {E/Fire} 유닛에게 {D/BT_STAT|ST_CRITICAL_RATE_IR}을 부여합니다.",
                                "스테이지 13: 보스가 모든 유닛에게 {D/BT_STAT|ST_CRITICAL_RATE_IR}을 부여합니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={guardianTeams.guardianSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="jAJOiJgASCU" title="주인 없는 수호자 전투 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
