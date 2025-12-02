'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import { WorldBossDisplay } from '@/app/components/boss'
import PrimordialSentinelTeamsData from './PrimordialSentinel.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { phase1Characters, phase2Characters } from './recommendedCharacters'
import GuideHeading from '@/app/components/GuideHeading'

const PrimordialSentinelTeams = PrimordialSentinelTeamsData as Record<string, TeamData>

const primordialSentinelNovember2025 = {
    boss1Key: 'Primordial Sentinel',
    boss2Key: 'Glorious Sentinel',
    boss1Ids: {
        'Normal': '4086007',
        'Very Hard': '4086009',
        'Extreme': '4086011'
    },
    boss2Ids: {
        'Hard': '4086008',
        'Very Hard': '4086010',
        'Extreme': '4086012'
    }
} as const

export default function PrimordialSentinelGuide() {
    return (
        <GuideTemplate
            title="시원의 파수꾼 (영광의 파수꾼) 공략 가이드"
            introduction="시원의 파수꾼은 정밀한 팀 조율과 타이밍이 필요한 2페이즈 월드 보스입니다. 이 가이드는 익스트림 리그까지의 공략 전략을 다룹니다."
            defaultVersion="november2025"
            versions={{
                november2025: {
                    label: '2025년 11월',
                    content: (
                        <>
                            <WorldBossDisplay config={primordialSentinelNovember2025} defaultMode="Extreme" />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                sections={[
                                    {
                                        title: "strategy",
                                        tips: [
                                            "이 전투는 행동 순서 제어가 전부입니다. 페이즈 1에서는 행동 순서 감소를 최대한 활용하세요.",
                                            "페이즈 2에서는 보스가 행동 순서 감소에 면역이므로 캐릭터를 최대한 빠르게 만들어야 합니다.",
                                            "스킬 체인과 CP 생성을 위해 현자와 로그 부적을 장착하세요 (로그의 치명타 확률을 잊지 마세요).",
                                            "양 페이즈에서 {B/UNIQUE_DAHLIA_A} 버프로 인한 {D/BT_STAT|ST_SPEED}를 위해 최소 1명의 힐러를 편성하세요."
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "팀 2에 6성 {P/Monad Eva}가 있다면 페이즈 1에서 CP를 쌓은 후 끝날 무렵 팀 2로 교체할 수 있습니다.",
                                            "{P/Monad Eva}가 즉시 보스에게 {D/BT_SEAL_ADDITIVE_ATTACK}를 부여하여 페이즈 1에서 쌓은 CP를 유지할 수 있습니다."
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList title="phase1" entries={phase1Characters} />
                            <RecommendedCharacterList title="phase2" entries={phase2Characters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={PrimordialSentinelTeams.november2025} defaultStage="Phase 1" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="4me_DqMftbs"
                                title="시원의 파수꾼 - 월드 보스 - SSS - 익스트림 리그"
                                author="Unknown"
                                date="01/11/2025"
                            />
                            <p className="mt-2 text-neutral-400 text-sm">
                                참고: 이 영상은 SSS 익스트림 클리어를 보여줍니다. 동일한 전략을 낮은 난이도에도 적용할 수 있지만 일부 보스 메커니즘이 약화되거나 비활성화될 수 있습니다. 익스트림 리그 이전에는 점수가 무제한이 아니므로 페이즈 1에서 체인 포인트를 쌓는 데 덜 집중해도 됩니다.
                            </p>
                        </>
                    ),
                },
                july2024: {
                    label: '2024년 7월',
                    content: (
                        <>
                            <TacticalTips
                                sections={[
                                    {
                                        title: "phase1",
                                        tips: [
                                            "{P/Valentine}의 S3를 최대한 많이 사용하세요.",
                                            "{P/Iota}는 S1만 사용합니다.",
                                            "{P/Notia}는 행동 순서 푸시를 위해 버프 가동률을 유지해야 합니다.",
                                            "{P/Dianne}는 {P/Iota}가 가장 높은 ATK를 가져야 하며 S1로 매 턴 푸시합니다.",
                                            "P1에서 CP를 쌓고 {P/Iota}와 {P/Valentine}의 행동 순서 감소로 보스를 잠급니다.",
                                            "{P/Iota}를 힐하지 마세요. 자해로 HP 1로 만듭니다 (신속으로 SPD 상승).",
                                            "보스를 1회 브레이크하고 WG를 1-2로 줄이고 {P/Iota}의 S3/S2B2로 무적을 부여합니다.",
                                            "브레이크 후 보스 HP가 약 120만이고 10회 체인 공격이 준비되어 있는지 확인하세요.",
                                            "P1 데미지를 임계값 이상으로 밀어 P2 보스를 소환합니다.",
                                            "{P/Iota} (HP 1, 신속)가 P2 보스보다 먼저 행동합니다. 팀 2로 교체하세요."
                                        ]
                                    },
                                    {
                                        title: "phase2",
                                        tips: [
                                            "P2 보스는 S2로 {D/BT_DOT_LIGHTNING}를 사용하며 {P/Monad Eva}의 S2로 즉시 해제합니다.",
                                            "해제 = \"힐러 액션\"이며 보스에게 {D/BT_STAT|ST_SPEED}를 부여합니다.",
                                            "팀이 속도에서 이기고 브레이크 + 코어 에너지를 제거할 수 있습니다.",
                                            "체인 공격을 연발하여 잠그고 {P/Monad Eva}의 S1로 CP 빌드를 도웁니다."
                                        ]
                                    }
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <GuideHeading level={3}>중요 참고사항</GuideHeading>
                            <p className="text-neutral-300 mb-4">
                                이 편성은 6성 {'{P/Monad Eva}'}에서만 작동합니다. 이것을 발견한 <strong>Birdmouth</strong>에게 감사드립니다.
                                코어 에너지 버프는 추가 공격으로 계산되며 {'{P/Monad Eva}'}의 전투 시작 시 스킬 봉인으로 취소할 수 있습니다.
                                이를 통해 CP 손실을 방지합니다.
                            </p>
                            <p className="text-neutral-300 mb-4">
                                대안: 페이즈 1 중에 팀 2로 교체합니다. {'{E/Light}'}{'{E/Dark}'} 유닛은 P1에서 WG를 감소시킬 수 없으므로
                                팀 2에 최소 1체의 {'{E/Fire}'}{'{E/Water}'}{'{E/Earth}'} 유닛이 필요합니다. 이를 통해 {'{P/Monad Eva}'}가 P2에 진입할 때 스킬 봉인을 적용하고 로테이션을 보호할 수 있습니다.
                            </p>
                            <p className="text-neutral-300">
                                다른 옵션: {'{P/Stella}'} 대신 {'{P/Demiurge Stella}'}를 사용합니다. P1 끝에서 팀 2로 교체하고 1회 체인 스킬로 고정 데미지를 발동하여 P2로 이동합니다.
                            </p>
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="Kd-dKroOXEo"
                                title="영광의 파수꾼 월드 보스 2300만+ by Ducky"
                                author="Ducky"
                                date="01/07/2024"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
