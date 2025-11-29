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
            title="造物主德雷坎 晋升挑战指南"
            introduction="一流冒险家晋升挑战，{P/Demiurge Drakhan}和{P/Vlada}登场。慢慢来是关键（无敌、复活、重生）。建议使用{I-T/Sage's Charm}在{B/BT_INVINCIBLE_IR}阶段积累CP。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000004' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000005' labelFilter={"First-Rate Adventurer Promotion Challenge"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "德雷坎在战斗开始时和击杀敌人时，对全体友军施加{B/BT_INVINCIBLE_IR}（3回合）。",
                                    "避免对德雷坎造成暴击 - 会重置其必杀技冷却时间并使其行动值提升35%。",
                                    "德雷坎的必杀技在目标HP为30%或以下时会造成即死。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DdrakhanALTeams.ddrakhanAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EW0F4F3_5YY"
                                title="一流晋升 vs 造物主德雷坎 通关指南！"
                                author="Adjen"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
