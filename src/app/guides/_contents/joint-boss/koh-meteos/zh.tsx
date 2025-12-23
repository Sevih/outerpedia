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
      title="光明骑士梅修斯联合挑战攻略"
      introduction="联合挑战首领。首领优先攻击最左侧的敌人，使用技能击杀或攻击非{C/Mage}单位时会触发强力AoE攻击。{E/Light}队友获得40%穿透加成。首领防御力每回合增加，但力竭时重置。"
      defaultVersion="november2025"
      versions={{
        november2025: {
          label: '2025年11月版本',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1优先攻击最左侧的敌人 - 放置{C/Mage}以避免触发被动AoE。",
                  "用S1/S2击杀敌人或S1攻击非{C/Mage}时触发无视防御AoE。",
                  "行动值效率+100%，但速度-50%。",
                  "使用非攻击技能时受到的暴击伤害增加100%（最多叠加3次）。",
                  "首领防御力每回合+500，力竭时重置。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersNov} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.november2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="qPZzt25dKX0"
                title="光明骑士梅修斯 - 联合挑战 - (自动) 极难"
                author="XuRenChao"
                date="15/11/2025"
              />
            </>
          ),
        },
        may2025: {
          label: '2025年5月版本',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1优先攻击最左侧的敌人 - 放置{C/Mage}以避免触发被动AoE。",
                  "用S1/S2击杀敌人或S1攻击非{C/Mage}时触发无视防御AoE。",
                  "行动值效率+100%，但速度-50%。",
                  "使用非攻击技能时受到的暴击伤害增加100%（最多叠加3次）。",
                  "首领防御力每回合+500，力竭时重置。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersMay} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.may2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g3LcTpm9fMo"
                title="光明骑士梅修斯 - 联合挑战 - 极难"
                author="Sevih"
                date="15/05/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '旧版 (2024年视频)',
          content: (
            <>
              <CombatFootage
                videoId="X5bL_YZ73y4"
                title="光明骑士梅修斯联合挑战最高分"
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
