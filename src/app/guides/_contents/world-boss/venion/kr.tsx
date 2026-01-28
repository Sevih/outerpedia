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
      title="보행요새 발트베니온 월드 보스 공략 가이드"
      introduction="베니온은 보스의 버프 상태에 따라 팀 구성을 조정해야 하는 2페이즈 월드 보스입니다. 이 가이드에서는 익스트림 리그까지의 공략 방법을 설명합니다."
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: '2026년 1월',
          content: (
            <>
              <WorldBossDisplay config={venionJanuary2026} defaultMode="Extreme" />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                sections={[
                  {
                    title: "strategy",
                    tips: [
                      "팀에 관통을 최대한 확보하세요. 베니온의 방어력이 높습니다(페이즈 1에서 3500, 페이즈 2에서 5000).",
                      "서포터에게 카운터 세트를 장착하면 베니온으로부터 각 보너스를 활성화할 수 있어 매우 유용합니다.",
                      "베니온의 버프를 주시하고 필요시 팀을 교체하여 즉사나 80% 푸시를 피하세요(1턴을 잃게 됩니다).",
                      "스킬 체인에 고정 데미지를 넣는 것은 총 데미지가 증가하는 경우 괜찮습니다.",
                      "두 번째 팀에 여러 힐러를 넣는 것도 약점 게이지 데미지를 늘리는 좋은 선택입니다."
                    ]
                  },
                  {
                    title: "phase1",
                    tips: [
                      "페이즈 1 보스는 {E/Fire}, {E/Water}, {E/Earth} 속성 적에게 받는 피해가 증가하며, 항상 속성 우위를 갖습니다.",
                      "{B/UNIQUE_VENION_A}가 부여되면 보스가 {E/Fire}/{E/Water}/{E/Earth} 속성 적의 행동 게이지를 80% 푸시합니다.",
                      "{B/UNIQUE_VENION_B}가 부여되면 보스가 {E/Light}/{E/Dark} 속성 적의 행동 게이지를 80% 푸시합니다."
                    ]
                  },
                  {
                    title: "phase2",
                    tips: [
                      "페이즈 2 보스는 {E/Light}, {E/Dark} 속성 적과 전체 공격으로부터 받는 피해가 증가합니다.",
                      "{B/UNIQUE_VENION_E}가 부여되면 보스가 {E/Fire}/{E/Water}/{E/Earth} 속성 적에게 즉사를 부여합니다.",
                      "{B/UNIQUE_VENION_D}가 부여되면 보스가 {E/Light}/{E/Dark} 속성 적에게 즉사를 부여합니다.",
                      "턴 시작 시, 보스는 HP 30% 이하인 모든 적의 버프를 제거하고 HP를 1로 만듭니다."
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
                title="베니온 - 월드 보스 - SSS - 익스트림 리그"
                author="Sevih"
                date="27/01/2026"
              />
            </>
          ),
        },
        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <GuideHeading level={3}>영상 가이드</GuideHeading>
              <p className="mb-4 text-neutral-300">
                아직 전체 공략 가이드가 작성되지 않았습니다. 현재로서는 <strong>Adjen</strong>의 영상을 참고하세요:
              </p>
              <YoutubeEmbed videoId="PxdLAUgbBPg" title="SSS Extreme League World Boss Venion! [Outerplane]" />
            </>
          ),
        },
      }}
    />
  )
}
