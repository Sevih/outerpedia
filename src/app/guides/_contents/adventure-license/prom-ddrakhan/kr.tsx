'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import DdrakhanALTeamsData from './DdrakhanAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import CombatFootage from '@/app/components/CombatFootage'
import { recommendedCharacters } from './recommendedCharacters'

const DdrakhanALTeams = DdrakhanALTeamsData as Record<string, TeamData>

export default function DdrakhanPromotionGuide() {
    return (
        <GuideTemplate
            title="데미우르고스 드레이칸 승급 챌린지 가이드"
            introduction="일류 모험가 승급 챌린지, {P/Demiurge Drakhan}과 {P/Vlada}가 등장합니다. 천천히 진행하는 것이 핵심입니다 (무적, 부활, 소생). {B/BT_INVINCIBLE_IR} 페이즈 동안 CP를 축적하기 위해 {I-T/Sage's Charm}을 추천합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000004' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000005' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "드레이칸은 전투 시작 시와 적을 처치할 때 아군 전체에게 {B/BT_INVINCIBLE_IR} (3턴)을 부여합니다.",
                                    "드레이칸에게 치명타를 피하세요 - 궁극기 쿨타임이 초기화되고 행동 게이지가 35% 증가합니다.",
                                    "드레이칸의 궁극기는 대상 HP가 30% 이하면 즉사시킵니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DdrakhanALTeams.ddrakhanAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EW0F4F3_5YY"
                                title="일류 승급 vs 데미드레이칸 클리어 가이드!"
                                author="Adjen"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
