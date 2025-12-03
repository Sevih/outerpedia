'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import GuideHeading from '@/app/components/GuideHeading'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import RagnakeusTeamsData from './Ragnakeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'

const RagnakeusTeams = RagnakeusTeamsData as Record<string, TeamData>

const ragnakeusDecember2025 = {
  boss1Key: 'Dragon of Death Ragnakeus',
  boss2Key: 'Mecha Dragon of Death Ragnakeus',
  boss1Ids: {
    'Normal': '4086037',
    'Very Hard': '4086039',
    'Extreme': '4086041'
  },
  boss2Ids: {
    'Hard': '4086038',
    'Very Hard': '4086040',
    'Extreme': '4086042'
  }
} as const

export default function RagnakeusGuide() {
  return (
    <GuideTemplate
      title="死亡龙拉格纳修斯 攻略指南"
      introduction="死亡龙拉格纳修斯是一个需要精确团队配合和时机把握的两阶段世界首领。本指南涵盖了直到极限联赛的攻略策略。"
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025年12月',
          content: (
            <>
              <WorldBossDisplay config={ragnakeusDecember2025} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "首领的主要特点是{B/BT_ACTION_GAUGE}。推荐使用速度快的单位。",
                      "任何能限制行动值增加的手段都很有用：{D/BT_DOT_POISON}、{D/BT_DOT_POISON2}、{I-W/Sacreed Edge}武器，或{P/Demiurge Vlada}（4星减少20%，5星减少50%）。",
                      "与大多数世界首领一样，最佳策略是尽可能频繁地击破首领。CP生成和WG伤害是关键重点。"
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "携带{D/BT_SEALED}、{D/BT_STEAL_BUFF}或{D/BT_EXTEND_BUFF}来对抗首领的{B/BT_STAT|ST_DEF}。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "携带{D/BT_REMOVE_BUFF}、{D/BT_STEAL_BUFF}或{D/BT_SEALED}来对抗首领的{B/BT_SHIELD_BASED_CASTER}。",
                      "如果使用{E/Fire}、{E/Earth}、{E/Water}，推荐携带{C/Defender}来防止S3重置。"
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={RagnakeusTeams.december2025} defaultStage="Phase 1" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                                videoId="8SU0TH6_DY4"
                                title="Dragon of Death Ragnakeus - World Boss - SSS - Extreme League"
                                author="Sevih"
                                date="03/12/2025"
                              />

            </>
          ),
        },
        october2024: {
          label: '2024年10月',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <GuideHeading level={2}>视频攻略</GuideHeading>
                  <p className="mb-2 text-neutral-300">
                    完整的攻略指南尚未制作。目前，我们推荐观看<strong>Ducky</strong>的精彩视频：
                  </p>
                </div>
                <hr className="my-6 border-neutral-700" />
                <CombatFootage
                  videoId="vR_FaPyptRk"
                  title="15mil Ragnakeus World Boss Guide"
                  author="Ducky"
                  date="01/12/2025"
                />
              </div>
            </>
          ),
        },
      }}
    />
  )
}
