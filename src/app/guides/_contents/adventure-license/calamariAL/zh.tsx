'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import CalamariALTeamsData from './CalamariAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const CalamariALTeams = CalamariALTeamsData as Record<string, TeamData>

export default function CalamariALGuide() {
    return (
        <GuideTemplate
            title="海怪 冒险许可证 攻略"
            introduction="与特殊请求第12关技能相同，1-2次尝试即可通关。已验证至第10关。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '攻略',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Adventure License' defaultBossId='51000023' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "首领附带强化效果时，所受WG伤害降低100%，因此请使用{D/BT_STEAL_BUFF}、{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}或{D/BT_SEALED}。",
                                "首领受到来自{E/Light}单位的伤害提升，受到来自非{E/Light}单位的WG伤害降低。"
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariALTeams.calamariAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="fG8M8BKCUFo" title="海怪 - 冒险许可证 - 第10关 - 1次通关（自动）" author="XuRenChao" date="08/09/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
