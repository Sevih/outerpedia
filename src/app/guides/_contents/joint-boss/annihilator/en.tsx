'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnnihilatorJCTeamsData from './AnnihilatorJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersJune,recommendedCharactersDec } from './recommendedCharacters'

const AnnihilatorJCTeams = AnnihilatorJCTeamsData as Record<string, TeamData>

export default function AnnihilatorGuide() {
  return (
    <GuideTemplate
      title="Annihilator Joint Challenge Guide"
      introduction="Joint Challenge boss. The boss gains {B/BT_SHIELD_BASED_CASTER} on S1 and requires {E/Dark} units for optimal action point efficiency. Single target attacks are heavily penalized with 70% damage reduction and WG recovery. Non-attack skills deal 20,000 fixed damage to the boss."
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: 'December 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Boss gains {B/BT_SHIELD_BASED_CASTER} on S1 - use {D/BT_REMOVE_BUFF} to remove it.",
                  "{E/Dark} units have 50% reduced action point cost.",
                  "Single target attacks deal 70% reduced damage and restore 3 WG to the boss.",
                  "Non-attack skills deal 10,000 fixed damage to the boss twice."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersDec} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCdec} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g64GWfYydvQ"
                title="Annihilator - Joint Challenge - Very Hard Mode"
                author="Sevih"
                date="23/12/2025"
              />
            </>
          ),
        },
        june2025: {
          label: 'June 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Boss gains {B/BT_SHIELD_BASED_CASTER} on S1 - use {D/BT_REMOVE_BUFF} to remove it.",
                  "{E/Dark} units have 50% reduced action point cost.",
                  "Single target attacks deal 70% reduced damage and restore 3 WG to the boss.",
                  "Non-attack skills deal 10,000 fixed damage to the boss twice."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJune} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCjune} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="5r3gji7y6E0"
                title="Annihilator - Joint Challenge - Very Hard Mode"
                author="Sevih"
                date="25/06/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <CombatFootage
                videoId="8d88RKTABNA"
                title="Annihilator Joint Boss"
                author="Ducky"
                date="01/01/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
