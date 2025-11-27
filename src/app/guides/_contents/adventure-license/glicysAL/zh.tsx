'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import GlicysALTeamsData from './GlicysAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const GlicysALTeams = GlicysALTeamsData as Record<string, TeamData>

export default function GlicysGuide() {
  return (
    <GuideTemplate
      title="克里希丝 冒险许可证 指南"
      introduction="与特别委托第12阶段相同的技能。生命值达到60%时获得1回合无敌和3回合效果命中提升。可在1-2次尝试中通关。已验证至第10阶段。"
      defaultVersion="default"
      versions={{
        default: {
          label: '指南',
          content: (
            <>
              <BossDisplay bossKey='Glicys' modeKey='Adventure License' defaultBossId='51000009' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips tips={[
                "克里希丝在没有手下时受到的伤害减少70%。请至少保持一个手下存活以对她造成完整伤害。",
                "生命值达到60%时进入狂暴化状态，获得1回合{B/BT_INVINCIBLE_IR}。在60%以下开始第二次尝试可跳过无敌阶段。"
              ]} />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={GlicysALTeams.glicysAL} defaultStage="Team 1 – Icebreaker" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage videoId="gufhBKd9kXw" title="Glicys - Adventure License - Stage 10 - 1 run clear (Auto)" author="XuRenChao" date="26/08/2025" />
            </>
          ),
        },
      }}
    />
  )
}
