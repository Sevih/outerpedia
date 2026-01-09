'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import DrakhanTeamsData from './DrakhanWB.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'

const DrakhanTeams = DrakhanTeamsData as Record<string, TeamData>

const drakhanDecember2025 = {
  boss1Key: 'Drakhan',
  boss2Key: 'Drakhan',
  boss1Ids: {
    'Normal': '4086031',
    'Very Hard': '4086033',
    'Extreme': '4086035'
  },
  boss2Ids: {
    'Hard': '4086032',
    'Very Hard': '4086034',
    'Extreme': '4086036'
  }
} as const

export default function DrakhanGuide() {
  return (
    <GuideTemplate
      title="드레이칸 월드 보스 가이드"
      introduction="드레이칸은 정확한 팀 구성과 타이밍이 필요한 2페이즈 월드 보스입니다. 이 가이드는 익스트림 리그까지의 공략 전략을 다룹니다."
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025년 12월',
          content: (
            <>
              <WorldBossDisplay config={drakhanDecember2025} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "보스의 주요 특징은 {B/BT_ACTION_GAUGE}입니다. 빠른 유닛이 권장됩니다.",
                      "행동 게이지 증가를 제한할 수 있는 것이 유용합니다: {D/BT_DOT_POISON}, {D/BT_DOT_POISON2}, {I-W/Sacreed Edge} 무기, 또는 {P/Demiurge Vlada} (4성에서 20% 감소, 5성에서 50% 감소).",
                      "대부분의 월드 보스와 마찬가지로, 가능한 자주 보스를 브레이크하는 것이 최선의 전략입니다. CP 생성과 WG 피해에 집중하세요."
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "{B/BT_RUN_FIRST_SKILL_ON_TURN_END_DEFENDER}와 {B/SYS_BUFF_REVENGE} 공격에서만 WG 피해를 받습니다. 이러한 메커니즘을 중심으로 팀을 구성하세요.",
                      "{C/Ranger} 유닛은 영구적으로 {D/BT_SILENCE_IR} 상태가 되므로 피하세요."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "빠른 유닛이 필수입니다. {D/BT_DOT_POISON} 또는 {D/BT_DOT_POISON2}로 보스의 행동 게이지 증가를 제한하세요.",
                      "보스가 버프를 훔치면 효과가 100% 증가하고 디버프로 변환됩니다. 예를 들어, 훔친 +30% {B/BT_STAT|ST_SPEED}는 -60% {D/BT_STAT|ST_SPEED}가 됩니다.",
                      "{E/Light} 영웅을 최소 1명 포함하세요. {P/Gnosis Beth}는 행동 게이지 증가 메커니즘으로 좋은 선택입니다.",
                      "보스의 WG 회복을 방지하기 위해 모든 유닛에 버프를 유지하세요.",
                      "팀에 적용되는 {D/BT_DOT_CURSE} 수를 줄이기 위해 {C/Defender}를 전열에 배치하세요.",
                      "{C/Striker}와 {C/Mage} 유닛은 영구적으로 {D/BT_SILENCE_IR} 상태가 되므로 피하세요."
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DrakhanTeams.december2025} defaultStage="Phase 1" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="C-Oz2uDfuwc"
                title="드레이칸 - 월드 보스 - SSS - 익스트림 리그"
                author="Sevih"
                date="31/12/2025"
              />
            </>
          ),
        },
        december2024: {
          label: '2024년 12월',
          content: (
            <>
              <CombatFootage
                videoId="tX4Xhm4byAY"
                title="Holy Night Dianne Summons, Testing, and New World Boss"
                author="Ducky"
                date="20/12/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
