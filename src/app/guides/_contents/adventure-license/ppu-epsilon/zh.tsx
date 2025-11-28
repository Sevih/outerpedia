'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ppuEpsilonALTeamsData from './ppuEpsilonAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ppuEpsilonALTeams = ppuEpsilonALTeamsData as Record<string, TeamData>

export default function PpuEpsilonGuide() {
    return (
        <GuideTemplate
            title="净化行星单位 & 埃普西隆 冒险许可证攻略"
            introduction="净化行星单位和埃普西隆小怪具有持续复活机制。先击杀两个埃普西隆以解除主Boss的伤害减免和WG免疫。等待Boss放必杀技后再一起击杀敌人。1-2次尝试可通关。已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Planet Purification Unit' modeKey='Adventure License' defaultBossId='51000015' />
                                <BossDisplay bossKey='Epsilon' modeKey='Adventure License' defaultBossId='51000016' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "先击杀两个埃普西隆小怪。当任何埃普西隆存活时，主Boss受到的伤害降低且免疫WG伤害。",
                                    "所有敌人都可以复活已死亡的友军 - 等待Boss放必杀技后再一起击杀敌人。",
                                    "当埃普西隆死亡时，会使其他小怪的HP降低30-70%。",
                                    "主Boss的必杀技会以强化状态复活所有已死亡的友军 - 等待Boss放必杀技后再击杀敌人。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ppuEpsilonALTeams.ppuEpsilonAL} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="X-ZpolvLR5I"
                                title="净化行星单位 埃普西隆 - 冒险许可证 - 第10阶段 - 1次通关 (自动)"
                                author="XuRenChao"
                                date="01/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
