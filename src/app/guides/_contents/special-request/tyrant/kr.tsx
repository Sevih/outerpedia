'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import StageBasedTeamSelector from '@/app/components/StageBasedTeamSelector'
import CombatFootage from '@/app/components/CombatFootage'
import BossDisplay from '@/app/components/BossDisplay'
import TyrantTeamsData from './Tyrant.json'
import type { TeamData } from '@/types/team'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

const TyrantTeams = TyrantTeamsData as Record<string, TeamData>

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="타이런트 특수의뢰 공략 가이드"
            introduction="타이런트 토들러는 디버프의 빠른 클렌즈가 핵심입니다. 전투 시작 시 {D/BT_DOT_POISON}, {D/BT_DOT_BLEED}, {D/BT_DOT_LIGHTNING}이 즉시 중첩되며, 즉시 클렌즈하지 않으면 매우 빠르게 전멸합니다. AoE 클렌즈를 가진 유닛이 필수적입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay bossKey='Tyrant Toddler' modeKey='Special Request: Ecology Study' defaultBossId='401400262' />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "전투 시작 시 팀과 보스 모두에게 {D/BT_DOT_POISON}, {D/BT_DOT_BLEED}, {D/BT_DOT_LIGHTNING}이 즉시 중첩됩니다.",
                                "이 DoT들은 즉시 클렌즈하지 않으면 매우 빠르게 전멸합니다.",
                                "Viella와 Dianne의 S3는 모든 디버프의 전체 지속 시간을 클렌즈하여 이 보스를 간단하게 만듭니다.",
                                "버스트 스킬, 듀얼 어택, 스킬 체인으로만 WG 데미지를 줄 수 있습니다.",
                                "{C/Healer}와 {C/Defender} 아군은 스피드 +50%와 방어력 기반 데미지 증가를 받습니다.",
                                "스테이지 12: {C/Healer}와 {C/Defender}의 스피드를 50% 증가시키고, 데미지가 방어력으로 계산됩니다. 다른 모든 클래스는 데미지가 95% 감소합니다.",
                                "스테이지 13: 크리티컬 확률을 완전히 감소시키고 {C/Defender}를 제외한 모든 클래스의 데미지를 95% 감소시킵니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                            <hr className="my-6 border-neutral-700" />
                            <StageBasedTeamSelector teamData={TyrantTeams.tyrantSpecialRequest} defaultStage="1-10" />
                            <hr className="my-6 border-neutral-700" />
                            <CombatFootage videoId="n9-IcrXHyBA" title="타이런트 전투 영상" author="Sevih" date="09/05/2025" />
                        </>
                    ),
                },
            }}
        />
    )
}
