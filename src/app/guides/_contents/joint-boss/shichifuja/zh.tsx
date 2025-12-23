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
      title="七步蛇联合挑战攻略"
      introduction="联合挑战首领。若最左侧角色非{C/Mage}，首领将完全恢复WG。仅从爆发、夹攻、连携技能受到WG伤害，否则获得{B/BT_ACTION_GAUGE}+20%并减少WG伤害50%。对连携攻击的{D/BT_FIXED_DAMAGE}较弱。"
      defaultVersion="august2025"
      versions={{
        august2025: {
          label: '2025年8月版本',
          content: (
            <>
              <BossDisplay bossKey='Shichifuja' modeKey='Joint Challenge' defaultBossId='4634084' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "使全体敌人攻击力减少90%，但受到{C/Mage}的伤害增加。",
                  "非爆发/夹攻/连携技能使首领获得{B/BT_ACTION_GAUGE}+20%，WG伤害-50%。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersAug} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={ShichifujaTeams.august2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="hcJ6L4DwjWA"
                title="七步蛇 - 联合挑战 - 极难"
                author="Sevih"
                date="19/08/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '旧版 (2024年视频)',
          content: (
            <>
              <CombatFootage
                videoId="EjCfC5roxiQ"
                title="七步蛇联合挑战最高分"
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
