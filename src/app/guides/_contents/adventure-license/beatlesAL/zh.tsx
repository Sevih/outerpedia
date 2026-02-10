'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import BossDisplay from '@/app/components/BossDisplay'
import BeatlesALTeamsData from './BeatlesAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BeatlesALTeams = BeatlesALTeamsData as Record<string, TeamData>

export default function DekrilMekrilGuide() {
    return (
        <GuideTemplate
            title="泰格里尔&梅格里尔 冒险执照攻略指南"
            introduction="泰格里尔&梅格里尔冒险执照与特殊委托第12阶段拥有相同的技能。这对兄弟组合使用合适的队伍配置可以稳定地一次通关。该攻略已验证至第9阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey="Dek'Ril" modeKey='Adventure License' defaultBossId='51000007' />
                                <BossDisplay bossKey="Mek'Ril" modeKey='Adventure License' defaultBossId='51000008' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "使用非连锁的AoE技能会给BOSS提供{B/BT_STAT|ST_DEF}。",
                                    "角色被{D/BT_DOT_POISON}影响时，BOSS会在行动后立即反击。",
                                    "主BOSS（右侧）是唯一攻击的。左侧BOSS持续增益{B/BT_STAT|ST_ATK}。",
                                    "如果左侧BOSS被击杀，主BOSS获得{B/BT_INVINCIBLE}和{B/BT_STAT|ST_ATK}。",
                                    "强烈推荐能施加{D/BT_REMOVE_BUFF}或{D/BT_STEAL_BUFF}的角色。",
                                    "集中单体DPS以避免触发{B/BT_STAT|ST_DEF}。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                        </>
                    ),
                },
            }}
        />
    )
}
