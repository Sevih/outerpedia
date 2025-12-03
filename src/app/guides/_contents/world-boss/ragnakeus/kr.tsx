'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import GuideHeading from '@/app/components/GuideHeading'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import RagnakeusTeamsData from './Ragnakeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'

const RagnakeusTeams = RagnakeusTeamsData as Record<string, TeamData>

const ragnakeusDecember2025 = {
  boss1Key: 'Dragon of Death Ragnakeus',
  boss2Key: 'Mecha Dragon of Death Ragnakeus',
  boss1Ids: {
    'Normal': '4086037',
    'Very Hard': '4086039',
    'Extreme': '4086041'
  },
  boss2Ids: {
    'Hard': '4086038',
    'Very Hard': '4086040',
    'Extreme': '4086042'
  }
} as const

export default function RagnakeusGuide() {
  return (
    <GuideTemplate
      title="임종룡 라그나케우스 공략 가이드"
      introduction="임종룡 라그나케우스는 정확한 팀 구성과 타이밍이 필요한 2페이즈 월드 보스입니다. 이 가이드는 익스트림 리그까지의 공략 전략을 다룹니다."
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025년 12월',
          content: (
            <>
              <WorldBossDisplay config={ragnakeusDecember2025} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "보스의 주요 특징은 {B/BT_ACTION_GAUGE}입니다. 빠른 유닛이 권장됩니다.",
                      "행동 게이지 증가를 제한하는 것이 유용합니다: {D/BT_DOT_POISON}, {D/BT_DOT_POISON2}, {I-W/Sacreed Edge} 무기, 또는 {P/Demiurge Vlada} (4성에서 20% 감소, 5성에서 50% 감소).",
                      "대부분의 월드 보스와 마찬가지로, 최선의 전략은 보스를 최대한 자주 브레이크하는 것입니다. CP 생성과 WG 피해가 핵심 포인트입니다."
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "보스의 {B/BT_STAT|ST_DEF}에 대응하기 위해 {D/BT_SEALED}, {D/BT_STEAL_BUFF}, 또는 {D/BT_EXTEND_BUFF}를 가져오세요."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "보스의 {B/BT_SHIELD_BASED_CASTER}에 대응하기 위해 {D/BT_REMOVE_BUFF}, {D/BT_STEAL_BUFF}, 또는 {D/BT_SEALED}를 가져오세요.",
                      "{E/Fire}, {E/Earth}, {E/Water}를 사용할 경우 S3 리셋을 방지하기 위해 {C/Defender}를 권장합니다."
                    ]
                  }
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList title="phase1" entries={phase1Characters} />
              <RecommendedCharacterList title="phase2" entries={phase2Characters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={RagnakeusTeams.december2025} defaultStage="Phase 1" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                                videoId="8SU0TH6_DY4"
                                title="Dragon of Death Ragnakeus - World Boss - SSS - Extreme League"
                                author="Sevih"
                                date="03/12/2025"
                              />

            </>
          ),
        },
        october2024: {
          label: '2024년 10월',
          content: (
            <>
              <div>
                <div className="mb-4">
                  <GuideHeading level={2}>영상 가이드</GuideHeading>
                  <p className="mb-2 text-neutral-300">
                    아직 완전한 공략 가이드가 작성되지 않았습니다. 현재로서는 <strong>Ducky</strong>의 훌륭한 영상을 시청하시기 바랍니다:
                  </p>
                </div>
                <hr className="my-6 border-neutral-700" />
                <CombatFootage
                  videoId="vR_FaPyptRk"
                  title="15mil Ragnakeus World Boss Guide"
                  author="Ducky"
                  date="01/12/2025"
                />
              </div>
            </>
          ),
        },
      }}
    />
  )
}
