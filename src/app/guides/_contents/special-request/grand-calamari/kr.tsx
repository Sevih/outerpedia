'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import CalamariTeamsData from './Grand-Calamari.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const CalamariTeams = CalamariTeamsData as Record<string, TeamData>

export default function GrandCalamari13Guide() {
    return (
        <GuideTemplate
            title="그랜드 칼라마리 특수의뢰 공략 가이드"
            introduction="그랜드 칼라마리는 버프 제거가 면역이며, 매 턴 디버프 지속 시간을 1턴 감소시킵니다. 이 전투의 핵심은 {D/BT_SEALED}, {D/BT_STEAL_BUFF} 또는 {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}를 사용하여 보스의 버프 획득을 방지하는 것입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Special Request: Ecology Study' defaultBossId='403400362' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "버프 제거 면역. {D/BT_SEALED}, {D/BT_STEAL_BUFF} 또는 {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}로 보스의 버프 획득을 방지하세요.",
                                "매 턴 디버프 지속 시간을 1턴 감소시킵니다. 디버프를 자주 재부여하세요.",
                                "{D/BT_STAT|ST_BUFF_CHANCE} 디버프를 부여합니다. 패시브 클렌즈 발동을 가진 클렌저를 편성하세요.",
                                "{E/Light} 유닛만 WG 데미지를 줄 수 있습니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariTeams.grandCalamariSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="O9cxC5paoes" title="그랜드 칼라마리 13 – 클리어 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
