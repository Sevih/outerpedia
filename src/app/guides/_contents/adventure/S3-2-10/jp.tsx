'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="裏切られたデシュレト攻略ガイド"
            introduction="裏切られたデシュレトはAoEスキルを使うチームを罰するボスです。単体攻撃の火属性DPSで挑みましょう。"
            defaultVersion="default"
            versions={{
                default: {
                    label: 'ガイド',
                    content: (
                        <>
                            <BossDisplay
                                bossKey='Betrayed Deshret'
                                modeKey={['Story (Normal)', 'Story (Hard)']}
                                defaultModeKey='Story (Hard)'
                                defaultBossId='4104005'
                            />
                            <hr className="my-6 border-neutral-700" />
                            <TacticalTips tips={[
                                "{E/Fire}キャラクターや非AoE攻撃を持つキャラクターを使用しましょう。"
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
