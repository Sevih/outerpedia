'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import VladiMaxALTeamsData from './VladiMaxAL.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const VladiMaxALTeams = VladiMaxALTeamsData as Record<string, TeamData>

export default function HeavyFixedVladiMaxGuide() {
    return (
        <GuideTemplate
            title="블라디 맥스 모험 라이선스 가이드"
            introduction="공격이 아닌 스킬에 맞으면 체력이 완전히 회복됩니다. 치명타로 스택이 쌓입니다. ETamamo 단독 또는 로나 체인 전략으로 클리어 가능. 스테이지 10까지 클리어 확인됨."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Vladi Max' modeKey='Adventure License' defaultBossId='51000030' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "적이 공격이 아닌 스킬을 사용하면 체력이 완전히 회복됩니다.",
                                "치명타로 2 스택 획득, 비치명타로 1 스택 감소. 5 스택 보유 시 보스가 행동하면 {D/BT_KILL}.",
                                "치명타로는 WG 피해를 입히지 않습니다.",
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={VladiMaxALTeams.vladiMaxAL} defaultStage="ETamamo Carry" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="lpQkc37S0zo" title="고정 포대 블라디 맥스 - 모험 라이선스 - 스테이지 10 - 1회 클리어 (오토)" author="XuRenChao" date="01/10/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
