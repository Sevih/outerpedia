'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import PrimordialSentinelTeamsData from './PrimordialSentinel.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'

const PrimordialSentinelTeams = PrimordialSentinelTeamsData as Record<string, TeamData>

const primordialSentinelNovember2025 = {
    boss1Key: 'Primordial Sentinel',
    boss2Key: 'Glorious Sentinel',
    boss1Ids: {
        'Normal': '4086007',
        'Very Hard': '4086009',
        'Extreme': '4086011'
    },
    boss2Ids: {
        'Hard': '4086008',
        'Very Hard': '4086010',
        'Extreme': '4086012'
    }
} as const

export default function PrimordialSentinelGuide() {
    return (
        <GuideTemplate
            title="始源守卫（荣耀守卫）攻略指南"
            introduction="始源守卫是一个需要精确团队配合和时机把控的双阶段世界Boss。本指南涵盖了直到极限联赛的攻略策略。"
            defaultVersion="november2025"
            versions={{
                november2025: {
                    label: '2025年11月',
                    content: (
                        <>
                            <WorldBossDisplay config={primordialSentinelNovember2025} defaultMode="Extreme" />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                sections={[
                                    {
                                        title: "strategy",
                                        tips: [
                                            "整场战斗围绕行动顺序控制展开。在第一阶段，尽可能利用行动顺序减少。",
                                            "在第二阶段，Boss免疫行动顺序减少，因此需要让角色尽可能快。",
                                            "装备贤者和盗贼护符以获得技能连锁和CP生成（别忘了盗贼的暴击率）。",
                                            "在两个阶段中，至少带一名治疗师，通过{B/UNIQUE_DAHLIA_A}buff来获得{D/BT_STAT|ST_SPEED}。"
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "如果队伍2中有6星{P/Monad Eva}，可以在第一阶段积累CP，然后在接近结束时切换到队伍2。",
                                            "{P/Monad Eva}会立即给Boss上{D/BT_SEAL_ADDITIVE_ATTACK}，让你保留在第一阶段积累的CP。"
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList title="phase1" entries={phase1Characters} />
                            <RecommendedCharacterList title="phase2" entries={phase2Characters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={PrimordialSentinelTeams.november2025} defaultStage="Phase 1" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="4me_DqMftbs"
                                title="始源守卫 - 世界Boss - SSS - 极限联赛"
                                author="Unknown"
                                date="01/11/2025"
                            />
                            <p className="mt-2 text-neutral-400 text-sm">
                                注意：此视频展示的是SSS极限通关。相同的策略可以应用于较低难度，但某些Boss机制可能会被削弱或禁用。由于极限联赛之前分数不是无限的，因此在第一阶段不需要太专注于积累连锁点数。
                            </p>
                        </>
                    ),
                },
                july2024: {
                    label: '2024年7月',
                    content: (
                        <>
                            <TacticalTips
                                sections={[
                                    {
                                        title: "phase1",
                                        tips: [
                                            "尽可能多地使用{P/Valentine}的S3。",
                                            "{P/Iota}只使用S1。",
                                            "{P/Notia}必须保持buff覆盖率以推动行动顺序。",
                                            "{P/Dianne}需要{P/Iota}拥有最高ATK，用S1每回合推动她。",
                                            "在P1积累CP，用{P/Iota}和{P/Valentine}的行动顺序减少锁住Boss。",
                                            "不要治疗{P/Iota}，让她自损到1HP（通过迅捷提升SPD）。",
                                            "击破Boss一次，将WG降到1-2，用{P/Iota}的S3/S2B2施加无敌。",
                                            "确保击破后Boss血量约120万，并准备好10次连锁攻击。",
                                            "将P1伤害推过阈值以召唤P2 Boss。",
                                            "{P/Iota}（1HP，迅捷）会在P2 Boss之前行动。切换到队伍2。"
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "P2 Boss使用S2施加{D/BT_DOT_LIGHTNING}，{P/Monad Eva}的S2可以立即解除。",
                                            "解除 = \"治疗师行动\"，会给Boss施加{D/BT_STAT|ST_SPEED}。",
                                            "队伍可以在速度上胜出并击破 + 移除核心能量。",
                                            "连发连锁攻击锁住它，用{P/Monad Eva}的S1帮助积累CP。"
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <GuideHeading level={3}>重要说明</GuideHeading>
                            <p className="text-neutral-300 mb-4">
                                此阵容仅适用于6星{'{P/Monad Eva}'}。感谢<strong>Birdmouth</strong>发现这个方法。
                                核心能量buff算作追加攻击，{'{P/Monad Eva}'}战斗开始时的技能封印可以取消它。
                                这可以保护你的CP不会丢失。
                            </p>
                            <p className="text-neutral-300 mb-4">
                                替代方案：在第一阶段期间切换到队伍2。由于{'{E/Light}'}{'{E/Dark}'}单位无法在P1减少WG，
                                你需要在队伍2中至少有一个{'{E/Fire}'}{'{E/Water}'}{'{E/Earth}'}单位。这让{'{P/Monad Eva}'}在进入P2时施加技能封印并保护你的轮转。
                            </p>
                            <p className="text-neutral-300">
                                另一个选择：用{'{P/Demiurge Stella}'}代替{'{P/Stella}'}。在P1结束时切换到队伍2，使用一次连锁技能触发固定伤害并进入P2。
                            </p>
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Kd-dKroOXEo"
                                title="荣耀守卫 世界Boss 2300万+ by Ducky"
                                author="Ducky"
                                date="01/07/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
