'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ShichifujaTeamsData from './ShichifujaJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersAug } from './recommendedCharacters'

const ShichifujaTeams = ShichifujaTeamsData as Record<string, TeamData>

export default function ShichifujaGuide() {
  return (
    <GuideTemplate
      title="七歩蛇 共同作戦ガイド"
      introduction="共同作戦ボス。最左のユニットが{C/Mage}でない場合、ボスはWGを全回復。バースト、連携、チェーンスキルからのみWGダメージを受け、それ以外は{B/BT_ACTION_GAUGE}+20%、WGダメージ-50%。チェーン攻撃による{D/BT_FIXED_DAMAGE}に弱い。"
      defaultVersion="august2025"
      versions={{
        august2025: {
          label: '2025年8月版',
          content: (
            <>
              <BossDisplay bossKey='Shichifuja' modeKey='Joint Challenge' defaultBossId='4634084' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "敵全体の攻撃力を90%減少させるが、{C/Mage}からのダメージは増加。",
                  "バースト/連携/チェーン以外のスキルはボスに{B/BT_ACTION_GAUGE}+20%、WGダメージ-50%。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersAug} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={ShichifujaTeams.august2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="hcJ6L4DwjWA"
                title="七歩蛇 - 共同作戦 - ベリーハード"
                author="Sevih"
                date="19/08/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: 'レガシー (2024年動画)',
          content: (
            <>
              <CombatFootage
                videoId="EjCfC5roxiQ"
                title="七歩蛇 共同作戦 最高スコア"
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
