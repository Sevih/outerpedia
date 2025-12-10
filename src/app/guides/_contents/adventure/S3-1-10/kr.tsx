'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SphinxGuardianGuide() {
    return (
        <GuideTemplate
            title="스핑크스 가디언 공략 가이드"
            introduction="스핑크스 가디언은 턴을 얻으려면 팀에 최소 한 명의 레인저가 필요한 도전적인 보스입니다. S1으로 레인저를 처형하고, 레인저가 없는 팀은 속도가 0이 됩니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sphinx Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144008'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "최소 한 명의 {C/Ranger}를 사용하세요.",
                                "{D/BT_COOL_CHARGE} 사용을 피하세요.",
                                "보스는 {D/BT_AGGRO}에 취약합니다."
                            ]} />
                            <hr className="my-6 border-neutral-700" />
                            <RecommendedCharacterList entries={recommendedCharacters} />
                        </>
                    ),
                },
            }}
        />
    )
}
