'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function AbyssalCalamityApophisGuide() {
    return (
        <GuideTemplate
            title="深淵の災厄アポフィス攻略ガイド"
            introduction="深淵の災厄アポフィスは壊滅的な毒と沈黙デバフを付与する危険なボスです。デバフを受けたターゲットに大量の固定ダメージと防御無視攻撃でペナルティを与えます。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
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
                                "{D/BT_DOT_POISON_IR}を防ぐために{B/BT_IMMUNE}と{B/BT_STAT|ST_BUFF_RESIST}を持っていきましょう。",
                                "またはボスの{D/BT_COOL3_CHARGE}への弱点を利用してS3を使わせないようにしましょう。"
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
