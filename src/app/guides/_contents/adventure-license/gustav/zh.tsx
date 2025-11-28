'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GustavALTeamsData from './GustavAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GustavALTeams = GustavALTeamsData as Record<string, TeamData>

export default function GustavGuide() {
    return (
        <GuideTemplate
            title="古斯塔夫 冒险许可证 指南"
            introduction="带有固定伤害机制的宝珠管理挑战。可在1-2次尝试中通关。已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Gustav' modeKey='Adventure License' defaultBossId='51000013' />
                            <BossDisplay bossKey='Spare Core' modeKey='Adventure License' defaultBossId='51000014' labelFilter={"Weekly Conquest - Gustav"} />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "宝珠在被攻击时造成{D/BT_FIXED_DAMAGE}。",
                                "使用拥有{B/BT_REMOVE_DEBUFF}或{B/BT_IMMUNE}的单位。",
                                "当宝珠被击败时,首领受到的伤害降低。",
                                "专注于单体伤害以最小化宝珠反击。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GustavALTeams.gustavAL} defaultStage="Standard Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="U29t5k0bDfY" title="古斯塔夫 - 冒险许可证 - 第10关 - 1次通关 (自动)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
