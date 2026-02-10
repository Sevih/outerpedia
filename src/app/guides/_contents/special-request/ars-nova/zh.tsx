'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaTeamsData from './Ars-Nova.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaTeams = ArsNovaTeamsData as Record<string, TeamData>

export default function ArsNova13Guide() {
    return (
        <GuideTemplate
            title="阿尔斯诺瓦特殊委托攻略指南"
            introduction="阿尔斯诺瓦需要精细的增益管理和AoE伤害来处理核心召唤物。BOSS会获得{B/BT_STAT|ST_COUNTER_RATE}增益，必须移除或窃取。每回合固定伤害递增，当连锁槽达到150以上时，BOSS不再受弱点槽伤害。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Ars Nova' modeKey='Special Request: Identification' defaultBossId='407600862' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "只有{E/Dark}角色能造成完整WG伤害，非暗属性角色WG伤害降低50%。",
                                "队伍CP达到150以上时，BOSS不再受WG伤害。保持CP在此阈值以下。",
                                "BOSS每次攻击后会召唤劣等核心。每个存活的核心使BOSS固定伤害增加1500。",
                                "击杀核心可减少15 CP。",
                                "HP降至30%时，BOSS进入3回合的狂暴状态，之后释放坎塔塔造成致命伤害。在触发前击败或击破它。",
                                "如果BOSS在战斗开始4回合内狂暴，队伍获得80 CP，可用于更快触发连锁技能。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaTeams.arsNovaSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="vsR7eGIbuFE" title="阿尔斯诺瓦13 – 通关录像" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
