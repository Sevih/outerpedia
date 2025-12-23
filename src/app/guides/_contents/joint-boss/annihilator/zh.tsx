'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnnihilatorJCTeamsData from './AnnihilatorJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersJune, recommendedCharactersDec } from './recommendedCharacters'

const AnnihilatorJCTeams = AnnihilatorJCTeamsData as Record<string, TeamData>

export default function AnnihilatorGuide() {
  return (
    <GuideTemplate
      title="歼灭者联合挑战攻略"
      introduction="联合挑战首领。首领在S1获得{B/BT_SHIELD_BASED_CASTER}，{E/Dark}单位的AP消耗最优化。单体攻击受到70%伤害降低和WG恢复的惩罚。非攻击技能对首领造成20,000固定伤害。"
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025年12月版本',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "首领在S1获得{B/BT_SHIELD_BASED_CASTER} - 使用{D/BT_REMOVE_BUFF}解除。",
                  "{E/Dark}单位AP消耗降低50%。",
                  "单体攻击伤害降低70%，恢复首领WG 3点。",
                  "非攻击技能对首领造成2次10,000固定伤害。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersDec} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCdec} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g64GWfYydvQ"
                title="歼灭者 - 联合挑战 - 极难"
                author="Sevih"
                date="23/12/2025"
              />
            </>
          ),
        },
        june2025: {
          label: '2025年6月版本',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "首领在S1获得{B/BT_SHIELD_BASED_CASTER} - 使用{D/BT_REMOVE_BUFF}解除。",
                  "{E/Dark}单位AP消耗降低50%。",
                  "单体攻击伤害降低70%，恢复首领WG 3点。",
                  "非攻击技能对首领造成2次10,000固定伤害。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJune} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCjune} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="5r3gji7y6E0"
                title="歼灭者 - 联合挑战 - 极难"
                author="Sevih"
                date="25/06/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '旧版 (2024年视频)',
          content: (
            <>
              <CombatFootage
                videoId="8d88RKTABNA"
                title="歼灭者联合挑战"
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
