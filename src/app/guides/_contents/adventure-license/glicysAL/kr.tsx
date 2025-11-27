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
      title="글리시스 모험 라이선스 가이드"
      introduction="특별 의뢰 스테이지 12와 동일한 스킬. 체력 60%에서 1턴 동안 무적, 3턴 동안 효과 적중 증가를 획득합니다. 1~2회 시도로 클리어 가능. 스테이지 10까지 검증됨."
      defaultVersion="default"
      versions={{
        default: {
          label: '가이드',
          content: (
            <>
              <BossDisplay bossKey='Glicys' modeKey='Adventure License' defaultBossId='51000009' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips tips={[
                "글리시스는 하수인이 없을 때 받는 피해가 70% 감소합니다. 그녀에게 완전한 피해를 입히려면 최소 1마리의 하수인을 살려두세요.",
                "체력 60%에서 광폭화 상태가 되어 1턴 동안 {B/BT_INVINCIBLE_IR}를 획득합니다. 60% 이하 상태에서 2번째 시도를 시작하면 무적 단계를 건너뛸 수 있습니다."
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
