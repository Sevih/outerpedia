'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusALTeamsData from './AmadeusAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'

const AmadeusALTeams = AmadeusALTeamsData as Record<string, TeamData>

const recommendedCharacters = [
    {
        names: "Dianne",
        reason: {
            en: "Ideal as both her heals are attacks, and she can {B/BT_REMOVE_DEBUFF} without triggering the boss mechanic.",
        }
    },
    {
        names: "Kuro",
        reason: {
            en: "Shines with {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}. Use S3 after boss self-buffs to convert them into long debuffs."
        }
    },
    {
        names: ["Drakhan", "Gnosis Beth"],
        reason: {
            en: "MVPs thanks to their repeated debuffs."
        }
    },
    {
        names: "Akari",
        reason: {
            en: "Works even without {D/BT_SEALED} thanks to her broad debuff kit."
        }
    },
    {
        names: "Skadi",
        reason: {
            en: "Could be used to fill a slot as the buffs can help the team do more damage."
        }
    }
]

export default function AmadeusALGuide() {
    return (
        <GuideTemplate
            title="Amadeus Adventure License Guide"
            introduction="Amadeus Adventure License features the same skills as Special Request stage 12. This encounter can typically be cleared in 1 to 2 attempts with the right team composition. The strategy has been verified up to stage 10."
            defaultVersion="default"
            versions={{
                default: {
                    label: 'Guide',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Adventure License' defaultBossId='51000026' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "Keep applying debuffs to deal enough {D/BT_WG_REVERSE_HEAL} before the enrage mechanic triggers.",
                                    "The boss applies random debuffs that ignore immunity. Cleansing is crucial after they land.",
                                    "The boss extends party debuffs by 1 turn each round. Plan your cleanses accordingly.",
                                    "Do not use characters with non-attack skills, as they grant the boss a permanent critical hit buff."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusALTeams.amadeusAL} defaultStage="Recommended Team" replace={{ lead: "", mid: "", tail: "" }} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EJNnAhVZPkY"
                                title="Amadeus - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="08/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}