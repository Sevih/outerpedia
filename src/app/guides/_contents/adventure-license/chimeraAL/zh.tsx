'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ChimeraALTeamsData from './ChimeraAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ChimeraALTeams = ChimeraALTeamsData as Record<string, TeamData>

export default function UnidentifiedChimeraGuide() {
    return (
        <GuideTemplate
            title="未知的奇美拉 冒险许可证 攻略"
            introduction="未知的奇美拉冒险许可证与特殊请求第12关拥有相同的技能。使用合适的队伍配置可以1次通关。已验证至第10阶段。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Adventure License' defaultBossId='51000006' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Boss每回合解除2个弱化效果，因此不要只依赖弱化效果。",
                                    "所有单位的暴击伤害降低85%。"
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ChimeraALTeams.chimeraAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lil6XEE0VUE"
                                title="未知的奇美拉 - 冒险许可证 - 第10阶段 - 1次通关 (自动)"
                                author="XuRenChao"
                                date="25/11/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
