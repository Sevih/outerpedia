'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DasteiALTeamsData from './DasteiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'
import CombatFootage from '@/app/components/CombatFootage'

const DasteiALTeams = DasteiALTeamsData as Record<string, TeamData>

export default function DasteiPromotionGuide() {
    return (
        <GuideTemplate
            title="데미우르고스 아스테 승급 챌린지 가이드"
            introduction="수석 모험가 승급 챌린지 ({P/Demiurge Astei}). {D/BT_STONE}을 부여하고 {D/BT_STONE_IR}로 전환 가능. HP 50%에서 광폭화하며 3턴 후 전멸 공격. {D/BT_DOT_CURSE} 또는 {D/BT_FIXED_DAMAGE} 팀으로 피해 감소 무시. 보통 1회 시도로 클리어 가능."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Astei' modeKey='Challenge' defaultBossId='50000002' />
                                <BossDisplay bossKey='Sterope' modeKey='Challenge' defaultBossId='50000003' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "턴 종료 시 무작위 적에게 {D/BT_STONE} 부여. {D/BT_STONE_IR}로 전환 가능 (6턴).",
                                    "HP 50%에서 광폭화. 3턴 후 전멸 공격.",
                                    "{D/BT_DOT_CURSE} 또는 {D/BT_FIXED_DAMAGE}로 피해 감소 무시."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DasteiALTeams.dasteiAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                                                        <CombatFootage />
                        </>
                    ),
                },
            }}
        />
    )
}
