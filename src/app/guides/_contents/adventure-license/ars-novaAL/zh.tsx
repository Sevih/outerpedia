'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaALTeamsData from './ArsNovaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'

const ArsNovaALTeams = ArsNovaALTeamsData as Record<string, TeamData>

const recommendedCharacters = [
    {
        names: ["Gnosis Dahlia", "Demiurge Astei", "Maxwell", "Francesca"],
        reason: {
            en: "{E/Dark} DPS options for this fight.",
            zh: "这场战斗的{E/Dark}DPS选择。"
        }
    },
    {
        names: ["Demiurge Vlada", "Eliza"],
        reason: {
            en: "{E/Dark} supports with {D/BT_REMOVE_BUFF}.",
            zh: "拥有{D/BT_REMOVE_BUFF}的{E/Dark}辅助。"
        }
    },
    {
        names: ["Sterope"],
        reason: {
            en: "Reduces {B/BT_STAT|ST_COUNTER_RATE} damage.",
            zh: "减少{B/BT_STAT|ST_COUNTER_RATE}伤害。"
        }
    },
    {
        names: ["Nella", "Demiurge Delta"],
        reason: {
            en: "{E/Dark} healers to keep the team alive.",
            zh: "让队伍存活的{E/Dark}治疗者。"
        }
    }
]

export default function ArsNovaGuide() {
    return (
        <GuideTemplate
            title="艺术新星 冒险执照攻略指南"
            introduction="艺术新星冒险执照与特殊委托第12阶段拥有相同的技能。使用合适的队伍配置可以稳定地一次通关。该攻略已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey="Ars Nova" modeKey='Adventure License' defaultBossId='51000024' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "与特殊委托第12阶段技能相同。",
                                    "只有{E/Dark}单位能造成完整的WG伤害。非暗属性单位WG伤害减少50%。",
                                    "当队伍CP达到150以上时，BOSS不受WG伤害。请将CP保持在此阈值以下。",
                                    "BOSS攻击后会召唤劣化核心。每个存活的核心会使BOSS的固定伤害增加1500。",
                                    "击杀核心可获得15 CP。这对连锁技能有用，但注意不要超过150 CP。",
                                    "在30%血量时，BOSS狂暴化3回合，然后施放大合唱造成致命伤害。在大合唱发动前击败或击破它。",
                                    "如果BOSS在战斗开始4回合内狂暴化，队伍获得80 CP。这可以帮助更快触发连锁技能。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaALTeams.arsNovaAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Gb-649eighM"
                                title="Ars Nova - Adventure License - Stage 10 - 1 run clear"
                                author="Sevih"
                                date="10/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
