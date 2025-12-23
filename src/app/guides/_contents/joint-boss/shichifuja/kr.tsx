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
      title="시치후샤 합동 챌린지 가이드"
      introduction="합동 챌린지 보스. 가장 왼쪽 유닛이 {C/Mage}가 아니면 보스가 WG를 전부 회복. 버스트, 협공, 스킬 체인에서만 WG 피해를 받으며, 그 외에는 {B/BT_ACTION_GAUGE} +20%, WG 피해 -50%. 체인 공격의 {D/BT_FIXED_DAMAGE}에 약함."
      defaultVersion="august2025"
      versions={{
        august2025: {
          label: '2025년 8월 버전',
          content: (
            <>
              <BossDisplay bossKey='Shichifuja' modeKey='Joint Challenge' defaultBossId='4634084' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "적 전체의 공격력을 90% 감소시키지만 {C/Mage}에게 받는 피해는 증가.",
                  "버스트/협공/체인 외 스킬은 보스에게 {B/BT_ACTION_GAUGE} +20%, WG 피해 -50%."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersAug} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={ShichifujaTeams.august2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="hcJ6L4DwjWA"
                title="시치후샤 - 합동 챌린지 - 베리 하드"
                author="Sevih"
                date="19/08/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <CombatFootage
                videoId="EjCfC5roxiQ"
                title="시치후샤 합동 챌린지 최고 점수"
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
