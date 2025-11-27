'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import VladiMaxALTeamsData from './VladiMaxAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladiMaxALTeams = VladiMaxALTeamsData as Record<string, TeamData>

export default function HeavyFixedVladiMaxGuide() {
    return (
        <GuideTemplate
            title="血腥麦克斯 冒险许可证指南"
            introduction="受到非攻击技能时会完全恢复生命值。暴击时会累积层数。可通过ETamamo单人或罗娜连携策略通关。已确认通关至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Vladi Max' modeKey='Adventure License' defaultBossId='51000030' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "敌人使用非攻击技能时会完全恢复生命值。",
                                "暴击时获得2层数，非暴击时减少1层数。持有5层数时首领行动会造成{D/BT_KILL}。",
                                "暴击不会造成WG伤害。",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladiMaxALTeams.vladiMaxAL} defaultStage="ETamamo Carry" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="lpQkc37S0zo" title="固定炮机布拉迪MAX - 冒险许可证 - 第10关 - 1次通关 (自动)" author="XuRenChao" date="01/10/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
