'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaTeamsData from './Ars-Nova.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaTeams = ArsNovaTeamsData as Record<string, TeamData>

export default function ArsNova13Guide() {
    return (
        <GuideTemplate
            title="Ars Nova Special Request Guide"
            introduction="Ars Nova requires careful buff management and AoE damage to handle core adds. The boss gains a {D/BT_STAT|ST_COUNTER_RATE} buff that must be removed or stolen, deals increasing fixed damage each turn, and stops taking weakness gauge damage if your Chain Gauge reaches 150 or more. Can be cleared in 1-2 attempts per stage with proper buff and chain gauge management."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Ars Nova' modeKey='Special Request: Identification' defaultBossId='407600862' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Immune to {D/BT_SEALED}. Must use buff removers or stealers.",
                                "Gains a {D/BT_STAT|ST_COUNTER_RATE} buff that must be removed or stolen.",
                                "Applies {D/BT_SEALED} with S2 and {D/BT_SILENCE} with S3. Bring early {D/BT_IMMUNE} to prevent Silence.",
                                "Deals fixed damage that increases each turn, especially if core adds survive. Bring AoE damage to handle them.",
                                "Do not hoard Chain Points. If you reach 150+, boss becomes immune to WG damage.",
                                "Vulnerable to priority manipulation (pushback, action gauge reduction).",
                                "Only takes WG damage from {E/Fire} units.",
                                "Main focus is to remove Counterattack buff and eliminate core adds that spawn regularly."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaTeams.arsNovaSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="vsR7eGIbuFE" title="Ars Nova 13 – Clean Run Showcase" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
