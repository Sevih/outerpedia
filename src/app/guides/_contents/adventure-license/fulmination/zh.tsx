'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import FulminationALTeamsData from './FulminationAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'

const FulminationALTeams = FulminationALTeamsData as Record<string, TeamData>

export default function FulminationALGuide() {
    return (
        <GuideTemplate
            title="弗拉达突击装甲 冒险执照指南"
            introduction="弗拉达突击装甲具有独特的机制，仅从反击和复仇攻击中受到弱点值伤害。使用正确的队伍配置，通常可以一次通关。该策略已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Vlada Assault Suit' modeKey='Adventure License' defaultBossId='51000029' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "仅从反击和复仇攻击中受到WG伤害。",
                                    "大幅减少来自范围攻击的伤害。",
                                    "降低非{E/Earth}单位的{D/BT_STAT|ST_CRITICAL_RATE_IR}。",
                                    "S2对没有增益的目标造成大幅增加的伤害。",
                                    "S3对Boss施加{B/BT_STAT|ST_SPEED}，对队伍施加{D/BT_STAT|ST_SPEED}，无视免疫和抵抗。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={FulminationALTeams.fulminationAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lt4osbmszzY"
                                title="Ful.Mi.NATION Assault Suit - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="29/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
