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
      title="深海ガーディアン 共同作戦ガイド"
      introduction="共同作戦ボス。ボスはS3使用後、9ターンの{B/BT_INVINCIBLE}を獲得します。{D/BT_STEAL_BUFF}または{D/BT_REMOVE_BUFF}で解除。{C/Striker}からのダメージ増加、AoE攻撃からは減少。バフのない敵はボスのターン終了時に{D/BT_FIXED_DAMAGE}を受けます。"
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: '2026年1月版',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "{B/BT_INVINCIBLE}を持つキャラクターは必殺スキルの{B/BT_COOL_CHARGE}を獲得。",
                  "ターン終了時、バフのない敵に最大HPの10%の{D/BT_FIXED_DAMAGE}を与える。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJan26} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.january2026} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="pOZr8AVgIi8"
                title="深海ガーディアン - 共同作戦 - ベリーハード (Auto) - by XuRenChao"
                author="XuRenChao"
                date="20/01/2026"
              />
            </>
          ),
        },
        july2025: {
          label: '2025年7月版',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "{B/BT_INVINCIBLE}を持つキャラクターは必殺スキルの{B/BT_COOL_CHARGE}を獲得。",
                  "ターン終了時、バフのない敵に最大HPの10%の{D/BT_FIXED_DAMAGE}を与える。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJuly} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.july2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="ScFXrrOeVNk"
                title="深海ガーディアン - 共同作戦 - ベリーハード"
                author="Sevih"
                date="23/07/2025"
              />
            </>
          ),
        },
        march2025: {
          label: '2025年3月版',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "ボスが先制し、即座に必殺スキルを使用してチーム全体をスタン（{B/BT_IMMUNE}無視）。",
                  "{D/BT_DOT_LIGHTNING}を付与し、AP獲得を減少（{C/Healer}を除く）。",
                  "チームにクラス重複なし = 50%の無料効果抵抗。",
                  "約300の効果抵抗でスタンを回避。",
                  "{P/Demiurge Delta}とTier 4聖者の指輪でS3により自身とチームを解除可能。",
                  "ボスは速い - 反撃ベースのユニットが有効なダメージソース。"
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
          label: 'レガシー (2024年動画)',
          content: (
            <>
              <CombatFootage
                videoId="pHi3CcaWhn0"
                title="深海ガーディアン 共同作戦 最高スコア"
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
