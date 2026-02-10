'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import chimeraTeamsData from './Chimera.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const chimeraTeams = chimeraTeamsData as Record<string, TeamData>

export default function ChimeraGuide() {
    return (
        <GuideTemplate
            title="미확인 키메라 특수의뢰 공략 가이드"
            introduction="스피드 장비와 크리티컬 장비를 얻기 위해 가능한 빨리 정복해야 하는 보스입니다. 키메라의 스킬 구성은 복잡하지 않으며, 기본적으로 DPS 레이스입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Unidentified Chimera' modeKey='Special Request: Ecology Study' defaultBossId='403400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "격노 전에 처치하지 못하면 생존이 매우 어려워집니다.",
                                "다행히 {E/Fire} 속성에는 현재 이 보스를 상대할 수 있는 좋은 도구가 많습니다.",
                                "키메라는 HP가 비교적 낮지만 방어력이 매우 높으므로 {D/BT_STAT|ST_DEF}이 거의 필수입니다.",
                                "DPS 유닛에 관통률% 액세서리를 장착하면 데미지가 크게 향상됩니다.",
                                "키메라의 패시브는 팀의 크리티컬 데미지를 85% 감소시키지만, 대신 모든 유닛에게 100% 크리티컬 확률을 부여합니다.",
                                "이를 활용하기 위해 유닛에 크리티컬 확률을 올릴 필요가 없습니다. 공격력과 크리티컬 데미지에만 집중하세요.",
                                "모든 유닛에 {I-T/Rogue's Charm}을 장착하세요. 매번 CP 생성이 발동됩니다. {E/Fire} 유닛에는 {I-T/Sage's Charm}도 유효합니다.",
                                "보스가 공격받을 때마다 10% {B/BT_ACTION_GAUGE}를 획득하므로 스피드가 중요합니다.",
                                "이상적으로 전체 팀이 스테이지 12에서 175 이상, 스테이지 13에서 185 이상의 스피드가 필요합니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={chimeraTeams.chimeraSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="eHRErCHZmp4" title="키메라 전투 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
