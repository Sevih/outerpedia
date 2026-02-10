'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import guardianTeamsData from './Guardian.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const guardianTeams = guardianTeamsData as Record<string, TeamData>

export default function MasterlessGuide() {
    return (
        <GuideTemplate
            title="无主守护者特殊委托攻略指南"
            introduction="这个BOSS的核心在于施加减益和管理召唤物。当BOSS没有减益时，弱点槽无法削减。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Masterless Guardian' modeKey='Special Request: Ecology Study' defaultBossId='404400162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "BOSS没有减益时，弱点槽无法削减且必杀技伤害大幅增加。",
                                "BOSS通过S1和S2召唤小兵。每个小兵行动时BOSS获得20%的{B/BT_ACTION_GAUGE}。",
                                "带上AoE技能快速清除小兵。",
                                "第12阶段：BOSS对{E/Earth}和{E/Fire}角色施加{D/BT_STAT|ST_CRITICAL_RATE_IR}。",
                                "第13阶段：BOSS对所有角色施加{D/BT_STAT|ST_CRITICAL_RATE_IR}。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={guardianTeams.guardianSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="jAJOiJgASCU" title="无主守护者战斗录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
