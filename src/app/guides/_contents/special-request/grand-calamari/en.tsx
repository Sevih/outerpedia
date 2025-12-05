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
            title="Grand Calamari Special Request Guide"
            introduction="Grand Calamari is immune to buff removal and reduces debuff duration by 1 each turn. The key to this fight is preventing the boss from gaining buffs using {D/BT_SEALED} or buff conversion. Can be cleared in 1-2 attempts per stage with proper team composition."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Grand Calamari' modeKey='Special Request: Ecology Study' defaultBossId='403400362' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Immune to buff removal. Prevent the boss from gaining buffs using {D/BT_SEALED} or buff conversion.",
                                "Reduces debuff duration by 1 each turn. Reapply debuffs frequently.",
                                "Applies {D/BT_STAT|ST_BUFF_CHANCE} debuff. Bring a cleanser with passive cleanse trigger.",
                                "Only takes WG damage from {E/Light} units.",
                                "Focus on units with {D/BT_SEALED}, buff steal, or buff conversion abilities."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={CalamariTeams.grandCalamariSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="O9cxC5paoes" title="Grand Calamari 13 – Clean Run Showcase" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
