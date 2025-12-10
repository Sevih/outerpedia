'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function VladiMaxGuide() {
    return (
        <GuideTemplate
            title="ヴラディマックス攻略ガイド"
            introduction="ヴラディマックスはチェインポイントを吸収し、防御デバフを受けた対象に確定スタンを付与する危険なボスです。彼の攻撃はカウンター、リベンジ、ディフェンダーのパッシブを無視します。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Vladi Max'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144004'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{B/BT_IMMUNE}、{B/BT_REMOVE_DEBUFF}を持つキャラクターを使用しましょう。"
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
