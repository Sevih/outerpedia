'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import PrototypeEx78TeamsData from './PrototypeEx78JC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersOct } from './recommendedCharacters'

const PrototypeEx78Teams = PrototypeEx78TeamsData as Record<string, TeamData>

export default function PrototypeEx78Guide() {
  return (
    <GuideTemplate
      title="Prototype EX-78 Joint Challenge Guide"
      introduction="Joint Challenge boss. The boss prioritizes the leftmost enemy, and if the target isn't a {C/Healer}, it gains {B/BT_DAMGE_TAKEN}. Increased damage from {E/Earth} and {E/Water} enemies. Takes 100% increased WG damage from {B/BT_CALL_BACKUP}."
      defaultVersion="october2025"
      versions={{
        october2025: {
          label: 'October 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Prototype EX-78' modeKey='Joint Challenge' defaultBossId='4548181' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1 prioritizes the leftmost enemy - place a {C/Healer} to prevent {B/BT_DAMGE_TAKEN} buff.",
                  "Increased damage from {E/Earth} and {E/Water}, reduced from {E/Fire}, {E/Light}, {E/Dark}.",
                  "Takes increased damage when afflicted with {D/BT_DOT_POISON}.",
                  "When attacked by debuffed enemy, reduces their CP by 30.",
                  "If boss has a dispellable buff, recovers 10% WG after attacking.",
                  "Takes 100% increased WG damage from {B/BT_CALL_BACKUP}."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersOct} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={PrototypeEx78Teams.october2025} defaultStage="Recommended Team" />
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <CombatFootage
                videoId="UuspJgswwNQ"
                title="Prototype EX-78 Joint Challenge Max Score"
                author="Ducky"
                date="01/12/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
