'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import VenionTeamsData from './Venion.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const VenionTeams = VenionTeamsData as Record<string, TeamData>

const venionJanuary2026 = {
  boss1Key: 'Walking Fortress Vault Venion',
  boss2Key: 'Uncharted Fortress Vault Venion',
  boss1Ids: {
    'Normal': '4086013',
    'Very Hard': '4086015',
    'Extreme': '4086017'
  },
  boss2Ids: {
    'Hard': '4086014',
    'Very Hard': '4086016',
    'Extreme': '4086018'
  }
} as const

export default function VenionGuide() {
  return (
    <GuideTemplate
      title="歩行要塞バルトベニオン ワールドボス攻略ガイド"
      introduction="ベニオンは、ボスのバフ状態に応じてチーム編成を変える必要がある2フェーズ制のワールドボスです。このガイドでは、エクストリームリーグまでの攻略方法を解説します。"
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: '2026年1月',
          content: (
            <>
              <WorldBossDisplay config={venionJanuary2026} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "チームにはできるだけ貫通を持たせましょう。ベニオンの防御力は高いです（フェーズ1で3500、フェーズ2で5000）。",
                      "サポートにカウンターセットを装備させると、ベニオンからの各種ボーナスを発動できるため非常に有効です。",
                      "ベニオンのバフに注意し、必要に応じてチームを交代して即死や80%プッシュを避けましょう（1ターン失うことになります）。",
                      "スキルチェーンに固定ダメージを入れるのは、総ダメージが増える場合は問題ありません。",
                      "2番目のチームに複数のヒーラーを入れるのも、弱点ゲージダメージを増やす有効な選択肢です。"
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "フェーズ1のボスは{E/Fire}、{E/Water}、{E/Earth}属性の敵から受けるダメージが増加し、常に属性有利になります。",
                      "{B/UNIQUE_VENION_A}が付与されると、ボスは{E/Fire}/{E/Water}/{E/Earth}属性の敵の行動ゲージを80%プッシュします。",
                      "{B/UNIQUE_VENION_B}が付与されると、ボスは{E/Light}/{E/Dark}属性の敵の行動ゲージを80%プッシュします。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "フェーズ2のボスは{E/Light}、{E/Dark}属性の敵とAoE攻撃から受けるダメージが増加します。",
                      "{B/UNIQUE_VENION_E}が付与されると、ボスは{E/Fire}/{E/Water}/{E/Earth}属性の敵に即死を与えます。",
                      "{B/UNIQUE_VENION_D}が付与されると、ボスは{E/Light}/{E/Dark}属性の敵に即死を与えます。",
                      "ターン開始時、ボスはHP30%以下の全ての敵のバフを解除し、HPを1にします。"
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={VenionTeams.january2026} defaultStage="Light and Dark" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="8YNWM3dErpo"
                title="ベニオン - ワールドボス - SSS - エクストリームリーグ"
                author="Sevih"
                date="27/01/2026"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'レガシー（2024年動画）',
          content: (
            <>
              <GuideHeading level={3}>動画ガイド</GuideHeading>
              <p className="mb-4 text-neutral-300">
                完全な攻略ガイドはまだ作成されていません。現時点では、<strong>Adjen</strong>による動画をご覧ください：
              </p>
              <YoutubeEmbed videoId="PxdLAUgbBPg" title="SSS Extreme League World Boss Venion! [Outerplane]" />
            </>
          ),
        },
      }}
    />
  )
}
