'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function GrandCalamariGuide() {
    return (
        <GuideTemplate
            title="グランドカラマリ攻略ガイド"
            introduction="グランドカラマリは攻撃力が最も高いヒーローをスタンさせ、デバフ時間を延長する手強いボスです。壊滅的な必殺技を避けるため、激怒フェーズの管理が重要です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Grand Calamari'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4134003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "激怒前にチェインポイントを溜めておきましょう。これにより一気に倒して必殺技をスキップできます。",
                                "{B/BT_IMMUNE}や{B/BT_REMOVE_DEBUFF}を持参して{D/BT_STUN}のギミックを無効化しましょう。"
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
