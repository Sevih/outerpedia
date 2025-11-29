'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import StellaALTeamsData from './StellaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const StellaALTeams = StellaALTeamsData as Record<string, TeamData>

export default function DemiurgeStellaPromotionGuide() {
  return (
    <GuideTemplate
      title="デミウルゴス ステラ 昇級チャレンジ ガイド"
      introduction="プロ冒険者昇級チャレンジ、{P/Demiurge Stella}戦。バーストスキル、連携、チェーンスキル以外のスキルで受けるダメージを90%軽減。毎ターン開始時に{D/BT_DOT_CURSE}を付与し、アルティメットで全スタックを破裂させる。破裂前に{B/BT_REMOVE_DEBUFF}で{D/BT_DOT_CURSE}を解除しよう。"
      defaultVersion="default"
      versions={{
        default: {
          label: 'ガイド',
          content: (
            <>
              <BossDisplay bossKey='Stella' modeKey='Challenge' defaultBossId='50000001' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "狂暴化状態でない場合、受けるWGダメージが90%軽減。",
                  "毎ターン開始時に敵全体に{D/BT_DOT_CURSE}を付与。アルティメットで{D/BT_IMMEDIATELY_CURSE}。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={StellaALTeams.stellaAL} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="V3wBW16PUBk"
                title="昇級バトル vs Dステラ - アドベンチャーライセンス!"
                author="adjen"
              />
            </>
          ),
        },
      }}
    />
  )
}
