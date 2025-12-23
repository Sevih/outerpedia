'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import PrototypeEx78TeamsData from './PrototypeEx78JC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersOct } from './recommendedCharacters'

const PrototypeEx78Teams = PrototypeEx78TeamsData as Record<string, TeamData>

export default function PrototypeEx78Guide() {
  return (
    <GuideTemplate
      title="EX-78示范机联合挑战攻略"
      introduction="联合挑战首领。首领优先攻击最左侧的敌人，若目标非{C/Healer}，则赋予自身{B/BT_DAMGE_TAKEN}。受到{E/Earth}和{E/Water}敌人的伤害增加。受到{B/BT_CALL_BACKUP}的WG伤害增加100%。"
      defaultVersion="october2025"
      versions={{
        october2025: {
          label: '2025年10月版本',
          content: (
            <>
              <BossDisplay bossKey='Prototype EX-78' modeKey='Joint Challenge' defaultBossId='4548181' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1优先攻击最左侧的敌人 - 放置{C/Healer}以防止{B/BT_DAMGE_TAKEN}增益。",
                  "受到{E/Earth}和{E/Water}伤害增加，{E/Fire}、{E/Light}、{E/Dark}减少。",
                  "处于{D/BT_DOT_POISON}状态时受到的伤害增加。",
                  "被带有减益的敌人攻击时，减少该敌人30点CP。",
                  "若首领拥有可解除的增益，攻击后恢复10% WG。",
                  "受到{B/BT_CALL_BACKUP}的WG伤害增加100%。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersOct} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={PrototypeEx78Teams.october2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="jw0GIwox7YM"
                title="EX-78示范机 - 联合挑战 - (自动) 极难"
                author="XuRenChao"
                date="28/10/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '旧版 (2024年视频)',
          content: (
            <>
              <CombatFootage
                videoId="UuspJgswwNQ"
                title="EX-78示范机联合挑战最高分"
                author="Ducky"
                date="01/12/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
