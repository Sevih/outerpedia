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
            introduction="被背叛的德舍雷特是一个注重命中率的Boss，会惩罚低命中率的队伍。拥有命中增益或减益的火属性角色是克服这个挑战的关键。"
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
