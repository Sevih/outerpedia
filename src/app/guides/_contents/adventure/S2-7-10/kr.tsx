'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="블라다 공략 가이드"
            introduction="블라다는 즉시 폭발시킬 수 있는 치명적인 화상 디버프를 부여하는 강력한 보스입니다. 영구적인 버프 강화를 획득하고, 화상에 걸리지 않은 적의 약점 피해만 받습니다."
            defaultVersion="default"
            versions={{
                default: {
                    label: '가이드',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                이 가이드는 S2 Hard 8-10에도 적용됩니다
                            </div>
                            <BossDisplay
                                bossKey='Vlada'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                labelFilter='As You Wish, Your Excellency'
                                defaultBossId='4500174'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{B/BT_IMMUNE}를 가진 캐릭터를 사용하세요.",
                                "{D/BT_STAT|ST_ATK}로 {D/IG_Buff_Dot_Burn_Interruption_D} {D/BT_DOT_BURN} 피해를 줄이세요."
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
