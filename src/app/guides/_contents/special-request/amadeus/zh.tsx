'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusTeamsData from './Amadeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const AmadeusTeams = AmadeusTeamsData as Record<string, TeamData>

export default function Amadeus13Guide() {
    return (
        <GuideTemplate
            title="阿玛迪斯特殊委托攻略指南"
            introduction="阿玛迪斯是一个需要精细管理减益效果和策略性角色选择的高难度BOSS。在没有减益效果的情况下，弱点槽伤害无效，且BOSS会施加无视免疫的随机减益，因此净化和减益施加是通关的关键。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Special Request: Identification' defaultBossId='407600962' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "没有减益时{D/BT_WG_REVERSE_HEAL}无效。持续施加减益。",
                                "施加无视{B/BT_IMMUNE}的{D/BT_RANDOM}。施加后的净化至关重要。",
                                "使用非攻击技能会给BOSS提供{D/BT_STAT|ST_CRITICAL_RATE_IR}。不要使用拥有非攻击技能的角色。",
                                "免疫{D/BT_SEALED}。",
                                "BOSS每回合将队伍的减益延长1回合。合理规划净化时机。",
                                "BOSS的增益可以被Kuro转化为长时间减益。",
                                "只有{E/Light}角色能造成WG伤害。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusTeams.amadeusSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="2lbN-rK89xI" title="阿玛迪斯13 – 通关录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
