'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ZiggsaronALTeamsData from './ZiggsaronAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ZiggsaronALTeams = ZiggsaronALTeamsData as Record<string, TeamData>

export default function RavenousWolfKingZiggsaronGuide() {
    return (
        <GuideTemplate
            title="아랑왕 지그사론 모험 라이선스 가이드"
            introduction="주간토벌 보스. 영구적인 공격력 감소와 매 턴 시작 시 강화 불가 부여. 속도형이 아닌 적에게 받는 피해 감소, 수속성이 아닌 적에게 받는 WG 피해 -50%. 4턴마다 광폭화하며 치명적인 궁극기 사용. 1-2회 도전으로 클리어 가능. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Ravenous Wolf King, Ziggsaron' modeKey='Adventure License' defaultBossId='51000034' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "팀 전체에 해제 불가능한 {D/BT_STAT|ST_ATK}가 영구적으로 부여됨.",
                                "매 턴 시작 시 {D/BT_SEALED}를 1턴 부여.",
                                "반격, 복수, 신속 대응 무효화.",
                                "{C/Ranger}가 아닌 유닛으로부터 받는 피해 감소."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ZiggsaronALTeams.ziggsaronAL} defaultStage="No Ranger" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="Nlt72xRKMpo" title="지그사론 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)" author="XuRenChao" date="19/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
