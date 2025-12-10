'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="배신당한 데쉬렛 공략 가이드"
            introduction="배신당한 데쉬렛은 명중률에 초점을 맞춘 보스로, 낮은 명중률의 팀을 처벌합니다. 명중 버프나 디버프를 가진 화염 속성 캐릭터가 이 도전을 극복하는 데 필수적입니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Betrayed Deshret'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4104005'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Fire} 캐릭터와/또는 비광역 공격을 가진 캐릭터를 사용하세요."
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
