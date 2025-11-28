'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ForestKingALTeamsData from './ForestKingAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ForestKingALTeams = ForestKingALTeamsData as Record<string, TeamData>

export default function ForestKingGuide() {
    return (
        <GuideTemplate
            title="森林之王 冒险许可证 指南"
            introduction="森林之王冒险许可证具有简单的机制，主要使用减益攻击。使用正确的队伍配置可以在1次尝试中稳定通关。已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Forest King' modeKey='Adventure License' defaultBossId='51000017' />
                            <BossDisplay bossKey='Spare Core' modeKey='Adventure License' defaultBossId='51000018' labelFilter={"Weekly Conquest - Forest King"} />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "使用终极技能对{D/BT_STUN}状态的目标造成增加的伤害。",
                                    "受到攻击时，减少所有敌人的增益持续时间1回合。",
                                    "大幅减少来自{C/Striker}敌人的伤害，但增加来自{C/Mage}和{C/Ranger}敌人的伤害。",
                                    "{E/Dark}单位的{D/BT_STAT|ST_CRITICAL_RATE_IR}减少。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ForestKingALTeams.forestKingAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="o3-ytts1Kos"
                                title="森林之王 - 冒险许可证 - 第10阶段 - 1次通关 (自动)"
                                author="XuRenChao"
                                date="26/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
