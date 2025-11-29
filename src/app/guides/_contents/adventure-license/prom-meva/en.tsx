'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import EvaALTeamsData from './EvaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const EvaALTeams = EvaALTeamsData as Record<string, TeamData>

export default function MonadEvaPromotionGuide() {
    return (
        <GuideTemplate
            title="Monad Eva Promotion Challenge Guide"
            introduction="Supreme Adventurer Promotion Challenge featuring {P/Monad Eva} and {P/K}."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Eva' modeKey='Challenge' defaultBossId='50000008' />
                                <BossDisplay bossKey='K' modeKey='Challenge' defaultBossId='50000009' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Eva negates WG damage and reduces damage taken when hit by single attacks. Use AoE skills.",
                                    "{B/BT_CALL_BACKUP} hits really hard so bring either a character that can tank it or a character that can revive.",
                                    "Both bosses have 220 speed so try to have all your characters at least at 240.",
                                    "Boss {D/BT_DOT_CURSE} and {D/BT_FIXED_DAMAGE} are allowed and uncapped."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={EvaALTeams.evaAL} defaultStage="Fixed Damage Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="AOhLXfgLUzM"
                                title="Monad Eva - Adventure License: Promotion Challenge"
                                author="XuRenChao"
                                date="09/06/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
