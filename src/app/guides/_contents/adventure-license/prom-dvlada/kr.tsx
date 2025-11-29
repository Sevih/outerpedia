'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import VladaALTeamsData from './VladaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladaALTeams = VladaALTeamsData as Record<string, TeamData>

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="데미우르고스 블라다 모험 라이선스 가이드"
            introduction="데미우르고스 블라다와 드레이칸은 약화 효과 적중 시 아군 전체의 HP를 15% 회복하며, 대상의 약화 효과 수에 비례하여 피해가 증가합니다. {D/BT_DOT_CURSE}와 {D/BT_FIXED_DAMAGE}는 제한 없이 부여 가능합니다. 보통 1~2회 시도가 필요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000006' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000007' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "양쪽 적 모두 약화 효과 적중 시 아군 전체의 HP를 15% 회복합니다.",
                                    "양쪽 적 모두 대상의 약화 효과 수에 비례하여 피해가 증가합니다.",
                                    "{D/BT_DOT_CURSE}와 {D/BT_FIXED_DAMAGE}는 제한 없이 부여 가능합니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladaALTeams.vladaAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="JIx2mVtXufA"
                                title="데미우르고스 블라다 - 모험 라이선스: 승급 챌린지"
                                author="Sevih"
                                date="09/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
