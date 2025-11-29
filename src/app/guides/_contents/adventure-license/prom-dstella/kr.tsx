'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import StellaALTeamsData from './StellaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const StellaALTeams = StellaALTeamsData as Record<string, TeamData>

export default function DemiurgeStellaPromotionGuide() {
  return (
    <GuideTemplate
      title="데미우르고스 스텔라 승급 챌린지 가이드"
      introduction="프로 모험가 승급 챌린지, {P/Demiurge Stella}전. 버스트 스킬, 협공, 스킬 체인을 제외한 스킬로 받는 피해를 90% 감소. 매 턴 시작 시 {D/BT_DOT_CURSE}를 부여하고 궁극기로 모든 스택을 폭발시킴. 폭발 전에 {B/BT_REMOVE_DEBUFF}로 {D/BT_DOT_CURSE}를 해제하세요."
      defaultVersion="default"
      versions={{
        default: {
          label: '가이드',
          content: (
            <>
              <BossDisplay bossKey='Stella' modeKey='Challenge' defaultBossId='50000001' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "광폭화 상태가 아닐 때 받는 WG 피해량 90% 감소.",
                  "매 턴 시작 시 적 전체에게 {D/BT_DOT_CURSE} 부여. 궁극기로 {D/BT_IMMEDIATELY_CURSE}."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharacters} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={StellaALTeams.stellaAL} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="V3wBW16PUBk"
                title="승급 배틀 vs D스텔라 - 어드벤처 라이선스!"
                author="adjen"
              />
            </>
          ),
        },
      }}
    />
  )
}
