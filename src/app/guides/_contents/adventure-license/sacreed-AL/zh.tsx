'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import SacreedALTeamsData from './SacreedAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SacreedALTeams = SacreedALTeamsData as Record<string, TeamData>

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="圣科利德守护者 冒险许可证 攻略"
            introduction="圣科利德守护者冒险许可证拥有与特殊请求第12关相同的技能。首领在回合结束时若有强化效果则会获得无敌,因此{D/BT_REMOVE_BUFF}或{D/BT_STUN}锁定至关重要。使用合适的队伍可在1至2次尝试内通关。攻略已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Sacreed Guardian' modeKey='Adventure License' defaultBossId='51000021' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000022' labelFilter={"Weekly Conquest - Sacreed Guardian"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "若首领在回合结束时拥有任何强化效果,会对所有非{C/Healer}单位施加{D/BT_STUN}并获得{B/BT_INVINCIBLE}。使用{D/BT_REMOVE_BUFF}或{D/BT_STUN}来阻止。",
                                    "首领每4回合狂暴化,获得无法解除的攻击力提升和伤害降低效果。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedALTeams.sacreedAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="1ui7TcwD7po"
                                title="圣科利德守护者 - 冒险许可证 - 第10关 - 1次通关 (自动)"
                                author="XuRenChao"
                                date="06/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
