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
      title="말살자 합동 챌린지 가이드"
      introduction="합동 챌린지 보스. 보스는 S1에서 {B/BT_SHIELD_BASED_CASTER}를 획득하며, {E/Dark} 유닛은 AP 소모가 최적화됩니다. 단일 공격은 70% 피해 감소와 WG 회복으로 페널티를 받습니다. 비공격 스킬은 보스에게 20,000 고정 피해를 줍니다."
      defaultVersion="december2025"
      versions={{
        december2025: {
          label: '2025년 12월 버전',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "보스는 S1에서 {B/BT_SHIELD_BASED_CASTER} 획득 - {D/BT_REMOVE_BUFF}로 해제.",
                  "{E/Dark} 유닛은 AP 소모가 50% 감소.",
                  "단일 공격은 70% 피해 감소, 보스 WG 3 회복.",
                  "비공격 스킬은 보스에게 10,000 고정 피해를 2회 부여."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersDec} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCdec} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="g64GWfYydvQ"
                title="말살자 - 합동 챌린지 - 베리 하드"
                author="Sevih"
                date="23/12/2025"
              />
            </>
          ),
        },
        june2025: {
          label: '2025년 6월 버전',
          content: (
            <>
              <BossDisplay bossKey='Annihilator' modeKey='Joint Challenge' defaultBossId='4318062' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "보스는 S1에서 {B/BT_SHIELD_BASED_CASTER} 획득 - {D/BT_REMOVE_BUFF}로 해제.",
                  "{E/Dark} 유닛은 AP 소모가 50% 감소.",
                  "단일 공격은 70% 피해 감소, 보스 WG 3 회복.",
                  "비공격 스킬은 보스에게 10,000 고정 피해를 2회 부여."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJune} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={AnnihilatorJCTeams.annihilatorJCjune} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="5r3gji7y6E0"
                title="말살자 - 합동 챌린지 - 베리 하드"
                author="Sevih"
                date="25/06/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <CombatFootage
                videoId="8d88RKTABNA"
                title="말살자 합동 챌린지"
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
