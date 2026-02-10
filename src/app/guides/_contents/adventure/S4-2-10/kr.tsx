'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="변이된 와이브르 공략 가이드"
            introduction="변이된 와이브르는 버프를 중심으로 싸우는 보스입니다. 버프가 많을수록 더 많은 피해를 입히고 받는 피해가 줄어듭니다. 버프를 제거하여 약화시키세요."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Mutated Wyvre'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4314003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                '보스는 이레귤러 헌터({P/Caren}, {P/Rey} 등)에 취약합니다.',
                                '{D/BT_REMOVE_BUFF}와 {B/BT_IMMUNE}이 공략의 핵심입니다.'
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
