'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ArsNovaALTeamsData from './ArsNovaAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ArsNovaALTeams = ArsNovaALTeamsData as Record<string, TeamData>

export default function ArsNovaGuide() {
    return (
        <GuideTemplate
            title="아르스 노바 모험가 라이센스 공략 가이드"
            introduction="아르스 노바 모험가 라이센스는 스페셜 리퀘스트 스테이지 12와 동일한 스킬을 가지고 있습니다. 적절한 팀 구성으로 1회 시도로 안정적으로 클리어할 수 있습니다. 이 공략은 스테이지 10까지 검증되었습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey="Ars Nova" modeKey='Adventure License' defaultBossId='51000024' />
                                                        <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000025' labelFilter={"Weekly Conquest - Ars Nova"} />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "스페셜 리퀘스트 스테이지 12와 동일한 스킬입니다.",
                                    "{E/Dark} 유닛만 전체 WG 피해를 입힙니다. 암속성이 아닌 유닛은 WG 피해가 50% 감소합니다.",
                                    "팀의 CP가 150 이상일 때 보스는 WG 피해를 받지 않습니다. CP를 이 임계값 아래로 유지하세요.",
                                    "보스는 공격 후 열화 코어를 소환합니다. 생존한 코어마다 보스의 고정 피해가 1500 증가합니다.",
                                    "코어를 처치하면 15 CP를 획득합니다. 체인 스킬에 유용하지만 150 CP를 초과하지 않도록 주의하세요.",
                                    "HP 30%에서 보스는 3턴 동안 광폭화하고 칸타타로 치명적인 피해를 입힙니다. 칸타타가 발동하기 전에 처치하거나 브레이크하세요.",
                                    "전투 시작 4턴 이내에 보스가 광폭화하면 팀이 80 CP를 획득합니다. 이를 통해 체인 스킬을 더 빨리 발동할 수 있습니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ArsNovaALTeams.arsNovaAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Gb-649eighM"
                                title="Ars Nova - Adventure License - Stage 10 - 1 run clear"
                                author="Sevih"
                                date="10/07/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
