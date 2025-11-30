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
            title="イレギュラークイーン 攻略ガイド"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay bossKey='Irregular Queen' modeKey='Pursuit Operation' defaultBossId='51202004' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "弱体効果がない場合はWGダメージを受けないが、弱体効果を付与されるとS2で反撃する。",
                                "{D/BT_DOT_CURSE}と固定ダメージは10,000を超えない。",
                                "S2は{D/BT_REMOVE_BUFF}を解除し、3ターンの{D/BT_AGGRO}を付与、会心時は{B/BT_REMOVE_DEBUFF}で自身の弱体を解除する。",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IrregularQueenPOTeams.irregularQueenPO} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videos={[
                                { videoId: "bPwKu7gjGWg", title: "1回クリア（公開編成）", author: "Sevih", date: "01/10/2025" },
                                { videoId: "9Sr0YMGaro0", title: "1回キル（オート）", author: "XuRenChao", date: "01/10/2025" },
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
