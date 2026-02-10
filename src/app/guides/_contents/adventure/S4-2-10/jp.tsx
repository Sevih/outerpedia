'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function MutatedWyvreGuide() {
    return (
        <GuideTemplate
            title="変異したワイブル攻略ガイド"
            introduction="変異したワイブルはバフを中心に戦うボスです。バフが多いほどダメージが増加し、受けるダメージが減少します。バフを除去して弱体化させましょう。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
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
                                'ボスはイレギュラーハンター（{P/Caren}や{P/Rey}など）に弱いです。',
                                '{D/BT_REMOVE_BUFF}と{B/BT_IMMUNE}が攻略の鍵です。'
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
