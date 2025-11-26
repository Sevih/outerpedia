'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import AmadeusALTeamsData from './AmadeusAL.json'
import type { TeamData } from '@/types/team'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import TacticalTips from '@/app/components/TacticalTips'

const AmadeusALTeams = AmadeusALTeamsData as Record<string, TeamData>

const recommendedCharacters = [
    {
        names: "Dianne",
        reason: {
            en: "Ideal as both her heals are attacks, and she can {B/BT_REMOVE_DEBUFF} without triggering the boss mechanic.",
            kr: "힐이 모두 공격이고 보스 메커니즘을 발동시키지 않고 {B/BT_REMOVE_DEBUFF}할 수 있어 이상적."
        }
    },
    {
        names: "Kuro",
        reason: {
            en: "Shines with {D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}. Use S3 after boss self-buffs to convert them into long debuffs.",
            kr: "{D/BT_STATBUFF_CONVERT_TO_STATDEBUFF}로 빛남. 보스 자체 버프 후 S3를 사용해 긴 디버프로 변환."
        }
    },
    {
        names: ["Drakhan", "Gnosis Beth"],
        reason: {
            en: "MVPs thanks to their repeated debuffs.",
            kr: "반복적인 디버프 덕분에 MVP."
        }
    },
    {
        names: "Akari",
        reason: {
            en: "Works even without {D/BT_SEALED} thanks to her broad debuff kit.",
            kr: "폭넓은 디버프 키트 덕분에 {D/BT_SEALED} 없이도 작동."
        }
    },
    {
        names: "Skadi",
        reason: {
            en: "Could be used to fill a slot as the buffs can help the team do more damage.",
            kr: "버프가 팀의 딜을 높일 수 있어 슬롯 채우기로 사용 가능."
        }
    }
]

export default function AmadeusALGuide() {
    return (
        <GuideTemplate
            title="아마데우스 모험가 라이센스 공략 가이드"
            introduction="아마데우스 모험가 라이센스는 특수 의뢰 스테이지 12와 동일한 스킬이 특징입니다. 적절한 팀 구성으로 보통 1~2회 시도로 클리어할 수 있습니다. 이 전략은 스테이지 10까지 검증되었습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Amadeus' modeKey='Adventure License' defaultBossId='51000026' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips
                                tips={[
                                    "격노 메커니즘이 발동하기 전에 충분한 {D/BT_WG_REVERSE_HEAL}를 주기 위해 디버프를 계속 적용하세요.",
                                    "보스는 면역을 무시하는 랜덤 디버프를 부여합니다. 디버프가 적용된 후 정화가 중요합니다.",
                                    "보스는 매 라운드 파티 디버프를 1턴 연장합니다. 정화를 계획적으로 사용하세요.",
                                    "비공격 스킬을 가진 캐릭터는 사용하지 마세요. 보스에게 영구적인 크리티컬 히트 버프를 줍니다."
                                ]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={AmadeusALTeams.amadeusAL} defaultStage="Recommended Team" replace={{ lead: "", mid: "", tail: "" }} />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage
                                videoId="EJNnAhVZPkY"
                                title="Amadeus - Adventure License - Stage 10 - 1 run clear (Auto) - by XuRenChao"
                                author="XuRenChao"
                                date="08/09/2025"
                            />
                        </>
                    ),
                },
            }}
        />
    )
}
