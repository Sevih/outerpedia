'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import TyrantTeamsData from './Tyrant.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const TyrantTeams = TyrantTeamsData as Record<string, TeamData>

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="Tyrant Special Request Guide"
            introduction="Tyrant Toddler is focused on cleansing debuffs quickly. Upon entering battle, you will be instantly stacked with {D/BT_DOT_POISON}, {D/BT_DOT_BLEED}, and {D/BT_DOT_LIGHTNING} that will kill you very quickly if not cleansed immediately. Units with AoE cleansing are essential. Can be cleared in 1-2 attempts per stage with proper cleanse management."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Tyrant Toddler' modeKey='Special Request: Ecology Study' defaultBossId='401400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "Upon entering battle, you and the boss are instantly stacked with {D/BT_DOT_POISON}, {D/BT_DOT_BLEED}, and {D/BT_DOT_LIGHTNING}.",
                                "These DoTs will kill you very quickly if not cleansed immediately.",
                                "Since DoTs are applied at start of battle, {D/BT_RUN_PASSIVE_SKILL_ON_TURN_END_DEFENDER_NO_CHECK} cleanse passives (Tio, Meva, Stella) will not trigger.",
                                "Units with AoE cleansing are essential: Dianne's S3, Saeran's S2 Burst 2, Shu's S3, or Monad Eva's S1 Burst 3.",
                                "Dianne's S3 completely trivializes this boss by cleansing the full duration of all debuffs.",
                                "Once cleansed, use Burst Skills, Dual Attacks, and Chain Skills to damage the weakness gauge.",
                                "Try to burst down quickly as boss damage increases rapidly over time.",
                                "Only takes WG damage from {E/Dark} units.",
                                "Stage 12: Increases {C/Healer} and {C/Defender} Speed by 50%, makes their damage scale with Defense. All other classes deal 95% less damage.",
                                "Stage 13: Fully reduces Critical Hit chance and reduces damage of all classes except {C/Defender} by 95%."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={TyrantTeams.tyrantSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="n9-IcrXHyBA" title="Tyrant Combat Footage" author="Community" date="01/01/2024" />
                        </>
                    ),
                },
            }}
        />
    )
}
