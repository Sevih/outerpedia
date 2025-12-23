'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import KOHMeteosTeamsData from './KOHMeteos.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersNov, recommendedCharactersMay } from './recommendedCharacters'

const KOHMeteosTeams = KOHMeteosTeamsData as Record<string, TeamData>

export default function KOHMeteosGuide() {
  return (
    <GuideTemplate
      title="光明の騎士・メテウス 共同作戦ガイド"
      introduction="共同作戦ボス。ボスは最も左側の敵を優先し、スキルで敵を倒すか非{C/Mage}を攻撃すると強力なAoE攻撃を発動します。{E/Light}の味方は40%の貫通ボーナスを得ます。ボスの防御力は毎ターン増加しますが、ブレイク時にリセットされます。"
      defaultVersion="november2025"
      versions={{
        november2025: {
          label: '2025年11月版',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1は最も左側の敵を優先 - パッシブAoEを避けるため{C/Mage}を配置。",
                  "S1/S2で敵を倒すか、S1で非{C/Mage}を攻撃すると防御無視AoEが発動。",
                  "行動ゲージ効率+100%、但し速度-50%。",
                  "非攻撃スキルを使用すると受ける会心ダメージが100%増加（最大3回累積）。",
                  "ボスの防御力は毎ターン+500、ブレイク時リセット。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersNov} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.november2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="qPZzt25dKX0"
                title="光明の騎士・メテウス - 共同作戦 - (オート) ベリーハード"
                author="XuRenChao"
                date="15/11/2025"
              />
            </>
          ),
        },
        may2025: {
          label: '2025年5月版',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1は最も左側の敵を優先 - パッシブAoEを避けるため{C/Mage}を配置。",
                  "S1/S2で敵を倒すか、S1で非{C/Mage}を攻撃すると防御無視AoEが発動。",
                  "行動ゲージ効率+100%、但し速度-50%。",
                  "非攻撃スキルを使用すると受ける会心ダメージが100%増加（最大3回累積）。",
                  "ボスの防御力は毎ターン+500、ブレイク時リセット。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersMay} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.may2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g3LcTpm9fMo"
                title="光明の騎士・メテウス - 共同作戦 - ベリーハード"
                author="Sevih"
                date="15/05/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'レガシー (2024年動画)',
          content: (
            <>
              <CombatFootage
                videoId="X5bL_YZ73y4"
                title="光明の騎士・メテウス 共同作戦 最高スコア"
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
