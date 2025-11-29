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
            title="造物主布拉达 冒险许可证 攻略"
            introduction="造物主布拉达和德雷坎在命中弱化效果时会使全体友军的HP恢复15%,并且根据目标的弱化效果数量增加伤害。{D/BT_DOT_CURSE}和{D/BT_FIXED_DAMAGE}可以无限制地附加。通常需要1-2次尝试。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Vlada' modeKey='Challenge' defaultBossId='50000006' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                                <BossDisplay bossKey='Drakhan' modeKey='Challenge' defaultBossId='50000007' labelFilter={"Supreme Adventurer Promotion Challenge 1"}/>
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "两个敌人在命中弱化效果时都会使全体友军的HP恢复15%。",
                                    "两个敌人都会根据目标的弱化效果数量增加伤害。",
                                    "{D/BT_DOT_CURSE}和{D/BT_FIXED_DAMAGE}可以无限制地附加。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladaALTeams.vladaAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="JIx2mVtXufA"
                                title="造物主布拉达 - 冒险许可证: 晋升挑战"
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
