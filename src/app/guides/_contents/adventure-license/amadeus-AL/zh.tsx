'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusALTeamsData from './AmadeusAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'

const AmadeusALTeams = AmadeusALTeamsData as Record<string, TeamData>

export default function AmadeusALGuide() {
    return (
        <GuideTemplate
            title="阿玛迪斯 冒险执照攻略指南"
            introduction="阿玛迪斯冒险执照与特殊委托第12阶段具有相同的技能。使用合适的队伍组合通常可在1-2次尝试内通关。此策略已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Adventure License' defaultBossId='51000026' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "持续施加减益效果，在狂暴机制触发前造成足够的{D/BT_WG_REVERSE_HEAL}。",
                                    "BOSS会施加无视免疫的随机减益。减益施加后及时净化至关重要。",
                                    "BOSS每回合延长队伍减益1回合。相应规划你的净化。",
                                    "不要使用具有非攻击技能的角色，因为会给BOSS永久暴击增益。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusALTeams.amadeusAL} defaultStage="Recommended Team" replace={{ lead: "", mid: "", tail: "" }} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EJNnAhVZPkY"
                                title="Amadeus - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="08/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
