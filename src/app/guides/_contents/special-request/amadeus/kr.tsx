'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusTeamsData from './Amadeus.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const AmadeusTeams = AmadeusTeamsData as Record<string, TeamData>

export default function Amadeus13Guide() {
    return (
        <GuideTemplate
            title="아마데우스 특수의뢰 공략 가이드"
            introduction="아마데우스는 디버프 관리와 전략적인 캐릭터 선택이 필요한 고난이도 보스입니다. 디버프가 없으면 약점 게이지 데미지가 무효화되며, 면역을 무시하는 랜덤 디버프를 부여하므로 클렌즈와 디버프 부여가 공략의 핵심입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Special Request: Identification' defaultBossId='407600962' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "디버프가 없는 상태에서는 {D/BT_WG_REVERSE_HEAL}이 무효. 디버프를 계속 부여하세요.",
                                "{B/BT_IMMUNE}을 무시하는 {D/BT_RANDOM}을 부여합니다. 부여 후 클렌즈가 중요합니다.",
                                "비공격 스킬 사용 시 보스에게 {D/BT_STAT|ST_CRITICAL_RATE_IR}이 부여됩니다. 비공격 스킬을 가진 캐릭터는 사용하지 마세요.",
                                "{D/BT_SEALED} 면역.",
                                "보스는 매 라운드 파티의 디버프를 1턴 연장합니다. 클렌즈를 계획적으로 사용하세요.",
                                "보스의 버프는 Kuro를 통해 장시간 디버프로 변환할 수 있습니다.",
                                "{E/Light} 유닛만 WG 데미지를 줄 수 있습니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusTeams.amadeusSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="2lbN-rK89xI" title="아마데우스 13 – 클리어 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
