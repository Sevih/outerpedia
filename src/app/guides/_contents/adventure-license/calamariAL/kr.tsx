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
            title="그랑 칼라마리 모험 라이선스 가이드"
            introduction="스페셜 리퀘스트 스테이지 12와 동일한 스킬을 사용하며, 1~2회 시도로 클리어 가능합니다. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Adventure License' defaultBossId='51000023' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "보스는 강화 효과를 보유 중일 때 받는 WG 피해를 100% 감소시키므로, {D/BT_STEAL_BUFF}, {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF} 또는 {D/BT_SEALED}를 사용하세요.",
                                "보스는 {E/Light} 유닛에게 받는 피해가 증가하고, {E/Light}이 아닌 유닛의 WG 피해가 감소합니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariALTeams.calamariAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="fG8M8BKCUFo" title="그랑 칼라마리 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)" author="XuRenChao" date="08/09/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
