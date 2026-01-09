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
      title="德雷坎 世界首领攻略指南"
      introduction="德雷坎是一个具有挑战性的双阶段世界首领，需要精确的队伍配置和时机把握。本指南涵盖了极限联赛的攻略策略。"
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025年12月',
          content: (
            <>
              <WorldBossDisplay config={drakhanDecember2025} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "首领的主要特点是{B/BT_ACTION_GAUGE}。推荐使用速度快的单位。",
                      "任何能限制行动值增加的效果都很有用：{D/BT_DOT_POISON}、{D/BT_DOT_POISON2}、{I-W/Sacreed Edge}武器，或{P/Demiurge Vlada}（4星时减少20%，5星时减少50%）。",
                      "与大多数世界首领一样，最佳策略是尽可能频繁地击破首领。重点关注CP生成和WG伤害。"
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "只有{B/BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER}和{B/SYS_BUFF_REVENGE}攻击才能造成WG伤害。围绕这些机制构建你的队伍。",
                      "避免使用{C/Ranger}单位，因为它们会永久处于{D/BT_SILENCE_IR}状态。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "速度快的单位至关重要。使用{D/BT_DOT_POISON}或{D/BT_DOT_POISON2}来限制首领的行动值增加。",
                      "当首领偷取增益时，效果会增加100%并转化为减益。例如，被偷取的+30% {B/BT_STAT|ST_SPEED}会变成-60% {D/BT_STAT|ST_SPEED}。",
                      "至少带一名{E/Light}英雄。{P/Gnosis Beth}是个不错的选择，因为她有行动值增加机制。",
                      "保持所有单位的增益效果，以防止首领恢复其WG。",
                      "将{C/Defender}放在前排以减少对队伍施加的{D/BT_DOT_CURSE}数量。",
                      "避免使用{C/Striker}和{C/Mage}单位，因为它们会永久处于{D/BT_SILENCE_IR}状态。"
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
                title="德雷坎 - 世界首领 - SSS - 极限联赛"
                author="Sevih"
                date="31/12/2025"
              />
            </>
          ),
        },
        december2024: {
          label: '2024年12月',
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
