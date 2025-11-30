'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import IrregularQueenPOTeamsData from './IrregularQueenPO.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const IrregularQueenPOTeams = IrregularQueenPOTeamsData as Record<string, TeamData>

export default function IrregularQueenGuide() {
    return (
        <GuideTemplate
            title="异型怪女王 攻略指南"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <BossDisplay bossKey='Irregular Queen' modeKey='Pursuit Operation' defaultBossId='51202004' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "若不存在弱化效果则不会受到WG伤害，但受到弱化效果时会以S2反击。",
                                "{D/BT_DOT_CURSE}和固定伤害不会超过10,000。",
                                "S2解除{D/BT_REMOVE_BUFF}，造成3回合{D/BT_AGGRO}，暴击时{B/BT_REMOVE_DEBUFF}解除自身弱化效果。",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IrregularQueenPOTeams.irregularQueenPO} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videos={[
                                { videoId: "bPwKu7gjGWg", title: "1次通关（公开配置）", author: "Sevih", date: "01/10/2025" },
                                { videoId: "9Sr0YMGaro0", title: "1次击杀（自动）", author: "XuRenChao", date: "01/10/2025" },
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
