'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import FulminationALTeamsData from './FulminationAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'

const FulminationALTeams = FulminationALTeamsData as Record<string, TeamData>

export default function FulminationALGuide() {
    return (
        <GuideTemplate
            title="Vlada Assault Suit Adventure License Guide"
            introduction="Vlada Assault Suit features a unique mechanic that only takes Weakness Gauge damage from Counter and Revenge attacks. This encounter can typically be cleared in 1 attempt with the right team composition. The strategy has been verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Vlada Assault Suit' modeKey='Adventure License' defaultBossId='51000029' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Only takes WG damage from Counter and Revenge attacks.",
                                    "Greatly reduces damage from AoE attacks.",
                                    "Reduces {D/BT_STAT|ST_CRITICAL_RATE_IR} for non-{E/Earth} units.",
                                    "S2 deals greatly increased damage to targets without buffs.",
                                    "S3 applies {B/BT_STAT|ST_SPEED} to boss and {D/BT_STAT|ST_SPEED} to your team, ignoring immunity and resilience."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={FulminationALTeams.fulminationAL} defaultStage="Curse Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="lt4osbmszzY"
                                title="Ful.Mi.NATION Assault Suit - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="29/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
