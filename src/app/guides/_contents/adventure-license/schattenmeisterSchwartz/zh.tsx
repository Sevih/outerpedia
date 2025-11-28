'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SchattenmeisterSchwartzALTeamsData from './SchattenmeisterSchwartzAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SchattenmeisterSchwartzALTeams = SchattenmeisterSchwartzALTeamsData as Record<string, TeamData>

export default function SchattenmeisterSchwartzGuide() {
    return (
        <GuideTemplate
            title="夜影团长施瓦兹 冒险许可证 攻略"
            introduction="夜影团长施瓦兹会施加无法解除的{D/IG_Buff_Effect_Sealed_Interruption_D}并召唤暗影兽。Boss单独时伤害较低，但暗影兽存活时伤害会增加。使用群体攻击快速清理小怪。已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Schattenmeister Schwartz' modeKey='Adventure License' defaultBossId='51000019' />
                                <BossDisplay bossKey='Shadow Beast Fire-Breather' modeKey='Adventure License' defaultBossId='51000020' labelFilter={"Weekly Conquest - Schattenmeister Schwartz"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "对全体敌人始终施加无法解除的{D/IG_Buff_Effect_Sealed_Interruption_D}。",
                                    "使用群体攻击快速清理暗影兽。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SchattenmeisterSchwartzALTeams.schattenmeisterSchwartzAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="glWpGZRH4xc"
                                title="夜影团长施瓦兹 - 冒险许可证 - 第10阶段 - 1次通关 (自动)"
                                author="XuRenChao"
                                date="01/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
