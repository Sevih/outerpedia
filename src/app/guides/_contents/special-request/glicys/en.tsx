'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysTeamsData from './Glicys.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysTeams = GlicysTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
    return (
        <GuideTemplate
            title="Glicys Special Request Guide"
            introduction="Glicys' core mechanic revolves around summoned mobs and the {D/BT_FREEZE} debuff. She summons adds that must be managed carefully, and using single-target attacks directly on the boss restores her weakness gauge until adds are killed. At 50% HP, she enters Enrage phase with increased mechanics. Can be cleared in 1-2 attempts per stage with proper add management."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Glicys' modeKey='Special Request: Identification' defaultBossId='407600162' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Boss summons a small mob on the right side. Hitting it with single-target skills lowers both mob's and boss's Defense.",
                                "Right mob applies {D/BT_FREEZE} with its attack.",
                                "Using single-target attacks directly on the boss restores her WG until adds are killed. Avoid early.",
                                "Boss deals increased damage to frozen enemies (especially on Stage 13).",
                                "At 50% HP, boss enters Enrage and summons a bigger mob on the left.",
                                "Attacking left mob without killing it will {D/BT_FREEZE} your team unless it's one-shot.",
                                "Boss gains {B/BT_INVINCIBLE_IR} during Enrage. Plan your burst accordingly.",
                                "Your team should ideally be slower than Glicys to avoid punishing speed interactions.",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={GlicysTeams.glicysSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="NikwWwstygo" title="Glicys Combat Footage" author="Sevih" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
