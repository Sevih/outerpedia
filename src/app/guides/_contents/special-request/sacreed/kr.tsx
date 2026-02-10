'use client'

import { useState, useCallback } from 'react'
import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'
import SacreedTeamsData from './Sacreed.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const SacreedTeams = SacreedTeamsData as Record<string, TeamData>

export default function SacreedGuardian13Guide() {
    const [miniBossId, setMiniBossId] = useState('404400462')

    // Mapping: Sacreed Guardian boss ID → Deformed Inferior Core boss ID
    const handleBossChange = useCallback((sacreedBossId: string) => {
        const bossIdMap: Record<string, string> = {
            '404400362': '404400462', // Stage 13
            '404400361': '404400461', // Stage 12
            '404400360': '404400460', // Stage 11
            '404400359': '404400459', // Stage 10
        }
        // Stage 9 et moins utilisent tous 404400450
        setMiniBossId(bossIdMap[sacreedBossId] || '404400450')
    }, [])

    return (
        <GuideTemplate
            title="사크리드 가디언 특수의뢰 공략 가이드"
            introduction="사크리드 가디언은 {D/BT_SEALED}이 면역이며, {D/BT_REMOVE_BUFF}, {D/BT_STEAL_BUFF} 또는 {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}가 필요합니다. 보스가 버프를 가진 상태에서 턴을 맞이하면 팀을 스턴시키고 무적이 됩니다. 오브는 매 턴 3개의 버프를 부여하므로 제어가 필요합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey='Special Request: Ecology Study'
                                defaultBossId='404400362'
                                onBossChange={handleBossChange}
                            />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Deformed Inferior Core', defaultBossId: miniBossId }
                                ]}
                                modeKey='Special Request: Ecology Study'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{D/BT_SEALED} 면역. 대신 {D/BT_STEAL_BUFF}, {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF} 또는 {D/BT_REMOVE_BUFF}를 사용하세요.",
                                "보스가 버프를 가진 상태에서 턴을 맞이하면 팀에 {D/BT_STUN}을 부여하고 {B/BT_INVINCIBLE}을 획득합니다.",
                                "전투 시작 시 빠른 유닛으로 보스의 초기 {B/BT_STAT|ST_SPEED} 버프를 제거하세요.",
                                "스테이지 11까지 {C/Healer} 유닛은 스턴되지 않습니다.",
                                "힐은 선택 사항입니다. 보스가 버프를 획득하기 전에 락다운과 버스트에 집중하세요.",
                                "스테이지 12: {B/SYS_BUFF_REVENGE}, {B/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK}, {B/BT_STAT|ST_COUNTER_RATE}가 발동되면 보스가 회복합니다.",
                                "스테이지 13: 보스가 {B/SYS_BUFF_REVENGE}, {B/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK}, {B/BT_STAT|ST_COUNTER_RATE}를 무효화합니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedTeams.sacreedSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="fLdbR9Sa7G0" title="사크리드 가디언 13 – 클리어 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
