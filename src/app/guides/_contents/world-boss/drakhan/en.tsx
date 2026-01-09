'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import DrakhanTeamsData from './DrakhanWB.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'

const DrakhanTeams = DrakhanTeamsData as Record<string, TeamData>

const drakhanDecember2025 = {
  boss1Key: 'Drakhan',
  boss2Key: 'Drakhan',
  boss1Ids: {
    'Normal': '4086031',
    'Very Hard': '4086033',
    'Extreme': '4086035'
  },
  boss2Ids: {
    'Hard': '4086032',
    'Very Hard': '4086034',
    'Extreme': '4086036'
  }
} as const

export default function DrakhanGuide() {
  return (
    <GuideTemplate
      title="Drakhan World Boss Guide"
      introduction="Drakhan is a challenging two-phase world boss that requires precise team coordination and timing. This guide covers strategies for defeating this boss up to the Extreme League."
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: 'December 2025',
          content: (
            <>
              <WorldBossDisplay config={drakhanDecember2025} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "The boss's main characteristic is its {B/BT_ACTION_GAUGE}. Fast units are recommended.",
                      "Anything that can limit priority gain is useful: {D/BT_DOT_POISON}, {D/BT_DOT_POISON2}, the {I-W/Sacreed Edge} weapon, or {P/Demiurge Vlada} (20% reduction at 4 stars, 50% at 5 stars).",
                      "Like most World Bosses, the best strategy is to break the boss as often as possible. Key focus areas are CP generation and Weakness Gauge damage."
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "Only takes Weakness Gauge damage from {B/BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER}, and {B/SYS_BUFF_REVENGE} attacks. Build your team around these mechanics.",
                      "Avoid {C/Ranger} units as they are permanently {D/BT_SILENCE_IR}."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "Fast units are essential. Bring {D/BT_DOT_POISON} or {D/BT_DOT_POISON2} to limit boss priority gain.",
                      "When the boss steals buffs, it increases their effect by 100% and converts them to debuffs. For example, a stolen +30% {B/BT_STAT|ST_SPEED} becomes a -60% {D/BT_STAT|ST_SPEED}.",
                      "Bring at least one {E/Light} hero. {P/Gnosis Beth} is a good option for her priority increase mechanics.",
                      "Keep buffs active on all your units to prevent the boss restoring its weakness gauge.",
                      "Place a {C/Defender} in the front slot to reduce the number of {D/BT_DOT_CURSE} applied to your team.",
                      "Avoid {C/Striker} and {C/Mage} units as they are permanently {D/BT_SILENCE_IR}."
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DrakhanTeams.december2025} defaultStage="Phase 1" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="C-Oz2uDfuwc"
                title="Drakhan - World Boss - SSS - Extreme League"
                author="Sevih"
                date="31/12/2025"
              />
            </>
          ),
        },
        december2024: {
          label: 'December 2024',
          content: (
            <>
              <CombatFootage
                videoId="tX4Xhm4byAY"
                title="Holy Night Dianne Summons, Testing, and New World Boss"
                author="Ducky"
                date="20/12/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
