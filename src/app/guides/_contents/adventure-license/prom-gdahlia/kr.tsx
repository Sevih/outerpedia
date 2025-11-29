'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import DahliaALTeamsData from './DahliaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const DahliaALTeams = DahliaALTeamsData as Record<string, TeamData>

export default function DahliaGuide() {
    return (
        <GuideTemplate
            title="달리아 어드벤처 라이선스 가이드"
            introduction="달리아는 25턴 제한이 있습니다. 매 턴 39,296~58,945의 피해를 안정적으로 줄 수 없다면, {D/BT_DOT_2000092}나 {D/BT_DOT_BURN}을 활용한 DoT가 가장 확실한 공략법입니다. 한 번의 공격으로 받는 피해는 최대 체력의 6%가 상한입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Dahlia' modeKey='Challenge' defaultBossId='50000010' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "한 번의 공격으로 받는 피해는 최대 체력의 6%가 상한.",
                                    "치명 피격 시 S1으로 반격.",
                                    "보스는 {D/BT_DOT_CURSE}와 {D/BT_FIXED_DAMAGE}에 면역이므로, {D/BT_DOT_2000092}나 {D/BT_DOT_BURN}으로 피해 상한 우회.",
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={DahliaALTeams.dahliaAL} defaultStage="G.Beth Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="iOvGnQDYaCE"
                                title="달리아 - 어드벤처 라이선스: 승급 챌린지"
                                author="XuRenChao"
                                date="25/08/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
