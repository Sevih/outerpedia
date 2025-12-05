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
            introduction="Ars Nova requires careful buff management and AoE damage to handle core adds. The boss gains a {B/BT_STAT|ST_COUNTER_RATE} buff that must be removed or stolen, deals increasing fixed damage each turn, and stops taking weakness gauge damage if your Chain Gauge reaches 150 or more."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Ars Nova' modeKey='Special Request: Identification' defaultBossId='407600862' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Only {E/Dark} units deal full WG damage - non-dark units deal 50% less WG damage.",
                                "The boss does not take WG damage when your team has 150+ CP. Keep your CP below this threshold.",
                                "The boss summons Inferior Cores after each attack. Each surviving core increases the boss's fixed damage by 1500.",
                                "Killing cores remove 15 CP each.",
                                "At 30% HP, the boss enrages for 3 turns and then uses Cantata dealing lethal damage. Defeat it or break it before Cantata triggers.",
                                "If the boss enrages within 4 turns of battle start, your team gains 80 CP - this can help trigger chain skills faster."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaTeams.arsNovaSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="vsR7eGIbuFE" title="Ars Nova 13 – Clean Run Showcase" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
