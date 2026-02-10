'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MeteosTeamsData from './Meteos.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const MeteosTeams = MeteosTeamsData as Record<string, TeamData>

export default function MeteosGuide() {
    return (
        <GuideTemplate
            title="炽热骑士梅提欧斯特殊委托攻略指南"
            introduction="梅提欧斯的机制主要与{B/BT_SHIELD_BASED_CASTER}增益相关。他拥有一个每受到5次攻击就触发AoE反击的特殊槽，且拥有减益时伤害增加。由于他阻止治疗效果，治疗者无效。受{B/BT_SHIELD_BASED_CASTER}保护的角色即使在狂暴期间也会受到大幅减少的伤害。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Blazing Knight Meteos' modeKey='Special Request: Identification' defaultBossId='407600262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "BOSS拥有每受到5次攻击就触发AoE反击的特殊槽。推荐使用协同攻击和连锁攻击。",
                                "BOSS有减益时伤害增加。将减益保持在最多2-3个。",
                                "BOSS施加永久{D/BT_SEALED_RECEIVE_HEAL}，使治疗者无效。",
                                "高阶段BOSS会对DPS角色施加{D/BT_SEALED}。",
                                "受{B/BT_SHIELD_BASED_CASTER}保护的角色受到的BOSS伤害大幅减少。",
                                "只有{E/Water}角色能造成WG伤害。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={MeteosTeams.meteosSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U2R6eEZgyuI" title="梅提欧斯战斗录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
