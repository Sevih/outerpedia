'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import DeepSeaGuardianTeamsData from './DeepSeaGuardianJC.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharactersJan26, recommendedCharactersJuly, recommendedCharactersMarch } from './recommendedCharacters'

const DeepSeaGuardianTeams = DeepSeaGuardianTeamsData as Record<string, TeamData>

export default function DeepSeaGuardianGuide() {
  return (
    <GuideTemplate
      title="심해 가디언 합동 챌린지 가이드"
      introduction="합동 챌린지 보스. 보스는 S3 사용 후 9턴 동안 {B/BT_INVINCIBLE}을 획득합니다. {D/BT_STEAL_BUFF} 또는 {D/BT_REMOVE_BUFF}로 해제. {C/Striker}에게 받는 피해 증가, AoE 공격에게는 감소. 버프가 없는 적은 보스 턴 종료 시 {D/BT_FIXED_DAMAGE}를 받습니다."
      defaultVersion="january2026"
      versions={{
        january2026: {
          label: '2026년 1월 버전',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "{B/BT_INVINCIBLE}을 가진 캐릭터는 필살기에 {B/BT_COOL_CHARGE}를 획득.",
                  "턴 종료 시, 버프가 없는 적에게 최대 HP 10%의 {D/BT_FIXED_DAMAGE}를 가함."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJan26} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.january2026} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="gUftoMcz8ws"
                title="심해 가디언 - 합동 챌린지 - 베리 하드"
                author="Sevih"
                date="20/01/2026"
              />
            </>
          ),
        },
        july2025: {
          label: '2025년 7월 버전',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "{B/BT_INVINCIBLE}을 가진 캐릭터는 필살기에 {B/BT_COOL_CHARGE}를 획득.",
                  "턴 종료 시, 버프가 없는 적에게 최대 HP 10%의 {D/BT_FIXED_DAMAGE}를 가함."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersJuly} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.july2025} defaultStage="Recommended Team" />
              <hr className="my-6 border-neutral-700" />
              <CombatFootage
                videoId="ScFXrrOeVNk"
                title="심해 가디언 - 합동 챌린지 - 베리 하드"
                author="Sevih"
                date="23/07/2025"
              />
            </>
          ),
        },
        march2025: {
          label: '2025년 3월 버전',
          content: (
            <>
              <BossDisplay bossKey='Deep Sea Guardian' modeKey='Joint Challenge' defaultBossId='4134065' />
              <hr className="my-6 border-neutral-700" />
              <TacticalTips
                tips={[
                  "보스가 선제하여 즉시 필살기를 사용, 팀 전체를 스턴 ({B/BT_IMMUNE} 무시).",
                  "{D/BT_DOT_LIGHTNING}를 부여하고 AP 획득 감소 ({C/Healer} 제외).",
                  "팀에 클래스 중복 없음 = 50% 무료 효과 저항.",
                  "약 300 효과 저항으로 스턴을 회피.",
                  "{P/Demiurge Delta}와 Tier 4 성자의 반지로 S3으로 자신과 팀 해제 가능.",
                  "보스가 빠름 - 반격 기반 유닛이 좋은 딜 소스."
                ]}
              />
              <hr className="my-6 border-neutral-700" />
              <RecommendedCharacterList entries={recommendedCharactersMarch} />
              <hr className="my-6 border-neutral-700" />
              <StageBasedTeamSelector teamData={DeepSeaGuardianTeams.march2025} defaultStage="Recommended Team" />
            </>
          ),
        },
        legacy2024: {
          label: '레거시 (2024년 영상)',
          content: (
            <>
              <CombatFootage
                videoId="pHi3CcaWhn0"
                title="심해 가디언 합동 챌린지 최고 점수"
                author="Ducky"
                date="02/10/2024"
              />
            </>
          ),
        },
      }}
    />
  )
}
