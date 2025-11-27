'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
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
                                    "与特殊委托第12阶段技能相同。",
                                    "只有{E/Fire}单位能造成完整伤害。非火属性单位伤害降低，且受到两个BOSS的伤害增加。",
                                    "梅格里尔存活时，所有受到的伤害大幅降低。先击杀梅格里尔以解除这个保护。",
                                    "梅格里尔死亡时，泰格里尔获得1回合{B/BT_INVINCIBLE}和{B/BT_STAT|ST_ATK}。请相应调整爆发时机。",
                                    "泰格里尔被全体攻击命中时获得{B/BT_STAT|ST_AVOID}。避免使用非连锁全体技能。",
                                    "泰格里尔回避时不受WG伤害，并用阿特拉斯反击（全体攻击 + {D/BT_DOT_POISON} + 护盾）。",
                                    "在70%血量时，泰格里尔狂暴化4回合。狂暴化结束时，使用阿克特翁造成高额单体伤害，并对所有敌人施加无法解除的{D/BT_SEALED_RECEIVE_HEAL}。",
                                    "如果泰格里尔在战斗开始2回合内狂暴化，队伍获得80 CP。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BeatlesALTeams.beatlesAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="mx8ml6X_RZI"
                                title="Dek'ril & Mek'ril - Adventure License - Stage 10 - 1 run clear (Auto)"
                                author="XuRenChao"
                                date="19/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
