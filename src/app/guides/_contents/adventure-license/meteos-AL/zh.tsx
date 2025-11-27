'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosALTeamsData from './MeteosAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosALTeams = MeteosALTeamsData as Record<string, TeamData>

export default function BlazingKnightMeteosGuide() {
    return (
        <GuideTemplate
            title="火焰骑士梅修斯 冒险许可证 指南"
            introduction="火焰骑士梅修斯冒险许可证具有与特殊请求第12阶段相同的技能，但只有第1次狂暴阶段。使用正确的队伍配置可以在1-2次尝试中稳定通关。已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Adventure License' defaultBossId='51000012' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "减少来自非{E/Water}敌人的WG伤害50%。",
                                    "Boss对拥有{B/BT_SHIELD_BASED_CASTER}的目标造成减少的伤害。",
                                    "使用{B/BT_REMOVE_DEBUFF}来应对{D/BT_SEALED}。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosALTeams.meteosAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Do7Vyjz3odI"
                                title="火焰骑士梅修斯 - 冒险许可证 - 第10阶段 - 1次通关"
                                author="XuRenChao"
                                date="11/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
