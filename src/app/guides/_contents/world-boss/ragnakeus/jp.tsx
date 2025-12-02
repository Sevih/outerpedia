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
      title="臨終の竜・ラグナケウス 攻略ガイド"
      introduction="臨終の竜・ラグナケウスは、正確なチーム編成とタイミングが求められる2フェーズのワールドボスです。このガイドでは、エクストリームリーグまでの攻略戦略を解説します。"
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
                      "ボスの主な特徴は{B/BT_ACTION_GAUGE}です。速いユニットが推奨されます。",
                      "行動ゲージ上昇を抑えるものが有効です：{D/BT_DOT_POISON}、{D/BT_DOT_POISON2}、{I-W/Sacreed Edge}武器、または{P/Demiurge Vlada}（4凸で20%減少、5凸で50%減少）。",
                      "他のワールドボスと同様、最良の戦略はボスをできるだけ頻繁にブレイクすることです。CP生成とWGダメージが重要なポイントです。"
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "ボスの{B/BT_STAT|ST_DEF}に対抗するため、{D/BT_SEALED}、{D/BT_STEAL_BUFF}、または{D/BT_EXTEND_BUFF}を持参してください。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "ボスの{B/BT_SHIELD_BASED_CASTER}に対抗するため、{D/BT_REMOVE_BUFF}、{D/BT_STEAL_BUFF}、または{D/BT_SEALED}を持参してください。"
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
              <CombatFootage />

            </>
          ),
        },
        october2024: {
          label: '2024年10月',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <GuideHeading level={2}>動画ガイド</GuideHeading>
                  <p className="mb-2 text-neutral-300">
                    完全な攻略ガイドはまだ作成されていません。現時点では、<strong>Ducky</strong>による素晴らしい動画をご覧ください：
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
