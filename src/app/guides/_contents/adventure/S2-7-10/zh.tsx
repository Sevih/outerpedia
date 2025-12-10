'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="弗拉达攻略指南"
            introduction="弗拉达是一个强大的Boss，会施加可以立即引爆的致命灼烧减益。她获得永久增益强化，只受到未灼烧敌人的弱点伤害。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                本指南也适用于S2 Hard 8-10关卡
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
                                "使用拥有{B/BT_IMMUNE}的角色。",
                                "使用{D/BT_STAT|ST_ATK}来减少{D/IG_Buff_Dot_Burn_Interruption_D} {D/BT_DOT_BURN}伤害。"
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
