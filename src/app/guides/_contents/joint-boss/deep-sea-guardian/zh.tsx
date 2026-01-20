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
      title="深海守护者联合挑战攻略"
      introduction="联合挑战首领。首领使用S3后获得9回合{B/BT_INVINCIBLE}。使用{D/BT_STEAL_BUFF}或{D/BT_REMOVE_BUFF}解除。受到{C/Striker}伤害增加，AoE攻击减少。无增益的敌人在首领回合结束时受到{D/BT_FIXED_DAMAGE}。"
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: '2026年1月版本',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "拥有{B/BT_INVINCIBLE}的角色其必杀技获得{B/BT_COOL_CHARGE}。",
                  "回合结束时，对无增益的敌人造成最大生命值10%的{D/BT_FIXED_DAMAGE}。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJan26} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.january2026} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="pOZr8AVgIi8"
                title="深海守护者 - 联合挑战 - 极难 (Auto) - by XuRenChao"
                author="XuRenChao"
                date="20/01/2026"
              />
            </>
          ),
        },
        july2025: {
          label: '2025年7月版本',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "拥有{B/BT_INVINCIBLE}的角色其必杀技获得{B/BT_COOL_CHARGE}。",
                  "回合结束时，对无增益的敌人造成最大生命值10%的{D/BT_FIXED_DAMAGE}。"
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJuly} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.july2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="ScFXrrOeVNk"
                title="深海守护者 - 联合挑战 - 极难"
                author="Sevih"
                date="23/07/2025"
              />
            </>
          ),
        },
        march2025: {
          label: '2025年3月版本',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "首领先手并立即使用必杀技，眩晕全队（无视{B/BT_IMMUNE}）。",
                  "施加{D/BT_DOT_LIGHTNING}并减少AP获取（{C/Healer}除外）。",
                  "队伍无重复职业 = 50%免费效果抵抗。",
                  "约300效果抵抗可避免持续眩晕。",
                  "{P/Demiurge Delta}配合Tier 4圣者之戒可用S3解除自身和队伍。",
                  "首领速度快 - 反击型角色是稳定的伤害来源。"
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
          label: '旧版 (2024年视频)',
          content: (
            <>
              <CombatFootage
                videoId="pHi3CcaWhn0"
                title="深海守护者联合挑战最高分"
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
