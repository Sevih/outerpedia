'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbominationHunterBelialGuide() {
    return (
        <GuideTemplate
            title="憎悪の狩人ベリアル攻略ガイド"
            introduction="憎悪の狩人ベリアルは燃焼デバフを爆発させて大ダメージを与える壊滅的なボスです。戦闘開始時に即座に燃焼爆発を行い、毎ターン非ディフェンダーに燃焼を付与し、激怒時にはチーム全体を処刑します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Abomination Hunter Belial'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4114005'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{D/BT_DOT_BURN}に対処するために{B/BT_SHIELD_BASED_CASTER}や{B/BT_INVINCIBLE}を持っていきましょう（2戦目の終わりに必ず付与してください）。",
                                "最初の{D/BT_IMMEDIATELY_2000092}の後、{D/BT_DOT_BURN}をブロックするために{B/BT_IMMUNE}を持っていきましょう。",
                                "最初の{D/BT_IMMEDIATELY_2000092}後の死亡から回復するために{B/BT_RESURRECTION}を持っていきましょう。"
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
