'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ShadowArchALTeamsData from './ShadowArchAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ShadowArchALTeams = ShadowArchALTeamsData as Record<string, TeamData>

export default function ShadowOfTheArchdemonGuide() {
    return (
        <GuideTemplate
            title="마왕의 그림자 모험 라이선스 가이드"
            introduction="마왕의 그림자는 {E/Fire}속성이 아닌 적의 속도를 0으로 감소시킵니다. 보스는 강화 효과가 있는 동안 WG 피해를 받지 않으며, 약화 효과를 부여하면 WG가 모두 회복됩니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Shadow of the Archdemon' modeKey='Adventure License' defaultBossId='51000027' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "{E/Fire}속성만 행동 가능 - {E/Fire}속성이 아닌 적은 속도가 완전히 감소.",
                                    "강화 효과가 있는 동안 WG 피해를 받지 않음.",
                                    "보스에게 약화 효과를 부여하면 WG가 모두 회복.",
                                    "해제 가능한 능력치 감소 효과를 가진 적에게 {D/BT_STUN}을 5턴 부여. 효과 저항 무시."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ShadowArchALTeams.shadowArchAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="bRSHzurhoV0"
                                title="마왕의 그림자 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)"
                                author="XuRenChao"
                                date="26/08/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
