'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ShadowArchALTeamsData from './ShadowArchAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ShadowArchALTeams = ShadowArchALTeamsData as Record<string, TeamData>

export default function ShadowOfTheArchdemonGuide() {
    return (
        <GuideTemplate
            title="魔王弗洛森 冒险许可证 攻略"
            introduction="魔王弗洛森会将非{E/Fire}属性敌人的速度降至0。Boss在拥有强化效果时不会受到WG伤害，且受到弱化效果时会恢复所有WG。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <BossDisplay bossKey='Shadow of the Archdemon' modeKey='Adventure License' defaultBossId='51000027' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "只有{E/Fire}属性可以行动 - 非{E/Fire}属性敌人速度完全降低。",
                                    "拥有强化效果时不会受到WG伤害。",
                                    "对Boss施加弱化效果会恢复所有WG。",
                                    "对拥有可解除能力值降低效果的敌人施加{D/BT_STUN}，持续5回合。无视效果抵抗。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ShadowArchALTeams.shadowArchAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="bRSHzurhoV0"
                                title="魔王弗洛森 - 冒险许可证 - 第10关 - 1次通关 (自动)"
                                author="XuRenChao"
                                date="26/08/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
