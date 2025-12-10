'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function VladaGuide() {
    return (
        <GuideTemplate
            title="ヴラダ攻略ガイド"
            introduction="ヴラダは即座に爆発させられる致命的な火傷デバフを付与する強力なボスです。永続的なバフ強化を獲得し、火傷していない敵からの弱点ダメージのみ受けます。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <div className="bg-yellow-100 text-black px-2 py-1 rounded-lg shadow-md text-sm text-center border border-yellow-100 mb-4">
                                このガイドはS2 Hard 8-10にも適用されます
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
                                "{B/BT_IMMUNE}を持つキャラクターを使用しましょう。",
                                "{D/BT_STAT|ST_ATK}で{D/IG_Buff_Dot_Burn_Interruption_D} {D/BT_DOT_BURN}のダメージを軽減しましょう。"
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
