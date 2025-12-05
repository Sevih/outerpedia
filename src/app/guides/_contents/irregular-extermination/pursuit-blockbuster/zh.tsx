'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import BlockbusterPOTeamsData from './BlockbusterPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const BlockbusterPOTeams = BlockbusterPOTeamsData as Record<string, TeamData>

export default function BlockbusterPOGuide() {
    return (
        <GuideTemplate
            title="破坏猛兽 追击歼灭战攻略"
            introduction="破坏猛兽每回合开始时获得随机强化效果,受到暴击时大幅降低所受伤害并恢复50%的WG。使用{B/HEAVY_STRIKE}的非暴击队伍或能够无视WG机制的强力DPS效果最佳。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <BossDisplay bossKey='Blockbuster' modeKey='Pursuit Operation' defaultBossId='51202002' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "每回合开始时获得随机强化效果。",
                                "受到暴击时,所受伤害大幅降低并恢复50%的WG。",
                                "使用{B/HEAVY_STRIKE}角色来避免触发暴击惩罚。",
                                "使用{D/BT_SEALED}阻止Boss获得强化。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={BlockbusterPOTeams.blockbusterPO} defaultStage="Non-Crit Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="pgWkc6X6VNE" title="破坏猛兽 - 追击歼灭战 - 一次通关" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
