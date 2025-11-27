'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import KsaiALTeamsData from './KsaiAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const KsaiALTeams = KsaiALTeamsData as Record<string, TeamData>

export default function KsaiGuide() {
    return (
        <GuideTemplate
            title="크사이 모험 라이선스 가이드"
            introduction="크사이는 수속성 유닛을 선호하는 화속성 속도형 보스입니다. 수속성이 아닌 유닛은 공격력과 방어력 페널티를 받으며, 전체 팀이 약화 촉진을 받습니다. DoT 상한으로 인해 저주 및 고정 피해 전략의 효과가 낮아지며, 틱당 5000으로 제한됩니다. 적절한 수속성 중심 팀 구성으로 1회 클리어가 가능합니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Ksai' modeKey='Adventure License' defaultBossId='51000028' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Water}이 아닌 유닛은 {D/BT_STAT|ST_ATK_IR}와 {D/BT_STAT|ST_DEF_IR} 페널티를 받습니다.",
                                "팀은 {D/BT_SYS_DEBUFF_ENHANCE_IR}를 받고, 보스는 {B/BT_SYS_BUFF_ENHANCE_IR}를 가집니다.",
                                "보스 HP가 70% 미만으로 떨어질 때까지 {D/BT_WG_REVERSE_HEAL}에 대한 면역이 있습니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={KsaiALTeams.ksaiAL} defaultStage="Team 1 – Reliable Clear" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="-jEcneW-N3Y" title="크사이 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)" author="XuRenChao" date="15/09/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
