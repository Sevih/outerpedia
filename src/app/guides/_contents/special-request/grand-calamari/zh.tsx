'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import CalamariTeamsData from './Grand-Calamari.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const CalamariTeams = CalamariTeamsData as Record<string, TeamData>

export default function GrandCalamari13Guide() {
    return (
        <GuideTemplate
            title="巨型鱿鱼特殊委托攻略指南"
            introduction="巨型鱿鱼免疫增益移除，且每回合减少减益持续时间1回合。战斗的关键是使用{D/BT_SEALED}、{D/BT_STEAL_BUFF}或{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}来阻止BOSS获得增益。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Special Request: Ecology Study' defaultBossId='403400362' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "免疫增益移除。使用{D/BT_SEALED}、{D/BT_STEAL_BUFF}或{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}来阻止BOSS获得增益。",
                                "每回合减少减益持续时间1回合。频繁重新施加减益。",
                                "施加{D/BT_STAT|ST_BUFF_CHANCE}减益。带一个有被动净化触发的净化角色。",
                                "只有{E/Light}角色能造成WG伤害。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariTeams.grandCalamariSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="O9cxC5paoes" title="巨型鱿鱼13 – 通关录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
