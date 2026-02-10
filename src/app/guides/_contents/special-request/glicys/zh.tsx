'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysTeamsData from './Glicys.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysTeams = GlicysTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
    return (
        <GuideTemplate
            title="格利西斯特殊委托攻略指南"
            introduction="格利西斯的核心机制围绕召唤怪物和{D/BT_FREEZE}减益展开。她会召唤需要小心管理的小怪，在小怪被击杀前对BOSS使用单体攻击会恢复弱点槽。HP降至50%时进入狂暴阶段，机制强化。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Glicys' modeKey='Special Request: Identification' defaultBossId='407600162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "BOSS在右侧召唤一个小怪。用单体技能攻击它可以同时降低小怪和BOSS的防御力。",
                                "右侧小怪攻击时施加{D/BT_FREEZE}。",
                                "在小怪被击杀前，对BOSS使用单体攻击会恢复WG。前期请避免。",
                                "BOSS对冻结的敌人造成增加的伤害（尤其是第13阶段）。",
                                "HP降至50%时，BOSS进入狂暴并在左侧召唤一个大型怪物。",
                                "如果不能一击击杀左侧怪物，队伍会被{D/BT_FREEZE}。",
                                "狂暴期间BOSS获得{B/BT_INVINCIBLE_IR}。合理规划爆发时机。",
                                "队伍速度理想情况下应低于格利西斯，以避免速度惩罚。",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GlicysTeams.glicysSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="NikwWwstygo" title="格利西斯战斗录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
