'use client'

import GuideTemplate from '@/app/components/GuideTemplate'
import BossDisplay from '@/app/components/BossDisplay'
import TacticalTips from '@/app/components/TacticalTips'
import RecommendedCharacterList from '@/app/components/RecommendedCharacterList'
import { recommendedCharacters } from './recommendedCharacters'

export default function TyrantGuide() {
    return (
        <GuideTemplate
            title="被背叛的德舍雷特攻略指南"
            introduction="被背叛的德舍雷特会惩罚使用群体技能的队伍。带上单体火属性输出角色来应对挑战。"
            defaultVersion="default"
            versions={{
                default: {
                    label: '指南',
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
                                "使用{E/Fire}角色和/或拥有非范围攻击的角色。"
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
