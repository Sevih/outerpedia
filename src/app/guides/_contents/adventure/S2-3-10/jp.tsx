'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function SacreedGuardianGuide() {
    return (
        <GuideTemplate
            title="聖域の守護者攻略ガイド"
            introduction="聖域の守護者はS3で攻撃力が最も高いヒーローを即死させ、5ターンごとに激怒する危険なボスです。激怒中は弱点ダメージのみ有効なため、タイミングとCC管理が重要です。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Sacreed Guardian'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4144003'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "ボスは免疫がないため、{D/BT_STUN} {D/BT_FREEZE} {D/BT_STONE} {D/BT_COOL_CHARGE} {D/BT_SILENCE}などのハードCCを持参しましょう。",
                                "{B/BT_RESURRECTION}を持参すると役立ちます。",
                                "{D/BT_ACTION_GAUGE} {B/BT_ACTION_GAUGE} {D/BT_STAT|ST_SPEED} {B/BT_STAT|ST_SPEED}でボスのターン数を抑え、激怒を遅らせることができます。",
                                "ボスが激怒するまでチェインを温存しましょう。",
                                "{D/BT_FIXED_DAMAGE}チェイン攻撃で一気に倒すこともできます。"
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
