'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import ToddlerALTeamsData from './ToddlerAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const ToddlerALTeams = ToddlerALTeamsData as Record<string, TeamData>

export default function TyrantToddlerGuide() {
    return (
        <GuideTemplate
            title="타일런트 유생체 모험 라이선스 가이드"
            introduction="특수 의뢰 스테이지 12와 동일한 스킬. 1~2회 시도로 클리어 가능. 스테이지 10까지 검증됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="space-y-4">
                                <BossDisplay bossKey='Tyrant Toddler' modeKey='Adventure License' defaultBossId='51000004' />
                                <BossDisplay bossKey='Deformed Inferior Core' modeKey='Adventure License' defaultBossId='51000005' labelFilter={"Weekly Conquest - Tyrant Toddler"} />
                            </div>
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "버스트 스킬, 협공, 스킬 체인 이외의 공격으로는 WG 피해를 받지 않음.",
                                "{C/Healer}와 {C/Defender} 아군은 속도가 50% 증가하고, 방어력에 비례하여 피해가 증가함."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={ToddlerALTeams.toddlerAL} defaultStage="Recommended Team" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="i7HvX6Gzic8" title="타일런트 유생체 - 모험 라이선스 - 스테이지 10 - 1회 클리어" author="XuRenChao" date="11/08/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
