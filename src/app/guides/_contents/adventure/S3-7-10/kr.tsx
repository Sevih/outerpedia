'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbyssalCalamityApophisGuide() {
    return (
        <GuideTemplate
            title="심연의 재앙 아포피스 공략 가이드"
            introduction="심연의 재앙 아포피스는 치명적인 독과 침묵 디버프를 부여하는 위험한 보스입니다. 디버프에 걸린 대상에게 대량의 고정 피해와 방어 무시 공격으로 페널티를 줍니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abyssal Calamity Apophis'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4184001'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{D/BT_DOT_POISON_IR}를 방지하기 위해 {B/BT_IMMUNE}과 {B/BT_STAT|ST_BUFF_RESIST}를 가져가세요.",
                                "또는 보스의 {D/BT_COOL3_CHARGE} 약점을 이용해 S3를 사용하지 못하게 하세요."
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
