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
      title="EX-78 시범기 합동 챌린지 가이드"
      introduction="합동 챌린지 보스. 보스는 가장 왼쪽의 적을 우선 공격하며, 대상이 {C/Healer}가 아닐 경우 자신에게 {B/BT_DAMGE_TAKEN}을 부여합니다. {E/Earth}와 {E/Water} 적에게 받는 피해 증가. {B/BT_CALL_BACKUP}으로 받는 WG 피해 100% 증가."
      defaultVersion="october2025"
      versions={{
        october2025: {
          label: '2025년 10월 버전',
          content: (
            <>
              <BossDisplay bossKey='Prototype EX-78' modeKey='Joint Challenge' defaultBossId='4548181' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "S1은 가장 왼쪽의 적을 우선 공격 - {B/BT_DAMGE_TAKEN} 버프를 방지하려면 {C/Healer}를 배치.",
                  "{E/Earth}와 {E/Water}에게 받는 피해 증가, {E/Fire}, {E/Light}, {E/Dark}에게는 감소.",
                  "{D/BT_DOT_POISON} 상태 시 받는 피해 증가.",
                  "약화 효과를 가진 적에게 공격받으면 해당 적의 CP 30 감소.",
                  "보스가 해제 가능한 버프를 보유 시 공격 후 WG 10% 회복.",
                  "{B/BT_CALL_BACKUP}으로 받는 WG 피해 100% 증가."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersOct} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={PrototypeEx78Teams.october2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="jw0GIwox7YM"
                title="EX-78 시범기 - 합동 챌린지 - (오토) 베리 하드"
                author="XuRenChao"
                date="28/10/2025"
              />
            </>
          ),
        },
        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <CombatFootage
                videoId="UuspJgswwNQ"
                title="EX-78 시범기 합동 챌린지 최고 점수"
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
