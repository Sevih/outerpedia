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
      title="ドレイカーン ワールドボス攻略ガイド"
      introduction="ドレイカーンは2フェーズ制のワールドボスで、正確なチーム編成とタイミングが求められます。このガイドではエクストリームリーグまでの攻略戦略を解説します。"
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
                      "ボスの主な特徴は{B/BT_ACTION_GAUGE}です。速いユニットが推奨されます。",
                      "行動ゲージ上昇を制限できるものが有効です：{D/BT_DOT_POISON}、{D/BT_DOT_POISON2}、{I-W/Sacreed Edge}武器、または{P/Demiurge Vlada}（4凸で20%減少、5凸で50%減少）。",
                      "他のワールドボスと同様、ボスをできるだけ頻繁にブレイクさせることが最良の戦略です。CP生成とWGダメージに集中しましょう。"
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "{B/BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER}と{B/SYS_BUFF_REVENGE}攻撃からのみWGダメージを受けます。これらのメカニクスを中心にチームを構築しましょう。",
                      "{C/Ranger}ユニットは永続的に{D/BT_SILENCE_IR}状態になるため避けてください。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "速いユニットが必須です。{D/BT_DOT_POISON}または{D/BT_DOT_POISON2}でボスの行動ゲージ上昇を制限しましょう。",
                      "ボスのWG回復を防ぐため、全ユニットにバフを維持してください。",
                      "チームへの{D/BT_DOT_CURSE}付与数を減らすため、{C/Defender}を前列に配置しましょう。",
                      "{C/Striker}と{C/Mage}ユニットは永続的に{D/BT_SILENCE_IR}状態になるため避けてください。"
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
                title="ドレイカーン - ワールドボス - SSS - エクストリームリーグ"
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
