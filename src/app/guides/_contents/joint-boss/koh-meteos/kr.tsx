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
      title="광명의 기사 메테우스 합동 챌린지 가이드"
      introduction="합동 챌린지 보스. 보스는 가장 왼쪽의 적을 우선 공격하며, 스킬로 적을 처치하거나 비-{C/Mage}를 공격하면 강력한 AoE 공격을 발동합니다. {E/Light} 아군은 40% 관통 보너스를 얻습니다. 보스의 방어력은 매 턴 증가하지만 브레이크 시 초기화됩니다."
      defaultVersion="november2025"
      versions={{
        november2025: {
          label: '2025년 11월 버전',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1은 가장 왼쪽의 적을 우선 공격 - 패시브 AoE를 피하려면 {C/Mage}를 배치.",
                  "S1/S2로 적을 처치하거나 S1으로 비-{C/Mage}를 공격하면 방어 무시 AoE 발동.",
                  "행동 게이지 효율 +100%, 대신 속도 -50%.",
                  "비공격 스킬 사용 시 받는 치명 피해 100% 증가 (최대 3회 누적).",
                  "보스 방어력 매 턴 +500, 브레이크 시 초기화."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersNov} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.november2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="qPZzt25dKX0"
                title="광명의 기사 메테우스 - 합동 챌린지 - (오토) 베리 하드"
                author="XuRenChao"
                date="15/11/2025"
              />
            </>
          ),
        },
        may2025: {
          label: '2025년 5월 버전',
          content: (
            <>
              <BossDisplay bossKey='Knight of Hope Meteos' modeKey='Joint Challenge' defaultBossId='4176152' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1은 가장 왼쪽의 적을 우선 공격 - 패시브 AoE를 피하려면 {C/Mage}를 배치.",
                  "S1/S2로 적을 처치하거나 S1으로 비-{C/Mage}를 공격하면 방어 무시 AoE 발동.",
                  "행동 게이지 효율 +100%, 대신 속도 -50%.",
                  "비공격 스킬 사용 시 받는 치명 피해 100% 증가 (최대 3회 누적).",
                  "보스 방어력 매 턴 +500, 브레이크 시 초기화."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersMay} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={KOHMeteosTeams.may2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g3LcTpm9fMo"
                title="광명의 기사 메테우스 - 합동 챌린지 - 베리 하드"
                author="Sevih"
                date="15/05/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <CombatFootage
                videoId="X5bL_YZ73y4"
                title="광명의 기사 메테우스 합동 챌린지 최고 점수"
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
