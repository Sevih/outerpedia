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
            title="이레귤러 퀸 공략 가이드"
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Irregular Queen' modeKey='Pursuit Operation' defaultBossId='51202004' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "약화 효과가 없으면 WG 피해를 받지 않지만, 약화 효과 피격 시 S2로 반격한다.",
                                "{D/BT_DOT_CURSE}와 고정 피해는 10,000을 초과하지 않는다.",
                                "S2는 {D/BT_REMOVE_BUFF}를 해제하고, 3턴 동안 {D/BT_AGGRO}를 부여하며, 치명타 시 {B/BT_REMOVE_DEBUFF}로 자신의 약화를 해제한다.",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={IrregularQueenPOTeams.irregularQueenPO} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videos={[
                                { videoId: "bPwKu7gjGWg", title: "1회 클리어 (공개 편성)", author: "Sevih", date: "01/10/2025" },
                                { videoId: "9Sr0YMGaro0", title: "1회 킬 (오토)", author: "XuRenChao", date: "01/10/2025" },
                            ]} />
                        </>
                    ),
                },
            }}
        />
    )
}
