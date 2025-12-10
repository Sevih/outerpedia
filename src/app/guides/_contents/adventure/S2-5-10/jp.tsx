'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AsteiDemiurgeGuide() {
    return (
        <GuideTemplate
            title="アステイ(デミウルゴス)攻略ガイド"
            introduction="デミウルゴス・アステイは強力なボスで、クリティカルバフを連鎖させて全敵に石化を付与し、さらに免疫無視にアップグレードします。激怒中は弱点ダメージのみ有効で、激怒時の必殺技は致命的なダメージを与えます。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Astei'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4500047'
                                labelFilter={["Snapped Back to Reality", "Doll Garden's Caretaker"]}
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{B/BT_REMOVE_DEBUFF}と{B/BT_IMMUNE}を持つキャラクター2人で{D/BT_STONE}ギミックに対処しましょう。",
                                "ダメージが問題なら、{D/BT_SEALED}でボスのバフを阻止できるキャラクターを連れて行きましょう。"
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
