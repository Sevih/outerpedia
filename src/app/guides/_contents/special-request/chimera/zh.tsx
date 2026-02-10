'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import chimeraTeamsData from './Chimera.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const chimeraTeams = chimeraTeamsData as Record<string, TeamData>

export default function ChimeraGuide() {
    return (
        <GuideTemplate
            title="未确认嵌合体特殊委托攻略指南"
            introduction="为了获取速度装备和暴击装备，你需要尽快攻略的BOSS。嵌合体的技能并不复杂，本质上是一场DPS竞速。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Special Request: Ecology Study' defaultBossId='403400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "如果在狂暴前无法击杀，生存将变得非常困难。",
                                "幸运的是，{E/Fire}属性目前有很多应对这个BOSS的优秀工具。",
                                "嵌合体HP较低但防御力非常高，因此{D/BT_STAT|ST_DEF}几乎是必需的。",
                                "DPS角色装备穿透率%饰品可以大幅提升伤害。",
                                "嵌合体的被动将队伍暴击伤害降低85%，但给予所有角色100%暴击率。",
                                "因此不需要给角色堆暴击率。专注于攻击力和暴击伤害。",
                                "给每个角色装备{I-T/Rogue's Charm}，每次都会触发CP生成。{E/Fire}角色装备{I-T/Sage's Charm}也有效。",
                                "由于BOSS每次被攻击时获得10%的{B/BT_ACTION_GAUGE}，速度非常重要。",
                                "理想情况下，第12阶段全队速度应在175以上（第13阶段185以上）。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={chimeraTeams.chimeraSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eHRErCHZmp4" title="嵌合体战斗录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
