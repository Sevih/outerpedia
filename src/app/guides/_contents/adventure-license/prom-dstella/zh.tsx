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
      title="造物主斯黛拉 晋升挑战 攻略"
      introduction="专家冒险家晋升挑战，{P/Demiurge Stella}战。使受到除爆发技能、夹攻、连携技能外的技能伤害降低90%。每回合开始时施加{D/BT_DOT_CURSE}，并用终极技引爆所有层数。在引爆前使用{B/BT_REMOVE_DEBUFF}解除{D/BT_DOT_CURSE}。"
      defaultVersion="default"
      versions={{
        default: {
          label: '攻略',
          content: (
            <>
              <BossDisplay bossKey='Stella' modeKey='Challenge' defaultBossId='50000001' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "未处于狂暴化状态时，受到的WG伤害降低90%。",
                  "每回合开始时对全体敌人施加{D/BT_DOT_CURSE}。终极技触发{D/BT_IMMEDIATELY_CURSE}。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={StellaALTeams.stellaAL} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="V3wBW16PUBk"
                title="晋升战斗 vs D斯黛拉 - 冒险执照!"
                author="adjen"
              />
            </>
          ),
        },
      }}
    />
  )
}
