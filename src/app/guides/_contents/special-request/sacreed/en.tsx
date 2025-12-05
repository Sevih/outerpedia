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
            title="Sacreed Guardian Special Request Guide"
            introduction="Sacreed Guardian is immune to {D/BT_SEALED}, requiring {D/BT_REMOVE_BUFF}, {D/BT_STEAL_BUFF} or {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}. If the boss has any buffs when taking its turn, it will stun your team and become invincible. The orb grants 3 buffs per turn and must be controlled."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
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
                                "Immune to {D/BT_SEALED}. Use {D/BT_STEAL_BUFF}, {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}, or {D/BT_REMOVE_BUFF} instead.",
                                "If the boss has any buffs when taking its turn, it will {D/BT_STUN} your team and gain {B/BT_INVINCIBLE}.",
                                "Use a fast unit to strip the boss's initial {B/BT_STAT|ST_SPEED} buff at the start of the fight.",
                                "{C/Healer} units can't be stunned until Stage 11.",
                                "Healing is optional. Focus on lockdown and bursting the boss quickly before it gains buffs.",
                                "Stage 12: Boss heals when these effects are triggered: {B/SYS_BUFF_REVENGE}, {B/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK}, and {B/BT_STAT|ST_COUNTER_RATE}.",
                                "Stage 13: Boss negates {B/SYS_BUFF_REVENGE}, {B/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK}, and {B/BT_STAT|ST_COUNTER_RATE}."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={SacreedTeams.sacreedSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="fLdbR9Sa7G0" title="Sacreed Guardian 13 – Clean Run Showcase" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
