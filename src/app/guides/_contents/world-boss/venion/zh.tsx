'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import VenionTeamsData from './Venion.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'
import YoutubeEmbed from '@/app/components/YoutubeEmbed'

const VenionTeams = VenionTeamsData as Record<string, TeamData>

const venionJanuary2026 = {
  boss1Key: 'Walking Fortress Vault Venion',
  boss2Key: 'Uncharted Fortress Vault Venion',
  boss1Ids: {
    'Normal': '4086013',
    'Very Hard': '4086015',
    'Extreme': '4086017'
  },
  boss2Ids: {
    'Hard': '4086014',
    'Very Hard': '4086016',
    'Extreme': '4086018'
  }
} as const

export default function VenionGuide() {
  return (
    <GuideTemplate
      title="移动要塞瓦尔特贝尼翁 世界首领攻略指南"
      introduction="贝尼翁是一个需要根据Boss增益状态调整队伍配置的两阶段世界首领。本指南涵盖了直至极限联赛的攻略策略。"
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: '2026年1月',
          content: (
            <>
              <WorldBossDisplay config={venionJanuary2026} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "尽可能让队伍拥有穿透属性。贝尼翁的防御力很高（第一阶段3500，第二阶段5000）。",
                      "给辅助装备反击套装非常有用，因为他们可以激活贝尼翁给予的各种加成。",
                      "注意贝尼翁的增益状态，必要时切换队伍以避免即死或80%推条（这会让你失去一回合）。",
                      "在连携技能中加入固定伤害是可以的，只要它能带来更高的总伤害。",
                      "在第二队中配置多个治疗者也是增加弱点条伤害的可行选择。"
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "第一阶段Boss受到{E/Fire}、{E/Water}、{E/Earth}属性敌人的伤害增加，且敌人始终具有属性优势。",
                      "如果获得{B/UNIQUE_VENION_A}，Boss会将{E/Fire}/{E/Water}/{E/Earth}属性敌人的行动条推进80%。",
                      "如果获得{B/UNIQUE_VENION_B}，Boss会将{E/Light}/{E/Dark}属性敌人的行动条推进80%。"
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "第二阶段Boss受到{E/Light}、{E/Dark}属性敌人和群体攻击的伤害增加。",
                      "如果获得{B/UNIQUE_VENION_E}，Boss会对{E/Fire}/{E/Water}/{E/Earth}属性敌人施加即死。",
                      "如果获得{B/UNIQUE_VENION_D}，Boss会对{E/Light}/{E/Dark}属性敌人施加即死。",
                      "回合开始时，Boss会移除所有HP低于30%的敌人的增益并将其HP设为1。"
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={VenionTeams.january2026} defaultStage="Light and Dark" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="8YNWM3dErpo"
                title="贝尼翁 - 世界首领 - SSS - 极限联赛"
                author="Sevih"
                date="27/01/2026"
              />
            </>
          ),
        },
        legacy2024: {
          label: '历史版本（2024年视频）',
          content: (
            <>
              <GuideHeading level={3}>视频指南</GuideHeading>
              <p className="mb-4 text-neutral-300">
                目前还没有完整的攻略指南。建议观看<strong>Adjen</strong>的视频：
              </p>
              <YoutubeEmbed videoId="PxdLAUgbBPg" title="SSS Extreme League World Boss Venion! [Outerplane]" />
            </>
          ),
        },
      }}
    />
  )
}
