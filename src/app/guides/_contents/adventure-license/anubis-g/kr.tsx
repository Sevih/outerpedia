'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AnubisALTeamsData from './AnubisAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'
import { recommendedCharacters } from './recommendedCharacters'
import MiniBossDisplay from '@/app/components/MiniBossDisplay'

const AnubisALTeams = AnubisALTeamsData as Record<string, TeamData>

export default function AnubisGuardianGuide() {
    return (
        <GuideTemplate
            title="아누비스 가디언 모험가 라이센스 공략 가이드"
            introduction="아누비스 가디언은 매 턴 쫄을 부활시키고, 자신의 버프와 디버프를 연장하며, 최적의 피해를 위해 화속성 유닛이 필요한 등 고유한 메커니즘이 특징입니다. 화속성이 아닌 유닛은 보스의 모든 디버프를 제거하고 WG 피해가 절반으로 줄어듭니다. 보스는 HP 50%에서 격노하며 3턴 후 치명적인 피해를 입힙니다. 적절한 화속성 팀 구성으로 보통 1~2회 시도로 클리어할 수 있습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey="Iota World's Giant God Soldier" modeKey='Adventure License' defaultBossId='51000031' />
                            <MiniBossDisplay
                                bosses={[
                                    { bossKey: 'Sand Soldier Khopesh', defaultBossId: '51000032' },
                                    { bossKey: 'Sand Soldier Spear', defaultBossId: '51000033' }
                                ]}
                                modeKey={['Weekly Conquest - Anubis Guardian']}
                                defaultModeKey='Weekly Conquest - Anubis Guardian'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "{E/Fire} 유닛만 사용하세요. 화속성이 아닌 유닛은 보스의 모든 디버프를 제거하고 WG 피해가 50% 감소합니다.",
                                    "보스는 공격 후 매 턴 모든 쫄을 부활시킵니다. 쫄이 아닌 보스에게 딜을 집중하세요.",
                                    "보스의 모든 버프와 디버프는 각 턴 시작 시 1턴씩 연장됩니다. {D/BT_DOT_BURN} 중첩이 매우 효과적입니다.",
                                    "보스만 살아있을 때는 WG 피해가 발생하지 않습니다. 최소 한 마리의 쫄을 살려두세요.",
                                    "HP 50%에서 보스가 격노하며 3턴 후 치명적인 피해를 입힙니다. 빠르게 밀어붙이세요.",
                                    "파티의 크리티컬 확률이 0%로 감소합니다. 크리티컬 의존 빌드는 사용하지 마세요."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AnubisALTeams.anubisAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="fU0UUuHswKM"
                                title="Anubis Guardian - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="22/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
