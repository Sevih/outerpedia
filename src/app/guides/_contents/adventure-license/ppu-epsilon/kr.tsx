'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ppuEpsilonALTeamsData from './ppuEpsilonAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ppuEpsilonALTeams = ppuEpsilonALTeamsData as Record<string, TeamData>

export default function PpuEpsilonGuide() {
    return (
        <GuideTemplate
            title="행성 정화 유닛 & 엡실론 모험 라이선스 공략"
            introduction="행성 정화 유닛과 엡실론은 지속적인 부활 메커니즘을 가지고 있습니다. 먼저 두 엡실론을 처치하여 메인 보스의 피해 감소와 WG 면역을 해제하세요. 보스의 필살기를 기다린 후 적들을 함께 처치하세요. 1~2회 시도로 클리어 가능. 10단계까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '공략',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Planet Purification Unit' modeKey='Adventure License' defaultBossId='51000015' />
                                <BossDisplay bossKey='Epsilon' modeKey='Adventure License' defaultBossId='51000016' />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "먼저 두 엡실론을 처치하세요. 엡실론이 살아있는 동안 메인 보스는 받는 피해가 감소하고 WG 피해를 받지 않습니다.",
                                    "모든 적은 쓰러진 아군을 부활시킬 수 있습니다 - 보스의 필살기를 기다린 후 적들을 함께 처치하세요.",
                                    "엡실론이 죽으면 다른 쫄들의 HP를 30~70% 감소시킵니다.",
                                    "메인 보스의 필살기는 쓰러진 아군 전체를 강화된 상태로 부활시킵니다 - 보스의 필살기를 기다린 후 적을 처치하세요."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ppuEpsilonALTeams.ppuEpsilonAL} defaultStage="Classic Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="X-ZpolvLR5I"
                                title="행성 정화 유닛 엡실론 - 모험 라이선스 - 10단계 - 1회 클리어 (오토)"
                                author="XuRenChao"
                                date="01/10/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
