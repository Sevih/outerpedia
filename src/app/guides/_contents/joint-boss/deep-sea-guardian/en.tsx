'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import DeepSeaGuardianTeamsData from './DeepSeaGuardianJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersJan26, recommendedCharactersJuly, recommendedCharactersMarch } from './recommendedCharacters'

const DeepSeaGuardianTeams = DeepSeaGuardianTeamsData as Record<string, TeamData>

export default function DeepSeaGuardianGuide() {
  return (
    <GuideTemplate
      title="Deep Sea Guardian Joint Challenge Guide"
      introduction="Joint Challenge boss. The boss gains {B/BT_INVINCIBLE} for 9 turns after using S3. Remove it with {D/BT_STEAL_BUFF} or {D/BT_REMOVE_BUFF}. Increased damage from {C/Striker}, reduced from AoE attacks. Enemies without buffs take {D/BT_FIXED_DAMAGE} at end of boss turn."
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: 'January 2026 Version',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Any character with {B/BT_INVINCIBLE} gains {B/BT_COOL_CHARGE} on their Ultimate.",
                  "At turn end, deals 10% Max HP {D/BT_FIXED_DAMAGE} to enemies without buffs.",
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJan26} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.january2026} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="ScFXrrOeVNk"
                title="Deep Sea Guardian - Joint Challenge - Very Hard"
                author="Sevih"
                date="23/07/2025"
              />
            </>
          ),
        },
        july2025: {
          label: 'July 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Any character with {B/BT_INVINCIBLE} gains {B/BT_COOL_CHARGE} on their Ultimate.",
                  "At turn end, deals 10% Max HP {D/BT_FIXED_DAMAGE} to enemies without buffs.",
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJuly} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.july2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="ScFXrrOeVNk"
                title="Deep Sea Guardian - Joint Challenge - Very Hard"
                author="Sevih"
                date="23/07/2025"
              />
            </>
          ),
        },
        march2025: {
          label: 'March 2025 Version',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "Boss takes first turn and uses Ultimate immediately, stunning your whole team (ignores {B/BT_IMMUNE}).",
                  "Applies {D/BT_DOT_LIGHTNING} and reduces AP gain (except for {C/Healer}).",
                  "No duplicate classes in team = 50% free Resilience.",
                  "Use ~300 Resilience to avoid constant stuns.",
                  "{P/Demiurge Delta} with Tier 4 Saint Ring can cleanse herself and team with S3.",
                  "Boss is fast - counter-based units are a solid damage source."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersMarch} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.march2025} defaultStage="Recommended Team" />
            </>
          ),
        },
        legacy2024: {
          label: 'Legacy (2024 Video)',
          content: (
            <>
              <CombatFootage
                videoId="pHi3CcaWhn0"
                title="Deep Sea Guardian Joint Challenge Max Score"
                author="Ducky"
                date="02/10/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
